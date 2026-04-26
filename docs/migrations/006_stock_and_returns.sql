-- Migration 006: Real stock counting + post-paid return / refund workflow
-- ==========================================================================
-- Adds:
--   • stock_quantity columns (variant-level + product-level fallback)
--   • Atomic decrement_stock / restore_stock SQL functions with row-level
--     locking (SELECT ... FOR UPDATE) so concurrent orders cannot race.
--   • order_returns table for the return / refund workflow
--
-- Run order: 002 → 003 → 004 → 005 → 006
-- ==========================================================================

-- ─── 1. Stock columns ───────────────────────────────────────────────────────
-- We track stock at TWO levels:
--   • product_variants.stock_quantity — the SKU level (preferred)
--   • products.stock_quantity         — fallback for products with no variants
-- The decrement/restore functions try variant first, fall back to product.

ALTER TABLE public.product_variants
  ADD COLUMN IF NOT EXISTS stock_quantity int NOT NULL DEFAULT 0
    CHECK (stock_quantity >= 0);

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS stock_quantity int NOT NULL DEFAULT 0
    CHECK (stock_quantity >= 0);

-- Backfill: existing products marked in_stock=true get a starter stock count
-- so the catalog still sells. Real numbers will come via the admin module.
UPDATE public.product_variants
   SET stock_quantity = CASE WHEN in_stock THEN 50 ELSE 0 END
 WHERE stock_quantity = 0;

UPDATE public.products
   SET stock_quantity = CASE WHEN in_stock THEN 100 ELSE 0 END
 WHERE stock_quantity = 0;

-- ─── 2. Atomic stock decrement ──────────────────────────────────────────────
-- Returns true on success, false if not enough stock.
-- FOR UPDATE locks the row for the duration of the txn — concurrent
-- decrements queue up and only one wins on the last unit.
CREATE OR REPLACE FUNCTION public.decrement_stock(
  p_product_id uuid,
  p_size       text DEFAULT NULL,
  p_color      text DEFAULT NULL,
  p_qty        int  DEFAULT 1
) RETURNS boolean AS $$
DECLARE
  v_id    uuid;
  v_stock int;
BEGIN
  IF p_qty <= 0 THEN
    RAISE EXCEPTION 'qty must be > 0, got %', p_qty;
  END IF;

  -- Variant level wins when caller provided size or color.
  IF p_size IS NOT NULL OR p_color IS NOT NULL THEN
    SELECT id, stock_quantity INTO v_id, v_stock
      FROM public.product_variants
     WHERE product_id = p_product_id
       AND (p_size  IS NULL OR size  = p_size)
       AND (p_color IS NULL OR color = p_color)
     FOR UPDATE
     LIMIT 1;

    IF v_id IS NOT NULL THEN
      IF v_stock < p_qty THEN
        RETURN false;
      END IF;
      UPDATE public.product_variants
         SET stock_quantity = stock_quantity - p_qty,
             in_stock       = ((stock_quantity - p_qty) > 0)
       WHERE id = v_id;
      RETURN true;
    END IF;
  END IF;

  -- Fall back to product-level stock.
  SELECT stock_quantity INTO v_stock
    FROM public.products
   WHERE id = p_product_id
   FOR UPDATE;

  IF v_stock IS NULL OR v_stock < p_qty THEN
    RETURN false;
  END IF;

  UPDATE public.products
     SET stock_quantity = stock_quantity - p_qty,
         in_stock       = ((stock_quantity - p_qty) > 0)
   WHERE id = p_product_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- ─── 3. Atomic stock restore (cancel / return path) ─────────────────────────
CREATE OR REPLACE FUNCTION public.restore_stock(
  p_product_id uuid,
  p_size       text DEFAULT NULL,
  p_color      text DEFAULT NULL,
  p_qty        int  DEFAULT 1
) RETURNS void AS $$
BEGIN
  IF p_qty <= 0 THEN
    RAISE EXCEPTION 'qty must be > 0, got %', p_qty;
  END IF;

  IF p_size IS NOT NULL OR p_color IS NOT NULL THEN
    UPDATE public.product_variants
       SET stock_quantity = stock_quantity + p_qty,
           in_stock       = true
     WHERE product_id = p_product_id
       AND (p_size  IS NULL OR size  = p_size)
       AND (p_color IS NULL OR color = p_color);
    IF FOUND THEN RETURN; END IF;
  END IF;

  UPDATE public.products
     SET stock_quantity = stock_quantity + p_qty,
         in_stock       = true
   WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql;

-- ─── 4. Returns table ───────────────────────────────────────────────────────
-- One return request per order (partial returns out of scope for v1).
-- Status flow:  pending → approved → refunded   (admin path)
--               pending → rejected               (admin path)
-- Until the admin module ships, requestReturn auto-approves and refunds
-- (mock — flips order.payment_status to 'refunded' but no real money moves).
CREATE TABLE IF NOT EXISTS public.order_returns (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES public.users(id),
  reason        text NOT NULL CHECK (length(trim(reason)) BETWEEN 1 AND 1000),
  status        text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'approved', 'rejected', 'refunded')),
  refund_amount numeric NOT NULL CHECK (refund_amount >= 0),
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  resolved_at   timestamptz,
  CONSTRAINT order_returns_one_per_order UNIQUE (order_id)
);

CREATE INDEX IF NOT EXISTS order_returns_user_idx   ON public.order_returns(user_id);
CREATE INDEX IF NOT EXISTS order_returns_status_idx ON public.order_returns(status);
