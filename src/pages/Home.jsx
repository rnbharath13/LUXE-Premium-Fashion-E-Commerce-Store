import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, RotateCcw, Shield, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';

const heroSlides = [
  {
    id: 1,
    label: 'New Season 2026',
    headline: 'Redefine Your',
    headlineAccent: 'Aesthetic',
    sub: 'Explore our latest curated collection of premium fashion pieces.',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1600&q=85',
    cat: 'women',
    cta: 'Shop Women',
    align: 'left',
  },
  {
    id: 2,
    label: 'Menswear Edit',
    headline: 'Craft Meets',
    headlineAccent: 'Modern Style',
    sub: 'Impeccably tailored pieces for the contemporary man.',
    image: 'https://images.unsplash.com/photo-1506634861428-a6d74f3a5073?auto=format&fit=crop&w=1600&q=85',
    cat: 'men',
    cta: 'Shop Men',
    align: 'right',
  },
  {
    id: 3,
    label: 'New Footwear',
    headline: 'Step Into',
    headlineAccent: 'The Future',
    sub: 'Next-generation silhouettes engineered for performance and style.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=85',
    cat: 'footwear',
    cta: 'Shop Footwear',
    align: 'left',
  },
];

const categories = [
  {
    id: 'men',
    label: "Men's",
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=90',
  },
  {
    id: 'women',
    label: "Women's",
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=90',
  },
  {
    id: 'accessories',
    label: 'Accessories',
    image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=800&q=90',
  },
  {
    id: 'footwear',
    label: 'Footwear',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=90',
  },
];

const perks = [
  { icon: Truck, title: 'Free Shipping', desc: 'On orders over $150' },
  { icon: RotateCcw, title: 'Easy Returns', desc: '30-day free returns' },
  { icon: Shield, title: 'Secure Payment', desc: 'Your data is protected' },
  { icon: Star, title: 'Premium Quality', desc: 'Curated for excellence' },
];

