import React, { useState } from 'react';
import { api } from '../api';
import { UserProfile } from '../types';

interface Props {
  onAdminLoginSuccess: (adminUser: UserProfile) => void;
  onBackToUserPortal: () => void;
}

export const AdminSignIn: React.FC<Props> = ({ onAdminLoginSuccess, onBackToUserPortal }) => {
  const [email, setEmail] = useState('admin@trovio.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide administrator email and security key.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.adminLogin(email.trim(), password);
      setLoading(false);
      onAdminLoginSuccess(res.user);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Access Denied: Invalid administrator credentials.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      zIndex: 10
    }}>
      <div style={{
        width: '100%',
        maxWidth: '500px',
        background: '#0F172A',
        borderRadius: '28px',
        border: '1.5px solid #1E293B',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px rgba(13, 148, 136, 0.15)',
        padding: '48px 44px',
        color: '#FFFFFF'
      }}>
        {/* Shield Icon & Badge */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, #0D9488 0%, #064E3B 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 25px rgba(13, 148, 136, 0.4)',
            marginBottom: '16px'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>

          <div style={{ display: 'inline-block', background: 'rgba(45, 212, 191, 0.12)', border: '1px solid rgba(45, 212, 191, 0.3)', color: '#2DD4BF', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '9999px', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
            RESTRICTED ACCESS PORTAL
          </div>

          <h1 style={{ fontSize: '26px', fontWeight: 900, letterSpacing: '-0.5px' }}>
            Mission Control & Dispatch
          </h1>
          <p style={{ fontSize: '13.5px', color: '#94A3B8', marginTop: '6px' }}>
            Authorized administrator operations, user dispatch, and flight network telemetry
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #EF4444',
            color: '#FCA5A5',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>🔒</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="form-group">
            <label style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: '#CBD5E1', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
              ADMINISTRATOR ID / EMAIL
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#1E293B',
              border: '1.5px solid #334155',
              borderRadius: '14px',
              height: '52px',
              padding: '0 16px'
            }}>
              <span style={{ color: '#0D9488', marginRight: '12px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@trovio.com"
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '14.5px',
                  fontWeight: 500,
                  outline: 'none'
                }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: '#CBD5E1', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
              SECURITY MASTER KEY
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#1E293B',
              border: '1.5px solid #334155',
              borderRadius: '14px',
              height: '52px',
              padding: '0 16px'
            }}>
              <span style={{ color: '#0D9488', marginRight: '12px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '14.5px',
                  fontWeight: 500,
                  outline: 'none'
                }}
                required
              />
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '12px 14px', fontSize: '12px', color: '#94A3B8' }}>
            Default test key: <code style={{ color: '#2DD4BF', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>admin@trovio.com</code> / <code style={{ color: '#2DD4BF', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>admin123</code>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: '54px',
              background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '14px',
              fontSize: '15px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 8px 24px -4px rgba(13, 148, 136, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              marginTop: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            {!loading ? (
              <span>Authorize & Enter Mission Control</span>
            ) : (
              <div className="spinner" />
            )}
          </button>

          <button
            type="button"
            onClick={onBackToUserPortal}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              color: '#CBD5E1',
              borderRadius: '12px',
              padding: '12px',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              marginTop: '4px'
            }}
          >
            <span>← Switch to Traveler Sign-In Portal</span>
          </button>
        </form>
      </div>
    </div>
  );
};
