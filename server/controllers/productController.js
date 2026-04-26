import { supabase } from '../config/supabase.js';
import { HOME_PAGE_CONTENT, getProductImageOverride } from '../lib/catalogMedia.js';

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

const HOME_BUCKETS = ['all', 'men', 'women', 'accessories', 'footwear'];
const isUuid = (s) => /^[0-9a-f-]{36}$/i.test(s);
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=88';

const resolveCategoryId = async (slug) => (slug && slug !== 'all')
  ? (await supabase.from('categories').select('id').eq('slug', slug).maybeSingle()).data?.id
  : null;
const resolveSubcategoryId = async (slug) => (slug && slug !== 'all')
  ? (await supabase.from('subcategories').select('id').eq('slug', slug).maybeSingle()).data?.id
  : null;

const unique = (values) => [...new Set(values.filter(Boolean))];

const pickProductImage = (product) =>
  getProductImageOverride(product.slug)
  || product.product_images?.find((img) => img.is_primary)?.image_url
  || product.product_images?.[0]?.image_url
  || FALLBACK_IMAGE;

const shapeProductCard = (product) => ({
  id:            product.id,
  name:          product.name,
  slug:          product.slug,
  brand:         product.brands?.name || '',
  category:      product.categories?.slug || '',
  description:   product.description || '',
  price:         Number(product.price),
  originalPrice: product.original_price ? Number(product.original_price) : null,
  rating:        Number(product.rating) || 0,
  reviews:       product.reviews_count || 0,
  inStock:       product.in_stock,
  image:         pickProductImage(product),
  tags:          (product.product_tags || []).map((t) => t.tag),
  sizes:         unique((product.product_variants || []).map((v) => v.size)).length
                 ? unique((product.product_variants || []).map((v) => v.size))
                 : ['One Size'],
  colors:        unique((product.product_variants || []).map((v) => v.color)).length
                 ? unique((product.product_variants || []).map((v) => v.color))
                 : ['#1a1a1a'],
});

const shapeProductDetail = (product) => {
  const card = shapeProductCard(product);
  const overrideImage = getProductImageOverride(product.slug);
  const images = overrideImage
    ? [{ image_url: overrideImage, alt_text: product.name, is_primary: true, display_order: 0 }]
    : (product.product_images || [])
        .sort((a, b) => {
          if (b.is_primary !== a.is_primary) return b.is_primary - a.is_primary;
          return (a.display_order || 0) - (b.display_order || 0);
        })
        .map((img) => ({
          image_url: img.image_url,
          alt_text: img.alt_text || product.name,
          is_primary: !!img.is_primary,
          display_order: img.display_order || 0,
        }));

  return {
    ...card,
    images,
    variants: product.product_variants || [],
    tags:     (product.product_tags || []).map((t) => t.tag),
  };
};

