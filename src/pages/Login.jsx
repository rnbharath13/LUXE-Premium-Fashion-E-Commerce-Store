import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import useStore from '../store/useStore';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, showToast } = useStore();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    setTimeout(() => {
      login({ email: form.email, name: form.email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').trim() });
      showToast('Welcome back!');
      navigate('/profile');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left editorial image */}
      <div className="hidden md:block relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85"
          alt="Fashion editorial"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />
        <div className="absolute bottom-10 left-10">
          <span
            style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', fontWeight: 700, color: '#fff' }}
          >
            LUXE
          </span>
          <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Premium fashion, curated for you.
          </p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center px-6 py-16" style={{ background: '#fff' }}>
        <div className="w-full max-w-sm animate-scale-in">
          <div className="mb-10">
            <p className="section-label">Welcome back</p>
            <h1
              className="text-3xl font-bold mb-2"
              style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}
            >
              Sign in
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Access your LUXE account
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 text-sm" style={{ background: 'rgba(196,30,58,0.08)', border: '1px solid rgba(196,30,58,0.2)', color: 'var(--accent-red)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="email" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field pl-10" placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type={showPwd ? 'text' : 'password'} value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-10 pr-10" placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="button" className="text-xs underline underline-offset-2" style={{ color: 'var(--text-muted)' }}>
                Forgot password?
              </button>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5">
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <>Sign In <ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: 'var(--border)' }} />
            </div>
            <div className="relative flex justify-center">
              <span className="text-xs px-3 bg-white" style={{ color: 'var(--text-muted)' }}>or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {['Google', 'Apple'].map((name) => (
              <button key={name} className="btn-ghost justify-center py-2.5 text-sm">{name}</button>
            ))}
          </div>

          <p className="text-center text-sm mt-8" style={{ color: 'var(--text-muted)' }}>
            {"Don't have an account? "}
            <Link to="/register" className="font-semibold underline underline-offset-2" style={{ color: 'var(--text-primary)' }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
