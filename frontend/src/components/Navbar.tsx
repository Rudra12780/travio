import React, { useState, useEffect } from 'react';
import { UserProfile, ActiveTab } from '../types';
import { api } from '../api';
import { AnimatedLogo } from './AnimatedLogo';

interface Props {
  user: UserProfile;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<Props> = ({
  user,
  activeTab,
  onTabChange,
  onSignOut
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMenuDrawer, setShowMenuDrawer] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [savedCount, setSavedCount] = useState<number>(0);

  // Fetch real-time count of saved favorite places
  const loadSavedCount = () => {
    api.getWishlist(user.id || 1)
      .then(res => {
        setSavedCount(res.wishlist?.length || 0);
      })
      .catch(() => {});
  };

  const getDismissedIds = (userId: number): number[] => {
    try {
      const raw = localStorage.getItem(`travio_dismissed_notifications_${userId}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const isClearedAll = (userId: number): boolean => {
    return localStorage.getItem(`travio_cleared_notifications_${userId}`) === 'true';
  };

  // Fetch real notifications sent by Admin or system
  const loadNotifications = () => {
    const userId = user.id || 1;
    const dismissedIds = getDismissedIds(userId);
    const cleared = isClearedAll(userId);

    api.getNotifications(userId)
      .then(res => {
        const activeNotifs = (res.notifications || []).filter(n => !dismissedIds.includes(n.id));
        if (activeNotifs.length > 0) {
          setNotifications(activeNotifs);
        } else if (!cleared) {
          const defaultNotifs = [
            { id: 991, icon: '✈️', title: 'Flight 6E-204 Confirmed', message: 'Delhi to Udaipur boarding at 08:30 AM', sender: 'Aviation Dispatch' },
            { id: 992, icon: '🏨', title: 'Lake Palace Upgrade', message: 'Heritage suite upgrade unlocked for Udaipur stay', sender: 'Concierge' },
            { id: 993, icon: '🧭', title: 'Weather Advisory', message: '31°C Clear skies expected for desert safari', sender: 'Meteorology' }
          ].filter(n => !dismissedIds.includes(n.id));

          if (defaultNotifs.length === 0) {
            localStorage.setItem(`travio_cleared_notifications_${userId}`, 'true');
          }
          setNotifications(defaultNotifs);
        } else {
          setNotifications([]);
        }
      })
      .catch(() => {
        if (cleared) {
          setNotifications([]);
        }
      });
  };

  useEffect(() => {
    loadNotifications();
    loadSavedCount();
    const interval = setInterval(loadNotifications, 8000);
    const handleWishlistUpdated = () => loadSavedCount();
    window.addEventListener('wishlist-updated', handleWishlistUpdated);
    return () => {
      clearInterval(interval);
      window.removeEventListener('wishlist-updated', handleWishlistUpdated);
    };
  }, [user.id]);

  const dismissNotification = async (id: number) => {
    const userId = user.id || 1;
    const dismissedIds = getDismissedIds(userId);
    if (!dismissedIds.includes(id)) {
      dismissedIds.push(id);
      localStorage.setItem(`travio_dismissed_notifications_${userId}`, JSON.stringify(dismissedIds));
    }

    setNotifications(prev => {
      const remaining = prev.filter(n => n.id !== id);
      if (remaining.length === 0) {
        localStorage.setItem(`travio_cleared_notifications_${userId}`, 'true');
      }
      return remaining;
    });

    try {
      if (id < 900) {
        await api.deleteNotification(id);
      }
    } catch (e) {
      // Ignored
    }
  };

  const clearAllNotifications = async () => {
    const userId = user.id || 1;
    localStorage.setItem(`travio_cleared_notifications_${userId}`, 'true');
    const dismissedIds = getDismissedIds(userId);
    notifications.forEach(n => {
      if (!dismissedIds.includes(n.id)) dismissedIds.push(n.id);
    });
    localStorage.setItem(`travio_dismissed_notifications_${userId}`, JSON.stringify(dismissedIds));
    setNotifications([]);

    try {
      await api.clearAllNotifications(userId);
    } catch (e) {
      // Ignored
    }
  };

  const isAdmin = user.role === 'Admin';

  const handleDrawerNavigate = (tab: ActiveTab) => {
    onTabChange(tab);
    setShowMenuDrawer(false);
  };

  return (
    <header className="dash-navbar" style={{ background: '#F7F6F2', borderBottom: '1px solid #E8E6E0', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="dash-container" style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px' }}>
        <div className="dash-nav-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
          
          {/* Left Side: GlobalTrotter Wordmark + Small uppercase descriptor */}
          <div 
            className="nav-brand" 
            onClick={() => onTabChange('dashboard')} 
            style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', flexShrink: 0 }}
          >
            <AnimatedLogo 
              size="sm" 
              title="GlobalTrotter" 
              badge="PERSONALIZED TRAVEL EXPERIENCES" 
            />
          </div>

          {/* Center: Editorial Navigation Links */}
          <nav className="editorial-nav-links" aria-label="Main Navigation" style={{ display: 'flex', alignItems: 'center', gap: '22px', flexShrink: 1, minWidth: 0, overflowX: 'auto' }}>
            <button
              type="button"
              className={`editorial-nav-item editorial-nav-item-discover preserve-discover-font ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => onTabChange('dashboard')}
              style={{
                background: 'none',
                border: 'none',
                fontFamily: "'Syne', 'Plus Jakarta Sans', sans-serif",
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                color: activeTab === 'dashboard' ? '#101010' : '#555555',
                borderBottom: activeTab === 'dashboard' ? '2px solid #101010' : '2px solid transparent',
                padding: '6px 2px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              Discover
            </button>

            <button
              type="button"
              className={`editorial-nav-item ${activeTab === 'cities' ? 'active' : ''}`}
              onClick={() => onTabChange('cities')}
              style={{
                background: 'none',
                border: 'none',
                fontFamily: '"Noto Sans Kharoshthi", sans-serif',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                color: activeTab === 'cities' ? '#101010' : '#555555',
                borderBottom: activeTab === 'cities' ? '2px solid #101010' : '2px solid transparent',
                padding: '6px 2px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              Destinations
            </button>

            <button
              type="button"
              className={`editorial-nav-item ${activeTab === 'my-trips' ? 'active' : ''}`}
              onClick={() => onTabChange('my-trips')}
              style={{
                background: 'none',
                border: 'none',
                fontFamily: '"Noto Sans Kharoshthi", sans-serif',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                color: activeTab === 'my-trips' ? '#101010' : '#555555',
                borderBottom: activeTab === 'my-trips' ? '2px solid #101010' : '2px solid transparent',
                padding: '6px 2px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              My Trips
            </button>

            <button
              type="button"
              className={`editorial-nav-item ${activeTab === 'itinerary-builder' ? 'active' : ''}`}
              onClick={() => onTabChange('itinerary-builder')}
              style={{
                background: 'none',
                border: 'none',
                fontFamily: '"Noto Sans Kharoshthi", sans-serif',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                color: activeTab === 'itinerary-builder' ? '#101010' : '#555555',
                borderBottom: activeTab === 'itinerary-builder' ? '2px solid #101010' : '2px solid transparent',
                padding: '6px 2px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              Itinerary
            </button>

            {isAdmin && (
              <button
                type="button"
                className={`editorial-nav-item ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => onTabChange('admin')}
                style={{
                  background: '#FFD84D',
                  border: '1.5px solid #101010',
                  color: '#101010',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  boxShadow: '1.5px 1.5px 0px #101010'
                }}
              >
                Mission Control
              </button>
            )}
          </nav>

          {/* Far Right: Notifications, User Profile & Circular Black Menu Button */}
          <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0, marginLeft: 'auto', zIndex: 50 }}>
            {/* Notifications Button */}
            <button
              type="button"
              className="btn-notification"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifications"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#FFFFFF',
                border: '1.5px solid #101010',
                color: '#101010',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                boxShadow: '2px 2px 0px #101010',
                transition: 'transform 0.15s ease'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              {notifications.length > 0 && (
                <span 
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#F4AFC1',
                    border: '2px solid #101010'
                  }}
                  aria-hidden="true" 
                />
              )}
            </button>

            {/* Notifications Dropdown Modal */}
            {showNotifications && (
              <div style={{
                position: 'absolute',
                top: '64px',
                right: '80px',
                width: '360px',
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '2px solid #101010',
                boxShadow: '6px 6px 0px #101010',
                padding: '20px',
                zIndex: 400
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #E8E6E0', paddingBottom: '10px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#101010', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Voyage Alerts
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {notifications.length > 0 && (
                      <button
                        type="button"
                        onClick={clearAllNotifications}
                        style={{
                          background: '#F7F6F2',
                          border: '1px solid #101010',
                          color: '#101010',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Clear All
                      </button>
                    )}
                    <span style={{ fontSize: '11px', background: '#FFD84D', color: '#101010', padding: '2px 8px', borderRadius: '4px', fontWeight: 800, border: '1px solid #101010' }}>
                      {notifications.length} NEW
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#555555', maxHeight: '320px', overflowY: 'auto' }}>
                  {notifications.map(n => (
                    <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 12px', background: '#F7F6F2', borderRadius: '8px', border: '1px solid #E8E6E0' }}>
                      <div style={{ paddingRight: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{n.icon || '✈️'}</span>
                          <p style={{ fontWeight: 700, color: '#101010', margin: 0, fontSize: '13px' }}>{n.title}</p>
                        </div>
                        <p style={{ fontSize: '12px', color: '#555555', margin: '4px 0 4px 0', lineHeight: '1.4' }}>{n.message}</p>
                        {n.sender && (
                          <span style={{ fontSize: '10px', color: '#101010', fontWeight: 800, background: '#F4AFC1', padding: '1px 6px', borderRadius: '4px' }}>
                            {n.sender}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => dismissNotification(n.id)}
                        style={{ background: 'none', border: 'none', color: '#101010', cursor: 'pointer', fontSize: '14px', padding: '2px', fontWeight: 800 }}
                        title="Dismiss alert"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#555555', padding: '16px 0', margin: 0, fontStyle: 'italic' }}>No pending alerts.</p>
                  )}
                </div>
              </div>
            )}

            {/* User Profile Pill */}
            <div className="user-profile-menu" style={{ position: 'relative' }}>
              <button
                type="button"
                className="user-profile-pill"
                onClick={() => setShowDropdown(!showDropdown)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#FFFFFF',
                  border: '1.5px solid #101010',
                  borderRadius: '9999px',
                  padding: '4px 12px 4px 4px',
                  cursor: 'pointer',
                  boxShadow: '2px 2px 0px #101010'
                }}
              >
                <img
                  src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80'}
                  alt={user.name}
                  style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#101010' }}>{user.name || 'Traveler'}</span>
              </button>

              {showDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '46px',
                  right: 0,
                  width: '230px',
                  background: '#FFFFFF',
                  border: '2px solid #101010',
                  borderRadius: '12px',
                  boxShadow: '4px 4px 0px #101010',
                  padding: '8px',
                  zIndex: 400
                }}>
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid #E8E6E0', marginBottom: '6px' }}>
                    <p style={{ fontSize: '13px', fontWeight: 800, color: '#101010', margin: 0 }}>{user.name}</p>
                    <p style={{ fontSize: '11px', color: '#555555', margin: '2px 0 0 0' }}>{user.email}</p>
                  </div>
                  <button
                    type="button"
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      background: 'transparent',
                      border: 'none',
                      color: '#101010',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      borderRadius: '6px'
                    }}
                    onClick={() => {
                      setShowDropdown(false);
                      onTabChange('settings');
                    }}
                  >
                    <span>Traveler Profile & Settings</span>
                  </button>
                  <button
                    type="button"
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      background: 'transparent',
                      border: 'none',
                      color: '#DC2626',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      borderRadius: '6px'
                    }}
                    onClick={() => {
                      setShowDropdown(false);
                      onSignOut();
                    }}
                  >
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

            {/* FAR RIGHT: CIRCULAR BLACK MENU BUTTON WITH WHITE ICON */}
            <button
              type="button"
              id="dash-right-sidebar-menu-btn"
              className="editorial-circular-menu-btn"
              onClick={() => setShowMenuDrawer(true)}
              aria-label="Open Navigation Directory"
              title="Open Navigation Menu"
              style={{
                width: '44px',
                height: '44px',
                minWidth: '44px',
                minHeight: '44px',
                borderRadius: '50%',
                background: '#101010',
                border: '2px solid #101010',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                boxShadow: '2px 2px 0px #429FE8',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                visibility: 'visible',
                opacity: 1,
                zIndex: 100
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round">
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* EDITORIAL NAVIGATION DRAWER / OVERLAY */}
      {showMenuDrawer && (
        <div 
          className="editorial-menu-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(16, 16, 16, 0.45)',
            backdropFilter: 'blur(4px)',
            zIndex: 999,
            display: 'flex',
            justifyContent: 'flex-end',
            animation: 'fadeIn 0.2s ease'
          }}
          onClick={() => setShowMenuDrawer(false)}
        >
          <div
            className="editorial-drawer"
            style={{
              width: '100%',
              maxWidth: '440px',
              height: '100%',
              background: '#F7F6F2',
              borderLeft: '2px solid #101010',
              padding: '36px 32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '-8px 0px 0px rgba(16, 16, 16, 0.15)',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', color: '#429FE8', textTransform: 'uppercase' }}>
                    DIRECTORY // INDEX
                  </span>
                  <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#101010', margin: '4px 0 0 0', fontFamily: "'Syne', sans-serif" }}>
                    GlobalTrotter
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMenuDrawer(false)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#101010',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Numbered Editorial Directory Links */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { num: '01', label: 'Discover', tab: 'dashboard' as ActiveTab, desc: 'Editorial Travel Feed', isDiscover: true },
                  { num: '02', label: 'Destinations', tab: 'cities' as ActiveTab, desc: 'Global City Dossiers' },
                  { num: '03', label: 'My Trips', tab: 'my-trips' as ActiveTab, desc: 'Active & Upcoming Itineraries' },
                  { num: '04', label: 'Itinerary Builder', tab: 'itinerary-builder' as ActiveTab, desc: 'Day-by-Day Timeline Planner' },
                  { num: '05', label: 'Activities & Experiences', tab: 'activities' as ActiveTab, desc: 'Curated Local Discoveries' },
                  { num: '06', label: 'Saved Places', tab: 'saved-places' as ActiveTab, desc: `Wishlist (${savedCount} spots)` },
                  { num: '07', label: 'Budget & Expenses', tab: 'expenses' as ActiveTab, desc: 'Financial Tracker & Currency' },
                  { num: '08', label: 'Trip Calendar', tab: 'calendar' as ActiveTab, desc: 'Departure Timelines' },
                  { num: '09', label: 'Live Trip Telemetry', tab: 'live-trip' as ActiveTab, desc: 'In-Transit Travel Assistant' }
                ].map((item) => (
                  <button
                    key={item.num}
                    type="button"
                    onClick={() => handleDrawerNavigate(item.tab)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: activeTab === item.tab ? '#FFFFFF' : 'transparent',
                      border: activeTab === item.tab ? '1.5px solid #101010' : '1px solid transparent',
                      borderRadius: '8px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      boxShadow: activeTab === item.tab ? '3px 3px 0px #101010' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#36B7B3', fontFamily: 'monospace' }}>
                        {item.num}
                      </span>
                      <div>
                        <div 
                          className={item.isDiscover ? 'preserve-discover-font' : ''}
                          style={{ 
                            fontSize: '15px', 
                            fontWeight: 800, 
                            color: '#101010', 
                            fontFamily: item.isDiscover ? "'Syne', 'Plus Jakarta Sans', sans-serif" : '"Noto Sans Kharoshthi", sans-serif' 
                          }}
                        >
                          {item.label}
                        </div>
                        <div style={{ fontSize: '11px', color: '#555555', fontFamily: '"Noto Sans Kharoshthi", sans-serif' }}>
                          {item.desc}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: '16px', color: '#101010', fontWeight: 800 }}>↗</span>
                  </button>
                ))}

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleDrawerNavigate('admin')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: '#FFD84D',
                      border: '2px solid #101010',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      boxShadow: '3px 3px 0px #101010',
                      marginTop: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#101010', fontFamily: 'monospace' }}>99</span>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 900, color: '#101010', fontFamily: "'Syne', sans-serif" }}>
                          Mission Control Center
                        </div>
                        <div style={{ fontSize: '11px', color: '#101010' }}>Platform Administration</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '16px', color: '#101010', fontWeight: 800 }}>↗</span>
                  </button>
                )}
              </div>
            </div>

            {/* Drawer Footer */}
            <div style={{ borderTop: '1px solid #E8E6E0', paddingTop: '18px', marginTop: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img
                    src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80'}
                    alt={user.name}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #101010' }}
                  />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#101010' }}>{user.name}</div>
                    <div style={{ fontSize: '11px', color: '#555555' }}>{user.role} Member</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenuDrawer(false);
                    onTabChange('settings');
                  }}
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #101010',
                    color: '#101010',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Settings
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowMenuDrawer(false);
                  onSignOut();
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#101010',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  letterSpacing: '0.04em'
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
