import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, RotateCcw, Shield, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { api, normalizeProduct } from '../../lib/api';
import ProductCard from '../../components/ProductCard';
import './Home.css';

const heroSlides = [
  {
    id: 1, label: 'New Season 2026', headline: 'Redefine Your', headlineAccent: 'Aesthetic',
    sub: 'Explore our latest curated collection of premium fashion pieces.',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1600&q=85',
    cat: 'women', cta: 'Shop Women', align: 'left',
  },
  {
    id: 2, label: 'Menswear Edit', headline: 'Craft Meets', headlineAccent: 'Modern Style',
    sub: 'Impeccably tailored pieces for the contemporary man.',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1600&q=85',
    cat: 'men', cta: 'Shop Men', align: 'right',
  },
  {
    id: 3, label: 'New Footwear', headline: 'Step Into', headlineAccent: 'The Future',
    sub: 'Next-generation silhouettes engineered for performance and style.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=85',
    cat: 'footwear', cta: 'Shop Footwear', align: 'left',
  },
];

const categories = [
  { id: 'men',         label: "Men's",      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=90' },
  { id: 'women',       label: "Women's",    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=90' },
  { id: 'accessories', label: 'Accessories',image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=800&q=90' },
  { id: 'footwear',    label: 'Footwear',   image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=90' },
];

const perks = [
  { icon: Truck,     title: 'Free Shipping', desc: 'On orders over $150' },
  { icon: RotateCcw, title: 'Easy Returns',  desc: '30-day free returns' },
  { icon: Shield,    title: 'Secure Payment',desc: 'Your data is protected' },
  { icon: Star,      title: 'Premium Quality',desc: 'Curated for excellence' },
];

export default function Home() {
  const [slide,          setSlide]          = useState(0);
  const [activeCategory, setActiveCategory] = useState('all');
  const [fade,           setFade]           = useState(true);
  const [allProducts,    setAllProducts]    = useState([]);

  const filtered = activeCategory === 'all'
    ? allProducts.slice(0, 8)
    : allProducts.filter((p) => p.category === activeCategory).slice(0, 8);

  useEffect(() => {
    api.get('/products?limit=50')
      .then(({ products }) => setAllProducts((products || []).map(normalizeProduct)))
      .catch(() => setAllProducts([]));
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setFade(false);
      setTimeout(() => { setSlide((s) => (s + 1) % heroSlides.length); setFade(true); }, 350);
    }, 5500);
    return () => clearInterval(t);
  }, []);

  const goSlide = (i) => { setFade(false); setTimeout(() => { setSlide(i); setFade(true); }, 350); };
  const hero    = heroSlides[slide];

  return (
    <div>
      {/* ── Hero ── */}
      <section className="hero">
        <div className={`hero-bg ${fade ? 'fade-in' : 'fade-out'}`}>
          <img src={hero.image} alt={hero.headline} />
          <div className="hero-overlay" />
        </div>

        <div className={`hero-content ${fade ? 'fade-in' : 'fade-out'}`}>
          <div className={`hero-content-inner${hero.align === 'right' ? ' align-right' : ''}`}>
            <div className="hero-text">
              <p className="hero-tag">{hero.label}</p>
              <h1 className="hero-heading">
                {hero.headline}<br />
                <span className="hero-heading-accent">{hero.headlineAccent}</span>
              </h1>
              <p className="hero-sub">{hero.sub}</p>
              <div className="hero-actions">
                <Link to={'/shop?cat=' + hero.cat} className="btn-primary">{hero.cta} <ArrowRight size={16} /></Link>
                <Link to="/shop" className="hero-view-all">View All</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-controls">
          <button className="hero-ctrl-btn" onClick={() => goSlide((slide - 1 + heroSlides.length) % heroSlides.length)}><ChevronLeft size={16} /></button>
          <div className="hero-dots">
            {heroSlides.map((_, i) => (
              <button key={i} className={`hero-dot${i === slide ? ' active' : ''}`} onClick={() => goSlide(i)} style={{ width: i === slide ? 28 : 7 }} />
            ))}
          </div>
          <button className="hero-ctrl-btn" onClick={() => goSlide((slide + 1) % heroSlides.length)}><ChevronRight size={16} /></button>
        </div>
      </section>

      {/* ── Perks ── */}
      <section className="perks-bar">
        <div className="perks-bar-inner">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {perks.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="perk-item">
                <Icon size={18} className="perk-icon" />
                <div>
                  <p className="perk-title">{title}</p>
                  <p className="perk-desc">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Shop by Category ── */}
      <section className="categories-section">
        <div className="categories-inner">
          <div className="mb-8">
            <p className="section-label">Collections</p>
            <h2 className="categories-heading">Shop by Category</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {categories.map((cat) => (
              <Link key={cat.id} to={'/shop?cat=' + cat.id} className="category-card" style={{ height: 320 }}>
                <img src={cat.image} alt={cat.label} />
                <div className="overlay" />
                <div className="label">{cat.label}</div>
              </Link>
            ))}
          </div>
          <div className="mt-3 md:mt-4">
            <Link to="/shop?cat=outerwear" className="category-card block" style={{ height: 220 }}>
              <img src="https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1400&q=80" alt="Outerwear" style={{ objectPosition: 'center 30%' }} />
              <div className="overlay" />
              <div className="label categories-banner-label">Outerwear — Shop Now</div>
              <span className="categories-banner-badge">New In</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trending Now ── */}
      <section className="trending-section">
        <div className="trending-inner">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
            <div>
              <p className="section-label">Curated Picks</p>
              <h2 className="trending-heading">Trending Now</h2>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {['all', 'men', 'women', 'accessories', 'footwear'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`trending-filter-btn${activeCategory === cat ? ' active' : ''}`}
                >
                  {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="text-center mt-12">
            <Link to="/shop" className="btn-ghost">View All Products <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* ── Editorial Split ── */}
      <section className="editorial-section">
        <div className="editorial-panel">
          <img src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=900&q=80" alt="Women editorial" />
          <div className="editorial-overlay" />
          <div className="editorial-content">
            <p className="editorial-tag">New Season</p>
            <h3 className="editorial-title">The Women's Edit</h3>
            <p className="editorial-desc">Feminine silhouettes meet contemporary edge.</p>
            <Link to="/shop?cat=women" className="btn-primary" style={{ fontSize: '0.8125rem' }}>Shop Women <ArrowRight size={14} /></Link>
          </div>
        </div>
        <div className="editorial-panel">
          <img src="https://images.unsplash.com/photo-1506634861428-a6d74f3a5073?auto=format&fit=crop&w=900&q=80" alt="Men editorial" />
          <div className="editorial-overlay" />
          <div className="editorial-content">
            <p className="editorial-tag">Menswear</p>
            <h3 className="editorial-title">Refined Masculinity</h3>
            <p className="editorial-desc">Elevated essentials for the modern gentleman.</p>
            <Link to="/shop?cat=men" className="btn-primary" style={{ fontSize: '0.8125rem' }}>Shop Men <ArrowRight size={14} /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