export default function Home() {
  const [slide, setSlide] = useState(0);
  const [activeCategory, setActiveCategory] = useState('all');
  const [fade, setFade] = useState(true);

  const filtered =
    activeCategory === 'all'
      ? products.slice(0, 8)
      : products.filter((p) => p.category === activeCategory).slice(0, 8);

  useEffect(() => {
    const t = setInterval(() => {
      setFade(false);
      setTimeout(() => { setSlide((s) => (s + 1) % heroSlides.length); setFade(true); }, 350);
    }, 5500);
    return () => clearInterval(t);
  }, []);

  const goSlide = (i) => {
    setFade(false);
    setTimeout(() => { setSlide(i); setFade(true); }, 350);
  };

  const hero = heroSlides[slide];

  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden" style={{ height: '90vh', minHeight: 520 }}>
        <div
          style={{
            position: 'absolute', inset: 0,
            opacity: fade ? 1 : 0,
            transition: 'opacity 0.4s ease',
          }}
        >
          <img
            src={hero.image}
            alt={hero.headline}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
          />
          {/* Overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)' }} />
        </div>

        {/* Content */}
        <div
          className="relative h-full flex items-center"
          style={{ opacity: fade ? 1 : 0, transition: 'opacity 0.4s ease' }}
        >
          <div className={`max-w-7xl mx-auto px-6 w-full ${hero.align === 'right' ? 'flex justify-end' : ''}`}>
            <div style={{ maxWidth: 520 }}>
              <p
                className="text-xs font-bold uppercase tracking-widest mb-4"
                style={{ color: '#c9a96e' }}
              >
                {hero.label}
              </p>
              <h1
                className="font-black text-white mb-5 leading-none"
                style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(3rem, 6vw, 5rem)' }}
              >
                {hero.headline}<br />
                <span style={{ color: '#c9a96e' }}>{hero.headlineAccent}</span>
              </h1>
              <p className="text-base mb-8 max-w-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
                {hero.sub}
              </p>
              <div className="flex items-center gap-4">
                <Link to={'/shop?cat=' + hero.cat} className="btn-primary">
                  {hero.cta} <ArrowRight size={16} />
                </Link>
                <Link to="/shop" className="text-sm font-semibold text-white underline underline-offset-4 hover:text-amber-200 transition-colors">
                  View All
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Slide controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
          <button
            onClick={() => goSlide((slide - 1 + heroSlides.length) % heroSlides.length)}
            className="w-8 h-8 flex items-center justify-center transition-all"
            style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex gap-2">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => goSlide(i)}
                className="transition-all duration-300"
                style={{
                  width: i === slide ? 28 : 7,
                  height: 3,
                  background: i === slide ? '#c9a96e' : 'rgba(255,255,255,0.5)',
                }}
              />
            ))}
          </div>
          <button
            onClick={() => goSlide((slide + 1) % heroSlides.length)}
            className="w-8 h-8 flex items-center justify-center transition-all"
            style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </section>

      {/* ── PERKS ── */}
      <section style={{ background: '#1c1c1c' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {perks.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <Icon size={18} style={{ color: '#c9a96e', flexShrink: 0 }} />
                <div>
                  <p className="text-xs font-bold text-white uppercase tracking-wider">{title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SHOP BY CATEGORY ── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <p className="section-label">Collections</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Shop by Category
            </h2>
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
          {/* Wide banner — Outerwear */}
          <div className="mt-3 md:mt-4">
            <Link
              to="/shop?cat=outerwear"
              className="category-card block"
              style={{ height: 220 }}
            >
              <img
                src="https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1400&q=80"
                alt="Outerwear"
                style={{ objectPosition: 'center 30%' }}
              />
              <div className="overlay" />
              <div className="label" style={{ fontSize: '1.25rem' }}>Outerwear — Shop Now</div>
              <span
                className="absolute top-4 right-4 text-xs font-bold uppercase tracking-widest px-3 py-1"
                style={{ background: '#c9a96e', color: '#fff' }}
              >
                New In
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── TRENDING NOW ── */}
      <section className="py-16" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
            <div>
              <p className="section-label">Curated Picks</p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Trending Now
              </h2>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {['all', 'men', 'women', 'accessories', 'footwear'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="px-4 py-1.5 text-xs font-semibold uppercase tracking-widest transition-all"
                  style={{
                    background: activeCategory === cat ? '#1c1c1c' : 'transparent',
                    color: activeCategory === cat ? '#fff' : 'var(--text-secondary)',
                    border: '1px solid ' + (activeCategory === cat ? '#1c1c1c' : 'var(--border)'),
                  }}
                >
                  {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/shop" className="btn-ghost">
              View All Products <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── EDITORIAL SPLIT BANNER ── */}
      <section className="grid md:grid-cols-2" style={{ minHeight: 480 }}>
        <div className="relative overflow-hidden" style={{ minHeight: 340 }}>
          <img
            src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=900&q=80"
            alt="Women editorial"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
          <div className="absolute bottom-8 left-8">
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#c9a96e' }}>New Season</p>
            <h3 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              Women's Edit
            </h3>
            <Link to="/shop?cat=women" className="btn-ghost" style={{ border: '1px solid rgba(255,255,255,0.6)', color: '#fff' }}>
              Shop Now <ArrowRight size={15} />
            </Link>
          </div>
        </div>
        <div className="relative overflow-hidden" style={{ minHeight: 340 }}>
          <img
            src="https://images.unsplash.com/photo-1506634861428-a6d74f3a5073?auto=format&fit=crop&w=900&q=80"
            alt="Men editorial"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
          <div className="absolute bottom-8 left-8">
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#c9a96e' }}>Tailored</p>
            <h3 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              Men's Edit
            </h3>
            <Link to="/shop?cat=men" className="btn-ghost" style={{ border: '1px solid rgba(255,255,255,0.6)', color: '#fff' }}>
              Shop Now <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── BRAND STRIP ── */}
      <section className="py-12 border-t border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-center text-xs uppercase tracking-widest mb-8" style={{ color: 'var(--text-muted)' }}>
            Trusted by leading brands
          </p>
          <div className="flex items-center justify-around flex-wrap gap-6">
            {['NORDIC', 'ATELIER', 'MAISON', 'AVANT', 'VELOUR', 'ONYX'].map((brand) => (
              <span
                key={brand}
                className="text-lg font-black uppercase tracking-widest cursor-pointer transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => (e.target.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.target.style.color = 'var(--text-muted)')}
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20" style={{ background: '#1c1c1c' }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#c9a96e' }}>
            Limited Time
          </p>
          <h2
            className="font-black text-white mb-5"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
          >
            Get 20% Off Your First Order
          </h2>
          <p className="mb-8" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>
            Use code <span className="font-bold" style={{ color: '#c9a96e' }}>LUXE20</span> at checkout.
            New customers only. Terms apply.
          </p>
          <Link to="/shop" className="btn-accent">
            Start Shopping <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
