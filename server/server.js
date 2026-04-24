import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import authRoutes        from './routes/auth.js';
import productRoutes     from './routes/products.js';
import categoryRoutes    from './routes/categories.js';
import subcategoryRoutes from './routes/subcategories.js';
import orderRoutes       from './routes/orders.js';
import wishlistRoutes    from './routes/wishlist.js';
import uploadRoutes      from './routes/upload.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// Security
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));

// Rate limiting
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: 'Too many requests, try again later' } }));
app.use('/api',      rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

// Logging & parsing
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }));

// Routes
app.use('/api/auth',          authRoutes);
app.use('/api/products',      productRoutes);
app.use('/api/categories',    categoryRoutes);
app.use('/api/subcategories', subcategoryRoutes);
app.use('/api/orders',        orderRoutes);
app.use('/api/wishlist',      wishlistRoutes);
app.use('/api/upload',        uploadRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n✓ LUXE backend running → http://localhost:${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV}`);
  console.log(`✓ Frontend:    ${process.env.FRONTEND_URL}\n`);
});
