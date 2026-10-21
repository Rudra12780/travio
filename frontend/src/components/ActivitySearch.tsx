import React, { useState, useEffect } from 'react';
import { Activity, Trip, ActiveTab } from '../types';
import { api } from '../api';
import { GlobalSearchBar } from './GlobalSearchBar';

interface Props {
  userId?: number;
  onNavigate: (tab: ActiveTab, tripId?: number) => void;
}

export const ActivitySearch: React.FC<Props> = ({ userId = 1, onNavigate }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedSort, setSelectedSort] = useState('Popularity');
  const [selectedGroup, setSelectedGroup] = useState('Default');
  const [loading, setLoading] = useState(true);

  // Add Activity to Stop Modal
  const [targetActivity, setTargetActivity] = useState<Activity | null>(null);
  const [selectedTripId, setSelectedTripId] = useState<number>(1);
  const [tripStops, setTripStops] = useState<any[]>([]);
  const [selectedStopId, setSelectedStopId] = useState<number>(1);
  const [scheduledTime, setScheduledTime] = useState('10:00');

  useEffect(() => {
    setLoading(true);
    api.getActivities({ search: searchTerm, category: categoryFilter })
      .then(res => {
        setActivities(res.activities);
        setLoading(false);
      });

    api.getTrips(userId).then(res => {
      setTrips(res.trips);
      if (res.trips.length > 0) {
        setSelectedTripId(res.trips[0].id);
        loadStopsForTrip(res.trips[0].id);
      }
    });
  }, [searchTerm, categoryFilter, userId]);

  const loadStopsForTrip = (tripId: number) => {
    api.getTrip(tripId).then(res => {
      const stops = res.trip.stops || [];
      setTripStops(stops);
      if (stops.length > 0) setSelectedStopId(stops[0].id);
    });
  };

  const handleTripSelectChange = (id: number) => {
    setSelectedTripId(id);
    loadStopsForTrip(id);
  };

  const handleAddActivityToStop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetActivity || !selectedStopId) return;

    try {
      await api.addStopActivity(selectedStopId, {
        activity_id: targetActivity.id,
        custom_title: targetActivity.name,
        scheduled_time: scheduledTime,
        cost: targetActivity.cost
      });

      alert(`✅ Activity "${targetActivity.name}" scheduled!`);
      setTargetActivity(null);
      onNavigate('itinerary-builder', selectedTripId);
    } catch (err: any) {
      alert(err.message || 'Could not schedule activity');
    }
  };

  const categories = ['All', 'Sightseeing', 'Adventure', 'Culture', 'Food Tour', 'Nightlife'];

  return (
    <div style={{ marginTop: '24px', color: '#101010' }}>
      {/* Title */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#36B7B3', border: '1.5px solid #101010', borderRadius: '4px', padding: '2px 8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '10.5px', fontWeight: 900, color: '#101010', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            LOCAL EXPERIENCES // CURATED DISCOVERY
          </span>
        </div>
        <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#101010', letterSpacing: '-0.5px', margin: '0 0 6px 0', fontFamily: "'Syne', sans-serif" }}>
          Curated Activities & Experiences
        </h2>
        <p style={{ fontSize: '14px', color: '#555555', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Discover curated activities, desert safaris, aquatic charters, and heritage excursions
        </p>
      </div>

      {/* Global Search Bar */}
      <GlobalSearchBar
        placeholder="Search experiences, tours, or safaris..."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        groupByOptions={['Default', 'By Category', 'By Duration']}
        filterOptions={['All', 'Sightseeing', 'Adventure', 'Culture', 'Food Tour', 'Nightlife']}
        sortByOptions={['Popularity', 'Price (Low to High)', 'Price (High to Low)', 'Rating']}
        selectedGroup={selectedGroup}
        onGroupChange={setSelectedGroup}
        selectedFilter={categoryFilter}
        onFilterChange={setCategoryFilter}
        selectedSort={selectedSort}
        onSortChange={setSelectedSort}
      />

      <div style={{ fontSize: '16px', fontWeight: 900, color: '#101010', margin: '24px 0 14px 0', fontFamily: "'Syne', sans-serif" }}>
        Experiences Available ({activities.length})
      </div>

      {/* Activities Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#555555' }}>
          <div className="spinner" style={{ margin: '0 auto 16px', borderTopColor: '#101010' }} />
          <p style={{ color: '#555555', fontWeight: 700 }}>Loading experiences catalog...</p>
        </div>
      ) : activities.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', background: '#FFFFFF', borderRadius: '14px', border: '2px solid #101010', color: '#555555', boxShadow: '4px 4px 0px #101010' }}>
          <p style={{ color: '#555555', fontSize: '15px', fontWeight: 700, margin: 0 }}>No experiences found matching this filter.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {activities.map(act => (
            <div
              key={act.id}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '2px solid #101010',
                overflow: 'hidden',
                boxShadow: '4px 4px 0px #101010',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.15s ease'
              }}
            >
              <div style={{ position: 'relative', height: '190px', borderBottom: '2px solid #101010' }}>
                <img
                  src={act.image_url}
                  alt={act.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: '#36B7B3',
                  color: '#101010',
                  fontSize: '11px',
                  fontWeight: 900,
                  padding: '3px 10px',
                  borderRadius: '4px',
                  border: '1.5px solid #101010'
                }}>
                  {act.category}
                </span>

                <span style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: '#FFD84D',
                  border: '1.5px solid #101010',
                  color: '#101010',
                  fontSize: '11.5px',
                  fontWeight: 900,
                  padding: '3px 10px',
                  borderRadius: '4px',
                  boxShadow: '2px 2px 0px #101010'
                }}>
                  ★ {act.rating}
                </span>

                <span style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  background: '#FFFFFF',
                  color: '#101010',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '4px',
                  border: '1.5px solid #101010'
                }}>
                  📍 {act.city_name}, {act.city_country}
                </span>
              </div>

              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#101010', margin: '0 0 8px 0', fontFamily: "'Syne', sans-serif" }}>
                  {act.name}
                </h3>
                <p style={{ fontSize: '13px', color: '#555555', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                  {act.description}
                </p>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '14px',
                  borderTop: '1px solid #E8E6E0',
                  marginTop: 'auto'
                }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#555555', display: 'block', textTransform: 'uppercase', fontWeight: 800 }}>
                      ⏱️ {act.duration_hours} Hours
                    </span>
                    <span style={{ fontSize: '18px', fontWeight: 900, color: '#101010' }}>${act.cost}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setTargetActivity(act)}
                    style={{
                      background: '#FFD84D',
                      color: '#101010',
                      border: '1.5px solid #101010',
                      borderRadius: '6px',
                      padding: '9px 18px',
                      fontSize: '13px',
                      fontWeight: 900,
                      cursor: 'pointer',
                      boxShadow: '2px 2px 0px #101010',
                      transition: 'transform 0.15s ease'
                    }}
                  >
                    + Add to Stop
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Activity to Stop Modal */}
      {targetActivity && (
        <div className="modal-overlay" onClick={() => setTargetActivity(null)}>
          <div 
            className="modal-card" 
            style={{ 
              maxWidth: '480px', 
              padding: '28px', 
              background: '#FFFFFF', 
              border: '2px solid #101010', 
              borderRadius: '16px', 
              boxShadow: '6px 6px 0px #101010',
              color: '#101010'
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              type="button" 
              className="modal-close-btn" 
              onClick={() => setTargetActivity(null)} 
              style={{ color: '#101010', fontWeight: 800, fontSize: '16px' }}
            >
              ✕
            </button>
            <h2 className="modal-title" style={{ color: '#101010', fontFamily: "'Syne', sans-serif", fontSize: '20px', fontWeight: 900, margin: '0 0 6px 0' }}>Schedule Experience</h2>
            <p className="modal-desc" style={{ color: '#555555', fontSize: '13px', margin: '0 0 16px 0' }}>
              Add <strong style={{ color: '#101010' }}>{targetActivity.name}</strong> (<span style={{ color: '#429FE8', fontWeight: 800 }}>${targetActivity.cost}</span>) to an itinerary stop.
            </p>

            <form onSubmit={handleAddActivityToStop} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label" style={{ color: '#101010', fontSize: '11.5px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em' }}>CHOOSE TRIP</label>
                <div className="input-container">
                  <select
                    className="form-input"
                    value={selectedTripId}
                    onChange={(e) => handleTripSelectChange(Number(e.target.value))}
                    required
                    style={{ background: '#FFFFFF', color: '#101010', border: '1.5px solid #101010', borderRadius: '8px', padding: '10px 12px', width: '100%', fontSize: '13px', fontWeight: 700 }}
                  >
                    {trips.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: '#101010', fontSize: '11.5px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em' }}>ASSIGN TO DESTINATION STOP</label>
                <div className="input-container">
                  {tripStops.length === 0 ? (
                    <span style={{ fontSize: '13px', color: '#DC2626', padding: '10px', display: 'block', fontWeight: 700 }}>No stops in this trip. Add a stop first.</span>
                  ) : (
                    <select
                      className="form-input"
                      value={selectedStopId}
                      onChange={(e) => setSelectedStopId(Number(e.target.value))}
                      required
                      style={{ background: '#FFFFFF', color: '#101010', border: '1.5px solid #101010', borderRadius: '8px', padding: '10px 12px', width: '100%', fontSize: '13px', fontWeight: 700 }}
                    >
                      {tripStops.map(s => (
                        <option key={s.id} value={s.id}>Stop {s.order_index}: {s.city_name} ({s.start_date})</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: '#101010', fontSize: '11.5px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em' }}>SCHEDULE TIME</label>
                <div className="input-container">
                  <input
                    type="time"
                    className="form-input"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    style={{ background: '#FFFFFF', color: '#101010', border: '1.5px solid #101010', borderRadius: '8px', padding: '10px 12px', width: '100%', fontSize: '13px', fontWeight: 700 }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-submit"
                disabled={tripStops.length === 0}
                style={{
                  marginTop: '8px',
                  padding: '12px',
                  borderRadius: '8px',
                  background: '#101010',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 900,
                  cursor: tripStops.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: tripStops.length === 0 ? 0.5 : 1,
                  boxShadow: '3px 3px 0px #FFD84D'
                }}
              >
                <span>Confirm Experience ↗</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
