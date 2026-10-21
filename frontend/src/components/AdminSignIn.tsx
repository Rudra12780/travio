import React, { useState } from 'react';
import { api } from '../api';
import { UserProfile } from '../types';
import { AnimatedLogo } from './AnimatedLogo';

interface Props {
  onAdminLoginSuccess: (adminUser: UserProfile) => void;
  onBackToUserPortal?: () => void;
}

export const AdminSignIn: React.FC<Props> = ({ onAdminLoginSuccess }) => {
  const [email, setEmail] = useState('admin@trovio.com');
  const [password, setPassword] = useState('admin@1234');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide administrator email/ID and master security key.');
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

  const handleFillDemoCreds = (userType: 'standard' | 'pass123') => {
    setEmail('admin@trovio.com');
    setPassword(userType === 'standard' ? 'admin@1234' : 'admin123');
    setError('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        zIndex: 10,
        background: '#F7F6F2'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '500px',
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '2px solid #101010',
          boxShadow: '6px 6px 0px #101010',
          padding: '40px 36px',
          color: '#101010',
          position: 'relative'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
            <AnimatedLogo size="lg" title="GlobalTrotter" badge="ADMIN GATE" />
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#FFD84D',
              border: '1.5px solid #101010',
              color: '#101010',
              fontSize: '11px',
              fontWeight: 900,
              padding: '4px 14px',
              borderRadius: '999px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '10px',
              boxShadow: '1.5px 1.5px 0px #101010'
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#101010' }} />
            RESTRICTED ADMIN DIRECTORY
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-0.03em', color: '#101010', margin: '4px 0 6px' }}>
            Mission Control Sign-In
          </h1>
          <p style={{ fontSize: '13.5px', color: '#555555', margin: 0 }}>
            Direct access is restricted. Authenticate as an authorized administrator to access platform telemetry and dispatch.
          </p>
        </div>

        {error && (
          <div
            style={{
              background: '#F4AFC1',
              border: '2px solid #101010',
              color: '#101010',
              padding: '12px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 800,
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '2px 2px 0px #101010'
            }}
          >
            <span style={{ fontSize: '16px' }}>🔒</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label
              style={{
                fontSize: '11px',
                fontWeight: 900,
                letterSpacing: '0.08em',
                color: '#101010',
                textTransform: 'uppercase',
                marginBottom: '6px',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>ADMINISTRATOR ID / EMAIL</span>
              <span style={{ color: '#555555', fontWeight: 700, fontSize: '11px' }}>admin@trovio.com</span>
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#F7F6F2',
                border: '1.5px solid #101010',
                borderRadius: '10px',
                height: '48px',
                padding: '0 14px',
              }}
            >
              <span style={{ color: '#101010', marginRight: '10px', display: 'flex' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@trovio.com or admin"
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: '#101010',
                  fontSize: '14px',
                  fontWeight: 700,
                  outline: 'none',
                }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label
              style={{
                fontSize: '11px',
                fontWeight: 900,
                letterSpacing: '0.08em',
                color: '#101010',
                textTransform: 'uppercase',
                marginBottom: '6px',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>SECURITY MASTER KEY</span>
              <span style={{ color: '#555555', fontWeight: 700, fontSize: '11px' }}>admin@1234</span>
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#F7F6F2',
                border: '1.5px solid #101010',
                borderRadius: '10px',
                height: '48px',
                padding: '0 14px',
              }}
            >
              <span style={{ color: '#101010', marginRight: '10px', display: 'flex' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                type={showKey ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: '#101010',
                  fontSize: '14px',
                  fontWeight: 700,
                  outline: 'none',
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#101010',
                  cursor: 'pointer',
                  fontSize: '13px',
                  padding: '4px',
                  fontWeight: 800
                }}
                title={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Quick Credential Preset Badges */}
          <div
            style={{
              background: '#F7F6F2',
              border: '1.5px solid #101010',
              borderRadius: '10px',
              padding: '12px 14px',
              fontSize: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, color: '#101010' }}>Verified Admin Credentials:</span>
              <span style={{ fontSize: '11px', color: '#555555', fontWeight: 700 }}>Click to apply</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleFillDemoCreds('standard')}
                style={{
                  background: '#FFD84D',
                  border: '1px solid #101010',
                  color: '#101010',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '1px 1px 0px #101010'
                }}
              >
                admin@trovio.com / admin@1234
              </button>
              <button
                type="button"
                onClick={() => handleFillDemoCreds('pass123')}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #101010',
                  color: '#101010',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '1px 1px 0px #101010'
                }}
              >
                admin@trovio.com / admin123
              </button>
            </div>
          </div>

          {/* Authorize Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: '50px',
              background: '#FFD84D',
              color: '#101010',
              border: '2px solid #101010',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '3px 3px 0px #101010',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              marginTop: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            {!loading ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#101010" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Authorize & Enter Admin Mission Control</span>
              </>
            ) : (
              <div className="spinner" style={{ borderTopColor: '#101010' }} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
