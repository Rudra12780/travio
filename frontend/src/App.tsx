import React, { useState, useEffect } from 'react';
import { UserProfile } from './types';
import { SignIn } from './components/SignIn';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { AdminSignIn } from './components/AdminSignIn';
import { AdminDashboard } from './components/AdminDashboard';
import { BackgroundAnimation } from './components/BackgroundAnimation';

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
    navigateTo('/admin');
  };

  const handleAdminSignOut = () => {
    try {
      localStorage.removeItem('trovio_admin_user');
    } catch (e) {}
    setAdminUser(null);
    setAdminImpersonatedUser(null);
    navigateTo('/admin');
  };

  // Admin Redirect into User View Handler
  const handleAdminRedirectToUser = (targetUser: UserProfile) => {
    setAdminImpersonatedUser(targetUser);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Return from User view back to Admin Command Center
  const handleReturnToAdmin = () => {
    setAdminImpersonatedUser(null);
    navigateTo('/admin');
  };

  // Determine whether current route is in Admin Zone
  const isAdminRoute = currentPath.startsWith('/admin');

  return (
    <>
      {/* Background Animated Flight Arcs / Cinematic Video / Aurora Glow */}
      <BackgroundAnimation />

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
      ) : isAdminRoute ? (
        /* Case 2: Restricted Admin Portal (/admin) */
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
      ) : (
        /* Case 3: Regular Traveler Portal (Zero hint of admin) */
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
