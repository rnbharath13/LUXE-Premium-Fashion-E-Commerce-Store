USE luxe_store;
GO

INSERT INTO categories (name, label, display_order) VALUES
('men',         'Men''s',      1),
('women',       'Women''s',    2),
('accessories', 'Accessories', 3),
('footwear',    'Footwear',    4),
('outerwear',   'Outerwear',   5);

INSERT INTO brands (name) VALUES
('LUXE Studio'),
('Armani'),
('Zara'),
('H&M'),
('Gucci'),
('Prada');
GO



-- Create database
CREATE DATABASE luxe_store;
GO

USE luxe_store;
GO

-- Categories table
CREATE TABLE categories (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  name NVARCHAR(100) NOT NULL UNIQUE,
  slug NVARCHAR(100) NOT NULL UNIQUE,
  description NVARCHAR(MAX),
  image_url NVARCHAR(MAX),
  created_at DATETIME2 DEFAULT GETUTCDATE()
);

-- Brands table
CREATE TABLE brands (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  name NVARCHAR(100) NOT NULL UNIQUE,
  created_at DATETIME2 DEFAULT GETUTCDATE()
);

-- Products table
CREATE TABLE products (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  name NVARCHAR(255) NOT NULL,
  slug NVARCHAR(255) NOT NULL UNIQUE,
  category_id UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES categories(id) ON DELETE CASCADE,
  brand_id UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES brands(id) ON DELETE CASCADE,
  description NVARCHAR(MAX),
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  rating DECIMAL(3, 2) DEFAULT 0,
  reviews_count INT DEFAULT 0,
  in_stock BIT DEFAULT 1,
  created_at DATETIME2 DEFAULT GETUTCDATE(),
  updated_at DATETIME2 DEFAULT GETUTCDATE()
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand_id);

-- Product images table
CREATE TABLE product_images (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  product_id UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES products(id) ON DELETE CASCADE,
  image_url NVARCHAR(MAX) NOT NULL,
  alt_text NVARCHAR(255),
  is_primary BIT DEFAULT 0,
  display_order INT DEFAULT 0,
  created_at DATETIME2 DEFAULT GETUTCDATE()
);

CREATE INDEX idx_product_images_product ON product_images(product_id);

-- Product variants (size/color combinations with pricing modifiers)
CREATE TABLE product_variants (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  product_id UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES products(id) ON DELETE CASCADE,
  size NVARCHAR(20) NOT NULL,
  color NVARCHAR(50),
  price_modifier DECIMAL(5, 4) DEFAULT 0,
  in_stock BIT DEFAULT 1,
  created_at DATETIME2 DEFAULT GETUTCDATE()
);

CREATE INDEX idx_variants_product ON product_variants(product_id);

-- Product tags table
CREATE TABLE product_tags (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  product_id UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES products(id) ON DELETE CASCADE,
  tag NVARCHAR(50) NOT NULL,
  CHECK (tag IN ('New Arrival', 'Sale', 'Best Seller', 'Premium', 'Trending'))
);

CREATE INDEX idx_tags_product ON product_tags(product_id);

-- Users table
CREATE TABLE users (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  email NVARCHAR(255) NOT NULL UNIQUE,
  password_hash NVARCHAR(255) NOT NULL,
  first_name NVARCHAR(100),
  last_name NVARCHAR(100),
  phone NVARCHAR(20),
  created_at DATETIME2 DEFAULT GETUTCDATE(),
  updated_at DATETIME2 DEFAULT GETUTCDATE()
);

CREATE INDEX idx_users_email ON users(email);

-- Orders table
CREATE TABLE orders (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  user_id UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE,
  order_number NVARCHAR(50) NOT NULL UNIQUE,
  status NVARCHAR(20) DEFAULT 'pending',
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  shipping_address NVARCHAR(MAX),
  billing_address NVARCHAR(MAX),
  payment_method NVARCHAR(50),
  created_at DATETIME2 DEFAULT GETUTCDATE(),
  updated_at DATETIME2 DEFAULT GETUTCDATE(),
  CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled'))
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

-- Order items table
CREATE TABLE order_items (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  order_id UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES orders(id) ON DELETE CASCADE,
  product_id UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES products(id),
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  size NVARCHAR(20),
  color NVARCHAR(50),
  created_at DATETIME2 DEFAULT GETUTCDATE()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- Wishlist table
CREATE TABLE wishlist (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  user_id UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE,
  product_id UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES products(id) ON DELETE CASCADE,
  created_at DATETIME2 DEFAULT GETUTCDATE(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_wishlist_user ON wishlist(user_id);
