import express from 'express';
import { getConnection } from '../config/db.js';

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT * FROM categories
      ORDER BY name ASC
    `);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get category by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT * FROM categories
      WHERE slug = '${slug}'
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
