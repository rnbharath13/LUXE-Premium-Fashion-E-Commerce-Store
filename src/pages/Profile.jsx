import { Link, useNavigate } from 'react-router-dom';
import { User, Package, Heart, Settings, LogOut, ChevronRight, Pen } from 'lucide-react';
import useStore from '../store/useStore';
import ProductCard from '../components/ProductCard';

export default function Profile() {
  const { user, logout, wishlist, orders } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="text-center px-4">
        <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6" style={{ border: '1px solid var(--border)' }}>
          <User size={36} style={{ color: 'var(--text-muted)' }} />
        </div>
        <h2
          className="text-2xl font-bold mb-2"
          style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}
        >
          Welcome Back
        </h2>
        <p className="mb-8 text-sm" style={{ color: 'var(--text-muted)' }}>
          Sign in to access your profile, orders, and wishlist.
        </p>
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <Link to="/login" className="btn-primary justify-center">Sign In</Link>
          <Link to="/register" className="btn-ghost justify-center">Create Account</Link>
        </div>
      </div>
    </div>
  );

  const stats = [
    { label: 'Orders', value: orders.length },
    { label: 'Wishlist', value: wishlist.length },
    { label: 'Member Since', value: '2026' },
  ];

  const menuItems = [
    { icon: Package, label: 'My Orders', desc: `${orders.length} orders`, to: '/orders' },
    { icon: Heart, label: 'Wishlist', desc: `${wishlist.length} saved items`, to: '/profile' },
    { icon: Settings, label: 'Account Settings', desc: 'Manage your account', to: '/profile' },
  ];

  return (
    <div className="min-h-screen animate-fade-in" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="p-8 mb-6" style={{ background: '#fff', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-6">
            <div
              className="w-16 h-16 flex items-center justify-center text-2xl font-black text-white flex-shrink-0"
              style={{ background: '#1c1c1c' }}
            >
              {user.avatar}
            </div>
            <div className="flex-1">
              <h1
                className="text-xl font-bold mb-0.5"
                style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}
              >
                {user.name || 'LUXE Member'}
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
            </div>
            <button
              className="p-2 transition-all hover:bg-gray-100"
              style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
            >
              <Pen size={15} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
            {stats.map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{value}</p>
                <p className="text-xs uppercase tracking-wider mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Menu */}
        <div className="space-y-2 mb-10">
          {menuItems.map(({ icon: Icon, label, desc, to }) => (
            <Link
              key={label}
              to={to}
              className="flex items-center gap-4 p-5 transition-all hover:bg-gray-50"
              style={{ background: '#fff', border: '1px solid var(--border)' }}
            >
              <Icon size={18} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</p>
              </div>
              <ChevronRight size={15} style={{ color: 'var(--text-muted)' }} />
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-5 transition-all hover:bg-red-50"
            style={{ background: '#fff', border: '1px solid var(--border)' }}
          >
            <LogOut size={18} style={{ color: 'var(--accent-red)', flexShrink: 0 }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--accent-red)' }}>Sign Out</span>
          </button>
        </div>

        {/* Wishlist */}
        {wishlist.length > 0 && (
          <div>
            <h2
              className="text-2xl font-bold mb-6"
              style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}
            >
              Wishlist
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {wishlist.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
