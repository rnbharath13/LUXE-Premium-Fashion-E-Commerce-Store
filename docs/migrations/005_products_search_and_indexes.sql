-- Migration 005: Production-grade product catalog — full-text search, indexes, atomic rating.
-- Run this in Supabase SQL Editor, then restart the backend.

-- ─── 1. Search vector column (denormalized, maintained by triggers) ───────────
-- 'A' weight: name (most relevant)
-- 'B' weight: brand name + tags (high relevance)
-- 'C' weight: description (lowest)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Helper function: rebuild a single product's search vector, joining brand + tags.
-- Called by triggers below — DRY up the query string in one place.
CREATE OR REPLACE FUNCTION public.refresh_product_search_vector(pid uuid)
RETURNS void AS $$
DECLARE
  prod_name  text;
  prod_desc  text;
  brand_name text;
  tag_text   text;
BEGIN
  SELECT p.name, p.description, b.name
    INTO prod_name, prod_desc, brand_name
  FROM public.products p
  LEFT JOIN public.brands b ON b.id = p.brand_id
  WHERE p.id = pid;

  SELECT string_agg(tag, ' ') INTO tag_text
  FROM public.product_tags WHERE product_id = pid;

  UPDATE public.products SET search_vector =
       setweight(to_tsvector('english', coalesce(prod_name,  '')), 'A')
    || setweight(to_tsvector('english', coalesce(brand_name, '')), 'B')
    || setweight(to_tsvector('english', coalesce(tag_text,   '')), 'B')
    || setweight(to_tsvector('english', coalesce(prod_desc,  '')), 'C')
  WHERE id = pid;
END;
$$ LANGUAGE plpgsql;

-- Trigger: rebuild after products row INSERT or UPDATE of relevant fields
CREATE OR REPLACE FUNCTION public.trg_products_search() RETURNS trigger AS $$
BEGIN
  PERFORM public.refresh_product_search_vector(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_search_trigger ON public.products;
CREATE TRIGGER products_search_trigger
  AFTER INSERT OR UPDATE OF name, description, brand_id ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.trg_products_search();

-- Trigger: rebuild on product_tags INSERT/UPDATE/DELETE
CREATE OR REPLACE FUNCTION public.trg_product_tags_search() RETURNS trigger AS $$
BEGIN
  PERFORM public.refresh_product_search_vector(coalesce(NEW.product_id, OLD.product_id));
  RETURN coalesce(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS product_tags_search_trigger ON public.product_tags;
CREATE TRIGGER product_tags_search_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.product_tags
  FOR EACH ROW EXECUTE FUNCTION public.trg_product_tags_search();

-- Backfill for existing rows
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT id FROM public.products LOOP
    PERFORM public.refresh_product_search_vector(r.id);
  END LOOP;
END $$;

-- ─── 2. Indexes ───────────────────────────────────────────────────────────────
-- GIN on search_vector — the workhorse for full-text queries
CREATE INDEX IF NOT EXISTS products_search_vector_idx
  ON public.products USING GIN (search_vector);

-- B-tree on FK columns — speeds up category/brand filters
CREATE INDEX IF NOT EXISTS products_category_id_idx ON public.products (category_id);
CREATE INDEX IF NOT EXISTS products_brand_id_idx    ON public.products (brand_id);

-- B-tree on commonly-sorted columns
CREATE INDEX IF NOT EXISTS products_price_idx       ON public.products (price);
CREATE INDEX IF NOT EXISTS products_rating_idx      ON public.products (rating DESC);
CREATE INDEX IF NOT EXISTS products_created_at_idx  ON public.products (created_at DESC);

-- product_tags lookups by product_id (filter chain) and by tag (faceting)
CREATE INDEX IF NOT EXISTS product_tags_product_idx ON public.product_tags (product_id);
CREATE INDEX IF NOT EXISTS product_tags_tag_idx     ON public.product_tags (tag);

-- product_variants lookup by product_id (PDP fetch + size/color filter)
CREATE INDEX IF NOT EXISTS product_variants_product_idx ON public.product_variants (product_id);

-- product_images lookup by product_id (gallery + listing primary image)
CREATE INDEX IF NOT EXISTS product_images_product_idx ON public.product_images (product_id);

-- reviews lookup by product_id (PDP + rating recalc trigger)
CREATE INDEX IF NOT EXISTS reviews_product_id_idx ON public.reviews (product_id);

-- ─── 3. Atomic rating recalc — replaces N+1 in createProductReview ────────────
CREATE OR REPLACE FUNCTION public.trg_recalc_product_rating() RETURNS trigger AS $$
DECLARE pid uuid;
BEGIN
  pid := coalesce(NEW.product_id, OLD.product_id);
  UPDATE public.products SET
    rating        = coalesce((SELECT round(avg(rating)::numeric, 1) FROM public.reviews WHERE product_id = pid), 0),
    reviews_count = (SELECT count(*) FROM public.reviews WHERE product_id = pid)
  WHERE id = pid;
  RETURN coalesce(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS reviews_rating_trigger ON public.reviews;
CREATE TRIGGER reviews_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.trg_recalc_product_rating();

-- One-time backfill: ensure any existing products have correct counts (cheap; runs once)
UPDATE public.products p SET
  rating        = coalesce((SELECT round(avg(rating)::numeric, 1) FROM public.reviews WHERE product_id = p.id), 0),
  reviews_count = (SELECT count(*) FROM public.reviews WHERE product_id = p.id);
