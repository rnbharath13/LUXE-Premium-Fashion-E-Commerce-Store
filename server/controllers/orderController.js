import { supabase } from '../config/supabase.js';
import { AppError } from '../middlewares/errorHandler.js';

export const createOrder = async (req, res, next) => {
  try {
    const { total_amount, items, shipping_address, payment_method } = req.body;
    const user_id = req.user.id;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id,
        total_amount,
        shipping_address,
        payment_method,
        status: 'pending'
      })
      .select()
      .single();

    if (orderError) throw new AppError(orderError.message, 400);

    // Add order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_purchase: item.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw new AppError(itemsError.message, 400);

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

export const getUserOrders = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) throw new AppError(error.message, 400);

    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .eq('id', id)
      .eq('user_id', user_id)
      .single();

    if (error) throw new AppError('Order not found', 404);

    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, payment_status } = req.body;

    const { data, error } = await supabase
      .from('orders')
      .update({ status, payment_status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);

    res.json(data);
  } catch (error) {
    next(error);
  }
};
