import { supabase } from '../config/supabase.js';

const SELECT_LIST = `
  id, name, slug, description, price, original_price, rating, reviews_count, in_stock, created_at,
  categories     ( id, name, slug ),
  subcategories  ( id, name, slug ),
  brands         ( id, name ),
  product_images ( image_url, is_primary ),
  product_tags   ( tag ),
  product_variants ( size, color, price_modifier, in_stock )
`;

const SELECT_DETAIL = `
  id, name, slug, description, price, original_price, rating, reviews_count, in_stock, created_at,
  categories       ( id, name, slug ),
  subcategories    ( id, name, slug ),
  brands           ( id, name ),
  product_images   ( id, image_url, alt_text, is_primary, display_order ),
  product_variants ( id, size, color, price_modifier, in_stock ),
  product_tags     ( tag )
`;

const isUuid = (s) => /^[0-9a-f-]{36}$/i.test(s);

// Resolve category slug → id once. Cheap query, no need to cache for v1.
const resolveCategoryId    = async (slug) => (slug && slug !== 'all')
  ? (await supabase.from('categories')   .select('id').eq('slug', slug).maybeSingle()).data?.id
  : null;
const resolveSubcategoryId = async (slug) => (slug && slug !== 'all')
  ? (await supabase.from('subcategories').select('id').eq('slug', slug).maybeSingle()).data?.id
  : null;

// ── GET /products ─────────────────────────────────────────────
export const getProducts = async (req, res, next) => {
  try {
    const { q, category, subcategory, brand, tag, size, color, minPrice, maxPrice, sortBy, limit, skip } = req.query;

    let query = supabase.from('products').select(SELECT_LIST, { count: 'exact' });

    // Category / subcategory: resolve slug → id (cheap, indexed lookup)
    const [catId, subId] = await Promise.all([
      resolveCategoryId(category),
      resolveSubcategoryId(subcategory),
    ]);
    if (category && category !== 'all' && !catId) return res.json({ products: [], total: 0, skip, limit });
    if (subcategory && subcategory !== 'all' && !subId) return res.json({ products: [], total: 0, skip, limit });
    if (catId) query = query.eq('category_id',    catId);
    if (subId) query = query.eq('subcategory_id', subId);

    // Brand filter: resolve names → ids (multiple brands = OR)
    if (brand?.length) {
      const { data: brands } = await supabase.from('brands').select('id').in('name', brand);
      const ids = (brands || []).map((b) => b.id);
      if (ids.length === 0) return res.json({ products: [], total: 0, skip, limit });
      query = query.in('brand_id', ids);
    }

    // Tag filter: products having ANY of the given tags. Two-step (subquery via IN list of product_ids).
    if (tag?.length) {
      const { data: rows } = await supabase.from('product_tags').select('product_id').in('tag', tag);
      const ids = [...new Set((rows || []).map((r) => r.product_id))];
      if (ids.length === 0) return res.json({ products: [], total: 0, skip, limit });
      query = query.in('id', ids);
    }

    // Size / color filter: products having a matching variant
    if (size?.length || color?.length) {
      let vq = supabase.from('product_variants').select('product_id');
      if (size?.length)  vq = vq.in('size',  size);
      if (color?.length) vq = vq.in('color', color);
      const { data: rows } = await vq;
      const ids = [...new Set((rows || []).map((r) => r.product_id))];
      if (ids.length === 0) return res.json({ products: [], total: 0, skip, limit });
      query = query.in('id', ids);
    }

    // Price
    if (minPrice != null) query = query.gte('price', minPrice);
    if (maxPrice != null) query = query.lte('price', maxPrice);

    // Full-text search via the GIN-indexed search_vector column.
    // 'websearch' parses Google-style queries: "denim jacket" -slim "men's"
    if (q) query = query.textSearch('search_vector', q, { type: 'websearch', config: 'english' });

    // Sort. When searching, default to natural FTS order (relevance proxy via match)
    // unless the user explicitly chose a sort. Always tiebreak by id for stability across pages.
    const effectiveSort = q && sortBy === 'featured' ? 'relevance' : sortBy;
    switch (effectiveSort) {
      case 'price-asc':  query = query.order('price',      { ascending: true  }); break;
      case 'price-desc': query = query.order('price',      { ascending: false }); break;
      case 'rating':     query = query.order('rating',     { ascending: false }); break;
      case 'newest':     query = query.order('created_at', { ascending: false }); break;
      case 'relevance':  /* natural FTS order */                                  break;
      default:           query = query.order('created_at', { ascending: false });
    }
    query = query.order('id', { ascending: true }); // deterministic tiebreak

    query = query.range(skip, skip + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ products: data || [], total: count || 0, skip, limit });
  } catch (err) { next(err); }
};

