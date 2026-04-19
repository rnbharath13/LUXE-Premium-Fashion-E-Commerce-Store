# Full-Stack E-Commerce Platform

A production-ready e-commerce platform built with React, Node.js, Express, and Supabase.

## Features

### Customer Features
- ✅ User registration/login (JWT-based)
- ✅ Product listing with pagination
- ✅ Product details and search
- ✅ Filter by category and price
- ✅ Shopping cart management
- ✅ Checkout and order placement
- ✅ Order history
- ✅ User profile management

### Admin Features
- ✅ Admin dashboard with analytics
- ✅ Product management (CRUD)
- ✅ Order management
- ✅ User management
- ✅ Sales analytics

## Tech Stack

**Frontend:**
- React 18
- React Router DOM
- Axios
- Tailwind CSS
- Vite

**Backend:**
- Node.js + Express
- Supabase (PostgreSQL + Auth)
- JWT Authentication
- bcrypt (Password hashing)

**Database:**
- Supabase (PostgreSQL)

## Project Structure

```
E-com/
├── server/                 # Backend
│   ├── controllers/        # Route handlers
│   ├── routes/            # API routes
│   ├── middlewares/       # Auth, validation, error handling
│   ├── models/            # Database schemas
│   ├── config/            # Supabase config
│   ├── utils/             # JWT, password hashing
│   └── server.js          # Express app entry
├── src/                   # Frontend
│   ├── components/        # Reusable components
│   ├── pages/            # Page components
│   ├── context/          # Auth & Cart context
│   ├── services/         # API service layer
│   ├── hooks/            # Custom hooks
│   ├── utils/            # Helper functions
│   ├── assets/           # Images, fonts
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # React entry point
│   └── styles.css        # Tailwind configuration
├── package.json          # Frontend dependencies
├── vite.config.js        # Vite configuration
└── tailwind.config.js    # Tailwind configuration
```

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- Supabase account

### Backend Setup

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create .env file:**
   ```bash
   cp .env.example .env
   ```

4. **Add your Supabase credentials to .env:**
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_KEY=your_service_key
   JWT_SECRET=your_jwt_secret
   ```

5. **Setup Supabase Database:**
   - Go to Supabase SQL Editor
   - Run the SQL from `server/models/schema.js`

6. **Start the server:**
   ```bash
   npm run dev
   ```
   Server runs on http://localhost:5000

### Frontend Setup

1. **In project root, install dependencies:**
   ```bash
   npm install
   ```

2. **Create .env file:**
   ```bash
   cp .env.example .env
   ```

3. **Add environment variables:**
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```
   App runs on http://localhost:5173

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Products
- `GET /api/products` - List products (with pagination, filters)
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add to cart
- `PUT /api/cart/:id` - Update cart item quantity
- `DELETE /api/cart/:id` - Remove from cart
- `DELETE /api/cart` - Clear cart

### Orders
- `POST /api/orders/create` - Create order
- `GET /api/orders/user` - Get user orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id` - Update order status (admin)

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - List users
- `GET /api/admin/orders` - List all orders
- `GET /api/admin/analytics` - Sales analytics

## Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
```
Deploy the `dist` folder to Vercel or Netlify.

### Backend (Render/Railway/Heroku)
```bash
npm start
```

Set environment variables on deployment platform.

## Security Features

- ✅ JWT authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (RBAC)
- ✅ Rate limiting
- ✅ Secure headers (Helmet)
- ✅ Input validation and sanitization
- ✅ CORS enabled

## Payment Integration (Optional)

### Stripe
1. Install: `npm install stripe`
2. Add keys to .env
3. Implement payment route

### Razorpay
1. Install: `npm install razorpay`
2. Add keys to .env
3. Implement payment route

## Performance Optimizations

- ✅ Code splitting with Lazy Loading
- ✅ Pagination for product listing
- ✅ API response caching
- ✅ Image optimization
- ✅ Database indexing
- ✅ Query optimization in Supabase

## Development Guidelines

### Code Style
- Use ES6+ features
- Follow naming conventions
- Keep components reusable
- Write clean, modular code

### Component Structure
```jsx
// Import statements
import React from 'react';

// Component definition
function ComponentName() {
  return (
    <div>Content</div>
  );
}

export default ComponentName;
```

### Adding New Pages
1. Create file in `src/pages/`
2. Add route in `src/App.jsx`
3. Create components in `src/components/`

### Adding New API Endpoints
1. Create controller in `server/controllers/`
2. Create route in `server/routes/`
3. Add to `server.js`

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### Supabase Connection Issues
- Verify URL and keys in .env
- Check Supabase project is active
- Ensure IP is whitelisted

### Frontend API Errors
- Check backend is running
- Verify VITE_API_URL in .env
- Check browser console for errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to branch
5. Submit pull request

## License

MIT License

## Support

For issues or questions, create an issue on GitHub.
