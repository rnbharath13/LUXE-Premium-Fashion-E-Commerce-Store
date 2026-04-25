import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Search, Menu, X, ChevronDown, LogOut } from 'lucide-react';
import useStore from '../../store/useStore';
import './Navbar.css';

const U = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=400&q=85`;

const megaMenus = {
  "Men's": {
    featured: { label: 'New This Season', image: U('1507679799987-c73779587ccf'), to: '/shop?cat=men&tag=New+Arrival' },
    links: [
      { label: "All Men's", to: '/shop?cat=men',               image: U('1507679799987-c73779587ccf') },
      { label: 'Shirts',    to: '/shop?cat=men&sub=shirts',     image: U('1490114538077-0a7f8cb49891') },
      { label: 'Blazers',   to: '/shop?cat=men&sub=blazers',    image: U('1507679799987-c73779587ccf') },
      { label: 'Trousers',  to: '/shop?cat=men&sub=trousers',   image: U('1552374196-1ab2a1c593e8') },
      { label: 'Knitwear',  to: '/shop?cat=men&sub=knitwear',   image: U('1610652492500-ded49ceeb378') },
      { label: 'Outerwear', to: '/shop?cat=men&sub=outerwear',  image: U('1551028719-00167b16eac5') },
    ],
  },
  "Women's": {
    featured: { label: 'New Arrivals', image: U('1515886657613-9f3515b0c78f'), to: '/shop?cat=women&tag=New+Arrival' },
    links: [
      { label: "All Women's", to: '/shop?cat=women',              image: U('1483985988355-763728e1935b') },
      { label: 'Dresses',     to: '/shop?cat=women&sub=dresses',  image: U('1515886657613-9f3515b0c78f') },
      { label: 'Tops',        to: '/shop?cat=women&sub=tops',     image: U('1576566588028-4147f3842f27') },
      { label: 'Trousers',    to: '/shop?cat=women&sub=trousers', image: U('1509631179647-0177331693ae') },
      { label: 'Knitwear',    to: '/shop?cat=women&sub=knitwear', image: U('1576566588028-4147f3842f27') },
      { label: 'Bags',        to: '/shop?cat=women&sub=bags',     image: U('1548036328-c9fa89d128fa') },
    ],
  },
};

const navItems = [
  { label: 'New',         to: '/shop?cat=new' },
  { label: "Men's",       to: '/shop?cat=men',        mega: true },
  { label: "Women's",     to: '/shop?cat=women',      mega: true },
  { label: 'Footwear',    to: '/shop?cat=footwear' },
  { label: 'Accessories', to: '/shop?cat=accessories' },
  { label: 'Sale',        to: '/shop?cat=sale',        sale: true },
];

export default function Navbar() {
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal,  setSearchVal]  = useState('');
  const [activeMenu,   setActiveMenu]   = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, user, logout, setCartOpen } = useStore();
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const timer = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setActiveMenu(null);
    setUserMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const openMenu  = (label) => { clearTimeout(timer.current); setActiveMenu(label); };
  const closeMenu = ()      => { timer.current = setTimeout(() => setActiveMenu(null), 150); };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchVal.trim())}`);
      setSearchOpen(false);
      setSearchVal('');
    }
  };

  const avatarLetter = user
    ? (user.first_name || user.email || 'U')[0].toUpperCase()
    : null;

  return (
    <>
      <div className="announcement-bar">
        FREE SHIPPING ON ORDERS OVER $150&nbsp;·&nbsp;USE CODE{' '}
        <span className="accent">LUXE20</span> FOR 20% OFF YOUR FIRST ORDER
      </div>

      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo">LUXE</Link>

          {/* Desktop nav */}
          <div className="navbar-desktop-nav">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.mega && openMenu(item.label)}
                onMouseLeave={() => item.mega && closeMenu()}
              >
                <Link to={item.to} className={`nav-link flex items-center gap-0.5${item.sale ? ' sale' : ''}`}>
                  {item.label}
                  {item.mega && <ChevronDown size={12} className="opacity-40 mt-0.5" />}
                </Link>
              </div>
            ))}
          </div>

          {/* Right icons */}
          <div className="navbar-right">
            {searchOpen ? (
              <form onSubmit={handleSearch} className="navbar-search-form">
                <input
                  autoFocus
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder="Search..."
                  className="input-field navbar-search-input"
                />
                <button type="button" className="navbar-icon-btn" onClick={() => setSearchOpen(false)}>
                  <X size={15} />
                </button>
              </form>
            ) : (
              <button className="navbar-icon-btn" onClick={() => setSearchOpen(true)}>
                <Search size={18} />
              </button>
            )}

            {user ? (
              <div className="navbar-user-menu-wrap" ref={userMenuRef}>
                <button className="navbar-icon-btn" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                  <div className="navbar-user-avatar">{avatarLetter}</div>
                </button>
                {userMenuOpen && (
                  <div className="navbar-user-dropdown">
                    <Link to="/profile" className="navbar-user-dropdown-item">
                      <User size={14} /> Profile
                    </Link>
                    <button className="navbar-user-dropdown-item navbar-user-dropdown-logout" onClick={handleLogout}>
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="navbar-icon-btn">
                <User size={18} />
              </Link>
            )}

            <button className="navbar-icon-btn" onClick={() => setCartOpen(true)}>
              <ShoppingBag size={18} />
              {cartCount > 0 && <span className="count-badge">{cartCount}</span>}
            </button>

            <button className="navbar-icon-btn navbar-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mega Menu */}
        {activeMenu && megaMenus[activeMenu] && (
          <div
            className="mega-menu"
            onMouseEnter={() => openMenu(activeMenu)}
            onMouseLeave={closeMenu}
          >
            <div className="mega-menu-inner">
              <div className="grid grid-cols-7 gap-6">
                <Link
                  to={megaMenus[activeMenu].featured.to}
                  onClick={() => setActiveMenu(null)}
                  className="mega-featured col-span-2"
                >
                  <img src={megaMenus[activeMenu].featured.image} alt={megaMenus[activeMenu].featured.label} />
                  <div className="mega-featured-overlay" />
                  <div className="mega-featured-label">
                    <p className="mega-featured-tag">Featured</p>
                    <p className="mega-featured-title">{megaMenus[activeMenu].featured.label}</p>
                  </div>
                </Link>
                <div className="col-span-5 grid grid-cols-3 gap-4">
                  {megaMenus[activeMenu].links.map((link) => (
                    <Link key={link.label} to={link.to} onClick={() => setActiveMenu(null)} className="mega-sub-link">
                      <div className="mega-sub-img">
                        <img src={link.image} alt={link.label} />
                      </div>
                      <span className="mega-sub-label">{link.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="mobile-menu">
            <div className="mobile-menu-inner">
              {navItems.map((item) => (
                <Link key={item.label} to={item.to} className={`mobile-nav-link${item.sale ? ' sale' : ''}`}>
                  {item.label}
                </Link>
              ))}
              {["Men's", "Women's"].map((cat) => (
                <div key={cat} className="mobile-sub-section">
                  <p className="mobile-sub-title">{cat}</p>
                  <div className="mobile-sub-grid">
                    {megaMenus[cat].links.map((link) => (
                      <Link key={link.label} to={link.to} className="mobile-sub-link">{link.label}</Link>
                    ))}
                  </div>
                </div>
              ))}
              <div className="mobile-sub-section" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                {user ? (
                  <>
                    <Link to="/profile" className="mobile-nav-link">My Account</Link>
                    <button className="mobile-nav-link" style={{ color: '#e53e3e', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }} onClick={handleLogout}>
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login"    className="mobile-nav-link">Sign In</Link>
                    <Link to="/register" className="mobile-nav-link">Create Account</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
