import express from 'express';
import { supabase } from './supabase.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, search, sortBy, skip = 0, limit = 100 } = req.query;
    let query = supabase.from('products').select('*,categories(name,slug),brands(name)', { count: 'exact' });

    if (category && category !== 'all') {
      query = query.eq('categories.slug', category);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,brands.name.ilike.%${search}%`);
    }

    if (sortBy === 'price-asc') query = query.order('price', { ascending: true });
    else if (sortBy === 'price-desc') query = query.order('price', { ascending: false });
    else if (sortBy === 'rating') query = query.order('rating', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    query = query.range(skip, skip + limit - 1);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*,categories(name,slug),brands(name)')
      .eq('id', id)
      .single();

    if (productError) throw productError;
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const [{ data: images }, { data: variants }, { data: tags }] = await Promise.all([
      supabase.from('product_images').select('*').eq('product_id', id).order('is_primary', { ascending: false }),
      supabase.from('product_variants').select('*').eq('product_id', id),
      supabase.from('product_tags').select('tag').eq('product_id', id)
    ]);

    res.json({ ...product, images, variants, tags: tags?.map(t => t.tag) || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
