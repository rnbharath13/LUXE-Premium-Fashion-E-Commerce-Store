import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Check, ArrowRight } from 'lucide-react';
import useStore from '../store/useStore';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, showToast } = useStore();
  const navigate = useNavigate();

  const perks = [
    'Free shipping on first order',
    'Early access to new drops',
    'Exclusive member discounts',
    'Easy returns & exchanges',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { showToast('Passwords do not match', 'error'); return; }
    setLoading(true);
    setTimeout(() => {
      login({ email: form.email, name: form.name || form.email.split('@')[0] });
      showToast('Account created! Welcome to LUXE');
      navigate('/profile');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left editorial */}
      <div className="relative hidden md:block overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1506634861428-a6d74f3a5073?auto=format&fit=crop&w=900&q=85"
          alt="Join LUXE"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }} />
        <div className="absolute bottom-10 left-10 right-10">
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', fontWeight: 700, color: '#fff' }}>
            LUXE
          </span>
          <h2 className="text-2xl font-bold text-white mt-3 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Join the club.
          </h2>
          <ul className="space-y-3">
            {perks.map((p) => (
              <li key={p} className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(201,169,110,0.3)', border: '1px solid rgba(201,169,110,0.5)' }}>
                  <Check size={11} style={{ color: '#c9a96e' }} />
                </div>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center px-6 py-16" style={{ background: '#fff' }}>
        <div className="w-full max-w-sm animate-scale-in">
          <div className="mb-10">
            <p className="section-label">New here?</p>
            <h1
              className="text-3xl font-bold mb-2"
              style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}
            >
              Create Account
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Unlock a world of premium fashion
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Full Name', icon: User, key: 'name', type: 'text', placeholder: 'John Doe' },
              { label: 'Email Address', icon: Mail, key: 'email', type: 'email', placeholder: 'you@example.com' },
            ].map(({ label, icon: Icon, key, type, placeholder }) => (
              <div key={key}>
                <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                  {label}
                </label>
                <div className="relative">
                  <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type={type} value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="input-field pl-9" placeholder={placeholder}
                  />
                </div>
              </div>
            ))}

            <div>
              <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                Password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type={showPwd ? 'text' : 'password'} value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-9 pr-9" placeholder="Min. 8 characters"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="password" value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  className="input-field pl-9" placeholder="Re-enter password"
                />
              </div>
            </div>

            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              By creating an account, you agree to our{' '}
              <a href="#" className="underline" style={{ color: 'var(--text-secondary)' }}>Terms</a>{' '}
              and{' '}
              <a href="#" className="underline" style={{ color: 'var(--text-secondary)' }}>Privacy Policy</a>.
            </p>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5">
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <>Create Account <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center text-sm mt-8" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold underline underline-offset-2" style={{ color: 'var(--text-primary)' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
