import { useEffect, useState } from 'react';
import { Monitor, Smartphone, MapPin, Clock, X, ShieldCheck, AlertCircle } from 'lucide-react';
import useStore from '../../store/useStore';
import { parseUserAgent, timeAgo } from '../../lib/userAgent';
import './ActiveSessions.css';

export default function ActiveSessions() {
  const { fetchSessions, revokeSession, logoutAllOther, showToast } = useStore();

  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [busyId,   setBusyId]   = useState(null);
  const [bulkBusy, setBulkBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchSessions();
      setSessions(data || []);
    } catch (err) {
      setError(err.message || 'Could not load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRevoke = async (session) => {
    if (session.current) {
      // Revoking the current session = logging out. Confirm.
      if (!confirm('This will sign you out of this device. Continue?')) return;
    }
    setBusyId(session.id);
    try {
      await revokeSession(session.id);
      showToast(session.current ? 'Signed out' : 'Session revoked');
      if (session.current) {
        // Force-clear local state and bounce — server cookie is gone.
        useStore.getState().clearSession();
        window.location.assign('/login');
        return;
      }
      setSessions((prev) => prev.filter((s) => s.id !== session.id));
    } catch (err) {
      showToast(err.message || 'Could not revoke session', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleLogoutAllOther = async () => {
    const others = sessions.filter((s) => !s.current).length;
    if (others === 0) return;
    if (!confirm(`Sign out of ${others} other device${others === 1 ? '' : 's'}?`)) return;
    setBulkBusy(true);
    try {
      await logoutAllOther();
      showToast('Signed out of other devices');
      await load();
    } catch (err) {
      showToast(err.message || 'Could not sign out other devices', 'error');
    } finally {
      setBulkBusy(false);
    }
  };

  if (loading) return (
    <div className="sessions-card">
      <h2 className="sessions-title"><ShieldCheck size={16} /> Active Sessions</h2>
      <p className="sessions-loading">Loading sessions…</p>
    </div>
  );

  if (error) return (
    <div className="sessions-card">
      <h2 className="sessions-title"><ShieldCheck size={16} /> Active Sessions</h2>
      <div className="sessions-error">
        <AlertCircle size={14} /> {error}
        <button className="sessions-retry-btn" onClick={load}>Retry</button>
      </div>
    </div>
  );

  const otherCount = sessions.filter((s) => !s.current).length;

  return (
    <div className="sessions-card">
      <div className="sessions-header">
        <h2 className="sessions-title"><ShieldCheck size={16} /> Active Sessions</h2>
        {otherCount > 0 && (
          <button
            className="sessions-bulk-btn"
            onClick={handleLogoutAllOther}
            disabled={bulkBusy}
          >
            {bulkBusy ? 'Signing out…' : `Sign out of ${otherCount} other`}
          </button>
        )}
      </div>
      <p className="sessions-subtitle">Devices currently signed in to your account.</p>

      <ul className="sessions-list">
        {sessions.map((s) => {
          const ua = parseUserAgent(s.user_agent);
          const Icon = ua.isMobile ? Smartphone : Monitor;
          return (
            <li key={s.id} className={`session-item${s.current ? ' current' : ''}`}>
              <div className="session-icon-wrap">
                <Icon size={18} />
              </div>
              <div className="session-body">
                <p className="session-device">
                  {ua.label}
                  {s.current && <span className="session-current-badge">This device</span>}
                </p>
                <p className="session-meta">
                  <span><MapPin size={11} /> {s.ip || 'unknown IP'}</span>
                  <span><Clock size={11} /> Active {timeAgo(s.last_used_at || s.created_at)}</span>
                </p>
              </div>
              <button
                className="session-revoke-btn"
                onClick={() => handleRevoke(s)}
                disabled={busyId === s.id}
                aria-label={s.current ? 'Sign out of this device' : 'Revoke this session'}
              >
                {busyId === s.id ? '…' : <><X size={13} /> {s.current ? 'Sign out' : 'Revoke'}</>}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
