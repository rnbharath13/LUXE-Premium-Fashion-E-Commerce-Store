# LUXE E-Commerce Backend

Express.js API backend for LUXE e-commerce platform, connected to SQL Server.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   - Copy `.env.example` to `.env`
   - Update with your SQL Server credentials:
     - `DB_SERVER`: Your SQL Server instance (e.g., `DESKTOP-KSNTVK8\SQLEXPRESS`)
     - `DB_NAME`: Database name (`luxe_store`)
     - `DB_USER`: SQL Server username (`sa`)
     - `DB_PASSWORD`: Your SQL Server password
     - `JWT_SECRET`: Generate a secure secret key

3. **Ensure database is created:**
   - Run the T-SQL schema in SQL Server Management Studio
   - All 9 tables should be created (products, orders, users, etc.)

## Running

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server runs on `http://localhost:5000` by default.

## API Endpoints

### Products
- `GET /api/products` - List all products (supports filters)
- `GET /api/products/:id` - Get product details

### Categories
- `GET /api/categories` - List all categories
- `GET /api/categories/:slug` - Get category by slug

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/user/:userId` - Get user's orders
- `GET /api/orders/:orderId` - Get order details

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token

## Environment Variables

```
DB_SERVER=DESKTOP-KSNTVK8\SQLEXPRESS
DB_NAME=luxe_store
DB_USER=sa
DB_PASSWORD=your_password
DB_ENCRYPT=false
PORT=5000
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5173
```

## Database Schema

9 tables:
- `users` - User accounts
- `categories` - Product categories
- `brands` - Product brands
- `products` - Product catalog
- `product_images` - Product images
- `product_variants` - Size/color variants with pricing
- `product_tags` - Product tags (New Arrival, Sale, etc.)
- `orders` - Customer orders
- `order_items` - Individual items in orders
- `wishlist` - User wishlists
