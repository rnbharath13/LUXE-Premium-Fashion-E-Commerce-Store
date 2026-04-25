import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';

export default function ResetPassword() {
  const [searchParams]          = useSearchParams();
  const token                   = searchParams.get('token');
  const userId                  = searchParams.get('id');
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [showPwd,   setShowPwd]   = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const navigate                  = useNavigate();

  if (!token || !userId) {
    return (
      <div className="auth-layout">
        <div className="auth-form-panel" style={{ width: '100%' }}>
          <div className="auth-form-inner animate-scale-in" style={{ textAlign: 'center' }}>
            <h1 className="auth-form-title">Invalid Link</h1>
            <p className="auth-form-subtitle">This reset link is missing required information.</p>
            <Link to="/forgot-password" className="btn-primary justify-center" style={{ marginTop: '1.5rem', padding: '0.875rem' }}>
              Request a new link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm)        { setError('Passwords do not match'); return; }
    if (password.length < 8)         { setError('Password must be at least 8 characters'); return; }
    if (!/[A-Z]/.test(password))     { setError('Password must contain at least one uppercase letter'); return; }
    if (!/[0-9]/.test(password))     { setError('Password must contain at least one number'); return; }

    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { token, userId, password });
      navigate('/login', { state: { message: 'Password reset successfully. Please sign in.' } });
    } catch (err) {
      setError(err.message || 'Reset link is invalid or expired. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-editorial">
        <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85" alt="LUXE" />
        <div className="auth-editorial-overlay" />
        <div className="auth-editorial-content">
          <span className="auth-editorial-logo">LUXE</span>
          <p className="auth-editorial-tagline">Premium fashion, curated for you.</p>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-inner animate-scale-in">
          <div className="auth-form-heading">
            <p className="section-label">Almost there</p>
            <h1 className="auth-form-title">New Password</h1>
            <p className="auth-form-subtitle">Choose a strong password for your account.</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="auth-label">New Password</label>
              <div className="auth-input-wrap">
                <Lock size={14} className="auth-input-icon" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-9"
                  placeholder="Min. 8 characters"
                  required
                />
                <button type="button" className="auth-input-icon-right" onClick={() => setShowPwd(!showPwd)}>
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="auth-label">Confirm Password</label>
              <div className="auth-input-wrap">
                <Lock size={14} className="auth-input-icon" />
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="input-field"
                  placeholder="Re-enter password"
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center" style={{ padding: '0.875rem' }}>
              {loading ? <span className="auth-spinner" /> : <>Reset Password <ArrowRight size={16} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
