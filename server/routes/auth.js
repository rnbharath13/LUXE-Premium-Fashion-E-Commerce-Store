import express from 'express';
import { getConnection } from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const pool = await getConnection();

    // Check if user exists
    const existingUser = await pool.request().query(`
      SELECT id FROM users WHERE email = '${email}'
    `);

    if (existingUser.recordset.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = randomUUID();

    await pool.request().query(`
      INSERT INTO users (id, email, password_hash, first_name, last_name)
      VALUES ('${userId}', '${email}', '${hashedPassword}', '${firstName || ''}', '${lastName || ''}')
    `);

    const token = jwt.sign({ userId, email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ userId, email, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT id, password_hash, first_name, last_name FROM users WHERE email = '${email}'
    `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.recordset[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      userId: user.id,
      email,
      firstName: user.first_name,
      lastName: user.last_name,
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify token
router.get('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, userId: decoded.userId });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
