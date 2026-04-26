import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import authRoutes        from './routes/auth.js';
import productRoutes     from './routes/products.js';
import categoryRoutes    from './routes/categories.js';
import locationRoutes    from './routes/location.js';
import subcategoryRoutes from './routes/subcategories.js';
import orderRoutes       from './routes/orders.js';
import wishlistRoutes    from './routes/wishlist.js';
import uploadRoutes      from './routes/upload.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import logger from './lib/logger.js';
import { checkEnv } from './lib/envCheck.js';

dotenv.config();
// Fail-fast on missing/placeholder secrets BEFORE any route is mounted.
// Better to crash on boot than serve traffic with predictable JWT signing keys.
checkEnv();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app  = express();
const PORT = process.env.PORT || 5000;

// ── Security headers ─────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// ── Structured request logging (all environments) ────────────
app.use(pinoHttp({
  logger,
  // Don't log health checks — noise
  autoLogging: { ignore: (req) => req.url === '/api/health' },
  // Redact sensitive fields from request/response logs
  redact: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
  customLogLevel: (req, res) => res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info',
}));

// ── Rate limiting ────────────────────────────────────────────
// Login: 10 attempts / 15 min per IP (account lockout handles per-account)
app.use('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      10,
  message:  { error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders:   false,
}));

// Forgot password: 5 requests / hour — prevent email bombing
app.use('/api/auth/forgot-password', rateLimit({
  windowMs: 60 * 60 * 1000,
  max:      5,
  message:  { error: 'Too many password reset requests, please try again later' },
  standardHeaders: true,
  legacyHeaders:   false,
}));

// General auth: 50 / 15 min
app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      50,
  message:  { error: 'Too many requests, try again later' },
  standardHeaders: true,
  legacyHeaders:   false,
}));

// General API: 300 / 15 min
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      300,
  standardHeaders: true,
  legacyHeaders:   false,
}));

// ── Parsing ──────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Static uploads ───────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }));

// ── Routes ───────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/products',      productRoutes);
app.use('/api/categories',    categoryRoutes);
app.use('/api/location',      locationRoutes);
app.use('/api/subcategories', subcategoryRoutes);
app.use('/api/orders',        orderRoutes);
app.use('/api/wishlist',      wishlistRoutes);
app.use('/api/upload',        uploadRoutes);

// ── Error handling ───────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`LUXE backend running on port ${PORT} [${process.env.NODE_ENV}]`);
});
