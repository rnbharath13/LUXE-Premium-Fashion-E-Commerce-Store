-- ============================================================
-- SEED DATA — Run AFTER MIGRATION_SUBCATEGORIES.sql
-- Matches actual schema: product_images, product_tags separate
-- ============================================================

-- ── Brands ──────────────────────────────────────────────────
INSERT INTO public.brands (id, name) VALUES
  ('b1000000-0000-0000-0000-000000000001'::uuid, 'Maison Laurent'),
  ('b2000000-0000-0000-0000-000000000002'::uuid, 'Atelier Nord'),
  ('b3000000-0000-0000-0000-000000000003'::uuid, 'Vega Studio'),
  ('b4000000-0000-0000-0000-000000000004'::uuid, 'Clove & Co'),
  ('b5000000-0000-0000-0000-000000000005'::uuid, 'Solenne'),
  ('b6000000-0000-0000-0000-000000000006'::uuid, 'Stride Lab')
ON CONFLICT DO NOTHING;

-- ── Categories ──────────────────────────────────────────────
INSERT INTO public.categories (name, slug) VALUES
  ('Men',         'men'),
  ('Women',       'women'),
  ('Footwear',    'footwear'),
  ('Accessories', 'accessories'),
  ('Outerwear',   'outerwear')
ON CONFLICT DO NOTHING;

-- ── Subcategories ───────────────────────────────────────────
INSERT INTO public.subcategories (name, slug, category_id) VALUES
  ('Shirts',    'shirts',         (SELECT id FROM public.categories WHERE slug='men')),
  ('Blazers',   'blazers',        (SELECT id FROM public.categories WHERE slug='men')),
  ('Trousers',  'trousers',       (SELECT id FROM public.categories WHERE slug='men')),
  ('Knitwear',  'knitwear',       (SELECT id FROM public.categories WHERE slug='men')),
  ('Outerwear', 'outerwear',      (SELECT id FROM public.categories WHERE slug='men')),
  ('Dresses',   'dresses',        (SELECT id FROM public.categories WHERE slug='women')),
  ('Tops',      'tops',           (SELECT id FROM public.categories WHERE slug='women')),
  ('Knitwear',  'knitwear-women', (SELECT id FROM public.categories WHERE slug='women')),
  ('Bags',      'bags-women',     (SELECT id FROM public.categories WHERE slug='women')),
  ('Sneakers',  'sneakers',       (SELECT id FROM public.categories WHERE slug='footwear')),
  ('Boots',     'boots',          (SELECT id FROM public.categories WHERE slug='footwear')),
  ('Sandals',   'sandals',        (SELECT id FROM public.categories WHERE slug='footwear')),
  ('Formal',    'formal',         (SELECT id FROM public.categories WHERE slug='footwear')),
  ('Bags',      'bags',           (SELECT id FROM public.categories WHERE slug='accessories')),
  ('Jewellery', 'jewellery',      (SELECT id FROM public.categories WHERE slug='accessories')),
  ('Belts',     'belts',          (SELECT id FROM public.categories WHERE slug='accessories')),
  ('Scarves',   'scarves',        (SELECT id FROM public.categories WHERE slug='accessories'))
ON CONFLICT DO NOTHING;

-- ── Products ────────────────────────────────────────────────
INSERT INTO public.products
  (id, name, slug, category_id, subcategory_id, brand_id, price, original_price, description, rating, reviews_count, in_stock)
