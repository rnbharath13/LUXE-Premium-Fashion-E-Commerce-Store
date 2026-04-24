import { Router } from 'express';
import { supabase } from '../config/supabase.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { category } = req.query;
    let query = supabase
      .from('subcategories')
      .select('id, name, slug, image_url, categories(name, slug)')
      .order('name');

    if (category) query = query.eq('categories.slug', category);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (err) { next(err); }
});

router.get('/:categorySlug', async (req, res, next) => {
  try {
    const { categorySlug } = req.params;
    const { data: cat } = await supabase
      .from('categories').select('id').eq('slug', categorySlug).single();

    if (!cat) return res.status(404).json({ error: 'Category not found' });

    const { data, error } = await supabase
      .from('subcategories')
      .select('id, name, slug, image_url')
      .eq('category_id', cat.id)
      .order('name');

    if (error) throw error;
    res.json(data || []);
  } catch (err) { next(err); }
});

export default router;
