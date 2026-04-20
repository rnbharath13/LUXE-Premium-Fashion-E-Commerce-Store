import express from 'express';
import { supabase } from './supabase.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { data, error } = await supabase.from('categories').select('*').eq('slug', slug).single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Category not found' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
