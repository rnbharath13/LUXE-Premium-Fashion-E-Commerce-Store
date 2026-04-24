import { randomUUID } from 'crypto';
import { supabase } from '../config/supabase.js';

export const getWishlist = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('wishlist')
      .select(`
        id, created_at,
        products (
          id, name, slug, price, original_price, rating, in_stock,
          brands ( name ),
          product_images ( image_url, is_primary ),
          product_tags ( tag )
        )
      `)
      .eq('user_id', req.user.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    next(err);
  }
};

export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId is required' });

    const { data, error } = await supabase
      .from('wishlist')
      .insert([{ id: randomUUID(), user_id: req.user.userId, product_id: productId }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') return res.status(409).json({ error: 'Already in wishlist' });
      throw error;
    }

    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

export const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', req.user.userId)
      .eq('product_id', productId);

    if (error) throw error;
    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    next(err);
  }
};
