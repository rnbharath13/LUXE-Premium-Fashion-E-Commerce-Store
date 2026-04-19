import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Search, Grid3X3, LayoutList } from 'lucide-react';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';
import useStore from '../store/useStore';

const SORTS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'Newest' },
];
const CATS = ['all', 'men', 'women', 'accessories', 'footwear', 'outerwear'];
const TAGS = ['New Arrival', 'Sale', 'Best Seller', 'Premium', 'Trending'];

export default function Shop() {
  const [searchParams] = useSearchParams();
  const { filters, setFilters, resetFilters } = useStore();
  const [showFilters, setShowFilters] = useState(false);
  const [gridView, setGridView] = useState(true);
  const [localSearch, setLocalSearch] = useState(filters.search || '');
  const [priceRange, setPriceRange] = useState([0, 500]);

  useEffect(() => {
    const cat = searchParams.get('cat');
    const tag = searchParams.get('tag');
    const q = searchParams.get('q');
    resetFilters();
    if (cat && cat !== 'new') setFilters({ category: cat });
    else if (cat === 'new') setFilters({ category: 'all', tags: ['New Arrival'] });
    if (tag) setFilters({ tags: [tag] });
    if (q) setFilters({ search: q });
  }, [searchParams]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (filters.category && filters.category !== 'all') list = list.filter((p) => p.category === filters.category);
    if (filters.search) list = list.filter((p) => p.name.toLowerCase().includes(filters.search.toLowerCase()) || p.brand.toLowerCase().includes(filters.search.toLowerCase()));
    if (filters.tags?.length) list = list.filter((p) => filters.tags.some((t) => p.tags.includes(t)));
    list = list.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (filters.sortBy === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (filters.sortBy === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (filters.sortBy === 'rating') list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [filters, priceRange]);

  const handleSearch = (e) => { e.preventDefault(); setFilters({ search: localSearch }); };
  const toggleTag = (tag) => {
    const tags = filters.tags || [];
    setFilters({ tags: tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag] });
  };
  const hasFilters = filters.category !== 'all' || filters.search || filters.tags?.length > 0;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="border-b" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <p className="section-label">Discover</p>
          <h1
            className="text-3xl font-bold mb-1"
            style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}
          >
            {filters.tags?.includes('New Arrival')
              ? 'New Arrivals'
              : filters.category && filters.category !== 'all'
              ? filters.category.charAt(0).toUpperCase() + filters.category.slice(1)
              : 'Shop All'}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {filtered.length} products
          </p>
        </div>
      </div>

      {/* Category tabs */}
      <div className="border-b" style={{ borderColor: 'var(--border)', background: '#fff' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-6 overflow-x-auto scrollbar-hide">
            {CATS.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilters({ category: cat })}
                className="py-4 text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all border-b-2 -mb-px"
                style={{
                  borderColor: filters.category === cat ? '#1c1c1c' : 'transparent',
                  color: filters.category === cat ? 'var(--text-primary)' : 'var(--text-muted)',
                }}
              >
                {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <form onSubmit={handleSearch} className="flex-1 max-w-xs relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search products..."
              className="input-field pl-9 h-10 text-sm"
            />
          </form>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 h-10 text-sm font-medium transition-all"
            style={{
              border: '1px solid var(--border)',
              color: showFilters ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: showFilters ? 'var(--bg-elevated)' : 'transparent',
            }}
          >
            <SlidersHorizontal size={14} /> Filters
            {hasFilters && (
              <span
                className="w-4 h-4 text-xs font-bold flex items-center justify-center rounded-full"
                style={{ background: '#1c1c1c', color: '#fff' }}
              >
                !
              </span>
            )}
          </button>

          <select
            value={filters.sortBy || 'featured'}
            onChange={(e) => setFilters({ sortBy: e.target.value })}
            className="input-field h-10 text-sm w-auto cursor-pointer"
          >
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          <div className="ml-auto flex gap-1">
            <button
              onClick={() => setGridView(true)}
              className="p-2 transition-all"
              style={{ color: gridView ? 'var(--text-primary)' : 'var(--text-muted)', background: gridView ? 'var(--bg-elevated)' : 'transparent' }}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setGridView(false)}
              className="p-2 transition-all"
              style={{ color: !gridView ? 'var(--text-primary)' : 'var(--text-muted)', background: !gridView ? 'var(--bg-elevated)' : 'transparent' }}
            >
              <LayoutList size={16} />
            </button>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="p-6 mb-6 animate-scale-in" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-primary)' }}>
                  Price Range
                </h3>
                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                  ${priceRange[0]} — ${priceRange[1]}
                </p>
                <input
                  type="range" min={0} max={500}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-primary)' }}>
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className="px-3 py-1.5 text-xs font-medium transition-all"
                      style={{
                        background: filters.tags?.includes(tag) ? '#1c1c1c' : 'transparent',
                        border: '1px solid ' + (filters.tags?.includes(tag) ? '#1c1c1c' : 'var(--border)'),
                        color: filters.tags?.includes(tag) ? '#fff' : 'var(--text-secondary)',
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {hasFilters && (
              <button
                onClick={() => { resetFilters(); setLocalSearch(''); setPriceRange([0, 500]); }}
                className="mt-5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider transition-colors"
                style={{ color: 'var(--accent-red)' }}
              >
                <X size={13} /> Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Active chips */}
        {hasFilters && (
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            {filters.search && (
              <span
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              >
                "{filters.search}"
                <button onClick={() => { setFilters({ search: '' }); setLocalSearch(''); }}>
                  <X size={10} />
                </button>
              </span>
            )}
            {filters.tags?.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              >
                {tag}
                <button onClick={() => toggleTag(tag)}><X size={10} /></button>
              </span>
            ))}
          </div>
        )}

        {/* Products */}
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              No products found
            </p>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              Try adjusting your filters
            </p>
            <button
              onClick={() => { resetFilters(); setLocalSearch(''); setPriceRange([0, 500]); }}
              className="btn-primary"
            >
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
