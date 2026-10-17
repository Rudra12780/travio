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
    <div style={{ marginTop: '24px' }}>
      {/* Title */}
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#292833', letterSpacing: '-0.5px', margin: '0 0 6px 0' }}>
          Curated Activities & Experiences
        </h2>
        <p style={{ fontSize: '13.5px', color: '#777584', margin: 0 }}>
          Discover curated activities, desert safaris, food walks, and heritage monuments
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

      <div style={{ fontSize: '16px', fontWeight: 800, color: '#292833', margin: '20px 0 12px 0' }}>
        Recommended Experiences
      </div>

      {/* Activities Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="spinner" style={{ margin: '0 auto 16px', borderTopColor: '#8178E8' }} />
          <p style={{ color: '#777584' }}>Loading experiences catalog...</p>
        </div>
      ) : activities.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FFFFFF', borderRadius: '24px', border: '1.5px solid #E8E2F0' }}>
          <p style={{ color: '#777584' }}>No experiences found matching this filter.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {activities.map(act => (
            <div
              key={act.id}
              style={{
                background: '#FFFFFF',
                borderRadius: '24px',
                border: '1.5px solid #E8E2F0',
                overflow: 'hidden',
                boxShadow: '0 8px 30px rgba(32, 63, 112, 0.05)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ position: 'relative', height: '180px' }}>
                <img
                  src={act.image_url}
                  alt={act.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: 'rgba(25, 43, 77, 0.75)',
                  backdropFilter: 'blur(8px)',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '9999px'
                }}>
                  {act.category}
                </span>

                <span style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: '#FFFFFF',
                  color: '#A678BD',
                  fontSize: '11.5px',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '9999px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                }}>
                  ★ {act.rating}
                </span>

                <span style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  background: 'linear-gradient(135deg, rgba(247, 191, 213, 0.9) 0%, rgba(195, 154, 217, 0.9) 100%)',
                  color: '#203F70',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  border: '1px solid #E8E2F0'
                }}>
                  📍 {act.city_name}, {act.city_country}
                </span>
              </div>

              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#292833', marginBottom: '8px' }}>
                  {act.name}
                </h3>
                <p style={{ fontSize: '13px', color: '#777584', lineHeight: '1.45', marginBottom: '16px' }}>
                  {act.description}
                </p>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '12px',
                  borderTop: '1px solid #E8E2F0',
                  marginTop: 'auto'
                }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#777584', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                      ⏱️ {act.duration_hours} Hours
                    </span>
                    <span style={{ fontSize: '17px', fontWeight: 800, color: '#203F70' }}>${act.cost}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setTargetActivity(act)}
                    style={{
                      background: 'linear-gradient(135deg, #8178E8 0%, #A678BD 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '9999px',
                      padding: '8px 18px',
                      fontSize: '13px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(129, 120, 232, 0.25)'
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
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close-btn" onClick={() => setTargetActivity(null)}>✕</button>
            <h2 className="modal-title">Schedule Experience</h2>
            <p className="modal-desc">
              Add <strong>{targetActivity.name}</strong> (${targetActivity.cost}) to an itinerary stop.
            </p>

            <form onSubmit={handleAddActivityToStop} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">CHOOSE TRIP</label>
                <div className="input-container">
                  <select
                    className="form-input"
                    value={selectedTripId}
                    onChange={(e) => handleTripSelectChange(Number(e.target.value))}
                    required
                  >
                    {trips.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">ASSIGN TO DESTINATION STOP</label>
                <div className="input-container">
                  {tripStops.length === 0 ? (
                    <span style={{ fontSize: '13px', color: '#EF4444', padding: '10px' }}>No stops in this trip. Add a stop first.</span>
                  ) : (
                    <select
                      className="form-input"
                      value={selectedStopId}
                      onChange={(e) => setSelectedStopId(Number(e.target.value))}
                      required
                    >
                      {tripStops.map(s => (
                        <option key={s.id} value={s.id}>Stop {s.order_index}: {s.city_name} ({s.start_date})</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">SCHEDULE TIME</label>
                <div className="input-container">
                  <input
                    type="time"
                    className="form-input"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-submit"
                disabled={tripStops.length === 0}
                style={{ marginTop: '8px', opacity: tripStops.length === 0 ? 0.5 : 1 }}
              >
                <span>Confirm Experience</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
