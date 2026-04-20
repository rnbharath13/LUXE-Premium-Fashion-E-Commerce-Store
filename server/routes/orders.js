import express from 'express';
import { getConnection } from '../config/db.js';
import { randomUUID } from 'crypto';

const router = express.Router();

// Create new order
router.post('/', async (req, res) => {
  try {
    const { userId, items, total, shippingAddress, billingAddress, paymentMethod } = req.body;
    const pool = await getConnection();

    const orderId = randomUUID();
    const orderNumber = `ORD-${Date.now()}`;
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = Math.round(subtotal * 0.1 * 100) / 100;
    const shippingCost = subtotal > 150 ? 0 : 10;

    const orderQuery = `
      INSERT INTO orders (id, user_id, order_number, status, subtotal, tax, shipping_cost, total, shipping_address, billing_address, payment_method)
      VALUES (
        '${orderId}',
        '${userId}',
        '${orderNumber}',
        'pending',
        ${subtotal},
        ${tax},
        ${shippingCost},
        ${total},
        '${JSON.stringify(shippingAddress).replace(/'/g, "''")}',
        '${JSON.stringify(billingAddress).replace(/'/g, "''")}',
        '${paymentMethod}'
      )
    `;

    await pool.request().query(orderQuery);

    // Insert order items
    for (const item of items) {
      const itemQuery = `
        INSERT INTO order_items (id, order_id, product_id, quantity, price, size, color)
        VALUES (
          '${randomUUID()}',
          '${orderId}',
          '${item.product_id}',
          ${item.quantity},
          ${item.price},
          '${item.size || 'One Size'}',
          '${item.color || 'Default'}'
        )
      `;
      await pool.request().query(itemQuery);
    }

    res.status(201).json({ orderId, orderNumber });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user orders
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT o.*, COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = '${userId}'
      GROUP BY o.id, o.user_id, o.order_number, o.status, o.subtotal, o.shipping_cost, o.tax, o.total, o.shipping_address, o.billing_address, o.payment_method, o.created_at, o.updated_at
      ORDER BY o.created_at DESC
    `);

    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get order details
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const pool = await getConnection();

    const orderResult = await pool.request().query(`
      SELECT * FROM orders WHERE id = '${orderId}'
    `);

    if (orderResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const itemsResult = await pool.request().query(`
      SELECT oi.*, p.name, p.image_url
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = '${orderId}'
    `);

    const order = orderResult.recordset[0];
    order.items = itemsResult.recordset;

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
