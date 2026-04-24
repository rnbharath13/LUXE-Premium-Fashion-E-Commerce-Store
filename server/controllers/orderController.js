import { randomUUID } from 'crypto';
import { supabase } from '../config/supabase.js';

export const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, billingAddress, paymentMethod } = req.body;
    const userId = req.user.userId;

    if (!items?.length) return res.status(400).json({ error: 'Order must have at least one item' });

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = Math.round(subtotal * 0.1 * 100) / 100;
    const shippingCost = subtotal > 150 ? 0 : 10;
    const total = Math.round((subtotal + tax + shippingCost) * 100) / 100;

    const orderId = randomUUID();
    const orderNumber = `ORD-${Date.now()}`;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        id: orderId,
        user_id: userId,
        order_number: orderNumber,
        status: 'pending',
        subtotal,
        tax,
        shipping_cost: shippingCost,
        total,
        shipping_address: shippingAddress,
        billing_address: billingAddress,
        payment_method: paymentMethod
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    const orderItems = items.map((item) => ({
      id: randomUUID(),
      order_id: orderId,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price,
      size: item.size || 'One Size',
      color: item.color || ''
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;

    res.status(201).json({ order, orderNumber });
  } catch (err) {
    next(err);
  }
};

export const getUserOrders = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('id, order_number, status, total, created_at, order_items ( id, quantity, price, size )')
      .eq('user_id', req.user.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    next(err);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('orders')
      .select(`
        id, order_number, status, subtotal, tax, shipping_cost, total,
        shipping_address, billing_address, payment_method, created_at,
        order_items (
          id, quantity, price, size, color,
          products ( id, name )
        )
      `)
      .eq('id', id)
      .eq('user_id', req.user.userId)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Order not found' });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: order } = await supabase
      .from('orders')
      .select('status')
      .eq('id', id)
      .eq('user_id', req.user.userId)
      .single();

    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending orders can be cancelled' });
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};
