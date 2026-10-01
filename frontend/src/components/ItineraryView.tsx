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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tripId) {
      api.getTrip(tripId).then(res => {
        setTrip(res.trip);
        setLoading(false);
      }).catch(console.error);
    } else {
      api.getTrips(userId).then(res => {
        if (res.trips.length > 0) {
          api.getTrip(res.trips[0].id).then(tRes => {
            setTrip(tRes.trip);
            setLoading(false);
          });
        }
      });
    }
  }, [tripId, userId]);

  if (loading || !trip) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <div className="spinner" style={{ margin: '0 auto 16px', borderTopColor: '#0D9488' }} />
        <p>Loading full voyage itinerary...</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '20px' }}>
      {/* Screen 9 Wireframe Header & Search */}
      <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', marginBottom: '4px' }}>
        Itenary View Screenn with budget section (Screen 9)
      </h2>
      <p style={{ fontSize: '13.5px', color: '#64748B', margin: '0 0 14px 0' }}>
        Itinerary for a selected place with flow from physical activities to expenses
      </p>

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
                background: '#0D9488',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: '6px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}>
                VOYAGE ITINERARY
              </span>
              <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#FFFFFF', marginTop: '8px', letterSpacing: '-0.5px' }}>
                {trip.title}
              </h1>
              <p style={{ fontSize: '14.5px', color: '#CBD5E1', marginTop: '4px' }}>
                📅 {trip.start_date} → {trip.end_date} • {trip.stops?.length || 0} Destinations • Total Budget: ${trip.total_budget}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => onShareClick(trip)}
                style={{
                  background: '#FFFFFF',
                  color: '#111827',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '10px 20px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Share Trip</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  background: 'rgba(255,255,255,0.15)',
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
        padding: '12px 20px',
        borderRadius: '16px',
        border: '1px solid #E2E8F0'
      }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>
          Estimated Investment: <strong style={{ color: '#0D9488' }}>${trip.summary?.totalEstimated || 0}</strong> of ${trip.total_budget} budget
        </div>

        <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: '10px', padding: '3px' }}>
          <button
            type="button"
            onClick={() => setViewMode('timeline')}
            style={{
              background: viewMode === 'timeline' ? '#FFFFFF' : 'transparent',
              color: viewMode === 'timeline' ? '#0D9488' : '#64748B',
              boxShadow: viewMode === 'timeline' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '13px',
              fontWeight: 700,
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
              color: viewMode === 'cities' ? '#0D9488' : '#64748B',
              boxShadow: viewMode === 'cities' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '13px',
              fontWeight: 700,
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
              borderRadius: '20px',
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
            }}
          >
            {/* City Stop Header */}
            <div style={{
              background: 'linear-gradient(90deg, #F8FAFC 0%, #FFFFFF 100%)',
              borderBottom: '1px solid #E2E8F0',
              padding: '20px 24px',
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
                  borderRadius: '10px',
                  background: '#0D9488',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {sIdx + 1}
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#111827' }}>
                    {stop.city_name}, {stop.city_country}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748B' }}>
                    📅 {stop.start_date} → {stop.end_date} • Transit: {stop.transit_mode} • Stay: ${stop.stay_cost}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{
                  background: '#E6FFFA',
                  color: '#0D9488',
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '9999px'
                }}>
                  {stop.climate || 'Sunny & Pleasant'}
                </span>
              </div>
            </div>

            {/* Activities Timeline */}
            <div style={{ padding: '24px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
                Day Schedule & Experiences
              </h4>

              {(!stop.activities || stop.activities.length === 0) ? (
                <p style={{ fontSize: '13.5px', color: '#94A3B8', fontStyle: 'italic' }}>
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
                        background: '#F8FAFC',
                        borderRadius: '14px',
                        border: '1.5px solid #E2E8F0',
                        gap: '16px',
                        flexWrap: 'wrap'
                      }}
                    >
                      {/* Day Pill */}
                      <div style={{
                        background: '#0F172A',
                        color: '#2DD4BF',
                        fontWeight: 800,
                        fontSize: '12px',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        minWidth: '60px',
                        textAlign: 'center'
                      }}>
                        Day {aIdx + 1}
                      </div>

                      {/* Physical Activity Card (Screen 9) */}
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <p style={{ fontSize: '15px', fontWeight: 800, color: '#111827', margin: 0 }}>
                          {act.custom_title}
                        </p>
                        <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 0 0' }}>
                          Physical Activity • {act.scheduled_time || '10:00'} • {act.category || 'Sightseeing'}
                        </p>
                      </div>

                      {/* Flow Arrow (Screen 9) */}
                      <div style={{ color: '#0D9488', fontSize: '20px', fontWeight: 900 }}>
                        ──→
                      </div>

                      {/* Expense (Screen 9) */}
                      <div style={{
                        background: '#FFFFFF',
                        border: '1.5px solid #CBD5E1',
                        borderRadius: '10px',
                        padding: '8px 16px',
                        textAlign: 'right',
                        minWidth: '100px'
                      }}>
                        <span style={{ fontSize: '11px', color: '#64748B', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Expense</span>
                        <span style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>${act.cost}</span>
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
