import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { RegisterModal } from './RegisterModal';

interface Props {
  onSignInSuccess: (user: UserProfile) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const SignIn: React.FC<Props> = ({ onSignInSuccess, onClose, isModal }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberWorkstation, setRememberWorkstation] = useState(true);

  // Validation
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Modals
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem('trovio_remembered_email');
      if (savedEmail) {
        setEmail(savedEmail);
      }
    } catch (e) {
      console.warn('Storage unavailable', e);
    }
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const validate = (): boolean => {
    let isValid = true;
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setEmailError('Email address is required');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    const userName = email.split('@')[0] || 'panther';
    const finalName = userName.toLowerCase() === 'name' ? 'panther' : userName;

    try {
      if (rememberWorkstation) {
        localStorage.setItem('trovio_remembered_email', email);
      } else {
        localStorage.removeItem('trovio_remembered_email');
      }
    } catch (err) {}

    setTimeout(() => {
      setLoading(false);
      onSignInSuccess({
        name: finalName,
        email: email.trim(),
        role: 'Traveler'
      });
    }, 700);
  };

  const handleGoogleSignIn = () => {
    setGoogleLoading(true);
    triggerToast('Connecting with Google Account...');

    setTimeout(() => {
      setGoogleLoading(false);
      onSignInSuccess({
        name: 'panther',
        email: 'panther.voyager@gmail.com',
        role: 'Traveler'
      });
    }, 900);
  };

  const cardContent = (
    <div className={`auth-wrapper ${isModal ? 'modal-auth-wrapper' : ''}`} onClick={(e) => isModal && e.stopPropagation()}>
      {isModal && onClose && (
        <button
          type="button"
          className="modal-close-btn auth-modal-close"
          onClick={onClose}
          aria-label="Close Sign In Dialog"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
      {/* Brand Header */}
      <div className="brand-header" onClick={() => !isModal && window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <div className="brand-icon-wrapper">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
          </svg>
        </div>
        <span className="brand-name">Trovio</span>
        <span className="brand-badge">GlobalTrotters</span>
      </div>

      {/* Main Container / Card (Requirements 1-9) */}
      <section className="auth-card" aria-label="Sign In Container">
        {/* Header */}
        <header className="auth-header">
          <h1 className="auth-title">Unlock Your Journey</h1>
          <p className="auth-subtitle">Sign in to access your itineraries and saved voyages</p>
        </header>

        {/* Google Sign-In */}
        <button
          type="button"
          className="btn-google"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          aria-label="Continue with Google"
        >
          <svg className="google-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>{googleLoading ? 'Connecting...' : 'Continue with Google'}</span>
        </button>

        {/* Divider */}
        <div className="auth-divider" aria-hidden="true">
          <span className="divider-line" />
          <span className="divider-text">OR CONTINUE WITH EMAIL</span>
          <span className="divider-line" />
        </div>

        {/* Email & Password Form */}
        <form className="auth-form" onSubmit={handleFormSubmit} noValidate>
          {/* Email Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="email-input">EMAIL ADDRESS</label>
            <div className={`input-container ${emailError ? 'has-error' : ''}`}>
              <span className="input-icon" aria-hidden="true">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </span>
              <input
                id="email-input"
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                autoComplete="email"
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                }}
                required
              />
            </div>
            {emailError && (
              <span className="field-error" role="alert">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                {emailError}
              </span>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="password-input">PASSWORD</label>
            <div className={`input-container ${passwordError ? 'has-error' : ''}`}>
              <span className="input-icon" aria-hidden="true">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••••••"
                value={password}
                autoComplete="current-password"
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError('');
                }}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" y1="2" x2="22" y2="22" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {passwordError && (
              <span className="field-error" role="alert">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                {passwordError}
              </span>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="form-options-row">
            <label className="remember-me" htmlFor="remember-box">
              <input
                type="checkbox"
                id="remember-box"
                className="custom-checkbox"
                checked={rememberWorkstation}
                onChange={(e) => setRememberWorkstation(e.target.checked)}
              />
              <span className="remember-label">Remember this workstation</span>
            </label>
            <button
              type="button"
              className="forgot-password-link"
              onClick={() => setShowForgotModal(true)}
            >
              Forgot password?
            </button>
          </div>

          {/* Sign In Button */}
          <button type="submit" className={`btn-submit ${loading ? 'loading' : ''}`}>
            {!loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Sign In</span>
                <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            ) : (
              <div className="spinner" />
            )}
          </button>
        </form>

        {/* Create Account Link */}
        <footer className="auth-footer">
          <span>Don't have an account yet?</span>{' '}
          <button
            type="button"
            className="link-create-account"
            onClick={() => setShowRegisterModal(true)}
          >
            Create one now
          </button>
        </footer>
      </section>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        onSuccess={(emailReset) => triggerToast(`Password reset link sent to ${emailReset}`)}
      />

      {/* Register Modal */}
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onRegisterSuccess={(newUser) => {
          setShowRegisterModal(false);
          onSignInSuccess(newUser);
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#111827',
          color: '#FFFFFF',
          padding: '14px 20px',
          borderRadius: '14px',
          boxShadow: '0 12px 28px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '14px',
          fontWeight: 500,
          zIndex: 2000
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="landing-modal-overlay auth-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
        {cardContent}
      </div>
    );
  }

  return cardContent;
};