const applyProductFilters = async (query, filters) => {
  const {
    q, category, subcategory, brand, tag, size, color, minPrice, maxPrice, sortBy,
  } = filters;

  const [catId, subId] = await Promise.all([
    resolveCategoryId(category),
    resolveSubcategoryId(subcategory),
  ]);

  if (category && category !== 'all' && !catId) return { query: null, empty: true };
  if (subcategory && subcategory !== 'all' && !subId) return { query: null, empty: true };
  if (catId) query = query.eq('category_id', catId);
  if (subId) query = query.eq('subcategory_id', subId);

  if (brand?.length) {
    const { data: brands } = await supabase.from('brands').select('id').in('name', brand);
    const ids = (brands || []).map((b) => b.id);
    if (ids.length === 0) return { query: null, empty: true };
    query = query.in('brand_id', ids);
  }

  if (tag?.length) {
    const { data: rows } = await supabase.from('product_tags').select('product_id').in('tag', tag);
    const ids = [...new Set((rows || []).map((r) => r.product_id))];
    if (ids.length === 0) return { query: null, empty: true };
    query = query.in('id', ids);
  }

  if (size?.length || color?.length) {
    let variantsQuery = supabase.from('product_variants').select('product_id');
    if (size?.length) variantsQuery = variantsQuery.in('size', size);
    if (color?.length) variantsQuery = variantsQuery.in('color', color);
    const { data: rows } = await variantsQuery;
    const ids = [...new Set((rows || []).map((r) => r.product_id))];
    if (ids.length === 0) return { query: null, empty: true };
    query = query.in('id', ids);
  }

  if (minPrice != null) query = query.gte('price', minPrice);
  if (maxPrice != null) query = query.lte('price', maxPrice);
  if (q) query = query.textSearch('search_vector', q, { type: 'websearch', config: 'english' });

  const effectiveSort = q && sortBy === 'featured' ? 'relevance' : sortBy;
  switch (effectiveSort) {
    case 'price-asc':  query = query.order('price',      { ascending: true }); break;
    case 'price-desc': query = query.order('price',      { ascending: false }); break;
    case 'rating':     query = query.order('rating',     { ascending: false }); break;
    case 'newest':     query = query.order('created_at', { ascending: false }); break;
    case 'relevance':  break;
    default:           query = query.order('created_at', { ascending: false });
  }
  query = query.order('id', { ascending: true });

  return { query, empty: false };
};

const listProducts = async (filters, selectClause = SELECT_LIST) => {
  const { limit = 24, skip = 0 } = filters;
  let query = supabase.from('products').select(selectClause, { count: 'exact' });
  const filtered = await applyProductFilters(query, filters);

  if (filtered.empty) return { products: [], total: 0, skip, limit };
  query = filtered.query.range(skip, skip + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { products: data || [], total: count || 0, skip, limit };
};

const loadFacets = async (category, subcategory) => {
  const [catId, subId] = await Promise.all([
    resolveCategoryId(category),
    resolveSubcategoryId(subcategory),
  ]);

  const productIdsInScope = async () => {
    if (!catId && !subId) return null;
    let q = supabase.from('products').select('id');
    if (catId) q = q.eq('category_id', catId);
    if (subId) q = q.eq('subcategory_id', subId);
    const { data } = await q;
    return (data || []).map((r) => r.id);
  };

  const inScope = await productIdsInScope();

  let brandsQ = supabase.from('products').select('brands(name), id');
  if (catId) brandsQ = brandsQ.eq('category_id', catId);
  if (subId) brandsQ = brandsQ.eq('subcategory_id', subId);
  const { data: brandRows } = await brandsQ;
  const brandCounts = new Map();
  for (const row of brandRows || []) {
    const name = row.brands?.name;
    if (!name) continue;
    brandCounts.set(name, (brandCounts.get(name) || 0) + 1);
  }

  let tagsQ = supabase.from('product_tags').select('tag, product_id');
  if (inScope) tagsQ = tagsQ.in('product_id', inScope);
  const { data: tagRows } = await tagsQ;
  const tagCounts = new Map();
  for (const row of tagRows || []) tagCounts.set(row.tag, (tagCounts.get(row.tag) || 0) + 1);

  let variantsQ = supabase.from('product_variants').select('size, color, product_id');
  if (inScope) variantsQ = variantsQ.in('product_id', inScope);
  const { data: variantRows } = await variantsQ;
  const sizes = unique((variantRows || []).map((r) => r.size).filter((size) => size && size !== 'One Size')).sort();
  const colors = unique((variantRows || []).map((r) => r.color));

  let priceQ = supabase.from('products').select('price');
  if (catId) priceQ = priceQ.eq('category_id', catId);
  if (subId) priceQ = priceQ.eq('subcategory_id', subId);
  const { data: priceRows } = await priceQ;
  const prices = (priceRows || []).map((r) => Number(r.price));

  return {
    brands: [...brandCounts.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    tags: [...tagCounts.entries()].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count),
    sizes,
    colors,
    priceRange: prices.length
      ? { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) }
      : { min: 0, max: 0 },
  };
};

