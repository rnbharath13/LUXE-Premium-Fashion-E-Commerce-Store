import { Link, useNavigate } from 'react-router-dom';
import { User, Package, Heart, Settings, LogOut, ChevronRight, Pen } from 'lucide-react';
import useStore from '../../store/useStore';
import ProductCard from '../../components/ProductCard';
import './Profile.css';

export default function Profile() {
  const { user, logout, wishlist, orders } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  if (!user) return (
    <div className="profile-guest">
      <div className="profile-guest-inner">
        <div className="profile-guest-icon-wrap">
          <User size={36} className="profile-guest-icon" />
        </div>
        <h2 className="profile-guest-title">Welcome Back</h2>
        <p className="profile-guest-desc">Sign in to access your profile, orders, and wishlist.</p>
        <div className="profile-guest-actions">
          <Link to="/login"    className="btn-primary justify-center">Sign In</Link>
          <Link to="/register" className="btn-ghost  justify-center">Create Account</Link>
        </div>
      </div>
    </div>
  );

  const stats = [
    { label: 'Orders',       value: orders.length  },
    { label: 'Wishlist',     value: wishlist.length },
    { label: 'Member Since', value: '2026'          },
  ];

  const menuItems = [
    { icon: Package,  label: 'My Orders',       desc: `${orders.length} orders`,          to: '/orders'  },
    { icon: Heart,    label: 'Wishlist',         desc: `${wishlist.length} saved items`,   to: '/profile' },
    { icon: Settings, label: 'Account Settings', desc: 'Manage your account',             to: '/profile' },
  ];

  return (
    <div className="profile-page animate-fade-in">
      <div className="profile-page-inner">
        {/* Header card */}
        <div className="profile-header">
          <div className="profile-header-row">
            <div className="profile-avatar">{user.avatar}</div>
            <div className="flex-1">
              <h1 className="profile-name">{user.name || 'LUXE Member'}</h1>
              <p className="profile-email">{user.email}</p>
            </div>
            <button className="profile-edit-btn"><Pen size={15} /></button>
          </div>
          <div className="profile-stats">
            {stats.map(({ label, value }) => (
              <div key={label} className="profile-stat">
                <p className="profile-stat-value">{value}</p>
                <p className="profile-stat-label">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Menu */}
        <div className="space-y-2 mb-10">
          {menuItems.map(({ icon: Icon, label, desc, to }) => (
            <Link key={label} to={to} className="profile-menu-item">
              <Icon size={18} className="profile-menu-icon" />
              <div className="flex-1">
                <p className="profile-menu-label">{label}</p>
                <p className="profile-menu-desc">{desc}</p>
              </div>
              <ChevronRight size={15} className="profile-menu-chevron" />
            </Link>
          ))}
          <button onClick={handleLogout} className="profile-logout-btn">
            <LogOut size={18} className="profile-logout-icon" />
            <span className="profile-logout-label">Sign Out</span>
          </button>
        </div>

        {/* Wishlist */}
        {wishlist.length > 0 && (
          <div>
            <h2 className="profile-wishlist-title">Wishlist</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {wishlist.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
