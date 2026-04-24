-- ============================================================
-- Run this BEFORE SEED_DATA.sql
-- Creates subcategories table + subcategory_id on products
-- ============================================================

CREATE TABLE IF NOT EXISTS public.subcategories (
  id         uuid NOT NULL DEFAULT gen_random_uuid(),
  name       character varying NOT NULL,
  slug       character varying NOT NULL UNIQUE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  image_url  text,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT subcategories_pkey PRIMARY KEY (id)
);

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS subcategory_id uuid REFERENCES public.subcategories(id) ON DELETE SET NULL;

-- Disable RLS on the new table
ALTER TABLE public.subcategories DISABLE ROW LEVEL SECURITY;
