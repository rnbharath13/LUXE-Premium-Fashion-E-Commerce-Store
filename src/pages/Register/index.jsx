import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Check, ArrowRight } from 'lucide-react';
import useStore from '../../store/useStore';
import './Register.css';
import '../Login/Login.css';

export default function Register() {
  const [form,    setForm]    = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const { register, showToast } = useStore();
  const navigate                = useNavigate();

  const perks = [
    'Free shipping on first order',
    'Early access to new drops',
    'Exclusive member discounts',
    'Easy returns & exchanges',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 8)          { setError('Password must be at least 8 characters'); return; }
    if (!/[A-Z]/.test(form.password))      { setError('Password must contain at least one uppercase letter'); return; }
    if (!/[0-9]/.test(form.password))      { setError('Password must contain at least one number'); return; }
    setLoading(true);
    setError('');
    try {
      const [firstName, ...rest] = (form.name || '').trim().split(' ');
      await register(form.email, form.password, firstName, rest.join(' '));
      showToast('Account created! Welcome to LUXE 🎉');
      navigate('/profile');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* Left editorial */}
      <div className="auth-editorial">
        <div className="register-editorial-img">
          <img src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=85" alt="Join LUXE" />
        </div>
        <div className="register-editorial-overlay" />
        <div className="register-editorial-content">
          <span className="register-editorial-logo">LUXE</span>
          <h2 className="register-editorial-heading">Join the club.</h2>
          <ul className="register-perk-list">
            {perks.map((p) => (
              <li key={p} className="register-perk-item">
                <div className="register-perk-icon-wrap"><Check size={11} className="register-perk-icon" /></div>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right form */}
      <div className="auth-form-panel">
        <div className="auth-form-inner animate-scale-in">
          <div className="auth-form-heading">
            <p className="section-label">New here?</p>
            <h1 className="auth-form-title">Create Account</h1>
            <p className="auth-form-subtitle">Unlock a world of premium fashion</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Full Name',      icon: User, key: 'name',  type: 'text',  ph: 'John Doe' },
              { label: 'Email Address',  icon: Mail, key: 'email', type: 'email', ph: 'you@example.com' },
            ].map(({ label, icon: Icon, key, type, ph }) => (
              <div key={key}>
                <label className="auth-label">{label}</label>
                <div className="auth-input-wrap">
                  <Icon size={14} className="auth-input-icon" />
                  <input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="input-field" placeholder={ph} />
                </div>
              </div>
            ))}

            <div>
              <label className="auth-label">Password</label>
              <div className="auth-input-wrap">
                <Lock size={14} className="auth-input-icon" />
                <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field pr-9" placeholder="Min. 8 characters" />
                <button type="button" className="auth-input-icon-right" onClick={() => setShowPwd(!showPwd)}>
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="auth-label">Confirm Password</label>
              <div className="auth-input-wrap">
                <Lock size={14} className="auth-input-icon" />
                <input type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} className="input-field" placeholder="Re-enter password" />
              </div>
            </div>

            <p className="auth-form-subtitle">
              By creating an account, you agree to our{' '}
              <a href="#" className="underline" style={{ color: 'var(--text-secondary)' }}>Terms</a>{' '}
              and{' '}
              <a href="#" className="underline" style={{ color: 'var(--text-secondary)' }}>Privacy Policy</a>.
            </p>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center" style={{ padding: '0.875rem' }}>
              {loading ? <span className="auth-spinner" /> : <>Create Account <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="auth-footer-text">
            Already have an account?{' '}
            <Link to="/login" className="auth-footer-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