export const getProducts = async (req, res, next) => {
  try {
    const result = await listProducts(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getBrowseProducts = async (req, res, next) => {
  try {
    const [listing, facets] = await Promise.all([
      listProducts(req.query),
      loadFacets(req.query.category, req.query.subcategory),
    ]);

    res.set('Cache-Control', 'public, max-age=30');
    res.json({
      products: listing.products.map(shapeProductCard),
      total: listing.total,
      skip: listing.skip,
      limit: listing.limit,
      facets,
    });
  } catch (err) {
    next(err);
  }
};

export const getHomeProducts = async (req, res, next) => {
  try {
    const listing = await listProducts({ limit: 48, skip: 0, sortBy: 'featured' });
    const shaped = listing.products
      .map(shapeProductCard)
      .filter((product) => HOME_BUCKETS.includes(product.category));

    const groups = HOME_BUCKETS.reduce((acc, bucket) => ({ ...acc, [bucket]: [] }), {});
    groups.all = shaped.slice(0, 8);
    for (const bucket of HOME_BUCKETS.slice(1)) {
      groups[bucket] = shaped.filter((product) => product.category === bucket).slice(0, 8);
    }

    res.set('Cache-Control', 'public, max-age=60');
    res.json({
      ...HOME_PAGE_CONTENT,
      groups,
    });
  } catch (err) {
    next(err);
  }
};

export const getProductFacets = async (req, res, next) => {
  try {
    const facets = await loadFacets(req.query.category, req.query.subcategory);
    res.set('Cache-Control', 'public, max-age=60');
    res.json(facets);
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const field = isUuid(id) ? 'id' : 'slug';

    const { data, error } = await supabase
      .from('products')
      .select(SELECT_DETAIL)
      .eq(field, id)
      .maybeSingle();

    if (error || !data) return res.status(404).json({ error: 'Product not found' });

    res.set('Cache-Control', 'public, max-age=30');
    res.json(shapeProductDetail(data));
  } catch (err) {
    next(err);
  }
};

export const getRelatedProducts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const field = isUuid(id) ? 'id' : 'slug';

    const { data: product } = await supabase
      .from('products')
      .select('id, category_id, subcategory_id')
      .eq(field, id)
      .maybeSingle();

    if (!product) return res.status(404).json({ error: 'Product not found' });

    let query = supabase
      .from('products')
      .select(SELECT_LIST)
      .eq('category_id', product.category_id)
      .neq('id', product.id)
      .limit(4);

    if (product.subcategory_id) query = query.eq('subcategory_id', product.subcategory_id);

    const { data, error } = await query;
    if (error) throw error;

    res.set('Cache-Control', 'public, max-age=60');
    res.json((data || []).map(shapeProductCard));
  } catch (err) {
    next(err);
  }
};

export const getProductReviews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const field = isUuid(id) ? 'id' : 'slug';

    const { data: product } = await supabase
      .from('products')
      .select('id')
      .eq(field, id)
      .maybeSingle();

    if (!product) return res.status(404).json({ error: 'Product not found' });

    const { data, error } = await supabase
      .from('reviews')
      .select('id, rating, comment, created_at, users ( first_name, last_name )')
      .eq('product_id', product.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    const reviews = (data || []).map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.created_at,
      name: r.users ? `${r.users.first_name} ${r.users.last_name?.[0] || ''}.` : 'Anonymous',
    }));

    res.json(reviews);
  } catch (err) {
    next(err);
  }
};

export const createProductReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.userId;
    const field = isUuid(id) ? 'id' : 'slug';

    const { data: product } = await supabase
      .from('products')
      .select('id')
      .eq(field, id)
      .maybeSingle();
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', userId)
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
  } catch (err) {
    next(err);
  }
};
