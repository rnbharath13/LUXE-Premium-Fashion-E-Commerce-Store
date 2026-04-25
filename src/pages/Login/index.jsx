import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import useStore from '../../store/useStore';
import './Login.css';

export default function Login() {
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const { login, showToast }  = useStore();
  const navigate              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      showToast('Welcome back!');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* Left editorial */}
      <div className="auth-editorial">
        <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85" alt="Fashion editorial" />
        <div className="auth-editorial-overlay" />
        <div className="auth-editorial-content">
          <span className="auth-editorial-logo">LUXE</span>
          <p className="auth-editorial-tagline">Premium fashion, curated for you.</p>
        </div>
      </div>

      {/* Right form */}
      <div className="auth-form-panel">
        <div className="auth-form-inner animate-scale-in">
          <div className="auth-form-heading">
            <p className="section-label">Welcome back</p>
            <h1 className="auth-form-title">Sign in</h1>
            <p className="auth-form-subtitle">Access your LUXE account</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="auth-label">Email Address</label>
              <div className="auth-input-wrap">
                <Mail size={15} className="auth-input-icon" />
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className="auth-label">Password</label>
              <div className="auth-input-wrap">
                <Lock size={15} className="auth-input-icon" />
                <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field pr-10" placeholder="••••••••" />
                <button type="button" className="auth-input-icon-right" onClick={() => setShowPwd(!showPwd)}>
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="auth-forgot-btn">Forgot password?</Link>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center" style={{ padding: '0.875rem' }}>
              {loading ? <span className="auth-spinner" /> : <>Sign In <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="auth-footer-text">
            {"Don't have an account? "}
            <Link to="/register" className="auth-footer-link">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
