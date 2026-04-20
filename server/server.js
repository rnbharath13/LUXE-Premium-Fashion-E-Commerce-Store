import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getConnection, closeConnection } from './config/db.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import orderRoutes from './routes/orders.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test DB connection on startup
app.get('/api/health', async (req, res) => {
  try {
    await getConnection();
    res.json({ status: 'ok', message: 'Server and database connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, async () => {
  try {
    await getConnection();
    console.log(`\n✓ Server running on http://localhost:${PORT}`);
    console.log(`✓ Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}\n`);
  } catch (error) {
    console.error('Failed to connect to database:', error.message);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await closeConnection();
  process.exit(0);
});