VALUES
  ('f0000001-0000-0000-0000-000000000001'::uuid, 'Oxford Button-Down Shirt',    'oxford-button-down-shirt',
   (SELECT id FROM public.categories WHERE slug='men'), (SELECT id FROM public.subcategories WHERE slug='shirts'),
   'b4000000-0000-0000-0000-000000000004'::uuid, 195, NULL, 'A classic Oxford weave shirt with a slim fit and button-down collar.', 4.7, 84, true),

  ('f0000002-0000-0000-0000-000000000002'::uuid, 'Linen Resort Shirt',           'linen-resort-shirt',
   (SELECT id FROM public.categories WHERE slug='men'), (SELECT id FROM public.subcategories WHERE slug='shirts'),
   'b2000000-0000-0000-0000-000000000002'::uuid, 145, NULL, 'Relaxed fit linen shirt perfect for warm weather.', 4.5, 61, true),

  ('f0000003-0000-0000-0000-000000000003'::uuid, 'Slim-Fit Dress Shirt',         'slim-fit-dress-shirt',
   (SELECT id FROM public.categories WHERE slug='men'), (SELECT id FROM public.subcategories WHERE slug='shirts'),
   'b1000000-0000-0000-0000-000000000001'::uuid, 220, NULL, 'Crisp poplin dress shirt tailored for a modern slim silhouette.', 4.8, 112, true),

  ('f0000004-0000-0000-0000-000000000004'::uuid, 'Wool-Blend Blazer',            'wool-blend-blazer',
   (SELECT id FROM public.categories WHERE slug='men'), (SELECT id FROM public.subcategories WHERE slug='blazers'),
   'b4000000-0000-0000-0000-000000000004'::uuid, 490, NULL, 'Single-breasted blazer in a premium wool-cashmere blend.', 4.9, 47, true),

  ('f0000005-0000-0000-0000-000000000005'::uuid, 'Unstructured Linen Blazer',    'unstructured-linen-blazer',
   (SELECT id FROM public.categories WHERE slug='men'), (SELECT id FROM public.subcategories WHERE slug='blazers'),
   'b3000000-0000-0000-0000-000000000003'::uuid, 340, 420, 'Light and breathable unstructured blazer for a relaxed smart look.', 4.6, 33, true),

  ('f0000006-0000-0000-0000-000000000006'::uuid, 'Tailored Slim Trousers',       'tailored-slim-trousers',
   (SELECT id FROM public.categories WHERE slug='men'), (SELECT id FROM public.subcategories WHERE slug='trousers'),
   'b4000000-0000-0000-0000-000000000004'::uuid, 265, NULL, 'Clean-cut slim trousers in a stretch wool blend.', 4.7, 58, true),

  ('f0000007-0000-0000-0000-000000000007'::uuid, 'Wide-Leg Chinos',              'wide-leg-chinos',
   (SELECT id FROM public.categories WHERE slug='men'), (SELECT id FROM public.subcategories WHERE slug='trousers'),
   'b2000000-0000-0000-0000-000000000002'::uuid, 195, NULL, 'Relaxed wide-leg chinos with a high-rise waist.', 4.4, 29, true),

  ('f0000008-0000-0000-0000-000000000008'::uuid, 'Merino Crew-Neck Jumper',      'merino-crew-neck-jumper',
   (SELECT id FROM public.categories WHERE slug='men'), (SELECT id FROM public.subcategories WHERE slug='knitwear'),
   'b1000000-0000-0000-0000-000000000001'::uuid, 310, NULL, 'Fine merino wool crew-neck jumper in a range of classic colours.', 4.8, 93, true),

  ('f0000009-0000-0000-0000-000000000009'::uuid, 'Chunky Knit Cardigan',         'chunky-knit-cardigan',
   (SELECT id FROM public.categories WHERE slug='men'), (SELECT id FROM public.subcategories WHERE slug='knitwear'),
   'b2000000-0000-0000-0000-000000000002'::uuid, 275, 340, 'Oversized chunky cardigan in an oatmeal boucle knit.', 4.6, 44, true),

  ('f000000a-0000-0000-0000-00000000000a'::uuid, 'Double-Breasted Overcoat',     'double-breasted-overcoat',
   (SELECT id FROM public.categories WHERE slug='men'), (SELECT id FROM public.subcategories WHERE slug='outerwear'),
   'b4000000-0000-0000-0000-000000000004'::uuid, 695, NULL, 'Heritage double-breasted overcoat in charcoal melton wool.', 4.9, 36, true),

  ('f000000b-0000-0000-0000-00000000000b'::uuid, 'Silk Slip Dress',              'silk-slip-dress',
   (SELECT id FROM public.categories WHERE slug='women'), (SELECT id FROM public.subcategories WHERE slug='dresses'),
   'b5000000-0000-0000-0000-000000000005'::uuid, 385, NULL, 'Fluid silk charmeuse slip dress with adjustable straps.', 4.8, 127, true),

  ('f000000c-0000-0000-0000-00000000000c'::uuid, 'Midi Wrap Dress',              'midi-wrap-dress',
   (SELECT id FROM public.categories WHERE slug='women'), (SELECT id FROM public.subcategories WHERE slug='dresses'),
   'b3000000-0000-0000-0000-000000000003'::uuid, 295, 375, 'Effortless wrap dress in a printed viscose crepe.', 4.7, 89, true),

  ('f000000d-0000-0000-0000-00000000000d'::uuid, 'Knit Bodycon Dress',           'knit-bodycon-dress',
   (SELECT id FROM public.categories WHERE slug='women'), (SELECT id FROM public.subcategories WHERE slug='dresses'),
   'b5000000-0000-0000-0000-000000000005'::uuid, 245, NULL, 'Form-fitting ribbed knit dress with a mock neck.', 4.6, 54, true),

  ('f000000e-0000-0000-0000-00000000000e'::uuid, 'Silk Blouse',                  'silk-blouse',
   (SELECT id FROM public.categories WHERE slug='women'), (SELECT id FROM public.subcategories WHERE slug='tops'),
   'b1000000-0000-0000-0000-000000000001'::uuid, 195, NULL, 'Relaxed silk blouse with a subtle sheen and V-neckline.', 4.7, 76, true),

  ('f000000f-0000-0000-0000-00000000000f'::uuid, 'Cropped Cashmere Turtleneck',  'cropped-cashmere-turtleneck',
   (SELECT id FROM public.categories WHERE slug='women'), (SELECT id FROM public.subcategories WHERE slug='tops'),
   'b5000000-0000-0000-0000-000000000005'::uuid, 325, NULL, 'Luxuriously soft cropped turtleneck in pure cashmere.', 4.9, 103, true),

  ('f0000010-0000-0000-0000-000000000010'::uuid, 'Oversized Wool Jumper',        'oversized-wool-jumper',
   (SELECT id FROM public.categories WHERE slug='women'), (SELECT id FROM public.subcategories WHERE slug='knitwear-women'),
   'b2000000-0000-0000-0000-000000000002'::uuid, 280, NULL, 'Cosy oversized jumper in a soft lambswool blend.', 4.7, 68, true),

  ('f0000011-0000-0000-0000-000000000011'::uuid, 'Structured Tote Bag',          'structured-tote-bag',
   (SELECT id FROM public.categories WHERE slug='women'), (SELECT id FROM public.subcategories WHERE slug='bags-women'),
   'b1000000-0000-0000-0000-000000000001'::uuid, 595, NULL, 'Architectural structured tote in smooth Italian leather.', 4.9, 149, true),

  ('f0000012-0000-0000-0000-000000000012'::uuid, 'Mini Crossbody Bag',           'mini-crossbody-bag',
   (SELECT id FROM public.categories WHERE slug='women'), (SELECT id FROM public.subcategories WHERE slug='bags-women'),
   'b5000000-0000-0000-0000-000000000005'::uuid, 345, 430, 'Compact crossbody in grained leather with a gold chain strap.', 4.7, 82, true),

  ('f0000013-0000-0000-0000-000000000013'::uuid, 'Low-Top Leather Sneaker',      'low-top-leather-sneaker',
   (SELECT id FROM public.categories WHERE slug='footwear'), (SELECT id FROM public.subcategories WHERE slug='sneakers'),
   'b6000000-0000-0000-0000-000000000006'::uuid, 220, NULL, 'Clean minimal leather sneaker with a vulcanised sole.', 4.8, 201, true),

  ('f0000014-0000-0000-0000-000000000014'::uuid, 'Chunky Sole Sneaker',          'chunky-sole-sneaker',
   (SELECT id FROM public.categories WHERE slug='footwear'), (SELECT id FROM public.subcategories WHERE slug='sneakers'),
   'b6000000-0000-0000-0000-000000000006'::uuid, 265, NULL, 'Bold platform sneaker with a padded collar.', 4.6, 98, true),

  ('f0000015-0000-0000-0000-000000000015'::uuid, 'Chelsea Boot',                 'chelsea-boot',
   (SELECT id FROM public.categories WHERE slug='footwear'), (SELECT id FROM public.subcategories WHERE slug='boots'),
   'b4000000-0000-0000-0000-000000000004'::uuid, 345, NULL, 'Classic Chelsea boot in smooth calfskin leather.', 4.8, 143, true),

  ('f0000016-0000-0000-0000-000000000016'::uuid, 'Knee-High Riding Boot',        'knee-high-riding-boot',
   (SELECT id FROM public.categories WHERE slug='footwear'), (SELECT id FROM public.subcategories WHERE slug='boots'),
   'b3000000-0000-0000-0000-000000000003'::uuid, 485, 560, 'Elegant knee-high boot with a block heel.', 4.7, 67, true),

  ('f0000017-0000-0000-0000-000000000017'::uuid, 'Leather Flat Sandal',          'leather-flat-sandal',
   (SELECT id FROM public.categories WHERE slug='footwear'), (SELECT id FROM public.subcategories WHERE slug='sandals'),
   'b3000000-0000-0000-0000-000000000003'::uuid, 175, NULL, 'Simple leather flat sandal with a braided strap.', 4.5, 52, true),

  ('f0000018-0000-0000-0000-000000000018'::uuid, 'Oxford Derby Shoe',            'oxford-derby-shoe',
   (SELECT id FROM public.categories WHERE slug='footwear'), (SELECT id FROM public.subcategories WHERE slug='formal'),
   'b4000000-0000-0000-0000-000000000004'::uuid, 395, NULL, 'Hand-stitched full-grain leather Derby with leather sole.', 4.8, 88, true),

  ('f0000019-0000-0000-0000-000000000019'::uuid, 'Leather Weekender Bag',        'leather-weekender-bag',
   (SELECT id FROM public.categories WHERE slug='accessories'), (SELECT id FROM public.subcategories WHERE slug='bags'),
   'b1000000-0000-0000-0000-000000000001'::uuid, 745, NULL, 'Spacious full-grain leather holdall for overnight travel.', 4.9, 61, true),

  ('f000001a-0000-0000-0000-00000000001a'::uuid, 'Canvas Tote',                  'canvas-tote',
   (SELECT id FROM public.categories WHERE slug='accessories'), (SELECT id FROM public.subcategories WHERE slug='bags'),
   'b2000000-0000-0000-0000-000000000002'::uuid, 95, NULL, 'Heavy-weight canvas tote with leather handles.', 4.5, 115, true),

  ('f000001b-0000-0000-0000-00000000001b'::uuid, 'Gold Chain Necklace',          'gold-chain-necklace',
   (SELECT id FROM public.categories WHERE slug='accessories'), (SELECT id FROM public.subcategories WHERE slug='jewellery'),
   'b5000000-0000-0000-0000-000000000005'::uuid, 185, NULL, 'Delicate 18k gold-plated layering chain necklace.', 4.7, 203, true),

  ('f000001c-0000-0000-0000-00000000001c'::uuid, 'Stud Earring Set',             'stud-earring-set',
   (SELECT id FROM public.categories WHERE slug='accessories'), (SELECT id FROM public.subcategories WHERE slug='jewellery'),
   'b5000000-0000-0000-0000-000000000005'::uuid, 95, 120, 'Set of three pairs of gold and silver stud earrings.', 4.6, 177, true),

  ('f000001d-0000-0000-0000-00000000001d'::uuid, 'Leather Dress Belt',           'leather-dress-belt',
   (SELECT id FROM public.categories WHERE slug='accessories'), (SELECT id FROM public.subcategories WHERE slug='belts'),
   'b4000000-0000-0000-0000-000000000004'::uuid, 145, NULL, 'Slim box-calf leather belt with a brushed gold buckle.', 4.6, 49, true),

  ('f000001e-0000-0000-0000-00000000001e'::uuid, 'Cashmere Scarf',               'cashmere-scarf',
   (SELECT id FROM public.categories WHERE slug='accessories'), (SELECT id FROM public.subcategories WHERE slug='scarves'),
   'b1000000-0000-0000-0000-000000000001'::uuid, 195, NULL, 'Ultra-soft pure cashmere scarf in a classic windowpane check.', 4.8, 91, true),

  ('f000001f-0000-0000-0000-00000000001f'::uuid, 'Silk Printed Scarf',           'silk-printed-scarf',
   (SELECT id FROM public.categories WHERE slug='accessories'), (SELECT id FROM public.subcategories WHERE slug='scarves'),
   'b5000000-0000-0000-0000-000000000005'::uuid, 165, 210, 'Hand-rolled edges silk scarf in an archival print.', 4.7, 73, true)

