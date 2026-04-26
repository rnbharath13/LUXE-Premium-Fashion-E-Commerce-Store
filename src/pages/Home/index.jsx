import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, RotateCcw, Shield, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../../lib/api';
import { useSeo } from '../../hooks/useSeo';
import ProductCard from '../../components/ProductCard';
import './Home.css';

const EMPTY_HOME = {
  heroSlides: [],
  categories: [],
  outerwearBanner: null,
  editorials: [],
  groups: { all: [], men: [], women: [], accessories: [], footwear: [] },
};

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
  const [homeData,       setHomeData]       = useState(EMPTY_HOME);

  useSeo({
    title:       'Premium Fashion, Curated for You',
    description: 'Discover the season\'s most-wanted pieces. Free shipping on orders over $150. 30-day returns. Secure checkout.',
  });

  const heroSlides = homeData.heroSlides || [];
  const categories = homeData.categories || [];
  const editorials = homeData.editorials || [];
  const groups = homeData.groups || EMPTY_HOME.groups;
  const filtered = groups[activeCategory] || [];
  const hero = heroSlides[slide] || heroSlides[0];

  useEffect(() => {
    api.get('/products/home')
      .then((data) => setHomeData(data || EMPTY_HOME))
      .catch(() => setHomeData(EMPTY_HOME));
  }, []);

  useEffect(() => {
    if (slide >= heroSlides.length) setSlide(0);
  }, [heroSlides.length, slide]);

  useEffect(() => {
    if (heroSlides.length <= 1) return undefined;
    const t = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setSlide((s) => (s + 1) % heroSlides.length);
        setFade(true);
      }, 350);
    }, 5500);
    return () => clearInterval(t);
  }, [heroSlides.length]);

  const goSlide = (i) => {
    if (!heroSlides.length) return;
    setFade(false);
    setTimeout(() => { setSlide(i); setFade(true); }, 350);
  };

  return (
    <div>
      <section className="hero">
        {hero && (
          <>
            <div className={`hero-bg ${fade ? 'fade-in' : 'fade-out'}`}>
              <img src={hero.image} alt={hero.headline} loading="eager" />
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
                    <Link to={`/shop?cat=${hero.cat}`} className="btn-primary">{hero.cta} <ArrowRight size={16} /></Link>
                    <Link to="/shop" className="hero-view-all">View All</Link>
                  </div>
                </div>
              </div>
            </div>

            {heroSlides.length > 1 && (
              <div className="hero-controls">
                <button className="hero-ctrl-btn" onClick={() => goSlide((slide - 1 + heroSlides.length) % heroSlides.length)}><ChevronLeft size={16} /></button>
                <div className="hero-dots">
                  {heroSlides.map((_, i) => (
                    <button key={i} className={`hero-dot${i === slide ? ' active' : ''}`} onClick={() => goSlide(i)} style={{ width: i === slide ? 28 : 7 }} />
                  ))}
                </div>
                <button className="hero-ctrl-btn" onClick={() => goSlide((slide + 1) % heroSlides.length)}><ChevronRight size={16} /></button>
              </div>
            )}
          </>
        )}
      </section>

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

      <section className="categories-section">
        <div className="categories-inner">
          <div className="mb-8">
            <p className="section-label">Collections</p>
            <h2 className="categories-heading">Shop by Category</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/shop?cat=${cat.id}`} className="category-card" style={{ height: 320 }}>
                <img src={cat.image} alt={cat.label} loading="lazy" />
                <div className="overlay" />
                <div className="label">{cat.label}</div>
              </Link>
            ))}
          </div>
          {homeData.outerwearBanner && (
            <div className="mt-3 md:mt-4">
              <Link to="/shop?cat=outerwear" className="category-card block" style={{ height: 220 }}>
                <img src={homeData.outerwearBanner.image} alt={homeData.outerwearBanner.alt} style={{ objectPosition: 'center 30%' }} loading="lazy" />
                <div className="overlay" />
                <div className="label categories-banner-label">Outerwear - Shop Now</div>
                <span className="categories-banner-badge">New In</span>
              </Link>
            </div>
          )}
        </div>
      </section>

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

      <section className="editorial-section">
        {editorials.map((panel) => (
          <div key={panel.title} className="editorial-panel">
            <img src={panel.image} alt={panel.title} loading="lazy" />
            <div className="editorial-overlay" />
            <div className="editorial-content">
              <p className="editorial-tag">{panel.tag}</p>
              <h3 className="editorial-title">{panel.title}</h3>
              <p className="editorial-desc">{panel.desc}</p>
              <Link to={`/shop?cat=${panel.cat}`} className="btn-primary" style={{ fontSize: '0.8125rem' }}>{panel.cta} <ArrowRight size={14} /></Link>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
