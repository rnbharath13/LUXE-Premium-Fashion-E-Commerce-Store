import { supabase } from '../config/supabase.js';

export const getProducts = async (req, res, next) => {
  try {
    const {
      category, subcategory, search, tags, sortBy,
      minPrice, maxPrice, skip = 0, limit = 24,
    } = req.query;

    let query = supabase
      .from('products')
      .select(`
        id, name, slug, description, price, original_price, rating, reviews_count, in_stock, created_at,
        categories ( id, name, slug ),
        subcategories ( id, name, slug ),
        brands ( id, name ),
        product_images ( image_url, is_primary ),
        product_tags ( tag )
      `, { count: 'exact' });

    if (category && category !== 'all') {
      const { data: cat } = await supabase
        .from('categories').select('id').eq('slug', category).single();
      if (cat) query = query.eq('category_id', cat.id);
    }

    if (subcategory && subcategory !== 'all') {
      const { data: sub } = await supabase
        .from('subcategories').select('id').eq('slug', subcategory).single();
      if (sub) query = query.eq('subcategory_id', sub.id);
    }

    if (search) query = query.ilike('name', `%${search}%`);
    if (minPrice) query = query.gte('price', minPrice);
    if (maxPrice) query = query.lte('price', maxPrice);

    if (sortBy === 'price-asc')       query = query.order('price', { ascending: true });
    else if (sortBy === 'price-desc') query = query.order('price', { ascending: false });
    else if (sortBy === 'rating')     query = query.order('rating', { ascending: false });
    else if (sortBy === 'newest')     query = query.order('created_at', { ascending: false });
    else                              query = query.order('created_at', { ascending: false });

    query = query.range(Number(skip), Number(skip) + Number(limit) - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    let products = data || [];

    // tag filter done client-side (Supabase doesn't support nested table filters in count queries)
    if (tags) {
      const tagList = tags.split(',');
      products = products.filter(p => p.product_tags?.some(t => tagList.includes(t.tag)));
    }

    res.json({ products, total: count, skip: Number(skip), limit: Number(limit) });
  } catch (err) { next(err); }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // support both UUID and slug
    const isUuid = /^[0-9a-f-]{36}$/.test(id);
    const field  = isUuid ? 'id' : 'slug';

    const { data, error } = await supabase
      .from('products')
      .select(`
        id, name, slug, description, price, original_price, rating, reviews_count, in_stock, created_at,
        categories ( id, name, slug ),
        subcategories ( id, name, slug ),
        brands ( id, name ),
        product_images ( id, image_url, alt_text, is_primary, display_order ),
        product_variants ( id, size, color, price_modifier, in_stock ),
        product_tags ( tag )
      `)
      .eq(field, id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Product not found' });

    const product = {
      ...data,
      images:   (data.product_images || []).sort((a, b) => {
        if (b.is_primary !== a.is_primary) return b.is_primary - a.is_primary;
        return (a.display_order || 0) - (b.display_order || 0);
      }),
      variants: data.product_variants || [],
      tags:     data.product_tags?.map(t => t.tag) || [],
    };
    delete product.product_images;
    delete product.product_variants;
    delete product.product_tags;

    res.json(product);
  } catch (err) { next(err); }
};

export const getRelatedProducts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isUuid = /^[0-9a-f-]{36}$/.test(id);
    const field  = isUuid ? 'id' : 'slug';

    const { data: product } = await supabase
      .from('products').select('id, category_id, subcategory_id').eq(field, id).single();

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
    res.json(data || []);
  } catch (err) { next(err); }
};

export const getProductReviews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isUuid = /^[0-9a-f-]{36}$/.test(id);
    const field  = isUuid ? 'id' : 'slug';

    const { data: product } = await supabase
      .from('products').select('id').eq(field, id).single();

    if (!product) return res.status(404).json({ error: 'Product not found' });

    const { data, error } = await supabase
      .from('reviews')
      .select('id, rating, comment, created_at, users ( first_name, last_name )')
      .eq('product_id', product.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    const reviews = (data || []).map(r => ({
      id:        r.id,
      rating:    r.rating,
      comment:   r.comment,
      createdAt: r.created_at,
      name:      r.users ? `${r.users.first_name} ${r.users.last_name[0]}.` : 'Anonymous',
    }));

    res.json(reviews);
  } catch (err) { next(err); }
};

export const createProductReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.userId;

    const isUuid = /^[0-9a-f-]{36}$/.test(id);
    const field  = isUuid ? 'id' : 'slug';

    const { data: product } = await supabase
      .from('products').select('id').eq(field, id).single();

    if (!product) return res.status(404).json({ error: 'Product not found' });

    // one review per user per product
    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', product.id)
      .single();

    if (existing) return res.status(409).json({ error: 'You have already reviewed this product' });

    const { data, error } = await supabase
      .from('reviews')
      .insert([{ user_id: userId, product_id: product.id, rating, comment }])
      .select('id, rating, comment, created_at')
      .single();

    if (error) throw error;

    // update product rating average
    const { data: allReviews } = await supabase
      .from('reviews').select('rating').eq('product_id', product.id);

    if (allReviews?.length) {
      const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
      await supabase
        .from('products')
        .update({ rating: Math.round(avg * 10) / 10, reviews_count: allReviews.length })
        .eq('id', product.id);
    }

    res.status(201).json(data);
  } catch (err) { next(err); }
};
