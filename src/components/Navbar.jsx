import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Search, Menu, X, ChevronDown } from 'lucide-react';
import useStore from '../store/useStore';

const U = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=400&q=85`;

const megaMenus = {
  "Men's": {
    featured: { label: 'New This Season', image: U('1507679799987-c73779587ccf'), to: '/shop?cat=men&tag=New+Arrival' },
    links: [
      { label: 'All Men\'s', to: '/shop?cat=men', image: U('1506634861428-a6d74f3a5073') },
      { label: 'Shirts', to: '/shop?cat=men&q=shirt', image: U('1490114538077-0a7f8cb49891') },
      { label: 'Blazers', to: '/shop?cat=men&q=blazer', image: U('1507679799987-c73779587ccf') },
      { label: 'Trousers', to: '/shop?cat=men&q=pants', image: U('1552374196-1ab2a1c593e8') },
      { label: 'Knitwear', to: '/shop?cat=men&q=turtleneck', image: U('1564859227655-91b8c0dc5ccc') },
      { label: 'Outerwear', to: '/shop?cat=outerwear', image: U('1551028719-00167b16eac5') },
    ],
  },
  "Women's": {
    featured: { label: 'New Arrivals', image: U('1515886657613-9f3515b0c78f'), to: '/shop?cat=women&tag=New+Arrival' },
    links: [
      { label: "All Women's", to: '/shop?cat=women', image: U('1483985988355-763728e1935b') },
      { label: 'Dresses', to: '/shop?cat=women&q=dress', image: U('1515886657613-9f3515b0c78f') },
      { label: 'Tops', to: '/shop?cat=women&q=blouse', image: U('1581044777550-4cfa4e5db0b8') },
      { label: 'Trousers', to: '/shop?cat=women&q=trousers', image: U('1509631179647-0177331693ae') },
      { label: 'Knitwear', to: '/shop?cat=women&q=sweater', image: U('1576566588028-4147f3842f27') },
      { label: 'Bags', to: '/shop?cat=women&q=tote', image: U('1548036328-c9fa89d128fa') },
    ],
  },
};

const navItems = [
  { label: 'New', to: '/shop?cat=new' },
  { label: "Men's", to: '/shop?cat=men', mega: true },
  { label: "Women's", to: '/shop?cat=women', mega: true },
  { label: 'Footwear', to: '/shop?cat=footwear' },
  { label: 'Accessories', to: '/shop?cat=accessories' },
  { label: 'Sale', to: '/shop?tag=Sale', sale: true },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [activeMenu, setActiveMenu] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, user, setCartOpen, setFilters } = useStore();
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const timer = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => { setMobileOpen(false); setSearchOpen(false); setActiveMenu(null); }, [location]);

  const openMenu = (label) => { clearTimeout(timer.current); setActiveMenu(label); };
  const closeMenu = () => { timer.current = setTimeout(() => setActiveMenu(null), 150); };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      setFilters({ search: searchVal });
      navigate('/shop');
      setSearchOpen(false);
      setSearchVal('');
    }
  };

  return (
    <>
      {/* Announcement bar */}
      <div className="announcement-bar">
        FREE SHIPPING ON ORDERS OVER $150&nbsp;·&nbsp;USE CODE{' '}
        <span style={{ color: '#c9a96e' }}>LUXE20</span> FOR 20% OFF YOUR FIRST ORDER
      </div>

      <nav
        className="sticky top-0 z-50 transition-all duration-300"
        style={{
          background: '#ffffff',
          borderBottom: '1px solid rgba(0,0,0,0.09)',
          boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.06)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: '#1c1c1c', letterSpacing: '-0.01em' }}>
              LUXE
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-7">
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.mega && openMenu(item.label)}
                  onMouseLeave={() => item.mega && closeMenu()}
                >
                  <Link
                    to={item.to}
                    className={`nav-link flex items-center gap-0.5${item.sale ? ' sale' : ''}`}
                    style={{ color: item.sale ? 'var(--accent-red)' : undefined }}
                  >
                    {item.label}
                    {item.mega && <ChevronDown size={12} className="opacity-40 mt-0.5" />}
                  </Link>
                </div>
              ))}
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-1">
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                  <input
                    autoFocus value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    placeholder="Search..."
                    className="input-field w-44 h-9 text-xs"
                  />
                  <button type="button" onClick={() => setSearchOpen(false)} style={{ color: 'var(--text-muted)' }}>
                    <X size={15} />
                  </button>
                </form>
              ) : (
                <button onClick={() => setSearchOpen(true)} className="p-2 transition-colors hover:text-black" style={{ color: 'var(--text-muted)' }}>
                  <Search size={18} />
                </button>
              )}

              <Link to={user ? '/profile' : '/login'} className="p-2 transition-colors hover:text-black" style={{ color: 'var(--text-muted)' }}>
                {user
                  ? <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: '#1c1c1c' }}>{user.avatar}</div>
                  : <User size={18} />}
              </Link>

              <button onClick={() => setCartOpen(true)} className="p-2 relative transition-colors hover:text-black" style={{ color: 'var(--text-muted)' }}>
                <ShoppingBag size={18} />
                {cartCount > 0 && <span className="count-badge">{cartCount}</span>}
              </button>

              <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2" style={{ color: 'var(--text-muted)' }}>
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mega Menu ── */}
        {activeMenu && megaMenus[activeMenu] && (
          <div
            className="absolute left-0 right-0 border-t animate-slide-down z-50"
            style={{ background: '#fff', borderColor: 'var(--border)', boxShadow: '0 16px 48px rgba(0,0,0,0.1)', top: '100%' }}
            onMouseEnter={() => openMenu(activeMenu)}
            onMouseLeave={closeMenu}
          >
            <div className="max-w-7xl mx-auto px-6 py-8">
              <div className="grid grid-cols-7 gap-6">
                {/* Featured card */}
                <Link
                  to={megaMenus[activeMenu].featured.to}
                  onClick={() => setActiveMenu(null)}
                  className="col-span-2 relative overflow-hidden group"
                  style={{ height: 260 }}
                >
                  <img
                    src={megaMenus[activeMenu].featured.image}
                    alt={megaMenus[activeMenu].featured.label}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                    className="group-hover:scale-105"
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 55%)' }} />
                  <div className="absolute bottom-4 left-4">
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: '#c9a96e' }}>Featured</p>
                    <p className="text-base font-bold text-white">{megaMenus[activeMenu].featured.label}</p>
                  </div>
                </Link>

                {/* Sub-category grid */}
                <div className="col-span-5 grid grid-cols-3 gap-4">
                  {megaMenus[activeMenu].links.map((link) => (
                    <Link
                      key={link.label}
                      to={link.to}
                      onClick={() => setActiveMenu(null)}
                      className="group flex items-center gap-3 p-3 transition-all hover:bg-gray-50"
                      style={{ border: '1px solid var(--border)' }}
                    >
                      <div className="w-14 h-16 flex-shrink-0 overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                        <img
                          src={link.image}
                          alt={link.label}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                          className="group-hover:scale-105"
                        />
                      </div>
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{link.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t animate-slide-down" style={{ borderColor: 'var(--border)', background: '#fff' }}>
            <div className="px-4 py-2 flex flex-col">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="py-3.5 text-sm font-medium border-b"
                  style={{ borderColor: 'var(--border)', color: item.sale ? 'var(--accent-red)' : 'var(--text-primary)' }}
                >
                  {item.label}
                </Link>
              ))}
              {/* Mobile sub-links */}
              <div className="py-3">
                <p className="text-xs uppercase tracking-widest font-bold mb-2" style={{ color: 'var(--text-muted)' }}>Men's</p>
                <div className="grid grid-cols-3 gap-2">
                  {megaMenus["Men's"].links.map((link) => (
                    <Link key={link.label} to={link.to} className="text-xs py-1 text-center" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="py-3 border-t" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xs uppercase tracking-widest font-bold mb-2" style={{ color: 'var(--text-muted)' }}>Women's</p>
                <div className="grid grid-cols-3 gap-2">
                  {megaMenus["Women's"].links.map((link) => (
                    <Link key={link.label} to={link.to} className="text-xs py-1 text-center" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
