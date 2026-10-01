import React, { useState, useEffect } from 'react';
import { UserProfile, ActiveTab } from '../types';
import { api } from '../api';

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
  const [notifications, setNotifications] = useState<any[]>([]);

  // Fetch real notifications sent by Admin or system
  const loadNotifications = () => {
    api.getNotifications(user.id || 1)
      .then(res => {
        if (res.notifications && res.notifications.length > 0) {
          setNotifications(res.notifications);
        } else {
          // Default initial travel notifications if none in db
          setNotifications([
            { id: 991, icon: '✈️', title: 'Flight 6E-204 Confirmed', message: 'Delhi to Udaipur boarding at 08:30 AM', sender: 'Aviation Dispatch' },
            { id: 992, icon: '🏨', title: 'Lake Palace Upgrade', message: 'Heritage suite upgrade unlocked for Udaipur stay', sender: 'Concierge' },
            { id: 993, icon: '🧭', title: 'Weather Advisory', message: '31°C Clear skies expected for desert safari', sender: 'Meteorology' }
          ]);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 8000); // Polling for live admin messages
    return () => clearInterval(interval);
  }, [user.id]);

  const dismissNotification = async (id: number) => {
    try {
      if (id < 900) {
        await api.deleteNotification(id);
      }
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (e) {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  const isAdmin = user.role === 'Admin';

  return (
    <header className="dash-navbar">
      <div className="dash-container">
        <div className="dash-nav-inner">
          {/* Brand Logo */}
          <div className="nav-brand" onClick={() => onTabChange('dashboard')}>
            <div className="nav-brand-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
              </svg>
            </div>
            <span className="nav-brand-title">GlobalTrotters</span>
            <span className="nav-brand-badge">{isAdmin ? 'ADMIN' : 'VOYAGER'}</span>
          </div>

          {/* Navigation Pill Links - Clean, Spacious, Never Cut Off */}
          <nav aria-label="Main Navigation" style={{ minWidth: 0 }}>
            <ul className="nav-menu">
              <li>
                <button
                  type="button"
                  className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => onTabChange('dashboard')}
                  title="Dashboard Overview"
                >
                  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                  </svg>
                  <span>Dashboard</span>
                </button>
              </li>

              <li>
                <button
                  type="button"
                  className={`nav-link ${activeTab === 'my-trips' ? 'active' : ''}`}
                  onClick={() => onTabChange('my-trips')}
                  title="My Trips & Expeditions"
                >
                  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                  <span>My Trips</span>
                </button>
              </li>

              <li>
                <button
                  type="button"
                  className={`nav-link ${activeTab === 'itinerary-builder' ? 'active' : ''}`}
                  onClick={() => onTabChange('itinerary-builder')}
                  title="Itinerary Builder"
                >
                  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="3 11 22 2 13 21 11 13 3 11" />
                  </svg>
                  <span>Itinerary</span>
                </button>
              </li>

              <li>
                <button
                  type="button"
                  className={`nav-link ${activeTab === 'live-trip' ? 'active' : ''}`}
                  onClick={() => onTabChange('live-trip')}
                  title="Live Trip Telemetry"
                >
                  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
                    <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
                    <circle cx="12" cy="12" r="2" />
                    <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" />
                    <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />
                  </svg>
                  <span>Live Trip</span>
                  <span className="live-badge">LIVE</span>
                </button>
              </li>

              <li>
                <button
                  type="button"
                  className={`nav-link ${activeTab === 'cities' ? 'active' : ''}`}
                  onClick={() => onTabChange('cities')}
                  title="Destinations & Cities"
                >
                  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <span>Destinations</span>
                </button>
              </li>

              <li>
                <button
                  type="button"
                  className={`nav-link ${activeTab === 'activities' ? 'active' : ''}`}
                  onClick={() => onTabChange('activities')}
                  title="Activities & Experiences"
                >
                  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m7.5 4.27 9 5.15" />
                    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                  </svg>
                  <span>Activities</span>
                </button>
              </li>

              <li>
                <button
                  type="button"
                  className={`nav-link ${activeTab === 'expenses' ? 'active' : ''}`}
                  onClick={() => onTabChange('expenses')}
                  title="Expenses & Budget"
                >
                  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                  <span>Expenses</span>
                </button>
              </li>

              <li>
                <button
                  type="button"
                  className={`nav-link ${activeTab === 'calendar' ? 'active' : ''}`}
                  onClick={() => onTabChange('calendar')}
                  title="Trip Calendar"
                >
                  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>Calendar</span>
                </button>
              </li>

              <li>
                <button
                  type="button"
                  className={`nav-link ${activeTab === 'community' ? 'active' : ''}`}
                  onClick={() => onTabChange('community')}
                  title="Community Voyager Feed"
                >
                  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span>Community</span>
                </button>
              </li>

              {/* Strict Requirement: Regular travelers get ZERO hints of Admin */}
              {isAdmin && (
                <li>
                  <button
                    type="button"
                    className={`nav-link ${activeTab === 'admin' ? 'active' : ''}`}
                    onClick={() => onTabChange('admin')}
                    style={{ color: '#0D9488', fontWeight: 800 }}
                    title="Mission Control Central"
                  >
                    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polygon points="12 2 2 7 12 12 22 7 12 2" />
                      <polyline points="2 17 12 22 22 17" />
                      <polyline points="2 12 12 17 22 12" />
                    </svg>
                    <span>Mission Control</span>
                  </button>
                </li>
              )}
            </ul>
          </nav>

          {/* Right Header Controls - Without redundant plan trip button so Calendar is NEVER cut off */}
          <div className="nav-actions">
            <button
              type="button"
              className="btn-notification"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifications"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              {notifications.length > 0 && <span className="notif-dot" aria-hidden="true" />}
            </button>

            {/* Notifications Modal / Dropdown Box */}
            {showNotifications && (
              <div style={{
                position: 'absolute',
                top: '58px',
                right: '70px',
                width: '330px',
                background: '#FFFFFF',
                borderRadius: '16px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
                border: '1px solid #E2E8F0',
                padding: '16px',
                zIndex: 300
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '13.5px', fontWeight: 800, color: '#111827', margin: 0 }}>
                    Voyage & Admin Alerts
                  </h4>
                  <span style={{ fontSize: '10.5px', background: '#EC4899', color: '#fff', padding: '2px 7px', borderRadius: '9999px', fontWeight: 800 }}>
                    {notifications.length} NEW
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px', color: '#475569', maxHeight: '340px', overflowY: 'auto' }}>
                  {notifications.map(n => (
                    <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
                      <div style={{ paddingRight: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{n.icon || '✈️'}</span>
                          <p style={{ fontWeight: 700, color: '#0F172A', margin: 0, fontSize: '13px' }}>{n.title}</p>
                        </div>
                        <p style={{ fontSize: '11.5px', color: '#475569', margin: '4px 0 2px 0', lineHeight: '1.4' }}>{n.message}</p>
                        {n.sender && (
                          <span style={{ fontSize: '10px', color: '#0D9488', fontWeight: 700, background: '#E6FFFA', padding: '1px 5px', borderRadius: '4px' }}>
                            {n.sender}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => dismissNotification(n.id)}
                        style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '14px', padding: '2px' }}
                        title="Dismiss alert"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#94A3B8', padding: '12px 0', margin: 0 }}>All caught up! No unread messages.</p>
                  )}
                </div>
              </div>
            )}

            {/* User Profile Pill */}
            <div className="user-profile-menu">
              <button
                type="button"
                className="user-profile-pill"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <img
                  src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80'}
                  alt={user.name}
                  className="user-avatar"
                />
                <span className="user-name">{user.name || 'panther'}</span>
              </button>

              {showDropdown && (
                <div className="user-dropdown">
                  <div style={{ padding: '6px 12px', borderBottom: '1px solid #F1F5F9', marginBottom: '4px' }}>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#111827', margin: 0 }}>{user.name}</p>
                    <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0 0' }}>{user.email}</p>
                  </div>
                  <button
                    type="button"
                    className="user-dropdown-item"
                    onClick={() => {
                      setShowDropdown(false);
                      onTabChange('settings');
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    <span>Traveler Profile & Settings</span>
                  </button>
                  <button
                    type="button"
                    className="user-dropdown-item danger"
                    onClick={() => {
                      setShowDropdown(false);
                      onSignOut();
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
