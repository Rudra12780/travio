import React, { useState, useEffect, useRef } from 'react';
import { AdminStats, UserProfile, Trip, City, Activity } from '../types';
import { api } from '../api';
import { GlobalSearchBar } from './GlobalSearchBar';
import { AnimatedLogo } from './AnimatedLogo';

interface Props {
  adminUser?: UserProfile | null;
  onAdminSignOut: () => void;
  onUpdateAdminUser?: (user: UserProfile) => void;
}

type AdminTab = 'manage-users' | 'popular-cities' | 'popular-activities' | 'user-trends';
export type AdminThemeMode = 'aurora' | 'cyber-teal' | 'glass-light';

export const AdminDashboard: React.FC<Props> = ({ adminUser, onAdminSignOut, onUpdateAdminUser }) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // Admin Profile Dropdown state
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const adminProfileRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (adminProfileRef.current && !adminProfileRef.current.contains(e.target as Node)) {
        setShowAdminDropdown(false);
      }
    };
    if (showAdminDropdown) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showAdminDropdown]);

  const adminDisplayName = adminUser?.name || 'Administrator';
  const adminEmail = adminUser?.email || 'admin@trovio.com';
  const adminAvatar = adminUser?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80';

  // Admin Profile Settings Modal state
  const [showAdminSettingsModal, setShowAdminSettingsModal] = useState(false);
  const [adminSettingsTab, setAdminSettingsTab] = useState<'profile' | 'broadcast'>('profile');

  // Edit Admin Profile fields
  const [editAdminName, setEditAdminName] = useState(adminDisplayName);
  const [editAdminEmail, setEditAdminEmail] = useState(adminEmail);
  const [editAdminBio, setEditAdminBio] = useState(adminUser?.bio || 'Super Administrator & Global Mission Control Fleet Commander');
  const [editAdminAvatar, setEditAdminAvatar] = useState(adminAvatar);
  const [editAdminCountry, setEditAdminCountry] = useState(adminUser?.home_country || 'Global HQ');
  const [savingAdminProfile, setSavingAdminProfile] = useState(false);

  // Synchronize whenever adminUser prop changes
  useEffect(() => {
    if (adminUser) {
      if (adminUser.name) setEditAdminName(adminUser.name);
      if (adminUser.email) setEditAdminEmail(adminUser.email);
      if (adminUser.bio) setEditAdminBio(adminUser.bio);
      if (adminUser.avatar_url) setEditAdminAvatar(adminUser.avatar_url);
      if (adminUser.home_country) setEditAdminCountry(adminUser.home_country);
    }
  }, [adminUser]);

  // Broadcast Alert states
  const [broadcastTitle, setBroadcastTitle] = useState('Voyage Advisory from Mission Control');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastIcon, setBroadcastIcon] = useState('📢');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  // Admin Theme state ('aurora' | 'cyber-teal' | 'glass-light') - Previous clean theme by default
  const [adminTheme, setAdminTheme] = useState<AdminThemeMode>('glass-light');

  // Active Admin Sub-Navigation Tab (Screen 12)
  const [activeTab, setActiveTab] = useState<AdminTab>('manage-users');

  // Search & Filter controls
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('Default');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedSort, setSelectedSort] = useState('Newest');

  // Modals state
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [userToMessage, setUserToMessage] = useState<any | null>(null);
  const [messageTitle, setMessageTitle] = useState('Voyage Update from Mission Control');
  const [messageBody, setMessageBody] = useState('');
  const [messageIcon, setMessageIcon] = useState('✈️');

  // View Trips for a User (Screen 12 requirement: "give admin access to view all trips made by user")
  const [viewUserTrips, setViewUserTrips] = useState<{ user: any; trips: Trip[] } | null>(null);
  const [loadingUserTrips, setLoadingUserTrips] = useState(false);

  // Schedule Trip Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [tripTitle, setTripTitle] = useState('');
  const [tripDesc, setTripDesc] = useState('');
  const [tripBudget, setTripBudget] = useState(2400);
  const [tripStartDate, setTripStartDate] = useState('2026-11-01');
  const [tripEndDate, setTripEndDate] = useState('2026-11-10');
  const [scheduleDate, setScheduleDate] = useState('2026-10-15');
  const [scheduleTime, setScheduleTime] = useState('10:00');
  const [scheduleStatus, setScheduleStatus] = useState<'immediate' | 'scheduled'>('immediate');
  const [tripCover, setTripCover] = useState('https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&w=1200&q=80');

  // Toast feedback
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const loadData = () => {
    Promise.all([
      api.getAdminStats(),
      api.getAdminUsers(),
      api.getCities(),
      api.getActivities()
    ])
      .then(([statsData, usersData, citiesData, actsData]) => {
        setStats(statsData);
        setUsers(usersData.users);
        setCities(citiesData.cities);
        setActivities(actsData.activities);
        setLoading(false);
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await api.deleteAdminUser(userToDelete.id);
      showToast(`✅ Traveler ${userToDelete.name} (#${userToDelete.id}) deleted successfully.`);
      setUserToDelete(null);
      loadData();
    } catch (err: any) {
      showToast(`❌ ${err.message || 'Could not delete user'}`);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToMessage || !messageTitle.trim() || !messageBody.trim()) return;

    try {
      await api.sendAdminMessage({
        user_id: userToMessage.id,
        title: messageTitle.trim(),
        message: messageBody.trim(),
        icon: messageIcon,
        sender: 'GlobalTrotter Mission Control'
      });
      showToast(`✉️ Message dispatched to ${userToMessage.name}! They will receive it in their notification box.`);
      setUserToMessage(null);
      setMessageBody('');
    } catch (err: any) {
      showToast(`❌ ${err.message || 'Could not send message'}`);
    }
  };

  const handleSaveAdminProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAdminProfile(true);
    try {
      const res = await api.updateProfile({
        id: adminUser?.id || 1,
        name: editAdminName.trim(),
        bio: editAdminBio.trim(),
        home_country: editAdminCountry.trim(),
        avatar_url: editAdminAvatar
      });
      if (res?.user) {
        onUpdateAdminUser?.(res.user);
      }
      showToast('✅ Mission Commander profile updated successfully!');
      setShowAdminSettingsModal(false);
    } catch (err: any) {
      showToast(`❌ ${err.message || 'Could not update admin profile'}`);
    } finally {
      setSavingAdminProfile(false);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      showToast('⚠️ Please provide both title and broadcast message');
      return;
    }
    setSendingBroadcast(true);
    try {
      const res = await api.broadcastAdminMessage({
        title: broadcastTitle.trim(),
        message: broadcastMessage.trim(),
        icon: broadcastIcon,
        sender: `${editAdminName || 'Super Admin'} (Mission Control)`
      });
      showToast(`📢 Global Broadcast dispatched to ${res.count || 'all'} voyagers!`);
      setBroadcastMessage('');
      setShowAdminSettingsModal(false);
    } catch (err: any) {
      showToast(`❌ ${err.message || 'Failed to send broadcast'}`);
    } finally {
      setSendingBroadcast(false);
    }
  };

  const handleViewUserTrips = async (user: any) => {
    setLoadingUserTrips(true);
    setViewUserTrips({ user, trips: [] });
    try {
      const res = await api.getTrips(user.id);
      setViewUserTrips({ user, trips: res.trips });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUserTrips(false);
    }
  };

  const handleScheduleTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripTitle.trim()) return;

    try {
      const scheduledAt = scheduleStatus === 'scheduled' ? `${scheduleDate} ${scheduleTime}` : null;
      await api.scheduleAdminTrip({
        user_id: 1,
        title: tripTitle.trim(),
        description: tripDesc.trim() || 'Curated package scheduled by Admin Mission Control.',
        start_date: tripStartDate,
        end_date: tripEndDate,
        total_budget: Number(tripBudget) || 2400,
        cover_image: tripCover,
        scheduled_at: scheduledAt,
        is_published: scheduleStatus === 'immediate' ? 1 : 0
      });

      showToast(scheduleStatus === 'immediate'
        ? `🚀 New Trip "${tripTitle}" published and posted successfully!`
        : `📅 Trip "${tripTitle}" scheduled for release on ${scheduledAt}!`
      );
      setShowScheduleModal(false);
      setTripTitle('');
      setTripDesc('');
      loadData();
    } catch (err: any) {
      showToast(`❌ ${err.message || 'Could not schedule trip'}`);
    }
  };

  if (loading || !stats) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <div className="spinner" style={{ margin: '0 auto 16px', borderTopColor: '#0D9488' }} />
        <p>Loading GlobalTrotter Admin Panel...</p>
      </div>
    );
  }

  // Filtered users
  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase();
    const matchSearch = !term || u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term);
    const matchFilter = selectedFilter === 'All' || u.role === selectedFilter;
    return matchSearch && matchFilter;
  });

  // Dynamic Editorial Styling Tokens
  const isDark = false;
  const cardStyle: React.CSSProperties = {
    background: '#FFFFFF',
    borderRadius: '16px',
    border: '2px solid #101010',
    padding: '28px',
    boxShadow: '4px 4px 0px #101010',
    color: '#101010',
    transition: 'all 0.2s ease'
  };
  const titleColor = '#101010';
  const descColor = '#555555';
  const subCardBg = '#FFFFFF';
  const subCardBorder = '1.5px solid #101010';

  return (
    <>
      {/* 1. PROPER FULL-WIDTH ADMIN TOP NAVIGATION BAR */}
      <header className="dash-navbar admin-top-navbar theme-glass-light">
        <div className="dash-container admin-nav-container">
          <div className="dash-nav-inner admin-nav-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '16px' }}>
            {/* Brand Logo */}
            <div className="nav-brand admin-nav-brand" onClick={() => setActiveTab('manage-users')} style={{ cursor: 'pointer', flexShrink: 0, minWidth: 'max-content', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AnimatedLogo 
                size="sm" 
                title="GlobalTrotter" 
                badge="ADMIN" 
              />
            </div>

            {/* Navigation Tab Links - Clean, Left-Aligned with guaranteed spacing, Never Overlapping Brand */}
            <nav className="dash-nav-links-wrapper admin-nav-links" aria-label="Admin Navigation" style={{ flex: '1 1 auto', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', minWidth: 0, overflowX: 'auto', scrollbarWidth: 'none', margin: '0 20px' }}>
              <ul className="nav-menu" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap', listStyle: 'none', margin: 0, padding: 0 }}>
                <li>
                  <button
                    type="button"
                    className={`nav-link admin-nav-link ${activeTab === 'manage-users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('manage-users')}
                    title="Manage Voyagers & Platform Permissions"
                  >
                    <span>👥</span>
                    <span>Manage Users</span>
                    <span className="admin-nav-pill-badge">{users.length}</span>
                  </button>
                </li>

                <li>
                  <button
                    type="button"
                    className={`nav-link admin-nav-link ${activeTab === 'popular-cities' ? 'active' : ''}`}
                    onClick={() => setActiveTab('popular-cities')}
                    title="Popular Destination Hubs"
                  >
                    <span>🏙️</span>
                    <span>Popular Cities</span>
                    <span className="admin-nav-pill-badge">{cities.length}</span>
                  </button>
                </li>

                <li>
                  <button
                    type="button"
                    className={`nav-link admin-nav-link ${activeTab === 'popular-activities' ? 'active' : ''}`}
                    onClick={() => setActiveTab('popular-activities')}
                    title="Popular Voyager Activities"
                  >
                    <span>🎯</span>
                    <span>Popular Activities</span>
                    <span className="admin-nav-pill-badge">{activities.length}</span>
                  </button>
                </li>

                <li>
                  <button
                    type="button"
                    className={`nav-link admin-nav-link ${activeTab === 'user-trends' ? 'active' : ''}`}
                    onClick={() => setActiveTab('user-trends')}
                    title="Real-time User Trends & Flight Telemetry"
                  >
                    <span>📈</span>
                    <span>User Trends & Analytics</span>
                    <span className="live-badge">LIVE</span>
                  </button>
                </li>
              </ul>
            </nav>

            {/* Right Header Controls: Schedule Button and Proper Profile Pill */}
            <div className="nav-actions admin-nav-actions" style={{ flexShrink: 0, marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* + Post & Schedule Trip Button */}
              <button
                type="button"
                className="btn-plan-trip admin-schedule-btn"
                onClick={() => setShowScheduleModal(true)}
                title="Post or Schedule Global Voyage"
              >
                <span>+ Post & Schedule Trip</span>
              </button>

              {/* Proper Profile Pill & Interactive Dropdown */}
              <div className="user-profile-menu admin-profile-menu" ref={adminProfileRef}>
                <button
                  type="button"
                  className="user-profile-pill admin-profile-pill"
                  onClick={() => setShowAdminDropdown(!showAdminDropdown)}
                  aria-expanded={showAdminDropdown}
                  title="Mission Commander Profile"
                >
                  <div className="admin-avatar-wrapper">
                    <img
                      src={editAdminAvatar || adminAvatar}
                      alt={editAdminName || adminDisplayName}
                      className="user-avatar admin-avatar"
                    />
                    <span className="admin-online-dot" />
                  </div>
                  <div className="admin-pill-text">
                    <span className="admin-pill-name">{editAdminName || adminDisplayName}</span>
                    <span className="admin-pill-role">SUPER ADMIN</span>
                  </div>
                  <svg className={`admin-chevron ${showAdminDropdown ? 'open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {/* Dropdown Menu - Clean Profile Details & Mission Features */}
                {showAdminDropdown && (
                  <div className={`admin-profile-dropdown theme-${adminTheme}`} style={{ width: '300px' }}>
                    {/* Header */}
                    <div className="admin-dropdown-header">
                      <div className="admin-avatar-wrapper" style={{ width: '44px', height: '44px' }}>
                        <img
                          src={editAdminAvatar || adminAvatar}
                          alt={editAdminName || adminDisplayName}
                          className="admin-avatar"
                          style={{ width: '44px', height: '44px' }}
                        />
                        <span className="admin-online-dot" style={{ width: '10px', height: '10px' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '13.5px', fontWeight: 800 }}>{editAdminName || adminDisplayName}</span>
                          <span style={{
                            fontSize: '9px',
                            fontWeight: 800,
                            background: 'rgba(13, 148, 136, 0.15)',
                            color: '#0D9488',
                            padding: '1px 5px',
                            borderRadius: '4px'
                          }}>
                            HQ
                          </span>
                        </div>
                        <span style={{ fontSize: '11px', color: '#64748B' }}>
                          {editAdminEmail || adminEmail}
                        </span>
                        <span style={{
                          fontSize: '10px',
                          color: '#0D9488',
                          fontWeight: 700,
                          marginTop: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          ⭐ Super Administrator • Full Access
                        </span>
                      </div>
                    </div>

                    {/* Features & Profile Settings Navigation */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', padding: '4px 0' }}>
                      <button
                        type="button"
                        className="admin-dropdown-item"
                        onClick={() => {
                          setShowAdminDropdown(false);
                          setAdminSettingsTab('profile');
                          setShowAdminSettingsModal(true);
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="3" />
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                        <span>Profile & Settings</span>
                      </button>

                      <button
                        type="button"
                        className="admin-dropdown-item"
                        onClick={() => {
                          setShowAdminDropdown(false);
                          setAdminSettingsTab('broadcast');
                          setShowAdminSettingsModal(true);
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                          <path d="M2 8c0-2.2 1.8-4 4-4" />
                          <path d="M22 8c0-2.2-1.8-4-4-4" />
                        </svg>
                        <span>Broadcast Global Alert</span>
                      </button>
                    </div>

                    {/* Sign Out Button */}
                    <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '6px' }}>
                      <button
                        type="button"
                        className="admin-dropdown-item danger"
                        onClick={() => {
                          setShowAdminDropdown(false);
                          onAdminSignOut();
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <span>Sign Out of Mission Control</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. ADMIN MAIN CONTENT CONTAINER */}
      <main className="dash-container" style={{ position: 'relative', zIndex: 1, paddingTop: '24px', paddingBottom: '60px' }}>
        {/* Toast Feedback Notification */}
        {toastMsg && (
          <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#0F172A',
            color: '#FFFFFF',
            padding: '14px 22px',
            borderRadius: '14px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            border: '1px solid #334155',
            zIndex: 9999,
            fontSize: '14px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            {toastMsg}
          </div>
        )}

        {/* Screen 12 Command Center Telemetry Banner & Search Bar */}
        <div 
          className="admin-top-card-container theme-glass-light"
          style={{
            position: 'relative',
            zIndex: 40,
            borderRadius: '24px',
            padding: '24px 28px',
            color: '#292833',
            marginBottom: '24px',
            overflow: 'visible',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(247, 191, 213, 0.15) 50%, rgba(195, 154, 217, 0.15) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1.5px solid #E8E2F0',
            boxShadow: '0 16px 36px -10px rgba(32, 63, 112, 0.08), 0 0 0 1px rgba(129, 120, 232, 0.15)',
            transition: 'all 0.3s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>🛰️</span>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  margin: 0,
                  color: adminTheme === 'glass-light' ? '#0F172A' : '#FFFFFF'
                }}>
                  Live Airspace Telemetry & Mission Control
                </h2>
                <span style={{
                  background: adminTheme === 'glass-light' ? 'rgba(13, 148, 136, 0.12)' : 'rgba(45, 212, 191, 0.18)',
                  color: adminTheme === 'glass-light' ? '#0D9488' : '#2DD4BF',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '999px',
                  border: adminTheme === 'glass-light' ? '1px solid rgba(13, 148, 136, 0.3)' : '1px solid rgba(45, 212, 191, 0.35)'
                }}>
                  SCREEN 12
                </span>
              </div>
              <p style={{
                fontSize: '13px',
                color: adminTheme === 'glass-light' ? '#475569' : '#94A3B8',
                margin: '5px 0 0 0',
                maxWidth: '700px'
              }}>
                Mission control for traveler management, live global flight telemetry, trending cities, activities, and deep analytics.
              </p>
            </div>

            {/* Radar status indicator */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: adminTheme === 'glass-light' ? 'rgba(13, 148, 136, 0.08)' : 'rgba(45, 212, 191, 0.12)',
              border: adminTheme === 'glass-light' ? '1px solid rgba(13, 148, 136, 0.22)' : '1px solid rgba(45, 212, 191, 0.28)',
              borderRadius: '999px',
              padding: '6px 16px',
              fontSize: '12px',
              fontWeight: 700,
              color: adminTheme === 'glass-light' ? '#0D9488' : '#2DD4BF'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#10B981',
                boxShadow: '0 0 10px #10B981'
              }} />
              <span>✈️ Airspace Radar: 14 Global Flights Active • 8 Hubs Aligned (DEL, UDR, HND, CDG, JFK) • 0 Delays</span>
            </div>
          </div>

          {/* Global Search Bar */}
          <div style={{ marginTop: '18px' }}>
            <GlobalSearchBar
              placeholder="Search users, cities, activities, or telemetry logs....."
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              groupByOptions={['Default', 'By Role', 'By Activity Level']}
              filterOptions={['All', 'Traveler', 'Admin']}
              sortByOptions={['Newest', 'Alphabetical', 'Trip Count']}
              selectedGroup={selectedGroup}
              onGroupChange={setSelectedGroup}
              selectedFilter={selectedFilter}
              onFilterChange={setSelectedFilter}
              selectedSort={selectedSort}
              onSortChange={setSelectedSort}
              style={{ margin: '0' }}
            />
          </div>
        </div>

      {/* ========================================================================= */}
      {/* TAB 1: MANAGE USERS (Screen 12 - Manage User Section)                    */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* TAB 1: MANAGE USERS (Screen 12 - Manage User Section)                    */}
      {/* ========================================================================= */}
      {activeTab === 'manage-users' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: titleColor, margin: 0 }}>
                Manage User Section
              </h2>
              <p style={{ fontSize: '13.5px', color: descColor, margin: '6px 0 0 0' }}>
                Responsible for managing travelers and platform permissions. Full mission telemetry access to view user trips, send direct advisories, or manage accounts.
              </p>
            </div>
            <span style={{ 
              fontSize: '13px', 
              fontWeight: 800, 
              color: '#2DD4BF', 
              background: isDark ? 'rgba(45, 212, 191, 0.15)' : '#F0FDFA', 
              padding: '6px 16px', 
              borderRadius: '999px',
              border: isDark ? '1px solid rgba(45, 212, 191, 0.35)' : '1px solid #CCFBF1'
            }}>
              {filteredUsers.length} Active Travelers
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ 
                  borderBottom: isDark ? '1.5px solid rgba(45, 212, 191, 0.3)' : '1.5px solid #E2E8F0', 
                  color: isDark ? '#2DD4BF' : '#64748B', 
                  fontSize: '11.5px', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  <th style={{ padding: '14px' }}>Traveler</th>
                  <th style={{ padding: '14px' }}>Email Address</th>
                  <th style={{ padding: '14px' }}>Role</th>
                  <th style={{ padding: '14px' }}>Trips Count</th>
                  <th style={{ padding: '14px', textAlign: 'right' }}>Actions & Controls</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id} style={{ borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px', fontWeight: 700, color: titleColor }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: isDark ? 'rgba(45, 212, 191, 0.15)' : '#E2E8F0',
                          border: isDark ? '1.5px solid rgba(45, 212, 191, 0.4)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          color: isDark ? '#2DD4BF' : '#475569',
                          fontSize: '13.5px'
                        }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ color: titleColor }}>{u.name}</div>
                          <div style={{ fontSize: '11px', color: descColor, fontWeight: 400 }}>ID #{u.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px', color: isDark ? '#CBD5E1' : '#475569' }}>{u.email}</td>
                    <td style={{ padding: '14px' }}>
                      <span style={{
                        background: u.role === 'Admin' ? 'rgba(79, 70, 229, 0.2)' : (isDark ? 'rgba(45, 212, 191, 0.15)' : '#E6FFFA'),
                        color: u.role === 'Admin' ? '#818CF8' : (isDark ? '#2DD4BF' : '#0D9488'),
                        border: u.role === 'Admin' ? '1px solid rgba(79, 70, 229, 0.35)' : (isDark ? '1px solid rgba(45, 212, 191, 0.35)' : '1px solid #CCFBF1'),
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '11.5px',
                        fontWeight: 700
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '14px', fontWeight: 700 }}>
                      <span style={{ color: '#2DD4BF' }}>{u.trips_count || 1} voyages</span>
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {/* View User Trips button (Screen 12 wireframe requirement) */}
                        <button
                          type="button"
                          onClick={() => handleViewUserTrips(u)}
                          style={{
                            background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
                            color: isDark ? '#F1F5F9' : '#334155',
                            border: isDark ? '1px solid rgba(255, 255, 255, 0.18)' : '1px solid #CBD5E1',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          👁️ View Trips
                        </button>

                        {/* Message Traveler button */}
                        <button
                          type="button"
                          onClick={() => {
                            setUserToMessage(u);
                            setMessageTitle(`Voyage Alert for ${u.name}`);
                          }}
                          style={{
                            background: isDark ? 'rgba(37, 99, 235, 0.2)' : '#EFF6FF',
                            color: isDark ? '#93C5FD' : '#2563EB',
                            border: isDark ? '1px solid rgba(37, 99, 235, 0.35)' : '1px solid #BFDBFE',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          ✉️ Message
                        </button>

                        {/* Delete User button */}
                        {u.role !== 'Admin' && (
                          <button
                            type="button"
                            onClick={() => setUserToDelete(u)}
                            style={{
                              background: isDark ? 'rgba(239, 68, 68, 0.18)' : '#FEF2F2',
                              color: isDark ? '#FCA5A5' : '#EF4444',
                              border: isDark ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid #FECACA',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            🗑️ Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: POPULAR CITIES (Screen 12 - Popular cities Section)               */}
      {/* ========================================================================= */}
      {activeTab === 'popular-cities' && (
        <div style={cardStyle}>
          <div style={{ marginBottom: '22px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: titleColor, margin: 0 }}>
              Popular cities Section
            </h2>
            <p style={{ fontSize: '13.5px', color: descColor, margin: '6px 0 0 0' }}>
              Lists all the popular cities where users are visiting based on current user trend data and booking frequency.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {cities.map((city, idx) => (
              <div 
                key={city.id}
                style={{
                  borderRadius: '18px',
                  border: subCardBorder,
                  overflow: 'hidden',
                  background: subCardBg,
                  boxShadow: isDark ? '0 10px 25px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.03)',
                  transition: 'transform 0.2s'
                }}
              >
                <div style={{ height: '140px', position: 'relative' }}>
                  <img src={city.image_url} alt={city.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(8px)',
                    color: '#2DD4BF',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(45, 212, 191, 0.3)'
                  }}>
                    #{idx + 1} TRENDING
                  </span>
                  <span style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    background: 'rgba(0,0,0,0.75)',
                    backdropFilter: 'blur(8px)',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    ${city.avg_cost_per_day}/day
                  </span>
                </div>
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '17px', fontWeight: 800, color: titleColor, margin: 0 }}>{city.name}</h3>
                    <span style={{ color: '#10B981', fontSize: '12.5px', fontWeight: 700 }}>+{20 + idx * 4}% visits</span>
                  </div>
                  <p style={{ fontSize: '12.5px', color: descColor, margin: '0 0 12px 0' }}>{city.country} • {city.region}</p>
                  <p style={{ fontSize: '12px', color: isDark ? '#CBD5E1' : '#475569', lineClamp: 2, margin: '0 0 12px 0' }}>{city.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #F1F5F9', paddingTop: '10px', color: descColor }}>
                    <span>⭐ {city.popularity_score} Popularity</span>
                    <span>🌡️ {city.climate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: POPULAR ACTIVITIES (Screen 12 - Popular Activities Section)        */}
      {/* ========================================================================= */}
      {activeTab === 'popular-activities' && (
        <div style={cardStyle}>
          <div style={{ marginBottom: '22px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: titleColor, margin: 0 }}>
              Popular Activities Section
            </h2>
            <p style={{ fontSize: '13.5px', color: descColor, margin: '6px 0 0 0' }}>
              Lists all the popular activities that users are booking and performing based on current user trend data.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {activities.map((act, idx) => (
              <div
                key={act.id}
                style={{
                  borderRadius: '18px',
                  border: subCardBorder,
                  overflow: 'hidden',
                  background: subCardBg,
                  boxShadow: isDark ? '0 10px 25px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{ height: '140px', position: 'relative' }}>
                  <img src={act.image_url} alt={act.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'rgba(13, 148, 136, 0.9)',
                    backdropFilter: 'blur(8px)',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(45, 212, 191, 0.4)'
                  }}>
                    {act.category}
                  </span>
                  <span style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    background: 'rgba(0,0,0,0.75)',
                    backdropFilter: 'blur(8px)',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    ${act.cost}
                  </span>
                </div>
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: titleColor, margin: 0 }}>{act.name}</h3>
                    <span style={{ color: '#F59E0B', fontSize: '12.5px', fontWeight: 700 }}>⭐ {act.rating}</span>
                  </div>
                  <p style={{ fontSize: '12.5px', color: descColor, margin: '0 0 10px 0' }}>Duration: {act.duration_hours}h • Score: {95 - idx * 2}%</p>
                  <p style={{ fontSize: '12px', color: isDark ? '#CBD5E1' : '#475569', margin: '0 0 12px 0' }}>{act.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #F1F5F9', paddingTop: '10px', fontSize: '12px', color: '#2DD4BF', fontWeight: 600 }}>
                    <span>👥 {120 + idx * 18} Travelers Joined</span>
                    <span style={{ color: '#10B981' }}>98% Positive Feedback</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: USER TRENDS AND ANALYTICS (Screen 12 Wireframe Visual Card)        */}
      {/* ========================================================================= */}
      {activeTab === 'user-trends' && (
        <div style={cardStyle}>
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: titleColor, margin: 0 }}>
              User Trends and Analytics
            </h2>
            <p style={{ fontSize: '13.5px', color: descColor, margin: '6px 0 0 0' }}>
              Focus on providing deep analysis across various voyage telemetry points to give useful intelligence to platform admins.
            </p>
          </div>

          {/* Screen 12 Wireframe Structure: */}
          {/* Top Row: 4 Metric Items on Left, Pie Chart on Right */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', marginBottom: '32px' }}>
            {/* Top Left: 4 User Metric Rows with Circular Avatars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 800 }}>
                  42%
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, color: titleColor }}>
                    <span>Solo Voyageurs</span>
                    <span style={{ color: descColor }}>1,420 Users</span>
                  </div>
                  <div style={{ height: '8px', background: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0', borderRadius: '999px', marginTop: '6px', overflow: 'hidden' }}>
                    <div style={{ width: '42%', height: '100%', background: '#2DD4BF', borderRadius: '999px', boxShadow: '0 0 8px rgba(45, 212, 191, 0.6)' }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 800 }}>
                  28%
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, color: titleColor }}>
                    <span>Couples & Honeymoon</span>
                    <span style={{ color: descColor }}>940 Users</span>
                  </div>
                  <div style={{ height: '8px', background: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0', borderRadius: '999px', marginTop: '6px', overflow: 'hidden' }}>
                    <div style={{ width: '28%', height: '100%', background: '#3B82F6', borderRadius: '999px', boxShadow: '0 0 8px rgba(59, 130, 246, 0.6)' }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 800 }}>
                  18%
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, color: titleColor }}>
                    <span>Family Expeditions</span>
                    <span style={{ color: descColor }}>610 Users</span>
                  </div>
                  <div style={{ height: '8px', background: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0', borderRadius: '999px', marginTop: '6px', overflow: 'hidden' }}>
                    <div style={{ width: '18%', height: '100%', background: '#10B981', borderRadius: '999px', boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)' }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 800 }}>
                  12%
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, color: titleColor }}>
                    <span>Corporate & Group Nomads</span>
                    <span style={{ color: descColor }}>405 Users</span>
                  </div>
                  <div style={{ height: '8px', background: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0', borderRadius: '999px', marginTop: '6px', overflow: 'hidden' }}>
                    <div style={{ width: '12%', height: '100%', background: '#F59E0B', borderRadius: '999px', boxShadow: '0 0 8px rgba(245, 158, 11, 0.6)' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Top Right: Pie Chart (matching Screen 12 wireframe) */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: subCardBg,
              borderRadius: '20px',
              padding: '24px',
              border: subCardBorder,
              boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.3)' : 'none'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: titleColor, marginBottom: '14px' }}>
                Regional Preference Share
              </div>
              <svg width="180" height="180" viewBox="0 0 42 42">
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke={isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0'} strokeWidth="6" />
                {/* Rajasthan / Heritage: 45% (teal) */}
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#2DD4BF" strokeWidth="6" strokeDasharray="45 55" strokeDashoffset="25" />
                {/* Kerala / Coastal: 25% (blue) */}
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#3B82F6" strokeWidth="6" strokeDasharray="25 75" strokeDashoffset="-20" />
                {/* Himalayas / Mountain: 20% (green) */}
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#10B981" strokeWidth="6" strokeDasharray="20 80" strokeDashoffset="-45" />
                {/* International: 10% (orange) */}
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#F59E0B" strokeWidth="6" strokeDasharray="10 90" strokeDashoffset="-65" />
              </svg>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '16px', fontSize: '11.5px', fontWeight: 600 }}>
                <span style={{ color: '#2DD4BF' }}>● Rajasthan (45%)</span>
                <span style={{ color: '#3B82F6' }}>● Kerala (25%)</span>
                <span style={{ color: '#10B981' }}>● Himalayas (20%)</span>
                <span style={{ color: '#F59E0B' }}>● Global (10%)</span>
              </div>
            </div>
          </div>

          {/* Middle: Line Chart (Screen 12 Wireframe) */}
          <div style={{
            background: subCardBg,
            borderRadius: '20px',
            padding: '24px',
            border: subCardBorder,
            marginBottom: '32px',
            boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.3)' : 'none'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '14px', fontWeight: 800, color: titleColor }}>Monthly Active Travelers Trend</span>
                <span style={{ fontSize: '12px', color: '#10B981', marginLeft: '8px', fontWeight: 700 }}>+34.2% YoY</span>
              </div>
              <span style={{ fontSize: '12px', color: descColor }}>Telemetry Year 2026</span>
            </div>

            {/* Line chart visualization */}
            <div style={{ position: 'relative', height: '140px', width: '100%' }}>
              <svg viewBox="0 0 600 140" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2DD4BF" stopOpacity={isDark ? 0.35 : 0.3} />
                    <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 20 110 Q 110 80 180 95 T 320 60 T 450 40 T 580 20 L 580 135 L 20 135 Z"
                  fill="url(#lineGrad)"
                />
                <path
                  d="M 20 110 Q 110 80 180 95 T 320 60 T 450 40 T 580 20"
                  fill="none"
                  stroke="#2DD4BF"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                {/* Connecting Red/Coral Dots from Wireframe */}
                <circle cx="20" cy="110" r="6" fill="#F43F5E" stroke="#0F172A" strokeWidth="2" />
                <circle cx="110" cy="80" r="6" fill="#F43F5E" stroke="#0F172A" strokeWidth="2" />
                <circle cx="180" cy="95" r="6" fill="#F43F5E" stroke="#0F172A" strokeWidth="2" />
                <circle cx="320" cy="60" r="6" fill="#F43F5E" stroke="#0F172A" strokeWidth="2" />
                <circle cx="450" cy="40" r="6" fill="#F43F5E" stroke="#0F172A" strokeWidth="2" />
                <circle cx="580" cy="20" r="6" fill="#F43F5E" stroke="#0F172A" strokeWidth="2" />
              </svg>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: descColor, marginTop: '10px' }}>
              <span>Jan</span>
              <span>Mar</span>
              <span>May</span>
              <span>Jul</span>
              <span>Sep</span>
              <span>Nov</span>
            </div>
          </div>

          {/* Bottom Row: Bar Chart on Left, Data Rows on Right (Screen 12 Wireframe) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
            {/* Bottom Left: Bar Chart with Orange Vertical Bars */}
            <div style={{
              background: subCardBg,
              borderRadius: '20px',
              padding: '24px',
              border: subCardBorder,
              boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.3)' : 'none'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: titleColor, marginBottom: '18px' }}>
                Quarterly Expedition Revenue & Bookings
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '140px', borderBottom: isDark ? '1.5px solid rgba(255, 255, 255, 0.15)' : '1.5px solid #CBD5E1', paddingBottom: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#F97316' }}>$42k</span>
                  <div style={{ width: '36px', height: '55px', background: '#F97316', borderRadius: '6px 6px 0 0', boxShadow: '0 0 10px rgba(249, 115, 22, 0.4)' }} />
                  <span style={{ fontSize: '12px', color: descColor, fontWeight: 600 }}>Q1</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#F97316' }}>$68k</span>
                  <div style={{ width: '36px', height: '85px', background: '#F97316', borderRadius: '6px 6px 0 0', boxShadow: '0 0 10px rgba(249, 115, 22, 0.4)' }} />
                  <span style={{ fontSize: '12px', color: descColor, fontWeight: 600 }}>Q2</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#F97316' }}>$94k</span>
                  <div style={{ width: '36px', height: '115px', background: '#F97316', borderRadius: '6px 6px 0 0', boxShadow: '0 0 10px rgba(249, 115, 22, 0.4)' }} />
                  <span style={{ fontSize: '12px', color: descColor, fontWeight: 600 }}>Q3</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#F97316' }}>$128k</span>
                  <div style={{ width: '36px', height: '135px', background: '#F97316', borderRadius: '6px 6px 0 0', boxShadow: '0 0 10px rgba(249, 115, 22, 0.4)' }} />
                  <span style={{ fontSize: '12px', color: descColor, fontWeight: 600 }}>Q4</span>
                </div>
              </div>
            </div>

            {/* Bottom Right: Analytics Summary Rows from Wireframe */}
            <div style={{
              background: subCardBg,
              borderRadius: '20px',
              padding: '24px',
              border: subCardBorder,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-around',
              gap: '12px',
              boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.3)' : 'none'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '13px', color: descColor }}>Average Trip Duration</span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: titleColor }}>6.8 Days</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '13px', color: descColor }}>Average Budget per Voyager</span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#2DD4BF' }}>$2,450 USD</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '13px', color: descColor }}>Repeat Booking Index</span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#10B981' }}>+41.8%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '13px', color: descColor }}>Expedition Satisfaction Rate</span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#3B82F6' }}>98.6%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                <span style={{ fontSize: '13px', color: descColor }}>Platform Retention</span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#F59E0B' }}>92.4%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: View User's Trips (Screen 12 Wireframe Requirement)               */}
      {/* ========================================================================= */}
      {viewUserTrips && (
        <div className="modal-overlay" onClick={() => setViewUserTrips(null)}>
          <div className="modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close-btn" onClick={() => setViewUserTrips(null)}>✕</button>
            <div className="modal-icon-badge" style={{ background: '#F0FDFA', color: '#0D9488' }}>
              👁️
            </div>
            <h2 className="modal-title">Expeditions Created by {viewUserTrips.user.name}</h2>
            <p className="modal-desc">
              All multi-city itineraries and saved voyages associated with traveler account #{viewUserTrips.user.id} ({viewUserTrips.user.email}).
            </p>

            {loadingUserTrips ? (
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                <div className="spinner" style={{ margin: '0 auto 12px', borderTopColor: '#0D9488' }} />
                <p>Loading traveler trips...</p>
              </div>
            ) : viewUserTrips.trips.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748B' }}>
                <p>No trips currently created by this traveler.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '380px', overflowY: 'auto' }}>
                {viewUserTrips.trips.map(t => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', background: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                    <img src={t.cover_image} alt={t.title} style={{ width: '64px', height: '64px', borderRadius: '10px', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: '15px', color: '#0F172A' }}>{t.title}</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>📅 {t.start_date} → {t.end_date} • ${t.total_budget}</div>
                      <div style={{ fontSize: '11.5px', color: t.status === 'Active' ? '#EC4899' : '#0D9488', fontWeight: 700, marginTop: '2px' }}>
                        ● {t.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Message User (Retained per request: "not remove the message thing") */}
      {/* ========================================================================= */}
      {userToMessage && (
        <div className="modal-overlay" onClick={() => setUserToMessage(null)}>
          <div className="modal-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close-btn" onClick={() => setUserToMessage(null)}>✕</button>
            <div className="modal-icon-badge" style={{ background: '#EFF6FF', color: '#2563EB' }}>
              ✉️
            </div>
            <h2 className="modal-title">Dispatch Alert to {userToMessage.name}</h2>
            <p className="modal-desc">
              Send a priority notification directly to this traveler. They will receive it in their top navbar notification bell.
            </p>

            <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">NOTIFICATION TITLE / SUBJECT</label>
                <input
                  type="text"
                  className="form-input"
                  value={messageTitle}
                  onChange={(e) => setMessageTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">SELECT BADGE ICON</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['✈️', '📍', '🎉', '⚠️', '⭐', '🏨'].map(ic => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setMessageIcon(ic)}
                      style={{
                        fontSize: '20px',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        border: messageIcon === ic ? '2px solid #2563EB' : '1px solid #E2E8F0',
                        background: messageIcon === ic ? '#EFF6FF' : '#FFFFFF',
                        cursor: 'pointer'
                      }}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">MESSAGE CONTENT</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: '90px', resize: 'vertical' }}
                  placeholder="e.g. Your personal chauffeur has been dispatched for tomorrow morning's Mehrangarh tour..."
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-plan-budget"
                style={{
                  background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)'
                }}
              >
                Send Notification to User Box
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: Confirm Delete User                                             */}
      {/* ========================================================================= */}
      {userToDelete && (
        <div className="modal-overlay" onClick={() => setUserToDelete(null)}>
          <div className="modal-card" style={{ maxWidth: '440px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-badge" style={{ background: '#FEF2F2', color: '#EF4444', margin: '0 auto 16px' }}>
              🗑️
            </div>
            <h2 className="modal-title">Delete Traveler Account?</h2>
            <p className="modal-desc">
              Are you sure you want to permanently delete <strong>{userToDelete.name}</strong> (#{userToDelete.id})? This action will remove all saved itineraries.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                style={{ flex: 1, padding: '10px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.2)', background: 'rgba(255, 255, 255, 0.08)', color: '#CBD5E1', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                style={{ flex: 1, padding: '10px', borderRadius: '12px', border: 'none', background: '#EF4444', color: '#FFFFFF', fontWeight: 800, cursor: 'pointer' }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: Post & Schedule New Trip                                        */}
      {/* ========================================================================= */}
      {showScheduleModal && (
        <div className="modal-overlay" onClick={() => setShowScheduleModal(false)} style={{ zIndex: 1000, padding: '20px' }}>
          <div
            className="modal-card"
            style={{
              maxWidth: '720px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: '24px',
              padding: '28px 32px',
              margin: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setShowScheduleModal(false)}
              style={{ top: '22px', right: '22px' }}
            >
              ✕
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(244, 63, 94, 0.12)',
                  color: '#F43F5E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: 800
                }}
              >
                📅
              </div>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
                  Post & Schedule Trip Package
                </h2>
                <p style={{ fontSize: '12.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                  Admin tool: Publish package immediately or set an automated launch schedule.
                </p>
              </div>
            </div>

            <form onSubmit={handleScheduleTrip} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Trip Title */}
              <div className="form-group">
                <label className="form-label">TRIP TITLE</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Royal Golden Triangle & Desert Odyssey"
                  value={tripTitle}
                  onChange={(e) => setTripTitle(e.target.value)}
                  required
                />
              </div>

              {/* 2-Column Balanced Section: Details & Cover Photo */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', alignItems: 'start' }}>
                {/* Left Column: Description, Dates, Budget */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">DESCRIPTION</label>
                    <textarea
                      className="form-input"
                      rows={3}
                      style={{ resize: 'none', height: '72px' }}
                      placeholder="Overview of curated package stops & highlights..."
                      value={tripDesc}
                      onChange={(e) => setTripDesc(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="form-group">
                      <label className="form-label">START DATE</label>
                      <input
                        type="date"
                        className="form-input"
                        value={tripStartDate}
                        onChange={(e) => setTripStartDate(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">END DATE</label>
                      <input
                        type="date"
                        className="form-input"
                        value={tripEndDate}
                        onChange={(e) => setTripEndDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">BUDGET (USD)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={tripBudget}
                      onChange={(e) => setTripBudget(Number(e.target.value))}
                    />
                  </div>
                </div>

                {/* Right Column: Cover Photo Upload from PC */}
                <div className="form-group" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>COVER PHOTO (UPLOAD FROM PC)</span>
                    {tripCover && (
                      <span style={{ fontSize: '11px', color: '#0D9488', fontWeight: 700 }}>
                        ✓ Photo Ready
                      </span>
                    )}
                  </label>

                  <div style={{
                    border: '1.5px dashed #CBD5E1',
                    borderRadius: '14px',
                    padding: '12px',
                    background: '#F8FAFC',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    flex: 1
                  }}>
                    {tripCover && (
                      <div style={{ position: 'relative', width: '100%', height: '115px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                        <img
                          src={tripCover}
                          alt="Trip Cover Preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
                          display: 'flex',
                          alignItems: 'flex-end',
                          justifyContent: 'space-between',
                          padding: '8px 10px'
                        }}>
                          <span style={{ color: '#FFFFFF', fontSize: '11px', fontWeight: 700 }}>
                            📸 Preview
                          </span>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <label
                              htmlFor="admin-trip-photo-upload"
                              style={{
                                background: '#FFFFFF',
                                color: '#0F172A',
                                padding: '3px 10px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                              }}
                            >
                              Change
                            </label>
                            <button
                              type="button"
                              onClick={() => setTripCover('https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&w=1200&q=80')}
                              style={{
                                background: 'rgba(239, 68, 68, 0.9)',
                                color: '#FFFFFF',
                                border: 'none',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                              title="Reset to default photo"
                            >
                              Reset
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <input
                        type="file"
                        id="admin-trip-photo-upload"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 8 * 1024 * 1024) {
                              alert('Photo file size must be under 8MB');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (reader.result) setTripCover(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <label
                        htmlFor="admin-trip-photo-upload"
                        style={{
                          background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
                          color: '#FFFFFF',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 8px rgba(13, 148, 136, 0.25)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <span>Upload Cover from PC</span>
                      </label>
                      <span style={{ fontSize: '11px', color: '#64748B', textAlign: 'center' }}>
                        PNG, JPG, WebP up to 8MB from computer
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Publishing Mode */}
              <div className="form-group" style={{ marginTop: '2px' }}>
                <label className="form-label">PUBLISHING MODE</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setScheduleStatus('immediate')}
                    style={{
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: scheduleStatus === 'immediate' ? '2px solid #0D9488' : '1px solid #CBD5E1',
                      background: scheduleStatus === 'immediate' ? '#F0FDFA' : '#FFFFFF',
                      color: scheduleStatus === 'immediate' ? '#0D9488' : '#64748B',
                      fontWeight: 700,
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>⚡ Publish Immediately</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleStatus('scheduled')}
                    style={{
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: scheduleStatus === 'scheduled' ? '2px solid #E11D48' : '1px solid #CBD5E1',
                      background: scheduleStatus === 'scheduled' ? '#FFF1F2' : '#FFFFFF',
                      color: scheduleStatus === 'scheduled' ? '#E11D48' : '#64748B',
                      fontWeight: 700,
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>📅 Schedule Date & Time</span>
                  </button>
                </div>
              </div>

              {scheduleStatus === 'scheduled' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#F8FAFC', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div className="form-group">
                    <label className="form-label">SCHEDULE RELEASE DATE</label>
                    <input
                      type="date"
                      className="form-input"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">SCHEDULE RELEASE TIME</label>
                    <input
                      type="time"
                      className="form-input"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons: Cancel and Submit */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #E2E8F0', paddingTop: '16px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#64748B',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 24px',
                    borderRadius: '10px',
                    border: 'none',
                    background: scheduleStatus === 'immediate'
                      ? 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)'
                      : 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {scheduleStatus === 'immediate' ? '⚡ Post & Dispatch Trip Now' : '📅 Schedule Package Launch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Admin Profile & Mission Control Settings */}
      {/* ========================================================================= */}
      {showAdminSettingsModal && (
        <div className="modal-overlay" onClick={() => setShowAdminSettingsModal(false)} style={{ zIndex: 1000 }}>
          <div
            className="modal-card"
            style={{
              maxWidth: '680px',
              width: '95%',
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: '24px',
              padding: '28px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  color: '#fff',
                  boxShadow: '0 8px 18px rgba(13, 148, 136, 0.35)'
                }}>
                  ⚙️
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
                    Mission Control & Profile Settings
                  </h2>
                  <p style={{ fontSize: '12.5px', color: '#64748B', margin: '3px 0 0 0' }}>
                    Manage commander identity and global broadcasts
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowAdminSettingsModal(false)}
                style={{ top: '24px', right: '24px' }}
              >
                ✕
              </button>
            </div>

            {/* Navigation Tab Bar inside Settings */}
            <div style={{
              display: 'flex',
              gap: '6px',
              background: '#F1F5F9',
              padding: '5px',
              borderRadius: '12px',
              marginBottom: '24px'
            }}>
              {[
                { id: 'profile', label: 'Admin Profile', icon: '👤' },
                { id: 'broadcast', label: 'Global Broadcast', icon: '📢' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setAdminSettingsTab(tab.id as any)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    background: adminSettingsTab === tab.id ? '#FFFFFF' : 'transparent',
                    color: adminSettingsTab === tab.id ? '#0D9488' : '#64748B',
                    boxShadow: adminSettingsTab === tab.id ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* TAB 1: ADMIN PROFILE SETTINGS */}
            {adminSettingsTab === 'profile' && (
              <form onSubmit={handleSaveAdminProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Avatar section - strictly Upload from PC only */}
                <div>
                  <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>
                    COMMANDER AVATAR IDENTITY (UPLOAD FROM PC ONLY)
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    padding: '16px',
                    background: '#F8FAFC',
                    borderRadius: '16px',
                    border: '1.5px dashed #CBD5E1'
                  }}>
                    <div style={{ position: 'relative', width: '82px', height: '82px', flexShrink: 0 }}>
                      <img
                        src={editAdminAvatar}
                        alt={editAdminName}
                        style={{
                          width: '82px',
                          height: '82px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '3px solid #0D9488',
                          boxShadow: '0 4px 14px rgba(13, 148, 136, 0.25)'
                        }}
                      />
                      <span style={{
                        position: 'absolute',
                        bottom: '2px',
                        right: '2px',
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        background: '#10B981',
                        border: '2px solid #FFFFFF'
                      }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          type="file"
                          id="admin-pc-avatar-upload"
                          accept="image/png, image/jpeg, image/jpg, image/webp"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 5 * 1024 * 1024) {
                                alert('Image file size must be under 5MB');
                                return;
                              }
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                if (reader.result) setEditAdminAvatar(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <label
                          htmlFor="admin-pc-avatar-upload"
                          style={{
                            background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
                            color: '#FFFFFF',
                            padding: '10px 18px',
                            borderRadius: '10px',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 12px rgba(13, 148, 136, 0.25)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                          <span>Upload from PC</span>
                        </label>

                        {editAdminAvatar && (
                          <button
                            type="button"
                            onClick={() => setEditAdminAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80')}
                            style={{
                              background: '#FFFFFF',
                              color: '#64748B',
                              border: '1px solid #CBD5E1',
                              padding: '10px 14px',
                              borderRadius: '10px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                            title="Reset to default avatar"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                      <span style={{ fontSize: '11.5px', color: '#64748B' }}>
                        PNG, JPG, or WebP up to 5MB directly from your PC
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">ADMIN DISPLAY NAME</label>
                    <div className="input-container">
                      <input
                        type="text"
                        className="form-input"
                        value={editAdminName}
                        onChange={(e) => setEditAdminName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">HEADQUARTERS / BASE CORRIDOR</label>
                    <div className="input-container">
                      <input
                        type="text"
                        className="form-input"
                        value={editAdminCountry}
                        onChange={(e) => setEditAdminCountry(e.target.value)}
                        placeholder="Global HQ, Command Base..."
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">MISSION CONTROL EMAIL</label>
                  <div className="input-container" style={{ background: '#F8FAFC', opacity: 0.85 }}>
                    <input
                      type="email"
                      className="form-input"
                      value={editAdminEmail}
                      disabled
                      readOnly
                    />
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                    Super Administrator access identifier (Root HQ)
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">COMMAND DIRECTIVE & BIO</label>
                  <div className="input-container" style={{ height: 'auto', padding: '10px 14px' }}>
                    <textarea
                      className="form-input"
                      rows={3}
                      value={editAdminBio}
                      onChange={(e) => setEditAdminBio(e.target.value)}
                      placeholder="Write your mission clearance notes or platform bio..."
                      style={{ resize: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
                  <button
                    type="button"
                    onClick={() => setShowAdminSettingsModal(false)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      background: '#FFFFFF',
                      color: '#475569',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingAdminProfile}
                    style={{
                      padding: '10px 24px',
                      borderRadius: '10px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      cursor: savingAdminProfile ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)'
                    }}
                  >
                    {savingAdminProfile ? 'Saving Changes...' : 'Save Profile Settings'}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: GLOBAL BROADCAST ANNOUNCEMENT */}
            {adminSettingsTab === 'broadcast' && (
              <form onSubmit={handleSendBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{
                  padding: '14px 18px',
                  borderRadius: '14px',
                  background: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '24px' }}>📢</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '13.5px', color: '#1E40AF' }}>
                      Dispatch Urgent Broadcast to All Active Voyagers
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#2563EB' }}>
                      This message will be instantly delivered to every registered traveler's notification bell with acoustic priority.
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">CHOOSE BROADCAST ICON</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {['📢', '✈️', '⚠️', '🌟', '🏖️', '🚨', '🗺️', '🔔'].map((ic) => (
                      <button
                        key={ic}
                        type="button"
                        onClick={() => setBroadcastIcon(ic)}
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          border: broadcastIcon === ic ? '2.5px solid #0D9488' : '1px solid #CBD5E1',
                          background: broadcastIcon === ic ? '#F0FDFA' : '#FFFFFF',
                          fontSize: '18px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {ic}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">BROADCAST TITLE</label>
                  <div className="input-container">
                    <input
                      type="text"
                      className="form-input"
                      value={broadcastTitle}
                      onChange={(e) => setBroadcastTitle(e.target.value)}
                      placeholder="e.g., Airspace Advisory, Monsoon Season Guidance..."
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">BROADCAST MESSAGE BODY</label>
                  <div className="input-container" style={{ height: 'auto', padding: '10px 14px' }}>
                    <textarea
                      className="form-input"
                      rows={4}
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      placeholder="Provide comprehensive updates, advisory information, or welcoming statements..."
                      style={{ resize: 'none' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
                  <button
                    type="button"
                    onClick={() => setShowAdminSettingsModal(false)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      background: '#FFFFFF',
                      color: '#475569',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingBroadcast}
                    style={{
                      padding: '10px 24px',
                      borderRadius: '10px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      cursor: sendingBroadcast ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                    }}
                  >
                    {sendingBroadcast ? 'Broadcasting...' : '📢 Dispatch Broadcast Now'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      </main>
    </>
  );
};
