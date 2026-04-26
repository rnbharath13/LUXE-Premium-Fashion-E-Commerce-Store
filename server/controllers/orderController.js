import { supabase } from '../config/supabase.js';
import {
  TAX_RATE, SHIPPING_COST, FREE_SHIPPING_THRESHOLD, round2,
} from '../config/checkout.js';
import { getProductImageOverride } from '../lib/catalogMedia.js';
import { generateOrderNumber, findVariant } from '../lib/orderHelpers.js';
import {
  decrementStock, restoreStock, restoreStockForOrder,
} from '../services/stockService.js';

// Cancellation is allowed up to (but not including) shipping. Beyond that,
// the customer must use the return flow.
const CANCELLABLE_STATUSES = ['pending', 'processing'];
const RETURNABLE_STATUSES  = ['shipped', 'delivered'];
// Customers can request a return up to N days after the order was placed.
// (Once we have a `delivered_at` column, gate on that instead.)
const RETURN_WINDOW_DAYS   = 14;

// ── Create order ─────────────────────────────────────────────
// Server is authoritative for pricing, tax, shipping, and stock — never trust client totals.
//
// Stock decrement uses a saga pattern: we decrement each line item one at
// a time; if any fails (insufficient stock) we restore everything we already
// decremented before returning to the client. This keeps inventory consistent
// across concurrent orders without distributed transactions.
export const createOrder = async (req, res, next) => {
  // Track which lines we've successfully decremented so the saga can roll back.
  const decremented = [];
  let createdOrderId = null;

  try {
    const userId  = req.user.userId;
    const idemKey = req.headers['idempotency-key'] || null;

    // ── Idempotency short-circuit ─────────────────────────────────────────
    if (idemKey) {
      const { data: existing } = await supabase
        .from('orders')
        .select('id, order_number, total, status, created_at')
        .eq('user_id',         userId)
        .eq('idempotency_key', idemKey)
        .maybeSingle();
      if (existing) {
        return res.status(200).json({
          order:       existing,
          orderNumber: existing.order_number,
          idempotent:  true,
        });
      }
    }

    const { items, shippingAddress, billingAddress, paymentMethod } = req.body;

    // ── Resolve products + variants for pricing & validation ──────────────
    const productIds = [...new Set(items.map((i) => i.productId))];
    const { data: products, error: pErr } = await supabase
      .from('products')
      .select('id, name, price, in_stock, product_variants(size, color, price_modifier, in_stock)')
      .in('id', productIds);

    if (pErr) throw pErr;
    if (!products || products.length !== productIds.length) {
      return res.status(400).json({ error: 'One or more products not found' });
    }

    // ── Build line items with server-computed prices ──────────────────────
    const lineItems = [];
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return res.status(400).json({ error: 'Invalid product in cart' });

      const variant       = findVariant(product.product_variants, item.size, item.color);
      const priceModifier = variant?.price_modifier ? Number(variant.price_modifier) : 0;
      const unitPrice     = round2(Number(product.price) * (1 + priceModifier));

      lineItems.push({
        product_id:   product.id,
        product_name: product.name,
        quantity:     item.quantity,
        price:        unitPrice,
        size:         item.size  || 'One Size',
        color:        item.color || '',
      });
    }

    // ── Saga step 1: decrement stock atomically per line ──────────────────
    // The DB function uses SELECT ... FOR UPDATE so concurrent orders queue
    // and only one wins on the last unit.
    for (const li of lineItems) {
      const ok = await decrementStock({
        productId: li.product_id,
        size:      li.size,
        color:     li.color,
        quantity:  li.quantity,
      });
      if (!ok) {
        // Roll back any earlier decrements before failing.
        for (const prev of decremented) {
          await restoreStock({
            productId: prev.product_id,
            size:      prev.size,
            color:     prev.color,
            quantity:  prev.quantity,
          }).catch(() => {});
        }
        return res.status(409).json({
          error: `${li.product_name} ${li.size && li.size !== 'One Size' ? `(${li.size})` : ''} is out of stock`,
        });
      }
      decremented.push(li);
    }

    // ── Server-authoritative totals ───────────────────────────────────────
    const subtotal      = round2(lineItems.reduce((s, i) => s + i.price * i.quantity, 0));
    const shippingCost  = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const tax           = round2(subtotal * TAX_RATE);
    const total         = round2(subtotal + shippingCost + tax);
    const orderNumber   = generateOrderNumber();
    const paymentStatus = paymentMethod === 'cod' ? 'pending' : 'paid'; // mock until Stripe

    // ── Saga step 2: insert order header ─────────────────────────────────
    const { data: order, error: oErr } = await supabase
      .from('orders')
      .insert([{
        user_id:          userId,
        order_number:     orderNumber,
        status:           'pending',
        subtotal,
        tax,
        shipping_cost:    shippingCost,
        total,
        shipping_address: shippingAddress,
        billing_address:  billingAddress,
        payment_method:   paymentMethod,
        payment_status:   paymentStatus,
        idempotency_key:  idemKey,
      }])
      .select()
      .single();

    // Idempotency race: a concurrent request raced past the short-circuit and
    // got here too. Both tried to INSERT the same idem_key → unique violation.
    // The winner's row already exists; restore our stock and return that one.
    if (oErr) {
      if (oErr.code === '23505' && idemKey) {
        // Restore the stock we just decremented since the winner already did its own.
        for (const prev of decremented) {
          await restoreStock({
            productId: prev.product_id,
            size:      prev.size,
            color:     prev.color,
            quantity:  prev.quantity,
          }).catch(() => {});
        }
        const { data: winner } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id',         userId)
          .eq('idempotency_key', idemKey)
          .single();
        if (winner) {
          return res.status(200).json({
            order: winner, orderNumber: winner.order_number, idempotent: true,
          });
        }
      }
      throw oErr;
    }
    createdOrderId = order.id;

    // ── Saga step 3: insert line items, compensating on failure ──────────
    const itemsToInsert = lineItems.map((li) => {
      const { product_name, ...row } = li; // eslint-disable-line no-unused-vars
      return { ...row, order_id: order.id };
    });
    const { error: iErr } = await supabase.from('order_items').insert(itemsToInsert);
    if (iErr) {
      // Compensating actions: undo order, undo stock decrements
      await supabase.from('orders').delete().eq('id', order.id).catch(() => {});
      createdOrderId = null;
      for (const prev of decremented) {
        await restoreStock({
          productId: prev.product_id,
          size:      prev.size,
          color:     prev.color,
          quantity:  prev.quantity,
        }).catch(() => {});
      }
      throw iErr;
    }

    res.status(201).json({ order, orderNumber });
  } catch (err) {
    // Belt-and-braces: if we threw between decrement and order insert, undo.
    if (decremented.length && !createdOrderId) {
      for (const prev of decremented) {
        await restoreStock({
          productId: prev.product_id,
          size:      prev.size,
          color:     prev.color,
          quantity:  prev.quantity,
        }).catch(() => {});
      }
    }
    next(err);
  }
};

