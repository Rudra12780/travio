import React, { useState, useEffect } from 'react';
import { Trip, ActiveTab } from '../types';
import { api } from '../api';
import { GlobalSearchBar } from './GlobalSearchBar';

interface Props {
  tripId?: number;
  userId?: number;
  onNavigate: (tab: ActiveTab, tripId?: number) => void;
  onShareClick: (trip: Trip) => void;
}

export const ItineraryView: React.FC<Props> = ({ tripId, userId = 1, onNavigate, onShareClick }) => {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'cities'>('timeline');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('Default');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedSort, setSelectedSort] = useState('Default');
  const [allUserTrips, setAllUserTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadData = async () => {
      try {
        if (tripId) {
          const res = await api.getTrip(tripId);
          if (isMounted && res.trip) {
            setTrip(res.trip);
          }
          const userTripsRes = await api.getTrips(userId);
          if (isMounted) setAllUserTrips(userTripsRes.trips || []);
        } else {
          // If no specific tripId (e.g. clicked Live Trip in navbar)
          let res = await api.getTrips(userId).catch(() => ({ trips: [] }));
          let list = res.trips || [];

          // If current user has no trips yet, fall back to available trips in database
          if (list.length === 0) {
            const fallbackRes = await api.getTrips(3).catch(() => ({ trips: [] }));
            list = fallbackRes.trips || [];
          }

          if (isMounted) setAllUserTrips(list);

          if (list.length > 0) {
            const target = list.find((t: Trip) => t.status === 'Active') || list[0];
            const detailRes = await api.getTrip(target.id);
            if (isMounted && detailRes.trip) {
              setTrip(detailRes.trip);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load itinerary:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [tripId, userId]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <div className="spinner" style={{ margin: '0 auto 16px', borderTopColor: '#8178E8' }} />
        <p style={{ color: '#777584', fontSize: '14px', fontWeight: 600 }}>Loading voyage telemetry & itinerary...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div style={{
        marginTop: '28px',
        background: '#FFFFFF',
        borderRadius: '24px',
        border: '1.5px solid #E8E2F0',
        padding: '54px 32px',
        textAlign: 'center',
        boxShadow: '0 8px 30px rgba(32, 63, 112, 0.05)'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(247, 191, 213, 0.25) 0%, rgba(195, 154, 217, 0.25) 100%)',
          color: '#8178E8',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          marginBottom: '18px'
        }}>
          🛰️
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#292833', margin: '0 0 8px 0' }}>
          No Active Voyage Found
        </h2>
        <p style={{ fontSize: '14px', color: '#777584', maxWidth: '460px', margin: '0 auto 24px', lineHeight: 1.6 }}>
          You don't currently have an expedition scheduled. Plan a new voyage or pick a destination to initiate live satellite telemetry tracking.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={() => onNavigate('my-trips')}
            style={{
              padding: '12px 24px',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, #8178E8 0%, #A678BD 100%)',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '13.5px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(129, 120, 232, 0.3)'
            }}
          >
            ✈️ Go to My Trips
          </button>
          <button
            type="button"
            onClick={() => onNavigate('cities')}
            style={{
              padding: '12px 20px',
              borderRadius: '12px',
              background: '#F8FAFC',
              color: '#334155',
              border: '1px solid #CBD5E1',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Explore Destinations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', marginBottom: '4px' }}>
            Live Voyage Telemetry & Itinerary
          </h2>
          <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0 }}>
            Real-time itinerary tracking, waypoint schedules, and expense telemetries
          </p>
        </div>

        {allUserTrips.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#64748B' }}>Select Voyage:</span>
            <select
              value={trip.id}
              onChange={(e) => {
                const targetId = Number(e.target.value);
                api.getTrip(targetId).then(r => { if (r.trip) setTrip(r.trip); });
              }}
              style={{
                padding: '7px 12px',
                borderRadius: '10px',
                border: '1.5px solid #CBD5E1',
                fontSize: '13px',
                fontWeight: 700,
                color: '#0F172A',
                background: '#FFFFFF',
                cursor: 'pointer'
              }}
            >
              {allUserTrips.map(t => (
                <option key={t.id} value={t.id}>{t.title} ({t.status})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <GlobalSearchBar
        placeholder="Search bar ....."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        groupByOptions={['Default', 'By Day', 'By Cost']}
        filterOptions={['All', 'Sightseeing', 'Adventure', 'Culture']}
        sortByOptions={['Chronological', 'Cost (Low to High)', 'Cost (High to Low)']}
        selectedGroup={selectedGroup}
        onGroupChange={setSelectedGroup}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        selectedSort={selectedSort}
        onSortChange={setSelectedSort}
      />

      {/* Itinerary Header Banner */}
      <div style={{
        position: 'relative',
        height: '240px',
        borderRadius: '24px',
        overflow: 'hidden',
        marginBottom: '28px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
      }}>
        <img
          src={trip.cover_image}
          alt={trip.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(17,24,39,0.3) 0%, rgba(17,24,39,0.85) 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '32px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span style={{
                background: 'linear-gradient(135deg, #8178E8 0%, #A678BD 100%)',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 800,
                padding: '5px 12px',
                borderRadius: '8px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                boxShadow: '0 4px 12px rgba(129, 120, 232, 0.3)'
              }}>
                VOYAGE ITINERARY
              </span>
              <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#FFFFFF', marginTop: '8px', letterSpacing: '-0.5px' }}>
                {trip.title}
              </h1>
              <p style={{ fontSize: '14.5px', color: '#FAF9FC', marginTop: '4px' }}>
                📅 {trip.start_date} → {trip.end_date} • {trip.stops?.length || 0} Destinations • Total Budget: ${trip.total_budget}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => onShareClick(trip)}
                style={{
                  background: '#FFFFFF',
                  color: '#292833',
                  border: '1.5px solid #E8E2F0',
                  borderRadius: '9999px',
                  padding: '10px 20px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(32, 63, 112, 0.08)'
                }}
              >
                <span>Share Trip</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  background: 'rgba(255,255,255,0.18)',
                  backdropFilter: 'blur(8px)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '9999px',
                  padding: '10px 20px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Print Plan 🖨️
              </button>

              <button
                type="button"
                className="btn-plan-budget"
                onClick={() => onNavigate('itinerary-builder', trip.id)}
              >
                Edit in Builder ✏️
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        background: '#FFFFFF',
        padding: '14px 22px',
        borderRadius: '20px',
        border: '1.5px solid #E8E2F0',
        boxShadow: '0 4px 18px rgba(32, 63, 112, 0.04)'
      }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#292833' }}>
          Estimated Investment: <strong style={{ color: '#8178E8' }}>${trip.summary?.totalEstimated || 0}</strong> of ${trip.total_budget} budget
        </div>

        <div style={{ display: 'flex', background: '#FAF9FC', borderRadius: '12px', padding: '4px', border: '1px solid #E8E2F0' }}>
          <button
            type="button"
            onClick={() => setViewMode('timeline')}
            style={{
              background: viewMode === 'timeline' ? '#FFFFFF' : 'transparent',
              color: viewMode === 'timeline' ? '#8178E8' : '#777584',
              boxShadow: viewMode === 'timeline' ? '0 2px 8px rgba(32, 63, 112, 0.08)' : 'none',
              border: 'none',
              borderRadius: '9px',
              padding: '6px 16px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Timeline Mode
          </button>
          <button
            type="button"
            onClick={() => setViewMode('cities')}
            style={{
              background: viewMode === 'cities' ? '#FFFFFF' : 'transparent',
              color: viewMode === 'cities' ? '#8178E8' : '#777584',
              boxShadow: viewMode === 'cities' ? '0 2px 8px rgba(32, 63, 112, 0.08)' : 'none',
              border: 'none',
              borderRadius: '9px',
              padding: '6px 16px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Grouped by Cities
          </button>
        </div>
      </div>

      {/* Stops Representation */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {trip.stops?.map((stop, sIdx) => (
          <div
            key={stop.id}
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              border: '1.5px solid #E8E2F0',
              overflow: 'hidden',
              boxShadow: '0 8px 30px rgba(32, 63, 112, 0.04)'
            }}
          >
            {/* City Stop Header */}
            <div style={{
              background: 'linear-gradient(90deg, #FAF9FC 0%, #FFFFFF 100%)',
              borderBottom: '1.5px solid #E8E2F0',
              padding: '20px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #8178E8 0%, #A678BD 100%)',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(129, 120, 232, 0.25)'
                }}>
                  {sIdx + 1}
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#292833' }}>
                    {stop.city_name}, {stop.city_country}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#777584' }}>
                    📅 {stop.start_date} → {stop.end_date} • Transit: {stop.transit_mode} • Stay: ${stop.stay_cost}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{
                  background: 'linear-gradient(135deg, rgba(247, 191, 213, 0.2) 0%, rgba(195, 154, 217, 0.2) 100%)',
                  color: '#203F70',
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  border: '1px solid #E8E2F0'
                }}>
                  {stop.climate || 'Sunny & Pleasant'}
                </span>
              </div>
            </div>

            {/* Activities Timeline */}
            <div style={{ padding: '24px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#203F70', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
                Day Schedule & Experiences
              </h4>

              {(!stop.activities || stop.activities.length === 0) ? (
                <p style={{ fontSize: '13.5px', color: '#777584', fontStyle: 'italic' }}>
                  Open exploration day. No scheduled activities booked yet.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {stop.activities.map((act, aIdx) => (
                    <div
                      key={act.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 20px',
                        background: '#FAF9FC',
                        borderRadius: '16px',
                        border: '1.5px solid #E8E2F0',
                        gap: '16px',
                        flexWrap: 'wrap'
                      }}
                    >
                      {/* Day Pill */}
                      <div style={{
                        background: 'linear-gradient(135deg, #203F70 0%, #192B4D 100%)',
                        color: '#F7BFD5',
                        fontWeight: 800,
                        fontSize: '12px',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        minWidth: '60px',
                        textAlign: 'center'
                      }}>
                        Day {aIdx + 1}
                      </div>

                      {/* Physical Activity Card */}
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <p style={{ fontSize: '15px', fontWeight: 800, color: '#292833', margin: 0 }}>
                          {act.custom_title}
                        </p>
                        <p style={{ fontSize: '12px', color: '#777584', margin: '4px 0 0 0' }}>
                          Physical Activity • {act.scheduled_time || '10:00'} • {act.category || 'Sightseeing'}
                        </p>
                      </div>

                      {/* Flow Arrow */}
                      <div style={{ color: '#8178E8', fontSize: '20px', fontWeight: 900 }}>
                        ──→
                      </div>

                      {/* Expense */}
                      <div style={{
                        background: '#FFFFFF',
                        border: '1.5px solid #E8E2F0',
                        borderRadius: '12px',
                        padding: '8px 16px',
                        textAlign: 'right',
                        minWidth: '100px',
                        boxShadow: '0 2px 8px rgba(32, 63, 112, 0.04)'
                      }}>
                        <span style={{ fontSize: '11px', color: '#777584', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Expense</span>
                        <span style={{ fontSize: '16px', fontWeight: 800, color: '#203F70' }}>${act.cost}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
