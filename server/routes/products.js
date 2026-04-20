import express from 'express';
import { getConnection } from '../config/db.js';
import sql from 'mssql';

const router = express.Router();

// Get all products with optional filters
router.get('/', async (req, res) => {
  try {
    const { category, tags, search, sortBy, skip = 0, limit = 100 } = req.query;
    const pool = await getConnection();
    let query = `
      SELECT p.*, c.name as category_name, b.name as brand_name,
        STRING_AGG(pt.tag, ',') as tags
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN product_tags pt ON p.id = pt.product_id
      WHERE 1=1
    `;

    if (category && category !== 'all') {
      query += ` AND c.slug = '${category}'`;
    }
    if (search) {
      query += ` AND (p.name LIKE '%${search}%' OR b.name LIKE '%${search}%')`;
    }
    if (tags) {
      const tagList = tags.split(',').map(t => `'${t}'`).join(',');
      query += ` AND pt.tag IN (${tagList})`;
    }

    query += ` GROUP BY p.id, p.name, p.slug, p.category_id, p.brand_id, p.description, p.price, p.original_price, p.rating, p.reviews_count, p.in_stock, p.created_at, p.updated_at, c.name, b.name`;

    if (sortBy === 'price-asc') query += ` ORDER BY p.price ASC`;
    else if (sortBy === 'price-desc') query += ` ORDER BY p.price DESC`;
    else if (sortBy === 'rating') query += ` ORDER BY p.rating DESC`;
    else query += ` ORDER BY p.created_at DESC`;

    query += ` OFFSET ${skip} ROWS FETCH NEXT ${limit} ROWS ONLY`;

    const result = await pool.request().query(query);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();

    const productQuery = `
      SELECT p.*, c.name as category_name, b.name as brand_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.id = '${id}'
    `;

    const imagesQuery = `
      SELECT * FROM product_images
      WHERE product_id = '${id}'
      ORDER BY is_primary DESC, display_order ASC
    `;

    const variantsQuery = `
      SELECT * FROM product_variants
      WHERE product_id = '${id}'
    `;

    const tagsQuery = `
      SELECT tag FROM product_tags
      WHERE product_id = '${id}'
    `;

    const [productResult, imagesResult, variantsResult, tagsResult] = await Promise.all([
      pool.request().query(productQuery),
      pool.request().query(imagesQuery),
      pool.request().query(variantsQuery),
      pool.request().query(tagsQuery)
    ]);

    if (productResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = productResult.recordset[0];
    product.images = imagesResult.recordset;
    product.variants = variantsResult.recordset;
    product.tags = tagsResult.recordset.map(t => t.tag);

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
