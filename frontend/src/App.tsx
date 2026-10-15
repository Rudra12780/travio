import React, { useState, useEffect } from 'react';
import { UserProfile } from './types';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { AdminSignIn } from './components/AdminSignIn';
import { AdminDashboard } from './components/AdminDashboard';
import { BackgroundAnimation } from './components/BackgroundAnimation';
import { Creative3DClickEffect } from './components/Creative3DClickEffect';

export const App: React.FC = () => {
  // Navigation / Routing State
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  // Regular Traveler User State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('trovio_current_user');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Storage read error', e);
    }
    return null;
  });

  // Authorized Admin User State
  const [adminUser, setAdminUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('trovio_admin_user');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Admin storage read error', e);
    }
    return null;
  });

  // Admin Impersonation / Traveler Redirection State
  const [adminImpersonatedUser, setAdminImpersonatedUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Traveler Auth Handlers
  const handleUserSignIn = (user: UserProfile) => {
    try {
      localStorage.setItem('trovio_current_user', JSON.stringify(user));
    } catch (e) {}
    setCurrentUser(user);
    navigateTo('/dashboard');
  };

  const handleUpdateUser = (updated: UserProfile) => {
    try {
      localStorage.setItem('trovio_current_user', JSON.stringify(updated));
    } catch (e) {}
    setCurrentUser(updated);
  };

  const handleUserSignOut = () => {
    try {
      localStorage.removeItem('trovio_current_user');
    } catch (e) {}
    setCurrentUser(null);
    navigateTo('/');
  };

  // Admin Auth Handlers
  const handleAdminSignInSuccess = (admin: UserProfile) => {
    try {
      localStorage.setItem('trovio_admin_user', JSON.stringify(admin));
    } catch (e) {}
    setAdminUser(admin);
    // Keep in /admin@1234 or /admin
    navigateTo('/admin@1234');
  };

  const handleAdminSignOut = () => {
    try {
      localStorage.removeItem('trovio_admin_user');
    } catch (e) {}
    setAdminUser(null);
    setAdminImpersonatedUser(null);
    navigateTo('/admin@1234');
  };

  // Admin Redirect into User View Handler
  const handleAdminRedirectToUser = (targetUser: UserProfile) => {
    setAdminImpersonatedUser(targetUser);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Return from User view back to Admin Command Center
  const handleReturnToAdmin = () => {
    setAdminImpersonatedUser(null);
    navigateTo('/admin@1234');
  };

  // Decode and normalize pathname for routing
  const rawPath = currentPath;
  const decodedPath = decodeURIComponent(rawPath).toLowerCase();

  // Route matches
  const isAdminSecretGate =
    decodedPath === '/admin@1234' ||
    decodedPath.startsWith('/admin@1234') ||
    rawPath.toLowerCase().startsWith('/admin%401234');

  const isGenericAdminRoute =
    decodedPath.startsWith('/admin') && !isAdminSecretGate;

  return (
    <>
      {/* Background Animated Flight Arcs / Cinematic Video / Aurora Glow */}
      <BackgroundAnimation />

      {/* Global Interactive 3D Spatial Holographic On-Click Effect */}
      <Creative3DClickEffect />

      {/* Case 1: Admin is redirecting and viewing as a Traveler */}
      {adminImpersonatedUser ? (
        <Dashboard
          user={adminImpersonatedUser}
          adminOrigin={true}
          onReturnToAdmin={handleReturnToAdmin}
          onRedirectToUser={handleAdminRedirectToUser}
          onUpdateUser={(updated) => setAdminImpersonatedUser(updated)}
          onSignOut={handleAdminSignOut}
        />
      ) : isAdminSecretGate ? (
        /* Case 2A: Dedicated Secret Admin Gate (localhost:3000/admin@1234) */
        adminUser ? (
          <div className="dash-wrapper" style={{ minHeight: '100vh', position: 'relative', zIndex: 10 }}>
            <AdminDashboard
              adminUser={adminUser}
              onRedirectToUser={handleAdminRedirectToUser}
              onAdminSignOut={handleAdminSignOut}
            />
          </div>
        ) : (
          <AdminSignIn
            onAdminLoginSuccess={handleAdminSignInSuccess}
            onBackToUserPortal={() => navigateTo('/')}
          />
        )
      ) : isGenericAdminRoute ? (
        /* Case 2B: Direct access to /admin attempted without authentication */
        adminUser ? (
          <div className="dash-wrapper" style={{ minHeight: '100vh', position: 'relative', zIndex: 10 }}>
            <AdminDashboard
              adminUser={adminUser}
              onRedirectToUser={handleAdminRedirectToUser}
              onAdminSignOut={handleAdminSignOut}
            />
          </div>
        ) : (
          /* Security Gate: Direct access is prohibited; user must sign in via /admin@1234 */
          <div
            style={{
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              position: 'relative',
              zIndex: 10,
              background: 'radial-gradient(circle at 50% 30%, rgba(239, 68, 68, 0.08) 0%, #F8FAFC 75%)',
            }}
          >
            <div
              style={{
                maxWidth: '480px',
                width: '100%',
                background: '#FFFFFF',
                borderRadius: '24px',
                border: '1.5px solid rgba(239, 68, 68, 0.25)',
                padding: '40px 32px',
                textAlign: 'center',
                color: '#0F172A',
                boxShadow: '0 20px 50px -10px rgba(15, 23, 42, 0.08), 0 0 25px rgba(239, 68, 68, 0.08)',
              }}
            >
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '18px',
                  background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 6px 20px rgba(239, 68, 68, 0.3)',
                  marginBottom: '18px',
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>

              <div
                style={{
                  display: 'inline-block',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#DC2626',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '12px',
                }}
              >
                DIRECT ACCESS RESTRICTED
              </div>

              <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '10px', color: '#0F172A' }}>
                Administrator Authentication Required
              </h2>
              <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6, marginBottom: '28px' }}>
                Direct access to the Mission Control Command Center is locked. You must sign in as an authorized administrator at the dedicated security gate.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={() => navigateTo('/admin@1234')}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '14px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
                    color: '#FFFFFF',
                    fontSize: '14.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 8px 20px -4px rgba(13, 148, 136, 0.5)',
                    transition: 'all 0.2s',
                  }}
                >
                  Go to Admin Login (/admin@1234)
                </button>

                <button
                  onClick={() => navigateTo('/')}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#CBD5E1',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  Return to Traveler Landing Page (localhost:3000)
                </button>
              </div>
            </div>
          </div>
        )
      ) : (
        /* Case 3: Regular Traveler Portal (localhost:3000) */
        currentUser ? (
          <Dashboard
            user={currentUser}
            adminOrigin={false}
            onUpdateUser={handleUpdateUser}
            onSignOut={handleUserSignOut}
          />
        ) : (
          <LandingPage onSignInSuccess={handleUserSignIn} />
        )
      )}
    </>
  );
};

export default App;
