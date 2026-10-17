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
        background: 'radial-gradient(circle at 50% 20%, rgba(247, 191, 213, 0.25) 0%, rgba(195, 154, 217, 0.2) 50%, #FAF9FC 100%)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'rgba(255, 255, 255, 0.96)',
          borderRadius: '28px',
          border: '1.5px solid #E8E2F0',
          boxShadow: '0 25px 60px -15px rgba(32, 63, 112, 0.1), 0 0 24px rgba(129, 120, 232, 0.12)',
          padding: '44px 40px',
          color: '#292833',
          position: 'relative',
          overflow: 'hidden',
          backdropFilter: 'blur(20px)'
        }}
      >
        {/* Glow Accent Top Bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '15%',
            right: '15%',
            height: '3px',
            background: 'linear-gradient(90deg, transparent, #8178E8, #F7BFD5, transparent)',
            borderRadius: '9999px',
          }}
        />

        <div style={{ textAlign: 'center', marginBottom: '26px' }}>
          {/* User GlobalTrotter Logo */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <AnimatedLogo size="lg" title="GlobalTrotter" badge="ADMIN" />
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, rgba(247, 191, 213, 0.25) 0%, rgba(195, 154, 217, 0.25) 100%)',
              border: '1px solid #E8E2F0',
              color: '#203F70',
              fontSize: '11px',
              fontWeight: 800,
              padding: '4px 14px',
              borderRadius: '9999px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '10px',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#8178E8', animation: 'pulse 1.5s infinite' }} />
            RESTRICTED ADMIN GATE : localhost:3000/admin@1234
          </div>

          <h1 style={{ fontSize: '27px', fontWeight: 900, letterSpacing: '-0.5px', color: '#292833' }}>
            Mission Control Sign-In
          </h1>
          <p style={{ fontSize: '13.5px', color: '#777584', marginTop: '6px' }}>
            Direct access is restricted. Authenticate as an authorized administrator to access platform telemetry and dispatch.
          </p>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#FCA5A5',
              padding: '12px 16px',
              borderRadius: '14px',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.15)',
            }}
          >
            <span style={{ fontSize: '16px' }}>🔒</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="form-group">
            <label
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: '#475569',
                textTransform: 'uppercase',
                marginBottom: '8px',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>ADMINISTRATOR ID / EMAIL</span>
              <span style={{ color: '#0D9488', fontWeight: 600, fontSize: '11px' }}>admin@trovio.com</span>
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#F8FAFC',
                border: '1.5px solid #CBD5E1',
                borderRadius: '14px',
                height: '52px',
                padding: '0 16px',
                transition: 'border-color 0.2s ease',
              }}
            >
              <span style={{ color: '#0D9488', marginRight: '12px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                  color: '#0F172A',
                  fontSize: '14.5px',
                  fontWeight: 600,
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
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: '#475569',
                textTransform: 'uppercase',
                marginBottom: '8px',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>SECURITY MASTER KEY</span>
              <span style={{ color: '#E11D48', fontWeight: 600, fontSize: '11px' }}>admin@1234</span>
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#F8FAFC',
                border: '1.5px solid #CBD5E1',
                borderRadius: '14px',
                height: '52px',
                padding: '0 16px',
              }}
            >
              <span style={{ color: '#0D9488', marginRight: '12px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                  color: '#0F172A',
                  fontSize: '14.5px',
                  fontWeight: 600,
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
                  color: '#64748B',
                  cursor: 'pointer',
                  fontSize: '12px',
                  padding: '4px',
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
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '14px',
              padding: '12px 14px',
              fontSize: '12px',
              color: '#64748B',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: '#0F172A' }}>Verified Admin Credentials:</span>
              <span style={{ fontSize: '11px', color: '#0D9488', fontWeight: 600 }}>Click to apply</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleFillDemoCreds('standard')}
                style={{
                  background: '#CCFBF1',
                  border: '1px solid rgba(13, 148, 136, 0.3)',
                  color: '#0F766E',
                  borderRadius: '8px',
                  padding: '4px 10px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                admin@trovio.com / admin@1234
              </button>
              <button
                type="button"
                onClick={() => handleFillDemoCreds('pass123')}
                style={{
                  background: '#F1F5F9',
                  border: '1px solid #E2E8F0',
                  color: '#475569',
                  borderRadius: '8px',
                  padding: '4px 10px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
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
              height: '54px',
              background: 'linear-gradient(135deg, #8178E8 0%, #A678BD 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '9999px',
              fontSize: '15px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 8px 25px -4px rgba(129, 120, 232, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              marginTop: '10px',
              transition: 'all 0.2s ease',
            }}
          >
            {!loading ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Authorize & Enter Admin Mission Control</span>
              </>
            ) : (
              <div className="spinner" style={{ borderTopColor: '#FFFFFF' }} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
