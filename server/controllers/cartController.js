import { supabase } from '../config/supabase.js';
import { AppError } from '../middlewares/errorHandler.js';

export const addToCart = async (req, res, next) => {
  try {
    const { product_id, quantity } = req.body;
    const user_id = req.user.id;

    // Check if product exists
    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', product_id)
      .single();

    if (!product) throw new AppError('Product not found', 404);

    // Try to update existing cart item
    const { data: existingItem } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', user_id)
      .eq('product_id', product_id)
      .single();

    if (existingItem) {
      const { data, error } = await supabase
        .from('cart')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id)
        .select()
        .single();

      if (error) throw new AppError(error.message, 400);
      return res.json(data);
    }

    // Insert new cart item
    const { data, error } = await supabase
      .from('cart')
      .insert({ user_id, product_id, quantity })
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

export const getCart = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    const { data, error } = await supabase
      .from('cart')
      .select('*, products(*)')
      .eq('user_id', user_id);

    if (error) throw new AppError(error.message, 400);

    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      return deleteCartItem(req, res, next);
    }

    const { data, error } = await supabase
      .from('cart')
      .update({ quantity })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const deleteCartItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('id', id);

    if (error) throw new AppError(error.message, 400);
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', user_id);

    if (error) throw new AppError(error.message, 400);
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
};
