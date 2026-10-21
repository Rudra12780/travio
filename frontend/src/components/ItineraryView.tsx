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
          let res = await api.getTrips(userId).catch(() => ({ trips: [] }));
          let list = res.trips || [];

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
        <div className="spinner" style={{ margin: '0 auto 16px', borderTopColor: '#101010' }} />
        <p style={{ color: '#101010', fontSize: '14px', fontWeight: 800 }}>Loading voyage telemetry & magazine dossier...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div style={{
        marginTop: '28px',
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '2px solid #101010',
        padding: '54px 32px',
        textAlign: 'center',
        boxShadow: '4px 4px 0px #101010'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: '#FFD84D',
          border: '2px solid #101010',
          color: '#101010',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          marginBottom: '18px',
          boxShadow: '3px 3px 0px #101010'
        }}>
          🛰️
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#101010', margin: '0 0 8px 0' }}>
          No Active Voyage Found
        </h2>
        <p style={{ fontSize: '14px', color: '#555555', maxWidth: '460px', margin: '0 auto 24px', lineHeight: 1.6 }}>
          You don't currently have an expedition scheduled. Plan a new voyage or pick a destination to initiate editorial timeline tracking.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => onNavigate('my-trips')}
            style={{
              padding: '12px 24px',
              borderRadius: '10px',
              background: '#FFD84D',
              color: '#101010',
              border: '2px solid #101010',
              fontSize: '13px',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '3px 3px 0px #101010',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            ✈️ Go to My Trips
          </button>
          <button
            type="button"
            onClick={() => onNavigate('cities')}
            style={{
              padding: '12px 20px',
              borderRadius: '10px',
              background: '#FFFFFF',
              color: '#101010',
              border: '2px solid #101010',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '3px 3px 0px #101010'
            }}
          >
            Explore Destinations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '20px', paddingBottom: '60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.12em', color: '#101010', textTransform: 'uppercase', display: 'inline-block', marginBottom: '6px' }}>
            EDITORIAL DOSSIER
          </span>
          <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#101010', marginBottom: '4px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
            Voyage Timeline & Daily Dossier
          </h2>
          <p style={{ fontSize: '14px', color: '#555555', margin: 0 }}>
            Day-by-day scheduled chronicles, destination waypoints, and expense telemetry.
          </p>
        </div>

        {allUserTrips.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#101010', textTransform: 'uppercase' }}>Select Voyage:</span>
            <select
              value={trip.id}
              onChange={(e) => {
                const targetId = Number(e.target.value);
                api.getTrip(targetId).then(r => { if (r.trip) setTrip(r.trip); });
              }}
              style={{
                padding: '9px 14px',
                borderRadius: '10px',
                border: '2px solid #101010',
                fontSize: '13px',
                fontWeight: 800,
                color: '#101010',
                background: '#FFFFFF',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: '2px 2px 0px #101010'
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
        placeholder="Search itinerary activities or stops..."
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
        height: '260px',
        borderRadius: '16px',
        overflow: 'hidden',
        marginBottom: '28px',
        boxShadow: '4px 4px 0px #101010',
        border: '2px solid #101010'
      }}>
        <img
          src={trip.cover_image}
          alt={trip.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(16, 16, 16, 0.25) 0%, rgba(16, 16, 16, 0.9) 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '28px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span style={{
                background: '#FFD84D',
                color: '#101010',
                border: '1.5px solid #101010',
                fontSize: '11px',
                fontWeight: 900,
                padding: '4px 10px',
                borderRadius: '6px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}>
                VOYAGE ITINERARY
              </span>
              <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#FFFFFF', marginTop: '8px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
                {trip.title}
              </h1>
              <p style={{ fontSize: '14px', color: '#FFFFFF', marginTop: '4px', fontWeight: 500, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                📅 {trip.start_date} → {trip.end_date} • {trip.stops?.length || 0} Destinations • <strong style={{ color: '#FFD84D', fontWeight: 900 }}>Budget: ${trip.total_budget}</strong>
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => onShareClick(trip)}
                style={{
                  background: '#FFFFFF',
                  color: '#101010',
                  border: '2px solid #101010',
                  borderRadius: '10px',
                  padding: '9px 18px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '2px 2px 0px #101010'
                }}
              >
                <span>Share</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  background: '#FFFFFF',
                  color: '#101010',
                  border: '2px solid #101010',
                  borderRadius: '10px',
                  padding: '9px 18px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '2px 2px 0px #101010'
                }}
              >
                Print 🖨️
              </button>

              <button
                type="button"
                onClick={() => onNavigate('itinerary-builder', trip.id)}
                style={{
                  background: '#FFD84D',
                  color: '#101010',
                  border: '2px solid #101010',
                  borderRadius: '10px',
                  padding: '9px 20px',
                  fontSize: '12.5px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '2px 2px 0px #101010',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
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
        borderRadius: '12px',
        border: '2px solid #101010',
        boxShadow: '3px 3px 0px #101010',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#101010' }}>
          Estimated Investment: <strong style={{ color: '#101010', fontSize: '15px', fontWeight: 900 }}>${trip.summary?.totalEstimated || 0}</strong> of ${trip.total_budget} budget
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setViewMode('timeline')}
            style={{
              background: viewMode === 'timeline' ? '#FFD84D' : '#FFFFFF',
              color: '#101010',
              border: '2px solid #101010',
              borderRadius: '8px',
              padding: '6px 16px',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: viewMode === 'timeline' ? '2px 2px 0px #101010' : 'none'
            }}
          >
            Timeline Mode
          </button>
          <button
            type="button"
            onClick={() => setViewMode('cities')}
            style={{
              background: viewMode === 'cities' ? '#FFD84D' : '#FFFFFF',
              color: '#101010',
              border: '2px solid #101010',
              borderRadius: '8px',
              padding: '6px 16px',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: viewMode === 'cities' ? '2px 2px 0px #101010' : 'none'
            }}
          >
            Grouped by Cities
          </button>
        </div>
      </div>

      {/* Stops Representation */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {trip.stops?.map((stop, sIdx) => (
          <div
            key={stop.id}
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '2px solid #101010',
              overflow: 'hidden',
              boxShadow: '4px 4px 0px #101010'
            }}
          >
            {/* City Stop Header */}
            <div style={{
              background: '#F7F6F2',
              borderBottom: '2px solid #101010',
              padding: '18px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: '#FFD84D',
                  color: '#101010',
                  fontWeight: 900,
                  fontSize: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #101010',
                  boxShadow: '2px 2px 0px #101010'
                }}>
                  {sIdx + 1}
                </div>
                <div>
                  <h3 style={{ fontSize: '19px', fontWeight: 900, color: '#101010', margin: 0 }}>
                    {stop.city_name}, {stop.city_country}
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#555555', margin: '3px 0 0' }}>
                    📅 {stop.start_date} → {stop.end_date} • Transit: {stop.transit_mode} • Stay: <strong>${stop.stay_cost}</strong>
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{
                  background: '#429FE8',
                  color: '#101010',
                  fontSize: '11px',
                  fontWeight: 900,
                  padding: '4px 10px',
                  borderRadius: '999px',
                  border: '1.5px solid #101010'
                }}>
                  {stop.climate || 'Sunny & Pleasant'}
                </span>
              </div>
            </div>

            {/* Activities Timeline */}
            <div style={{ padding: '24px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: 900, color: '#101010', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
                SCHEDULED ACTIVITIES & EXPERIENCES
              </h4>

              {(!stop.activities || stop.activities.length === 0) ? (
                <p style={{ fontSize: '13px', color: '#777777', fontStyle: 'italic', margin: 0, padding: '12px', background: '#F7F6F2', borderRadius: '8px', border: '1.5px dashed #101010' }}>
                  Open exploration day. No scheduled activities booked yet.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {stop.activities.map((act, aIdx) => (
                    <div
                      key={act.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 18px',
                        background: '#F7F6F2',
                        borderRadius: '12px',
                        border: '1.5px solid #101010',
                        gap: '16px',
                        flexWrap: 'wrap'
                      }}
                    >
                      {/* Day Pill */}
                      <div style={{
                        background: '#FFD84D',
                        color: '#101010',
                        fontWeight: 900,
                        fontSize: '11.5px',
                        padding: '5px 12px',
                        borderRadius: '6px',
                        minWidth: '55px',
                        textAlign: 'center',
                        border: '1.5px solid #101010'
                      }}>
                        Day {aIdx + 1}
                      </div>

                      {/* Physical Activity Card */}
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <p style={{ fontSize: '15px', fontWeight: 900, color: '#101010', margin: 0 }}>
                          {act.custom_title}
                        </p>
                        <p style={{ fontSize: '12px', color: '#555555', margin: '3px 0 0 0' }}>
                          Experience • {act.scheduled_time || '10:00'} • {act.category || 'Sightseeing'}
                        </p>
                      </div>

                      {/* Flow Arrow */}
                      <div style={{ color: '#101010', fontSize: '18px', fontWeight: 900 }}>
                        ──→
                      </div>

                      {/* Expense */}
                      <div style={{
                        background: '#FFFFFF',
                        border: '1.5px solid #101010',
                        borderRadius: '8px',
                        padding: '6px 14px',
                        textAlign: 'right',
                        minWidth: '90px',
                        boxShadow: '2px 2px 0px #101010'
                      }}>
                        <span style={{ fontSize: '10px', color: '#555555', display: 'block', textTransform: 'uppercase', fontWeight: 800 }}>Expense</span>
                        <span style={{ fontSize: '15px', fontWeight: 900, color: '#101010' }}>${act.cost}</span>
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
