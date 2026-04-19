import { supabase } from '../config/supabase.js';
import { AppError } from '../middlewares/errorHandler.js';

export const getProducts = async (req, res, next) => {
  try {
    const { category, minPrice, maxPrice, search, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase.from('products').select('*', { count: 'exact' });

    if (category) query = query.eq('category_id', category);
    if (search) query = query.ilike('name', `%${search}%`);
    if (minPrice) query = query.gte('price', minPrice);
    if (maxPrice) query = query.lte('price', maxPrice);

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new AppError(error.message, 400);

    res.json({
      products: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new AppError('Product not found', 404);

    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category_id, image_url, stock } = req.body;

    const { data, error } = await supabase
      .from('products')
      .insert({
        name,
        description,
        price,
        category_id,
        image_url,
        stock,
        created_by: req.user.id
      })
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);

    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);

    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw new AppError(error.message, 400);

    res.json({ message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};
