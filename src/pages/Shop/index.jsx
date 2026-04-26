import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Search, Grid3X3, LayoutList } from 'lucide-react';
import { api } from '../../lib/api';
import { useSeo } from '../../hooks/useSeo';
import ProductCard from '../../components/ProductCard';
import './Shop.css';

const LIMIT = 24;

const SORTS = [
  { value: 'featured',   label: 'Featured' },
  { value: 'relevance',  label: 'Relevance' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Top Rated' },
  { value: 'newest',     label: 'Newest' },
];
const CATS = ['all', 'men', 'women', 'accessories', 'footwear', 'outerwear'];
const SUB_CATS = {
  men:         ['all', 'shirts', 'blazers', 'trousers', 'knitwear', 'outerwear'],
  women:       ['all', 'dresses', 'tops', 'trousers', 'knitwear', 'bags'],
  footwear:    ['all', 'sneakers', 'boots', 'sandals', 'formal'],
  accessories: ['all', 'bags', 'jewellery', 'belts', 'scarves'],
};
const EMPTY_FACETS = { brands: [], tags: [], sizes: [], colors: [], priceRange: { min: 0, max: 500 } };

const parseListParam = (params, key) => {
  const v = params.get(key);
  return v ? v.split(',').filter(Boolean) : [];
};

const readFilters = (params) => ({
  q:           params.get('q')        || '',
  category:    params.get('cat')      || 'all',
  subcategory: params.get('sub')      || 'all',
  brand:       parseListParam(params, 'brand'),
  tag:         parseListParam(params, 'tag'),
  size:        parseListParam(params, 'size'),
  color:       parseListParam(params, 'color'),
  minPrice:    Number(params.get('min')) || 0,
  maxPrice:    Number(params.get('max')) || 0,
  sortBy:      params.get('sort')     || 'featured',
});

const writeFilters = (params, patch) => {
  const next = new URLSearchParams(params);
  const set = (key, val) => {
    if (val == null || val === '' || val === 'all' || val === 0 || (Array.isArray(val) && val.length === 0)) next.delete(key);
    else next.set(key, Array.isArray(val) ? val.join(',') : String(val));
  };
  if ('q'           in patch) set('q',     patch.q);
  if ('category'    in patch) set('cat',   patch.category);
  if ('subcategory' in patch) set('sub',   patch.subcategory);
  if ('brand'       in patch) set('brand', patch.brand);
  if ('tag'         in patch) set('tag',   patch.tag);
  if ('size'        in patch) set('size',  patch.size);
  if ('color'       in patch) set('color', patch.color);
  if ('minPrice'    in patch) set('min',   patch.minPrice);
  if ('maxPrice'    in patch) set('max',   patch.maxPrice);
  if ('sortBy'      in patch) set('sort',  patch.sortBy);
  return next;
};

const buildQueryString = (f) => {
  const p = new URLSearchParams();
  if (f.q) p.set('q', f.q);
  if (f.category !== 'all') p.set('category', f.category);
  if (f.subcategory !== 'all') p.set('subcategory', f.subcategory);
  if (f.brand.length) p.set('brand', f.brand.join(','));
  if (f.tag.length) p.set('tag', f.tag.join(','));
  if (f.size.length) p.set('size', f.size.join(','));
  if (f.color.length) p.set('color', f.color.join(','));
  if (f.minPrice > 0) p.set('minPrice', f.minPrice);
  if (f.maxPrice > 0) p.set('maxPrice', f.maxPrice);
  if (f.sortBy && f.sortBy !== 'featured') p.set('sortBy', f.sortBy);
  return p;
};

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => readFilters(searchParams), [searchParams]);

  const [products,    setProducts]    = useState([]);
  const [total,       setTotal]       = useState(0);
  const [skip,        setSkip]        = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error,       setError]       = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [gridView,    setGridView]    = useState(true);
  const [localSearch, setLocalSearch] = useState(filters.q);
  const [facets,      setFacets]      = useState(EMPTY_FACETS);

  const seoTitle = filters.q
    ? `Search: ${filters.q}`
    : filters.category !== 'all'
    ? `${filters.category[0].toUpperCase()}${filters.category.slice(1)}`
    : 'Shop All';

  useSeo({
    title:       seoTitle,
    description: `Browse ${total || 'thousands of'} products${filters.category !== 'all' ? ` in ${filters.category}` : ''} at LUXE.`,
  });

  useEffect(() => { setLocalSearch(filters.q); }, [filters.q]);

  const updateFilters = useCallback((patch) => {
    setSearchParams(writeFilters(searchParams, patch), { replace: false });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const ctl = new AbortController();
    setLoading(true);
    setError('');
    setSkip(0);

    const qs = buildQueryString(filters);
    qs.set('limit', LIMIT);
    qs.set('skip', 0);

    api.get(`/products/browse?${qs.toString()}`, { signal: ctl.signal })
      .then(({ products: rows, total: nextTotal, facets: nextFacets }) => {
        setProducts(rows || []);
        setTotal(nextTotal || 0);
        setFacets(nextFacets || EMPTY_FACETS);
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        setProducts([]);
        setTotal(0);
        setFacets(EMPTY_FACETS);
        setError(err.message || 'Could not load products');
      })
      .finally(() => setLoading(false));

    return () => ctl.abort();
  }, [searchParams]);

  const loadMore = async () => {
    if (loadingMore || products.length >= total) return;
    const nextSkip = skip + LIMIT;
    setLoadingMore(true);
    try {
      const qs = buildQueryString(filters);
      qs.set('limit', LIMIT);
      qs.set('skip', nextSkip);
      const { products: rows } = await api.get(`/products/browse?${qs.toString()}`);
      setProducts((prev) => [...prev, ...(rows || [])]);
      setSkip(nextSkip);
    } catch (err) {
      setError(err.message || 'Could not load more');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSearch = (e) => { e.preventDefault(); updateFilters({ q: localSearch.trim() }); };
  const toggleInList = (key, val) => {
    const cur = filters[key];
    updateFilters({ [key]: cur.includes(val) ? cur.filter((v) => v !== val) : [...cur, val] });
  };
  const setCategory = (cat) => updateFilters({ category: cat, subcategory: 'all' });
  const setSubcategory = (sub) => updateFilters({ subcategory: sub });
  const setSort = (sortBy) => updateFilters({ sortBy });
  const setMaxPrice = (val) => updateFilters({ maxPrice: val });
  const clearAll = () => setSearchParams(new URLSearchParams(), { replace: false });

  const hasFilters = filters.q || filters.category !== 'all' || filters.subcategory !== 'all'
                  || filters.brand.length || filters.tag.length || filters.size.length
                  || filters.color.length || filters.minPrice || filters.maxPrice;

  const subCats = SUB_CATS[filters.category] || null;
  const hasMore = products.length < total;
  const priceMax = filters.maxPrice || facets.priceRange?.max || 500;

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-header-inner">
          <p className="section-label">Discover</p>
          <h1 className="shop-header-title">{seoTitle}</h1>
          <p className="shop-header-count">{loading ? 'Loading...' : `${total} ${total === 1 ? 'product' : 'products'}`}</p>
        </div>
      </div>

      <div className="shop-cat-bar">
        <div className="shop-cat-inner">
          <div className="shop-cat-scroll scrollbar-hide">
            {CATS.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`shop-cat-btn${filters.category === cat ? ' active' : ''}`}
              >
                {cat === 'all' ? 'All' : cat[0].toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {subCats && (
        <div className="shop-cat-bar" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
          <div className="shop-cat-inner">
            <div className="shop-cat-scroll scrollbar-hide">
              {subCats.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSubcategory(sub)}
                  className={`shop-cat-btn${filters.subcategory === sub ? ' active' : ''}`}
                  style={{ fontSize: '0.75rem' }}
                >
                  {sub === 'all' ? `All ${filters.category[0].toUpperCase()}${filters.category.slice(1)}` : sub[0].toUpperCase() + sub.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="shop-body">
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <form onSubmit={handleSearch} className="flex-1 max-w-xs relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search products..."
              className="input-field pl-9 h-10 text-sm"
              type="search"
              name="search"
              aria-label="Search products"
            />
          </form>

          <button onClick={() => setShowFilters(!showFilters)} className={`shop-filter-btn${showFilters ? ' active' : ''}`}>
            <SlidersHorizontal size={14} /> Filters
            {hasFilters && <span className="shop-filter-indicator">!</span>}
          </button>

          <select
            value={filters.sortBy}
            onChange={(e) => setSort(e.target.value)}
            className="input-field h-10 text-sm w-auto cursor-pointer"
            aria-label="Sort"
          >
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          <div className="ml-auto flex gap-1">
            <button onClick={() => setGridView(true)} className={`shop-view-btn${gridView ? ' active' : ''}`} aria-label="Grid view"><Grid3X3 size={16} /></button>
            <button onClick={() => setGridView(false)} className={`shop-view-btn${!gridView ? ' active' : ''}`} aria-label="List view"><LayoutList size={16} /></button>
          </div>
        </div>

        {showFilters && (
          <div className="shop-filter-panel">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="shop-filter-section-title">Price Range</h3>
                <p className="shop-price-label">${filters.minPrice} - ${priceMax}</p>
                <input
                  type="range"
                  min={facets.priceRange?.min || 0}
                  max={facets.priceRange?.max || 500}
                  value={priceMax}
                  onChange={(e) => setMaxPrice(+e.target.value)}
                  aria-label="Maximum price"
                />
              </div>

              <div>
                <h3 className="shop-filter-section-title">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {(facets.tags || []).map(({ tag, count }) => (
                    <button
                      key={tag}
                      onClick={() => toggleInList('tag', tag)}
                      className={`shop-tag-btn${filters.tag.includes(tag) ? ' active' : ''}`}
                    >
                      {tag} <span style={{ opacity: 0.55 }}>· {count}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="shop-filter-section-title">Brand</h3>
                <div className="flex flex-wrap gap-2">
                  {(facets.brands || []).slice(0, 12).map(({ name, count }) => (
                    <button
                      key={name}
                      onClick={() => toggleInList('brand', name)}
                      className={`shop-tag-btn${filters.brand.includes(name) ? ' active' : ''}`}
                    >
                      {name} <span style={{ opacity: 0.55 }}>· {count}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {hasFilters && (
              <button className="shop-clear-btn" onClick={clearAll}>
                <X size={13} /> Clear all filters
              </button>
            )}
          </div>
        )}

        {hasFilters && (
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            {filters.q && (
              <span className="shop-chip">
                "{filters.q}"
                <button className="shop-chip-remove" onClick={() => updateFilters({ q: '' })}><X size={10} /></button>
              </span>
            )}
            {filters.tag.map((t) => (
              <span key={t} className="shop-chip">
                {t}
                <button className="shop-chip-remove" onClick={() => toggleInList('tag', t)}><X size={10} /></button>
              </span>
            ))}
            {filters.brand.map((b) => (
              <span key={b} className="shop-chip">
                {b}
                <button className="shop-chip-remove" onClick={() => toggleInList('brand', b)}><X size={10} /></button>
              </span>
            ))}
          </div>
        )}

        {loading ? (
          <div className={gridView ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6' : 'space-y-3'}>
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="shop-skeleton-card" />)}
          </div>
        ) : error ? (
          <div className="shop-empty">
            <p className="shop-empty-icon">!</p>
            <p className="shop-empty-title">{error}</p>
            <button onClick={() => updateFilters({})} className="btn-primary">Retry</button>
          </div>
        ) : products.length === 0 ? (
          <div className="shop-empty">
            <p className="shop-empty-icon">?</p>
            <p className="shop-empty-title">No products found</p>
            <p className="shop-empty-desc">Try adjusting your filters</p>
            <button onClick={clearAll} className="btn-primary">Clear Filters</button>
          </div>
        ) : (
          <>
            <div className={gridView ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6' : 'space-y-3'}>
              {products.map((p) => <ProductCard key={p.id} product={p} listView={!gridView} />)}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-10">
                <button onClick={loadMore} disabled={loadingMore} className="btn-secondary px-10">
                  {loadingMore ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
