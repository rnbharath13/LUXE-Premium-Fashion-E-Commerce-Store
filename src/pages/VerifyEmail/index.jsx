import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token          = searchParams.get('token');
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('Invalid verification link.'); return; }

    api.post('/auth/verify-email', { token })
      .then(() => setStatus('success'))
      .catch((err) => { setStatus('error'); setMessage(err.message || 'Verification failed.'); });
  }, [token]);

  return (
    <div className="auth-layout">
      <div className="auth-form-panel" style={{ width: '100%' }}>
        <div className="auth-form-inner animate-scale-in" style={{ textAlign: 'center' }}>
          {status === 'verifying' && (
            <>
              <span className="auth-spinner" style={{ width: 32, height: 32, margin: '0 auto 1rem' }} />
              <p className="auth-form-subtitle">Verifying your email...</p>
            </>
          )}
          {status === 'success' && (
            <>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
              <h1 className="auth-form-title">Email Verified</h1>
              <p className="auth-form-subtitle" style={{ marginBottom: '2rem' }}>
                Your email has been verified. You're all set!
              </p>
              <Link to="/" className="btn-primary justify-center" style={{ padding: '0.875rem' }}>
                Continue Shopping
              </Link>
            </>
          )}
          {status === 'error' && (
            <>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
              <h1 className="auth-form-title">Verification Failed</h1>
              <p className="auth-form-subtitle" style={{ marginBottom: '2rem' }}>{message}</p>
              <Link to="/login" className="btn-primary justify-center" style={{ padding: '0.875rem' }}>
                Back to Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
