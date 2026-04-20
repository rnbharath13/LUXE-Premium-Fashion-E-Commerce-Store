import express from 'express';
import { supabase } from './supabase.js';
import { randomUUID } from 'crypto';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { userId, items, total, shippingAddress, billingAddress, paymentMethod } = req.body;
    const orderId = randomUUID();
    const orderNumber = `ORD-${Date.now()}`;
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = Math.round(subtotal * 0.1 * 100) / 100;
    const shippingCost = subtotal > 150 ? 0 : 10;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{ id: orderId, user_id: userId, order_number: orderNumber, status: 'pending', subtotal, tax, shipping_cost: shippingCost, total, shipping_address: shippingAddress, billing_address: billingAddress, payment_method: paymentMethod }])
      .select();

    if (orderError) throw orderError;

    const orderItems = items.map(item => ({
      id: randomUUID(),
      order_id: orderId,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
      size: item.size || 'One Size',
      color: item.color || 'Default'
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;

    res.status(201).json({ orderId, orderNumber });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { data: order, error: orderError } = await supabase.from('orders').select('*').eq('id', orderId).single();
    if (orderError) throw orderError;
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*,products(name)')
      .eq('order_id', orderId);

    if (itemsError) throw itemsError;
    res.json({ ...order, items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
