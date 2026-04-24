import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Search, Grid3X3, LayoutList } from 'lucide-react';
import { api, normalizeProduct } from '../../lib/api';
import ProductCard from '../../components/ProductCard';
import useStore from '../../store/useStore';
import './Shop.css';

const SORTS = [
  { value: 'featured',   label: 'Featured' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Top Rated' },
  { value: 'newest',     label: 'Newest' },
];
const CATS = ['all', 'men', 'women', 'accessories', 'footwear', 'outerwear'];
const TAGS = ['New Arrival', 'Sale', 'Best Seller', 'Premium', 'Trending'];

export default function Shop() {
  const [searchParams]               = useSearchParams();
  const { filters, setFilters, resetFilters } = useStore();
  const [showFilters, setShowFilters] = useState(false);
  const [gridView,    setGridView]    = useState(true);
  const [localSearch, setLocalSearch] = useState(filters.search || '');
  const [priceRange,  setPriceRange]  = useState([0, 500]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    const cat = searchParams.get('cat');
    const tag = searchParams.get('tag');
    const q   = searchParams.get('q');
    resetFilters();
    if (cat && cat !== 'new') setFilters({ category: cat });
    else if (cat === 'new')   setFilters({ category: 'all', tags: ['New Arrival'] });
    if (tag) setFilters({ tags: [tag] });
    if (q)   setFilters({ search: q });
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    api.get('/products?limit=200')
      .then(({ products }) => setAllProducts((products || []).map(normalizeProduct)))
      .catch(() => setAllProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = [...allProducts];
    if (filters.category && filters.category !== 'all')
      list = list.filter((p) => p.category === filters.category);
    if (filters.search)
      list = list.filter((p) => p.name.toLowerCase().includes(filters.search.toLowerCase()) || p.brand.toLowerCase().includes(filters.search.toLowerCase()));
    if (filters.tags?.length)
      list = list.filter((p) => filters.tags.some((t) => p.tags.includes(t)));
    list = list.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (filters.sortBy === 'price-asc')       list.sort((a, b) => a.price - b.price);
    else if (filters.sortBy === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (filters.sortBy === 'rating')     list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [filters, priceRange, allProducts]);

  const handleSearch = (e) => { e.preventDefault(); setFilters({ search: localSearch }); };
  const toggleTag    = (tag) => {
    const tags = filters.tags || [];
    setFilters({ tags: tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag] });
  };
  const hasFilters = filters.category !== 'all' || filters.search || filters.tags?.length > 0;

  return (
    <div className="shop-page">
      {/* Header */}
      <div className="shop-header">
        <div className="shop-header-inner">
          <p className="section-label">Discover</p>
          <h1 className="shop-header-title">
            {filters.tags?.includes('New Arrival')
              ? 'New Arrivals'
              : filters.category && filters.category !== 'all'
              ? filters.category.charAt(0).toUpperCase() + filters.category.slice(1)
              : 'Shop All'}
          </h1>
          <p className="shop-header-count">{filtered.length} products</p>
        </div>
      </div>

      {/* Category tabs */}
      <div className="shop-cat-bar">
        <div className="shop-cat-inner">
          <div className="shop-cat-scroll scrollbar-hide">
            {CATS.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilters({ category: cat })}
                className={`shop-cat-btn${filters.category === cat ? ' active' : ''}`}
              >
                {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="shop-body">
        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <form onSubmit={handleSearch} className="flex-1 max-w-xs relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input value={localSearch} onChange={(e) => setLocalSearch(e.target.value)} placeholder="Search products..." className="input-field pl-9 h-10 text-sm" />
          </form>

          <button onClick={() => setShowFilters(!showFilters)} className={`shop-filter-btn${showFilters ? ' active' : ''}`}>
            <SlidersHorizontal size={14} /> Filters
            {hasFilters && <span className="shop-filter-indicator">!</span>}
          </button>

          <select value={filters.sortBy || 'featured'} onChange={(e) => setFilters({ sortBy: e.target.value })} className="input-field h-10 text-sm w-auto cursor-pointer">
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          <div className="ml-auto flex gap-1">
            <button onClick={() => setGridView(true)}  className={`shop-view-btn${gridView  ? ' active' : ''}`}><Grid3X3   size={16} /></button>
            <button onClick={() => setGridView(false)} className={`shop-view-btn${!gridView ? ' active' : ''}`}><LayoutList size={16} /></button>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="shop-filter-panel">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="shop-filter-section-title">Price Range</h3>
                <p className="shop-price-label">${priceRange[0]} — ${priceRange[1]}</p>
                <input type="range" min={0} max={500} value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], +e.target.value])} />
              </div>
              <div>
                <h3 className="shop-filter-section-title">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {TAGS.map((tag) => (
                    <button key={tag} onClick={() => toggleTag(tag)} className={`shop-tag-btn${filters.tags?.includes(tag) ? ' active' : ''}`}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {hasFilters && (
              <button className="shop-clear-btn" onClick={() => { resetFilters(); setLocalSearch(''); setPriceRange([0, 500]); }}>
                <X size={13} /> Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Active chips */}
        {hasFilters && (
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            {filters.search && (
              <span className="shop-chip">
                "{filters.search}"
                <button className="shop-chip-remove" onClick={() => { setFilters({ search: '' }); setLocalSearch(''); }}><X size={10} /></button>
              </span>
            )}
            {filters.tags?.map((tag) => (
              <span key={tag} className="shop-chip">
                {tag}
                <button className="shop-chip-remove" onClick={() => toggleTag(tag)}><X size={10} /></button>
              </span>
            ))}
          </div>
        )}

        {/* Products */}
        {loading ? (
          <div className="shop-empty">
            <p className="shop-empty-title">Loading products...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="shop-empty">
            <p className="shop-empty-icon">🔍</p>
            <p className="shop-empty-title">No products found</p>
            <p className="shop-empty-desc">Try adjusting your filters</p>
            <button onClick={() => { resetFilters(); setLocalSearch(''); setPriceRange([0, 500]); }} className="btn-primary">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={gridView ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6' : 'space-y-3'}>
            {filtered.map((p) => <ProductCard key={p.id} product={p} listView={!gridView} />)}
          </div>
        )}
      </div>
    </div>
  );
}
