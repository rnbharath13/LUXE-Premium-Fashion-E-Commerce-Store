CREATE DATABASE luxe_store;
GO
USE luxe_store;
GO

USE luxe_store;
GO

-- ── 1. users ────────────────────────────────────────
CREATE TABLE users (
  id            UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  email         NVARCHAR(255)    UNIQUE NOT NULL,
  full_name     NVARCHAR(150),
  password_hash NVARCHAR(255)    NOT NULL,
  avatar_url    NVARCHAR(MAX),
  created_at    DATETIME2        DEFAULT GETDATE()
);
GO

-- ── 2. categories ───────────────────────────────────
CREATE TABLE categories (
  id            UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  name          NVARCHAR(50)     UNIQUE NOT NULL,  -- 'men', 'women'
  label         NVARCHAR(100)    NOT NULL,          -- "Men's"
  image_url     NVARCHAR(MAX),
  display_order INT              DEFAULT 0
);
GO

-- ── 3. brands ───────────────────────────────────────
CREATE TABLE brands (
  id       UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  name     NVARCHAR(100)    UNIQUE NOT NULL,
  logo_url NVARCHAR(MAX)
);
GO

-- ── 4. products ─────────────────────────────────────
CREATE TABLE products (
  id             UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  name           NVARCHAR(255)   NOT NULL,
  description    NVARCHAR(MAX),
  price          DECIMAL(10,2)   NOT NULL,
  original_price DECIMAL(10,2),
  rating         DECIMAL(3,2)    DEFAULT 0,
  review_count   INT             DEFAULT 0,
  in_stock       BIT             DEFAULT 1,
  brand_id       UNIQUEIDENTIFIER REFERENCES brands(id),
  category_id    UNIQUEIDENTIFIER REFERENCES categories(id),
  created_at     DATETIME2       DEFAULT GETDATE()
);
GO

-- ── 5. product_images ───────────────────────────────
CREATE TABLE product_images (
  id            UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  product_id    UNIQUEIDENTIFIER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url     NVARCHAR(MAX)    NOT NULL,
  is_primary    BIT              DEFAULT 0,
  display_order INT              DEFAULT 0
);
GO

-- ── 6. product_variants ─────────────────────────────
CREATE TABLE product_variants (
  id             UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  product_id     UNIQUEIDENTIFIER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size           NVARCHAR(20),       -- 'S','M','L','42','32'
  color          NVARCHAR(20),       -- '#1c1c1c'
  color_name     NVARCHAR(50),       -- 'Black'
  price_modifier DECIMAL(5,4)  DEFAULT 0,   -- 0.06 = +6%
  stock_quantity INT           DEFAULT 0
);
GO

-- ── 7. product_tags ─────────────────────────────────
CREATE TABLE product_tags (
  id         UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  product_id UNIQUEIDENTIFIER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tag        NVARCHAR(50)     NOT NULL
    CONSTRAINT chk_tag CHECK (tag IN (
      'Sale','New Arrival','Best Seller','Trending','Premium'
    ))
);
GO

-- ── 8. orders ───────────────────────────────────────
CREATE TABLE orders (
  id               UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  user_id          UNIQUEIDENTIFIER REFERENCES users(id),
  order_number     NVARCHAR(20)     UNIQUE NOT NULL,
  status           NVARCHAR(20)     DEFAULT 'pending'
    CONSTRAINT chk_order_status CHECK (status IN (
      'pending','processing','shipped','delivered','cancelled'
    )),
  subtotal         DECIMAL(10,2)    NOT NULL,
  shipping_cost    DECIMAL(10,2)    DEFAULT 0,
  tax              DECIMAL(10,2)    DEFAULT 0,
  grand_total      DECIMAL(10,2)    NOT NULL,
  shipping_address NVARCHAR(MAX),   -- store as JSON string
  tracking_number  NVARCHAR(100),
  created_at       DATETIME2        DEFAULT GETDATE()
);
GO

-- ── 9. order_items ──────────────────────────────────
CREATE TABLE order_items (
  id           UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  order_id     UNIQUEIDENTIFIER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id   UNIQUEIDENTIFIER REFERENCES products(id),
  variant_id   UNIQUEIDENTIFIER REFERENCES product_variants(id),
  product_name NVARCHAR(255)    NOT NULL,
  image_url    NVARCHAR(MAX),
  quantity     INT              NOT NULL,
  unit_price   DECIMAL(10,2)    NOT NULL
);
GO

-- ── Indexes ──────────────────────────────────────────
CREATE INDEX idx_products_category   ON products(category_id);
CREATE INDEX idx_products_brand      ON products(brand_id);
CREATE INDEX idx_product_images      ON product_images(product_id);
CREATE INDEX idx_product_variants    ON product_variants(product_id);
CREATE INDEX idx_product_tags        ON product_tags(product_id);
CREATE INDEX idx_orders_user         ON orders(user_id);
CREATE INDEX idx_order_items_order   ON order_items(order_id);
GO