// ── List user orders ─────────────────────────────────────────
export const getUserOrders = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id, order_number, status, total, payment_status, created_at,
        order_items ( id, quantity, price, size, color )
      `)
      .eq('user_id', req.user.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    next(err);
  }
};

// ── Get one order (with full line item product info + return info) ───
export const getOrderById = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id, order_number, status, subtotal, tax, shipping_cost, total,
        payment_method, payment_status, shipping_address, billing_address,
        created_at, updated_at,
        order_items (
          id, quantity, price, size, color,
          products ( id, name, slug, product_images ( image_url, is_primary ) )
        ),
        order_returns ( id, status, reason, refund_amount, created_at, resolved_at )
      `)
      .eq('id',      req.params.id)
      .eq('user_id', req.user.userId)
      .maybeSingle();

    if (error || !data) return res.status(404).json({ error: 'Order not found' });

    data.order_items = (data.order_items || []).map((item) => ({
      ...item,
      image_url: getProductImageOverride(item.products?.slug)
        || item.products?.product_images?.find((img) => img.is_primary)?.image_url
        || item.products?.product_images?.[0]?.image_url
        || '',
    }));

    res.json(data);
  } catch (err) {
    next(err);
  }
};

// ── Cancel order (pending OR processing) — restores stock + flags refund ─
export const cancelOrder = async (req, res, next) => {
  try {
    // Fetch order + items in one shot — needed for stock restoration.
    const { data: order } = await supabase
      .from('orders')
      .select(`
        id, status, payment_method, payment_status,
        order_items ( product_id, quantity, size, color )
      `)
      .eq('id',      req.params.id)
      .eq('user_id', req.user.userId)
      .maybeSingle();

    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (!CANCELLABLE_STATUSES.includes(order.status)) {
      return res.status(409).json({
        error: `Cannot cancel an order in '${order.status}' state. Use the return flow instead.`,
      });
    }

    // Atomic state transition: only flip if still cancellable. Prevents a
    // race where two concurrent cancels both restore stock.
    const { data: updated, error } = await supabase
      .from('orders')
      .update({
        status:         'cancelled',
        // If the customer paid by card, mark refund. Real Stripe refund
        // happens in step 3 (Stripe integration). COD orders just stay 'pending'
        // payment-wise since no money ever moved.
        payment_status: order.payment_status === 'paid' ? 'refunded' : order.payment_status,
        updated_at:     new Date().toISOString(),
      })
      .eq('id',     order.id)
      .in('status', CANCELLABLE_STATUSES)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!updated) {
      // Lost the race — somebody cancelled it between our SELECT and UPDATE.
      return res.status(409).json({ error: 'Order is no longer cancellable' });
    }

    // Stock restore is best-effort and idempotent; failures here are logged
    // not fatal, the cancellation itself succeeded.
    await restoreStockForOrder(order.order_items);

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// ── Request return on a paid + shipped/delivered order ───────────────
export const requestReturn = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const userId     = req.user.userId;

    // Load order + items, scoped to this user (ownership)
    const { data: order, error: oErr } = await supabase
      .from('orders')
      .select(`
        id, status, payment_status, total, created_at,
        order_items ( product_id, quantity, size, color ),
        order_returns ( id )
      `)
      .eq('id',      req.params.id)
      .eq('user_id', userId)
      .maybeSingle();

    if (oErr) throw oErr;
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // ── Eligibility checks ────────────────────────────────────────────
    if (order.order_returns && order.order_returns.length) {
      return res.status(409).json({ error: 'A return has already been requested for this order' });
    }
    if (!RETURNABLE_STATUSES.includes(order.status)) {
      return res.status(409).json({
        error: `Returns are only available for shipped or delivered orders (current: ${order.status})`,
      });
    }
    if (order.payment_status !== 'paid') {
      return res.status(409).json({ error: 'Only paid orders can be returned' });
    }
    const ageDays = (Date.now() - new Date(order.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (ageDays > RETURN_WINDOW_DAYS) {
      return res.status(409).json({
        error: `Return window has closed (${RETURN_WINDOW_DAYS} days from order date).`,
      });
    }

    // ── Create the return record ──────────────────────────────────────
    // For now (no admin module, no Stripe) we auto-approve and refund.
    // When the admin module ships this becomes status: 'pending' and admin
    // flips it to 'approved' → 'refunded' via a separate endpoint.
    const refundAmount = Number(order.total);

    const { data: ret, error: rErr } = await supabase
      .from('order_returns')
      .insert([{
        order_id:      order.id,
        user_id:       userId,
        reason,
        status:        'refunded',                   // TODO: 'pending' once admin exists
        refund_amount: refundAmount,
        resolved_at:   new Date().toISOString(),
      }])
      .select()
      .single();

    if (rErr) {
      // Race: someone created a return between our check and insert.
      if (rErr.code === '23505') {
        return res.status(409).json({ error: 'A return has already been requested for this order' });
      }
      throw rErr;
    }

    // ── Side effects: restore stock + flip order/payment status ───────
    await restoreStockForOrder(order.order_items);

    await supabase
      .from('orders')
      .update({
        status:         'cancelled',   // No 'returned' status today; admin will add later
        payment_status: 'refunded',    // Mock until Stripe — real refund hits Stripe.refunds.create
        updated_at:     new Date().toISOString(),
      })
      .eq('id', order.id);

    res.status(201).json({
      message: 'Return processed and refund issued.',
      return:  ret,
    });
  } catch (err) {
    next(err);
  }
};
