import { supabase } from '../config/supabase.js';

export const getProducts = async (req, res, next) => {
  try {
    const { category, subcategory, search, tags, sortBy, minPrice, maxPrice, skip = 0, limit = 200 } = req.query;

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

    if (search) query = query.or(`name.ilike.%${search}%`);
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

    if (tags) {
      const tagList = tags.split(',');
      products = products.filter(p => p.product_tags?.some(t => tagList.includes(t.tag)));
    }

    if (category === 'new' || category === 'sale') {
      const tagFilter = category === 'new' ? 'New Arrival' : 'Sale';
      products = products.filter(p => p.product_tags?.some(t => t.tag === tagFilter));
    }

    res.json({ products, total: count, skip: Number(skip), limit: Number(limit) });
  } catch (err) { next(err); }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
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
      .eq('id', id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Product not found' });

    const product = {
      ...data,
      images:   data.product_images?.sort((a, b) => b.is_primary - a.is_primary) || [],
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
    const { data: product } = await supabase
      .from('products').select('category_id, subcategory_id').eq('id', id).single();

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
      .neq('id', id)
      .limit(4);

    if (product.subcategory_id) {
      query = query.eq('subcategory_id', product.subcategory_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (err) { next(err); }
};
