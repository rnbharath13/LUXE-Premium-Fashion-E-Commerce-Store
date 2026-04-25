import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { api } from '../../lib/api';

export default function ForgotPassword() {
  const [email,     setEmail]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [sent,      setSent]      = useState(false);
  const [error,     setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
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
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
              <h1 className="auth-form-title">Check your email</h1>
              <p className="auth-form-subtitle" style={{ marginBottom: '2rem' }}>
                If <strong>{email}</strong> is registered, you'll receive a reset link shortly.
              </p>
              <Link to="/login" className="btn-primary justify-center" style={{ padding: '0.875rem' }}>
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <div className="auth-form-heading">
                <p className="section-label">Forgot password?</p>
                <h1 className="auth-form-title">Reset Password</h1>
                <p className="auth-form-subtitle">Enter your email and we'll send you a reset link.</p>
              </div>

              {error && <div className="auth-error">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="auth-label">Email Address</label>
                  <div className="auth-input-wrap">
                    <Mail size={14} className="auth-input-icon" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full justify-center" style={{ padding: '0.875rem' }}>
                  {loading ? <span className="auth-spinner" /> : <>Send Reset Link <ArrowRight size={16} /></>}
                </button>
              </form>

              <p className="auth-footer-text">
                <Link to="/login" className="auth-footer-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
