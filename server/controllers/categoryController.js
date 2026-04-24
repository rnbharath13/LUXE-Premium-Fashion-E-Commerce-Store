import { supabase } from '../config/supabase.js';

export const getCategories = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, description, image_url')
      .order('name');

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    next(err);
  }
};

export const getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, description, image_url')
      .eq('slug', slug)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Category not found' });
    res.json(data);
  } catch (err) {
    next(err);
  }
};
