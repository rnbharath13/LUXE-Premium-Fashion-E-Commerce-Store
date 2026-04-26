import { supabase } from '../config/supabase.js';
import {
  TAX_RATE, SHIPPING_COST, FREE_SHIPPING_THRESHOLD, round2,
} from '../config/checkout.js';
import { generateOrderNumber, findVariant } from '../lib/orderHelpers.js';

// ── Create order ─────────────────────────────────────────────
// Server is authoritative for pricing, tax, shipping, and stock — never trust client totals.
export const createOrder = async (req, res, next) => {
  try {
    const userId  = req.user.userId;
    const idemKey = req.headers['idempotency-key'] || null;

    // Idempotency short-circuit: same key → return existing order
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

    // Fetch products + variants from DB — server-authoritative pricing
    const productIds = [...new Set(items.map((i) => i.productId))];
    const { data: products, error: pErr } = await supabase
      .from('products')
      .select('id, name, price, in_stock, product_variants(size, color, price_modifier, in_stock)')
      .in('id', productIds);

    if (pErr) throw pErr;
    if (!products || products.length !== productIds.length) {
      return res.status(400).json({ error: 'One or more products not found' });
    }

    // Validate stock + compute server-side line prices
    const lineItems = [];
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return res.status(400).json({ error: 'Invalid product in cart' });
      if (!product.in_stock) return res.status(409).json({ error: `${product.name} is out of stock` });

      const variant = findVariant(product.product_variants, item.size, item.color);
      if (variant && variant.in_stock === false) {
        return res.status(409).json({ error: `${product.name} (${item.size || ''}) is out of stock` });
      }

      const priceModifier = variant?.price_modifier ? Number(variant.price_modifier) : 0;
      const unitPrice     = round2(Number(product.price) * (1 + priceModifier));

      lineItems.push({
        product_id: product.id,
        quantity:   item.quantity,
        price:      unitPrice,
        size:       item.size  || 'One Size',
        color:      item.color || '',
      });
    }

    // Server-authoritative totals
    const subtotal      = round2(lineItems.reduce((s, i) => s + i.price * i.quantity, 0));
    const shippingCost  = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const tax           = round2(subtotal * TAX_RATE);
    const total         = round2(subtotal + shippingCost + tax);
    const orderNumber   = generateOrderNumber();
    const paymentStatus = paymentMethod === 'cod' ? 'pending' : 'paid'; // mock: card always succeeds

    // Insert order
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

    // Idempotency race: concurrent request hit unique constraint — return the winner
    if (oErr) {
      if (oErr.code === '23505' && idemKey) {
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

    // Insert line items — compensating delete on failure to avoid orphan order
    const itemsToInsert = lineItems.map((li) => ({ ...li, order_id: order.id }));
    const { error: iErr } = await supabase.from('order_items').insert(itemsToInsert);
    if (iErr) {
      await supabase.from('orders').delete().eq('id', order.id);
      throw iErr;
    }

    res.status(201).json({ order, orderNumber });
  } catch (err) {
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

// ── Get one order (with full line item product info) ─────────
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
        )
      `)
      .eq('id',      req.params.id)
      .eq('user_id', req.user.userId)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Order not found' });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// ── Cancel pending order ─────────────────────────────────────
export const cancelOrder = async (req, res, next) => {
  try {
    const { data: order } = await supabase
      .from('orders')
      .select('id, status')
      .eq('id',      req.params.id)
      .eq('user_id', req.user.userId)
      .maybeSingle();

    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status !== 'pending') {
      return res.status(409).json({ error: `Cannot cancel an order in '${order.status}' state` });
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', order.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};
