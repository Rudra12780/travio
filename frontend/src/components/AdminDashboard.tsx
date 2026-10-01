import React, { useState, useEffect } from 'react';
import { AdminStats, UserProfile, Trip, City, Activity } from '../types';
import { api } from '../api';
import { GlobalSearchBar } from './GlobalSearchBar';

interface Props {
  onRedirectToUser: (targetUser: UserProfile) => void;
  onAdminSignOut: () => void;
}

type AdminTab = 'manage-users' | 'popular-cities' | 'popular-activities' | 'user-trends';

export const AdminDashboard: React.FC<Props> = ({ onRedirectToUser, onAdminSignOut }) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div style={{ marginTop: '20px', maxWidth: '1240px', margin: '20px auto 40px' }}>
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

      {/* Screen 12 Header: GlobalTrotter & Profile Circle */}
      <div style={{
        background: '#0F172A',
        borderRadius: '24px',
        padding: '24px 30px',
        color: '#FFFFFF',
        marginBottom: '20px',
        border: '1.5px solid #1E293B',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0D9488 0%, #2DD4BF 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                color: '#FFFFFF',
                fontSize: '18px'
              }}>
                G
              </div>
              <h1 style={{ fontSize: '26px', fontWeight: 900, letterSpacing: '-0.5px', margin: 0 }}>
                GlobalTrotter
              </h1>
              <span style={{
                background: 'rgba(45, 212, 191, 0.15)',
                color: '#2DD4BF',
                fontSize: '11px',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: '999px',
                border: '1px solid rgba(45, 212, 191, 0.3)'
              }}>
                ADMIN PANEL / SCREEN 12
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#94A3B8', margin: '6px 0 0 0' }}>
              Management of users, trips, popular cities, trending activities, and comprehensive user trends analysis
            </p>
          </div>

          {/* Right Action Icons & Profile Circle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              type="button"
              onClick={() => setShowScheduleModal(true)}
              style={{
                background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '999px',
                padding: '9px 18px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(13, 148, 136, 0.35)'
              }}
            >
              <span>+ Post & Schedule Trip</span>
            </button>

            <button
              type="button"
              onClick={onAdminSignOut}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#F87171',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '999px',
                padding: '9px 16px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Sign Out
            </button>

            {/* Profile Avatar Circle from Screen 12 Wireframe */}
            <div 
              title="Admin Commander Profile"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: '#1E293B',
                border: '2px solid #2DD4BF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                overflow: 'hidden'
              }}
            >
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" 
                alt="Admin" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>

        {/* Global Search & Action Bar (Screen 12 Wireframe) */}
        <div style={{ marginTop: '20px' }}>
          <GlobalSearchBar
            placeholder="Search bar ....."
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

        {/* Sub-Navigation Tabs from Screen 12 Wireframe */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginTop: '18px',
          flexWrap: 'wrap',
          borderTop: '1px solid #1E293B',
          paddingTop: '16px'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('manage-users')}
            style={{
              padding: '10px 20px',
              borderRadius: '999px',
              border: activeTab === 'manage-users' ? '1.5px solid #2DD4BF' : '1px solid #334155',
              background: activeTab === 'manage-users' ? 'rgba(45, 212, 191, 0.15)' : 'transparent',
              color: activeTab === 'manage-users' ? '#2DD4BF' : '#94A3B8',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Manage Users
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('popular-cities')}
            style={{
              padding: '10px 20px',
              borderRadius: '999px',
              border: activeTab === 'popular-cities' ? '1.5px solid #2DD4BF' : '1px solid #334155',
              background: activeTab === 'popular-cities' ? 'rgba(45, 212, 191, 0.15)' : 'transparent',
              color: activeTab === 'popular-cities' ? '#2DD4BF' : '#94A3B8',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Popular cities
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('popular-activities')}
            style={{
              padding: '10px 20px',
              borderRadius: '999px',
              border: activeTab === 'popular-activities' ? '1.5px solid #2DD4BF' : '1px solid #334155',
              background: activeTab === 'popular-activities' ? 'rgba(45, 212, 191, 0.15)' : 'transparent',
              color: activeTab === 'popular-activities' ? '#2DD4BF' : '#94A3B8',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Popular Activites
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('user-trends')}
            style={{
              padding: '10px 20px',
              borderRadius: '999px',
              border: activeTab === 'user-trends' ? '1.5px solid #2DD4BF' : '1px solid #334155',
              background: activeTab === 'user-trends' ? 'rgba(45, 212, 191, 0.15)' : 'transparent',
              color: activeTab === 'user-trends' ? '#2DD4BF' : '#94A3B8',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            User Trends and Analytics
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MANAGE USERS (Screen 12 - Manage User Section)                    */}
      {/* ========================================================================= */}
      {activeTab === 'manage-users' && (
        <div style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid #E2E8F0',
          padding: '28px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Manage User Section
              </h2>
              <p style={{ fontSize: '13.5px', color: '#64748B', margin: '4px 0 0 0' }}>
                Responsible for managing users and their actions. Admin has access to view all trips made by the user, send direct notifications, or manage accounts.
              </p>
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0D9488', background: '#F0FDFA', padding: '6px 14px', borderRadius: '999px' }}>
              {filteredUsers.length} Active Travelers
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid #E2E8F0', color: '#64748B', fontSize: '11.5px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 14px' }}>User</th>
                  <th style={{ padding: '12px 14px' }}>Email Address</th>
                  <th style={{ padding: '12px 14px' }}>Role</th>
                  <th style={{ padding: '12px 14px' }}>Trips Count</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions & Controls</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px', fontWeight: 700, color: '#0F172A' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          background: '#E2E8F0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          color: '#475569',
                          fontSize: '13px'
                        }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div>{u.name}</div>
                          <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 400 }}>ID #{u.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px', color: '#475569' }}>{u.email}</td>
                    <td style={{ padding: '14px' }}>
                      <span style={{
                        background: u.role === 'Admin' ? 'rgba(79, 70, 229, 0.1)' : '#E6FFFA',
                        color: u.role === 'Admin' ? '#4F46E5' : '#0D9488',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '11.5px',
                        fontWeight: 700
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '14px', fontWeight: 700, color: '#0F172A' }}>
                      <span style={{ color: '#0D9488' }}>{u.trips_count || 1} voyages</span>
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {/* View User Trips button (Screen 12 wireframe requirement) */}
                        <button
                          type="button"
                          onClick={() => handleViewUserTrips(u)}
                          style={{
                            background: '#F1F5F9',
                            color: '#334155',
                            border: '1px solid #CBD5E1',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          👁️ View Trips
                        </button>

                        {/* Message Traveler button (Kept per request: "not remove the message thing") */}
                        <button
                          type="button"
                          onClick={() => {
                            setUserToMessage(u);
                            setMessageTitle(`Voyage Alert for ${u.name}`);
                          }}
                          style={{
                            background: '#EFF6FF',
                            color: '#2563EB',
                            border: '1px solid #BFDBFE',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          ✉️ Message
                        </button>

                        {/* Redirect to User Session */}
                        <button
                          type="button"
                          onClick={() => onRedirectToUser(u)}
                          style={{
                            background: '#F0FDFA',
                            color: '#0D9488',
                            border: '1px solid #99F6E4',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          🚪 Login As
                        </button>

                        {/* Delete User button */}
                        {u.role !== 'Admin' && (
                          <button
                            type="button"
                            onClick={() => setUserToDelete(u)}
                            style={{
                              background: '#FEF2F2',
                              color: '#EF4444',
                              border: '1px solid #FECACA',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer'
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
        <div style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid #E2E8F0',
          padding: '28px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Popular cities Section
            </h2>
            <p style={{ fontSize: '13.5px', color: '#64748B', margin: '4px 0 0 0' }}>
              Lists all the popular cities where users are visiting based on current user trend data and booking frequency.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {cities.map((city, idx) => (
              <div 
                key={city.id}
                style={{
                  borderRadius: '18px',
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden',
                  background: '#FFFFFF',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  transition: 'transform 0.2s'
                }}
              >
                <div style={{ height: '140px', position: 'relative' }}>
                  <img src={city.image_url} alt={city.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: '#0F172A',
                    color: '#2DD4BF',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '6px'
                  }}>
                    #{idx + 1} TRENDING
                  </span>
                  <span style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    background: 'rgba(0,0,0,0.7)',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '6px'
                  }}>
                    ${city.avg_cost_per_day}/day
                  </span>
                </div>
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: 0 }}>{city.name}</h3>
                    <span style={{ color: '#10B981', fontSize: '12.5px', fontWeight: 700 }}>+{20 + idx * 4}% visits</span>
                  </div>
                  <p style={{ fontSize: '12.5px', color: '#64748B', margin: '0 0 12px 0' }}>{city.country} • {city.region}</p>
                  <p style={{ fontSize: '12px', color: '#475569', lineClamp: 2, margin: '0 0 12px 0' }}>{city.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', borderTop: '1px solid #F1F5F9', paddingTop: '10px', color: '#64748B' }}>
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
        <div style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid #E2E8F0',
          padding: '28px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Popular Activites Section
            </h2>
            <p style={{ fontSize: '13.5px', color: '#64748B', margin: '4px 0 0 0' }}>
              Lists all the popular activities that users are booking and performing based on current user trend data.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {activities.map((act, idx) => (
              <div
                key={act.id}
                style={{
                  borderRadius: '18px',
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden',
                  background: '#FFFFFF',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{ height: '140px', position: 'relative' }}>
                  <img src={act.image_url} alt={act.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: '#0D9488',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '6px'
                  }}>
                    {act.category}
                  </span>
                  <span style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    background: 'rgba(0,0,0,0.7)',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '6px'
                  }}>
                    ${act.cost}
                  </span>
                </div>
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>{act.name}</h3>
                    <span style={{ color: '#F59E0B', fontSize: '12.5px', fontWeight: 700 }}>⭐ {act.rating}</span>
                  </div>
                  <p style={{ fontSize: '12.5px', color: '#64748B', margin: '0 0 10px 0' }}>Duration: {act.duration_hours}h • Score: {95 - idx * 2}%</p>
                  <p style={{ fontSize: '12px', color: '#475569', margin: '0 0 12px 0' }}>{act.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '10px', fontSize: '12px', color: '#0D9488', fontWeight: 600 }}>
                    <span>👥 {120 + idx * 18} Travelers Joined</span>
                    <span>98% Positive Feedback</span>
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
        <div style={{
          background: '#FFFFFF',
          borderRadius: '28px',
          border: '1.5px solid #E2E8F0',
          padding: '36px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.06)'
        }}>
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              User Trends and Analytics
            </h2>
            <p style={{ fontSize: '13.5px', color: '#64748B', margin: '4px 0 0 0' }}>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                    <span>Solo Voyageurs</span>
                    <span>1,420 Users</span>
                  </div>
                  <div style={{ height: '8px', background: '#E2E8F0', borderRadius: '999px', marginTop: '6px', overflow: 'hidden' }}>
                    <div style={{ width: '42%', height: '100%', background: '#0D9488', borderRadius: '999px' }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 800 }}>
                  28%
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                    <span>Couples & Honeymoon</span>
                    <span>940 Users</span>
                  </div>
                  <div style={{ height: '8px', background: '#E2E8F0', borderRadius: '999px', marginTop: '6px', overflow: 'hidden' }}>
                    <div style={{ width: '28%', height: '100%', background: '#3B82F6', borderRadius: '999px' }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 800 }}>
                  18%
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                    <span>Family Expeditions</span>
                    <span>610 Users</span>
                  </div>
                  <div style={{ height: '8px', background: '#E2E8F0', borderRadius: '999px', marginTop: '6px', overflow: 'hidden' }}>
                    <div style={{ width: '18%', height: '100%', background: '#10B981', borderRadius: '999px' }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 800 }}>
                  12%
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                    <span>Corporate & Group Nomads</span>
                    <span>405 Users</span>
                  </div>
                  <div style={{ height: '8px', background: '#E2E8F0', borderRadius: '999px', marginTop: '6px', overflow: 'hidden' }}>
                    <div style={{ width: '12%', height: '100%', background: '#F59E0B', borderRadius: '999px' }} />
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
              background: '#F8FAFC',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: '14px' }}>
                Regional Preference Share
              </div>
              <svg width="180" height="180" viewBox="0 0 42 42">
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#E2E8F0" strokeWidth="6" />
                {/* Rajasthan / Heritage: 45% (teal) */}
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#0D9488" strokeWidth="6" strokeDasharray="45 55" strokeDashoffset="25" />
                {/* Kerala / Coastal: 25% (blue) */}
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#3B82F6" strokeWidth="6" strokeDasharray="25 75" strokeDashoffset="-20" />
                {/* Himalayas / Mountain: 20% (green) */}
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#10B981" strokeWidth="6" strokeDasharray="20 80" strokeDashoffset="-45" />
                {/* International: 10% (orange) */}
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#F59E0B" strokeWidth="6" strokeDasharray="10 90" strokeDashoffset="-65" />
              </svg>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '16px', fontSize: '11.5px', fontWeight: 600 }}>
                <span style={{ color: '#0D9488' }}>● Rajasthan (45%)</span>
                <span style={{ color: '#3B82F6' }}>● Kerala (25%)</span>
                <span style={{ color: '#10B981' }}>● Himalayas (20%)</span>
                <span style={{ color: '#F59E0B' }}>● Global (10%)</span>
              </div>
            </div>
          </div>

          {/* Middle: Line Chart (Screen 12 Wireframe) */}
          <div style={{
            background: '#F8FAFC',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid #E2E8F0',
            marginBottom: '32px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>Monthly Active Travelers Trend</span>
                <span style={{ fontSize: '12px', color: '#10B981', marginLeft: '8px', fontWeight: 700 }}>+34.2% YoY</span>
              </div>
              <span style={{ fontSize: '12px', color: '#64748B' }}>Telemetry Year 2026</span>
            </div>

            {/* Line chart visualization */}
            <div style={{ position: 'relative', height: '140px', width: '100%' }}>
              <svg viewBox="0 0 600 140" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0D9488" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#0D9488" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 20 110 Q 110 80 180 95 T 320 60 T 450 40 T 580 20 L 580 135 L 20 135 Z"
                  fill="url(#lineGrad)"
                />
                <path
                  d="M 20 110 Q 110 80 180 95 T 320 60 T 450 40 T 580 20"
                  fill="none"
                  stroke="#0D9488"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                {/* Connecting Red/Coral Dots from Wireframe */}
                <circle cx="20" cy="110" r="6" fill="#E11D48" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="110" cy="80" r="6" fill="#E11D48" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="180" cy="95" r="6" fill="#E11D48" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="320" cy="60" r="6" fill="#E11D48" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="450" cy="40" r="6" fill="#E11D48" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="580" cy="20" r="6" fill="#E11D48" stroke="#FFFFFF" strokeWidth="2" />
              </svg>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8', marginTop: '10px' }}>
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
              background: '#F8FAFC',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: '18px' }}>
                Quarterly Expedition Revenue & Bookings
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '140px', borderBottom: '1.5px solid #CBD5E1', paddingBottom: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#F97316' }}>$42k</span>
                  <div style={{ width: '36px', height: '55px', background: '#F97316', borderRadius: '6px 6px 0 0' }} />
                  <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Q1</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#F97316' }}>$68k</span>
                  <div style={{ width: '36px', height: '85px', background: '#F97316', borderRadius: '6px 6px 0 0' }} />
                  <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Q2</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#F97316' }}>$94k</span>
                  <div style={{ width: '36px', height: '115px', background: '#F97316', borderRadius: '6px 6px 0 0' }} />
                  <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Q3</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#F97316' }}>$128k</span>
                  <div style={{ width: '36px', height: '135px', background: '#F97316', borderRadius: '6px 6px 0 0' }} />
                  <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Q4</span>
                </div>
              </div>
            </div>

            {/* Bottom Right: Analytics Summary Rows from Wireframe */}
            <div style={{
              background: '#F8FAFC',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-around',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '13px', color: '#64748B' }}>Average Trip Duration</span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>6.8 Days</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '13px', color: '#64748B' }}>Average Budget per Voyager</span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#0D9488' }}>$2,450 USD</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '13px', color: '#64748B' }}>Repeat Booking Index</span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#10B981' }}>+41.8%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '13px', color: '#64748B' }}>Expedition Satisfaction Rate</span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#3B82F6' }}>98.6%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                <span style={{ fontSize: '13px', color: '#64748B' }}>Platform Retention</span>
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
                style={{ flex: 1, padding: '10px', borderRadius: '12px', border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}
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
        <div className="modal-overlay" onClick={() => setShowScheduleModal(false)}>
          <div className="modal-card" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close-btn" onClick={() => setShowScheduleModal(false)}>✕</button>
            <div className="modal-icon-badge" style={{ background: '#FFF1F2', color: '#E11D48' }}>
              📅
            </div>
            <h2 className="modal-title">Post & Schedule Trip Package</h2>
            <p className="modal-desc">
              Admin exclusive tool: Publish trip immediately or set automated launch date & time.
            </p>

            <form onSubmit={handleScheduleTrip} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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

              <div className="form-group">
                <label className="form-label">DESCRIPTION</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: '70px' }}
                  placeholder="Overview of the curated package stops and highlights..."
                  value={tripDesc}
                  onChange={(e) => setTripDesc(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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

              <div className="form-group">
                <label className="form-label">PUBLISHING MODE</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setScheduleStatus('immediate')}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '10px',
                      border: scheduleStatus === 'immediate' ? '2px solid #0D9488' : '1px solid #E2E8F0',
                      background: scheduleStatus === 'immediate' ? '#F0FDFA' : '#FFFFFF',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    ⚡ Publish Immediately
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleStatus('scheduled')}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '10px',
                      border: scheduleStatus === 'scheduled' ? '2px solid #E11D48' : '1px solid #E2E8F0',
                      background: scheduleStatus === 'scheduled' ? '#FFF1F2' : '#FFFFFF',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    📅 Schedule Date & Time
                  </button>
                </div>
              </div>

              {scheduleStatus === 'scheduled' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
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

              <button
                type="submit"
                className="btn-plan-budget"
                style={{
                  background: scheduleStatus === 'immediate'
                    ? 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)'
                    : 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
                }}
              >
                {scheduleStatus === 'immediate' ? 'Post Trip Now' : 'Schedule Trip Launch'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