ON CONFLICT DO NOTHING;

-- ── Product Images ───────────────────────────────────────────
INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES
  ('f0000001-0000-0000-0000-000000000001'::uuid, 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&w=600&q=80', true, 0),
  ('f0000002-0000-0000-0000-000000000002'::uuid, 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80', true, 0),
  ('f0000003-0000-0000-0000-000000000003'::uuid, 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80', true, 0),
  ('f0000004-0000-0000-0000-000000000004'::uuid, 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80', true, 0),
  ('f0000005-0000-0000-0000-000000000005'::uuid, 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?auto=format&fit=crop&w=600&q=80', true, 0),
  ('f0000006-0000-0000-0000-000000000006'::uuid, 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80', true, 0),
  ('f0000007-0000-0000-0000-000000000007'::uuid, 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=600&q=80', true, 0),
  ('f0000008-0000-0000-0000-000000000008'::uuid, 'https://images.unsplash.com/photo-1564859227655-91b8c0dc5ccc?auto=format&fit=crop&w=600&q=80', true, 0),
  ('f0000009-0000-0000-0000-000000000009'::uuid, 'https://images.unsplash.com/photo-1610652492500-ded49ceeb378?auto=format&fit=crop&w=600&q=80', true, 0),
  ('f000000a-0000-0000-0000-00000000000a'::uuid, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80', true, 0),
  ('f000000b-0000-0000-0000-00000000000b'::uuid, 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80', true, 0),
  ('f000000c-0000-0000-0000-00000000000c'::uuid, 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=80', true, 0),
  ('f000000d-0000-0000-0000-00000000000d'::uuid, 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=600&q=80', true, 0),
  ('f000000e-0000-0000-0000-00000000000e'::uuid, 'https://images.unsplash.com/photo-1581044777550-4cfa4e5db0b8?auto=format&fit=crop&w=600&q=80', true, 0),
  ('f000000f-0000-0000-0000-00000000000f'::uuid, 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=600&q=80', true, 0),
  ('f0000010-0000-0000-0000-000000000010'::uuid, 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=600&q=80', true, 0),
  ('f0000011-0000-0000-0000-000000000011'::uuid, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80', true, 0),
  ('f0000012-0000-0000-0000-000000000012'::uuid, 'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=600&q=80', true, 0),
  ('f0000013-0000-0000-0000-000000000013'::uuid, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80', true, 0),
  ('f0000014-0000-0000-0000-000000000014'::uuid, 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80', true, 0),
  ('f0000015-0000-0000-0000-000000000015'::uuid, 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=600&q=80', true, 0),
  ('f0000016-0000-0000-0000-000000000016'::uuid, 'https://images.unsplash.com/photo-1605812860427-4024433a70fd?auto=format&fit=crop&w=600&q=80', true, 0),
  ('f0000017-0000-0000-0000-000000000017'::uuid, 'https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=600&q=80', true, 0),
  ('f0000018-0000-0000-0000-000000000018'::uuid, 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=600&q=80', true, 0),
  ('f0000019-0000-0000-0000-000000000019'::uuid, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80', true, 0),
  ('f000001a-0000-0000-0000-00000000001a'::uuid, 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80', true, 0),
  ('f000001b-0000-0000-0000-00000000001b'::uuid, 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80', true, 0),
  ('f000001c-0000-0000-0000-00000000001c'::uuid, 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80', true, 0),
  ('f000001d-0000-0000-0000-00000000001d'::uuid, 'https://images.unsplash.com/photo-1624222247344-55a5f9cff5b1?auto=format&fit=crop&w=600&q=80', true, 0),
  ('f000001e-0000-0000-0000-00000000001e'::uuid, 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=600&q=80', true, 0),
  ('f000001f-0000-0000-0000-00000000001f'::uuid, 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=600&q=80', true, 0)
ON CONFLICT DO NOTHING;

-- Manual hotfix for existing seeded rows already present in Supabase:
-- UPDATE public.product_images
-- SET image_url = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80'
-- WHERE image_url LIKE '%photo-1594938298603-c8148c4b4fef%';

-- ── Product Tags ─────────────────────────────────────────────
INSERT INTO public.product_tags (product_id, tag) VALUES
  ('f0000001-0000-0000-0000-000000000001'::uuid, 'Best Seller'),
  ('f0000002-0000-0000-0000-000000000002'::uuid, 'New Arrival'),
  ('f0000003-0000-0000-0000-000000000003'::uuid, 'Premium'),
  ('f0000004-0000-0000-0000-000000000004'::uuid, 'Premium'),
  ('f0000004-0000-0000-0000-000000000004'::uuid, 'Best Seller'),
  ('f0000005-0000-0000-0000-000000000005'::uuid, 'Sale'),
  ('f0000006-0000-0000-0000-000000000006'::uuid, 'Best Seller'),
  ('f0000007-0000-0000-0000-000000000007'::uuid, 'New Arrival'),
  ('f0000008-0000-0000-0000-000000000008'::uuid, 'Best Seller'),
  ('f0000008-0000-0000-0000-000000000008'::uuid, 'Premium'),
  ('f0000009-0000-0000-0000-000000000009'::uuid, 'Sale'),
  ('f000000a-0000-0000-0000-00000000000a'::uuid, 'Premium'),
  ('f000000a-0000-0000-0000-00000000000a'::uuid, 'Trending'),
  ('f000000b-0000-0000-0000-00000000000b'::uuid, 'Best Seller'),
  ('f000000b-0000-0000-0000-00000000000b'::uuid, 'Premium'),
  ('f000000c-0000-0000-0000-00000000000c'::uuid, 'Sale'),
  ('f000000c-0000-0000-0000-00000000000c'::uuid, 'Trending'),
  ('f000000d-0000-0000-0000-00000000000d'::uuid, 'New Arrival'),
  ('f000000e-0000-0000-0000-00000000000e'::uuid, 'Best Seller'),
  ('f000000f-0000-0000-0000-00000000000f'::uuid, 'Premium'),
  ('f000000f-0000-0000-0000-00000000000f'::uuid, 'Trending'),
  ('f0000010-0000-0000-0000-000000000010'::uuid, 'Best Seller'),
  ('f0000011-0000-0000-0000-000000000011'::uuid, 'Premium'),
  ('f0000011-0000-0000-0000-000000000011'::uuid, 'Best Seller'),
  ('f0000012-0000-0000-0000-000000000012'::uuid, 'Sale'),
  ('f0000012-0000-0000-0000-000000000012'::uuid, 'Trending'),
  ('f0000013-0000-0000-0000-000000000013'::uuid, 'Best Seller'),
  ('f0000013-0000-0000-0000-000000000013'::uuid, 'Trending'),
  ('f0000014-0000-0000-0000-000000000014'::uuid, 'New Arrival'),
  ('f0000015-0000-0000-0000-000000000015'::uuid, 'Best Seller'),
  ('f0000016-0000-0000-0000-000000000016'::uuid, 'Sale'),
  ('f0000016-0000-0000-0000-000000000016'::uuid, 'Premium'),
  ('f0000017-0000-0000-0000-000000000017'::uuid, 'New Arrival'),
  ('f0000018-0000-0000-0000-000000000018'::uuid, 'Premium'),
  ('f0000019-0000-0000-0000-000000000019'::uuid, 'Premium'),
  ('f0000019-0000-0000-0000-000000000019'::uuid, 'Best Seller'),
  ('f000001a-0000-0000-0000-00000000001a'::uuid, 'New Arrival'),
  ('f000001b-0000-0000-0000-00000000001b'::uuid, 'Best Seller'),
  ('f000001b-0000-0000-0000-00000000001b'::uuid, 'Trending'),
  ('f000001c-0000-0000-0000-00000000001c'::uuid, 'Sale'),
  ('f000001d-0000-0000-0000-00000000001d'::uuid, 'Best Seller'),
  ('f000001e-0000-0000-0000-00000000001e'::uuid, 'Premium'),
  ('f000001e-0000-0000-0000-00000000001e'::uuid, 'Best Seller'),
  ('f000001f-0000-0000-0000-00000000001f'::uuid, 'Sale'),
  ('f000001f-0000-0000-0000-00000000001f'::uuid, 'Trending')
ON CONFLICT DO NOTHING;

-- ── Product Variants ─────────────────────────────────────────
INSERT INTO public.product_variants (product_id, size, color)
SELECT p.id, s.size, 'Black'
FROM public.products p
CROSS JOIN (VALUES ('XS'),('S'),('M'),('L'),('XL')) AS s(size)
WHERE p.category_id IN (SELECT id FROM public.categories WHERE slug IN ('men','women'))
ON CONFLICT DO NOTHING;

INSERT INTO public.product_variants (product_id, size, color)
SELECT p.id, s.size, 'Tan'
FROM public.products p
CROSS JOIN (VALUES ('38'),('39'),('40'),('41'),('42'),('43'),('44')) AS s(size)
WHERE p.category_id = (SELECT id FROM public.categories WHERE slug='footwear')
ON CONFLICT DO NOTHING;

INSERT INTO public.product_variants (product_id, size, color)
SELECT p.id, 'One Size', 'Multi'
FROM public.products p
WHERE p.category_id = (SELECT id FROM public.categories WHERE slug='accessories')
ON CONFLICT DO NOTHING;