// ── GET /products/facets ──────────────────────────────────────
// Returns filter UI metadata. Optionally scoped to a category for relevant brand/tag lists.
export const getProductFacets = async (req, res, next) => {
  try {
    const { category, subcategory } = req.query;
    const [catId, subId] = await Promise.all([
      resolveCategoryId(category),
      resolveSubcategoryId(subcategory),
    ]);

    // Helper: build a query that matches the same products as the listing call,
    // so facet counts reflect what the user is currently filtering on.
    const productIdsInScope = async () => {
      if (!catId && !subId) return null; // global scope
      let q = supabase.from('products').select('id');
      if (catId) q = q.eq('category_id',    catId);
      if (subId) q = q.eq('subcategory_id', subId);
      const { data } = await q;
      return (data || []).map((r) => r.id);
    };

    const inScope = await productIdsInScope();

    // Brands (with counts) — left join via products
    let brandsQ = supabase
      .from('products')
      .select('brands(name), id', { count: 'exact', head: false });
    if (catId) brandsQ = brandsQ.eq('category_id',    catId);
    if (subId) brandsQ = brandsQ.eq('subcategory_id', subId);
    const { data: brandRows } = await brandsQ;
    const brandCounts = new Map();
    for (const r of brandRows || []) {
      const name = r.brands?.name;
      if (!name) continue;
      brandCounts.set(name, (brandCounts.get(name) || 0) + 1);
    }
    const brands = [...brandCounts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Tags (with counts)
    let tagsQ = supabase.from('product_tags').select('tag, product_id');
    if (inScope) tagsQ = tagsQ.in('product_id', inScope);
    const { data: tagRows } = await tagsQ;
    const tagCounts = new Map();
    for (const r of tagRows || []) tagCounts.set(r.tag, (tagCounts.get(r.tag) || 0) + 1);
    const tags = [...tagCounts.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);

    // Sizes / colors — distinct
    let varQ = supabase.from('product_variants').select('size, color, product_id');
    if (inScope) varQ = varQ.in('product_id', inScope);
    const { data: varRows } = await varQ;
    const sizeSet  = new Set();
    const colorSet = new Set();
    for (const r of varRows || []) {
      if (r.size  && r.size  !== 'One Size') sizeSet.add(r.size);
      if (r.color)                            colorSet.add(r.color);
    }

    // Price range
    let priceQ = supabase.from('products').select('price');
    if (catId) priceQ = priceQ.eq('category_id',    catId);
    if (subId) priceQ = priceQ.eq('subcategory_id', subId);
    const { data: priceRows } = await priceQ;
    const prices = (priceRows || []).map((r) => Number(r.price));
    const priceRange = prices.length
      ? { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) }
      : { min: 0, max: 0 };

    res.set('Cache-Control', 'public, max-age=60'); // facets change slowly
    res.json({ brands, tags, sizes: [...sizeSet].sort(), colors: [...colorSet], priceRange });
  } catch (err) { next(err); }
};

// ── GET /products/:id ─────────────────────────────────────────
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const field  = isUuid(id) ? 'id' : 'slug';

    const { data, error } = await supabase
      .from('products').select(SELECT_DETAIL).eq(field, id).maybeSingle();

    if (error || !data) return res.status(404).json({ error: 'Product not found' });

    const product = {
      ...data,
      images:   (data.product_images || []).sort((a, b) => {
        if (b.is_primary !== a.is_primary) return b.is_primary - a.is_primary;
        return (a.display_order || 0) - (b.display_order || 0);
      }),
      variants: data.product_variants || [],
      tags:     data.product_tags?.map((t) => t.tag) || [],
    };
    delete product.product_images;
    delete product.product_variants;
    delete product.product_tags;

    res.set('Cache-Control', 'public, max-age=30');
    res.json(product);
  } catch (err) { next(err); }
};

// ── GET /products/:id/related ────────────────────────────────
export const getRelatedProducts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const field  = isUuid(id) ? 'id' : 'slug';

    const { data: product } = await supabase
      .from('products').select('id, category_id, subcategory_id').eq(field, id).maybeSingle();

    if (!product) return res.status(404).json({ error: 'Product not found' });

    let query = supabase
      .from('products')
      .select(`
        id, name, slug, price, original_price, rating, reviews_count, in_stock,
        brands ( name ),
        product_images ( image_url, is_primary ),
        product_tags ( tag )
      `)
      .eq('category_id', product.category_id)
      .neq('id', product.id)
      .limit(4);

    if (product.subcategory_id) query = query.eq('subcategory_id', product.subcategory_id);

    const { data, error } = await query;
    if (error) throw error;
    res.set('Cache-Control', 'public, max-age=60');
    res.json(data || []);
  } catch (err) { next(err); }
};

// ── GET /products/:id/reviews ────────────────────────────────
export const getProductReviews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const field  = isUuid(id) ? 'id' : 'slug';

    const { data: product } = await supabase
      .from('products').select('id').eq(field, id).maybeSingle();

    if (!product) return res.status(404).json({ error: 'Product not found' });

    const { data, error } = await supabase
      .from('reviews')
      .select('id, rating, comment, created_at, users ( first_name, last_name )')
      .eq('product_id', product.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    const reviews = (data || []).map((r) => ({
      id:        r.id,
      rating:    r.rating,
      comment:   r.comment,
      createdAt: r.created_at,
      name:      r.users ? `${r.users.first_name} ${r.users.last_name?.[0] || ''}.` : 'Anonymous',
    }));

    res.json(reviews);
  } catch (err) { next(err); }
};

// ── POST /products/:id/reviews ───────────────────────────────
// Rating + reviews_count are now maintained by the reviews_rating_trigger (migration 005),
// so this controller no longer fetches all reviews to recompute. One INSERT, done.
export const createProductReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.userId;
    const field  = isUuid(id) ? 'id' : 'slug';

    const { data: product } = await supabase
      .from('products').select('id').eq(field, id).maybeSingle();
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // One review per user per product
    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id',    userId)
      .eq('product_id', product.id)
      .maybeSingle();
    if (existing) return res.status(409).json({ error: 'You have already reviewed this product' });

    const { data, error } = await supabase
      .from('reviews')
      .insert([{ user_id: userId, product_id: product.id, rating, comment }])
      .select('id, rating, comment, created_at')
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) { next(err); }
};
