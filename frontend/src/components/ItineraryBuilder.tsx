import React, { useState, useEffect } from 'react';
import { Trip, City, Stop, Activity, ActiveTab } from '../types';
import { api } from '../api';

interface Props {
  selectedTripId?: number;
  userId?: number;
  onNavigate: (tab: ActiveTab, tripId?: number) => void;
}

export const ItineraryBuilder: React.FC<Props> = ({ selectedTripId, userId = 1, onNavigate }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [currentTripId, setCurrentTripId] = useState<number | undefined>(selectedTripId);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Stop Modal State
  const [showAddStopModal, setShowAddStopModal] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState<number>(1);
  const [stopStartDate, setStopStartDate] = useState('');
  const [stopEndDate, setStopEndDate] = useState('');
  const [transitMode, setTransitMode] = useState('Flight');
  const [stayCost, setStayCost] = useState(140);
  const [stopNotes, setStopNotes] = useState('');

  // Add Activity Modal State
  const [activeStopIdForActivity, setActiveStopIdForActivity] = useState<number | null>(null);
  const [availableActivities, setAvailableActivities] = useState<Activity[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState<number | ''>('');
  const [customActTitle, setCustomActTitle] = useState('');
  const [actDate, setActDate] = useState('');
  const [actTime, setActTime] = useState('10:00');
  const [actCost, setActCost] = useState(25);

  const loadTripData = (id: number) => {
    setLoading(true);
    api.getTrip(id)
      .then(res => {
        setTrip(res.trip);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    api.getTrips(userId).then(res => {
      setTrips(res.trips);
      const chosenId = selectedTripId || (res.trips[0] ? res.trips[0].id : undefined);
      setCurrentTripId(chosenId);
      if (chosenId) loadTripData(chosenId);
    });

    api.getCities().then(res => {
      setCities(res.cities);
      if (res.cities.length > 0) setSelectedCityId(res.cities[0].id);
    });
  }, [userId, selectedTripId]);

  const handleTripChange = (id: number) => {
    setCurrentTripId(id);
    loadTripData(id);
  };

  const handleAddStop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTripId) return;

    try {
      await api.addStop(currentTripId, {
        city_id: selectedCityId,
        start_date: stopStartDate || (trip ? trip.start_date : '2026-10-01'),
        end_date: stopEndDate || (trip ? trip.end_date : '2026-10-03'),
        transit_mode: transitMode,
        stay_cost: Number(stayCost) || 120,
        notes: stopNotes
      });
      setShowAddStopModal(false);
      loadTripData(currentTripId);
    } catch (err: any) {
      alert(err.message || 'Could not add stop');
    }
  };

  const handleDeleteStop = async (stopId: number) => {
    if (window.confirm('Are you sure you want to remove this stop from your itinerary?')) {
      try {
        await api.deleteStop(stopId);
        if (currentTripId) loadTripData(currentTripId);
      } catch (err: any) {
        alert(err.message || 'Could not delete stop');
      }
    }
  };

  const handleMoveStop = async (index: number, direction: 'up' | 'down') => {
    if (!trip?.stops || !currentTripId) return;
    const stopsList = [...trip.stops];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= stopsList.length) return;

    // Swap
    const temp = stopsList[index];
    stopsList[index] = stopsList[targetIdx];
    stopsList[targetIdx] = temp;

    const orderedIds = stopsList.map(s => s.id);
    try {
      await api.reorderStops(currentTripId, orderedIds);
      loadTripData(currentTripId);
    } catch (err: any) {
      alert(err.message || 'Could not reorder');
    }
  };

  const openAddActivity = (stop: Stop) => {
    setActiveStopIdForActivity(stop.id);
    setActDate(stop.start_date);
    // Fetch activities for that city
    api.getActivities({ cityId: stop.city_id }).then(res => {
      setAvailableActivities(res.activities);
      if (res.activities.length > 0) {
        setSelectedActivityId(res.activities[0].id);
        setCustomActTitle(res.activities[0].name);
        setActCost(res.activities[0].cost);
      } else {
        setSelectedActivityId('');
        setCustomActTitle('Guided City Walk');
        setActCost(25);
      }
    });
  };

  const handleAddActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStopIdForActivity) return;

    try {
      await api.addStopActivity(activeStopIdForActivity, {
        activity_id: selectedActivityId ? Number(selectedActivityId) : undefined,
        custom_title: customActTitle,
        scheduled_date: actDate,
        scheduled_time: actTime,
        cost: Number(actCost) || 0
      });
      setActiveStopIdForActivity(null);
      if (currentTripId) loadTripData(currentTripId);
    } catch (err: any) {
      alert(err.message || 'Could not add activity');
    }
  };

  const handleDeleteActivity = async (actId: number) => {
    try {
      await api.deleteStopActivity(actId);
      if (currentTripId) loadTripData(currentTripId);
    } catch (err: any) {
      alert(err.message || 'Could not remove activity');
    }
  };

  if (!trip) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h3>No Trip Selected</h3>
        <p style={{ color: '#64748B', marginBottom: '20px' }}>Select an existing trip or plan a new one.</p>
        <button type="button" className="btn-plan-budget" onClick={() => onNavigate('my-trips')} style={{ margin: '0 auto' }}>
          <span>View My Trips</span>
        </button>
      </div>
    );
  }

  const transitIcons: Record<string, string> = {
    Flight: '✈️',
    Car: '🚗',
    Train: '🚆',
    Bus: '🚌',
    Boat: '⛵'
  };

  return (
    <div style={{ marginTop: '24px' }}>
      {/* Top Controls: Trip Selector & Summary */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '28px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '280px' }}>
          <img
            src={trip.cover_image}
            alt={trip.title}
            style={{ width: '64px', height: '64px', borderRadius: '16px', objectFit: 'cover' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <select
                value={currentTripId}
                onChange={(e) => handleTripChange(Number(e.target.value))}
                style={{
                  fontSize: '20px',
                  fontWeight: 900,
                  color: '#111827',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  outline: 'none',
                  maxWidth: '380px'
                }}
              >
                {trips.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
            <p style={{ fontSize: '13.5px', color: '#64748B' }}>
              {trip.start_date} → {trip.end_date} • Budget: ${trip.total_budget} • {trip.stops?.length || 0} Destination Stops
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            type="button"
            className="btn-plan-budget"
            onClick={() => {
              setStopStartDate(trip.start_date);
              setStopEndDate(trip.end_date);
              setShowAddStopModal(true);
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            <span>Add City Stop</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('itinerary-view', trip.id)}
            style={{
              background: '#F1F5F9',
              color: '#1E293B',
              border: '1px solid #CBD5E1',
              borderRadius: '9999px',
              padding: '12px 20px',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Preview Timeline 👁️
          </button>
        </div>
      </div>

      {/* Interactive Stops Flow */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {(!trip.stops || trip.stops.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>🗺️</div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>No stops added to this itinerary yet</h3>
            <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '20px' }}>Click "Add City Stop" above to choose your first destination.</p>
          </div>
        ) : (
          trip.stops.map((stop, idx) => (
            <div
              key={stop.id}
              style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                border: '1.5px solid #E2E8F0',
                padding: '24px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                position: 'relative'
              }}
            >
              {/* Stop Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: '#0D9488',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {idx + 1}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111827' }}>Section {idx + 1}: {stop.city_name}</h3>
                      <span style={{ fontSize: '12px', background: '#F1F5F9', color: '#475569', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                        {stop.city_country}
                      </span>
                      <span style={{ fontSize: '12px', background: '#E6FFFA', color: '#0D9488', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        {transitIcons[stop.transit_mode] || '🚗'} {stop.transit_mode} Transit
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
                      Date Range: {stop.start_date} to {stop.end_date} • Budget of this section: ${stop.stay_cost}
                    </p>
                  </div>
                </div>

                {/* Move & Delete Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    title="Move stop up"
                    disabled={idx === 0}
                    onClick={() => handleMoveStop(idx, 'up')}
                    style={{
                      background: '#F1F5F9',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      cursor: idx === 0 ? 'not-allowed' : 'pointer',
                      opacity: idx === 0 ? 0.4 : 1
                    }}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    title="Move stop down"
                    disabled={idx === (trip.stops?.length || 0) - 1}
                    onClick={() => handleMoveStop(idx, 'down')}
                    style={{
                      background: '#F1F5F9',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      cursor: idx === (trip.stops?.length || 0) - 1 ? 'not-allowed' : 'pointer',
                      opacity: idx === (trip.stops?.length || 0) - 1 ? 0.4 : 1
                    }}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    title="Remove stop"
                    onClick={() => handleDeleteStop(stop.id)}
                    style={{
                      background: '#FFF1F2',
                      color: '#E11D48',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontWeight: 700
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Scheduled Activities for this Stop */}
              <div style={{ background: '#F8FAFC', borderRadius: '14px', padding: '16px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Scheduled Stop Activities ({stop.activities?.length || 0})
                  </span>
                  <button
                    type="button"
                    onClick={() => openAddActivity(stop)}
                    style={{
                      background: '#0D9488',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '5px 12px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    + Add Activity
                  </button>
                </div>

                {(!stop.activities || stop.activities.length === 0) ? (
                  <p style={{ fontSize: '13px', color: '#94A3B8', fontStyle: 'italic' }}>
                    No activities scheduled yet for {stop.city_name}. Click "+ Add Activity" to browse recommendations.
                  </p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
                    {stop.activities.map(act => (
                      <div
                        key={act.id}
                        style={{
                          background: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          borderRadius: '10px',
                          padding: '10px 14px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <p style={{ fontSize: '13.5px', fontWeight: 700, color: '#111827' }}>{act.custom_title}</p>
                          <p style={{ fontSize: '11.5px', color: '#64748B' }}>
                            ⏰ {act.scheduled_time} • ${act.cost} {act.category ? `• ${act.category}` : ''}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteActivity(act.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#94A3B8',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Screen 5: + Add another Section button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <button
            type="button"
            className="btn-plan-budget"
            onClick={() => {
              setStopStartDate(trip.start_date || '2026-10-15');
              setStopEndDate(trip.end_date || '2026-10-25');
              setShowAddStopModal(true);
            }}
            style={{ padding: '12px 28px', fontSize: '15px', borderRadius: '12px' }}
          >
            + Add another Section
          </button>
        </div>
      </div>

      {/* Add Stop Modal */}
      {showAddStopModal && (
        <div className="modal-overlay" onClick={() => setShowAddStopModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close-btn" onClick={() => setShowAddStopModal(false)}>✕</button>
            <h2 className="modal-title">Add Destination Stop</h2>
            <p className="modal-desc">Select a global city and configure arrival dates & transit.</p>

            <form onSubmit={handleAddStop} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">CHOOSE CITY</label>
                <div className="input-container">
                  <select
                    className="form-input"
                    value={selectedCityId}
                    onChange={(e) => setSelectedCityId(Number(e.target.value))}
                    required
                  >
                    {cities.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.country}) - ${c.avg_cost_per_day}/day</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">ARRIVAL DATE</label>
                  <div className="input-container">
                    <input
                      type="date"
                      className="form-input"
                      value={stopStartDate}
                      onChange={(e) => setStopStartDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">DEPARTURE DATE</label>
                  <div className="input-container">
                    <input
                      type="date"
                      className="form-input"
                      value={stopEndDate}
                      onChange={(e) => setStopEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">TRANSIT MODE</label>
                  <div className="input-container">
                    <select
                      className="form-input"
                      value={transitMode}
                      onChange={(e) => setTransitMode(e.target.value)}
                    >
                      <option value="Flight">✈️ Flight</option>
                      <option value="Car">🚗 Chauffeured Car</option>
                      <option value="Train">🚆 Scenic Train</option>
                      <option value="Bus">🚌 Luxury Coach</option>
                      <option value="Boat">⛵ Cruise / Ferry</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">STAY COST ($)</label>
                  <div className="input-container">
                    <input
                      type="number"
                      className="form-input"
                      value={stayCost}
                      onChange={(e) => setStayCost(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">NOTES / LODGING</label>
                <div className="input-container">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Heritage Haveli or Central Suite"
                    value={stopNotes}
                    onChange={(e) => setStopNotes(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn-submit" style={{ marginTop: '8px' }}>
                <span>Add Stop to Itinerary</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Activity Modal */}
      {activeStopIdForActivity !== null && (
        <div className="modal-overlay" onClick={() => setActiveStopIdForActivity(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close-btn" onClick={() => setActiveStopIdForActivity(null)}>✕</button>
            <h2 className="modal-title">Schedule Activity</h2>
            <p className="modal-desc">Assign a sightseeing tour or adventure to this stop.</p>

            <form onSubmit={handleAddActivitySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {availableActivities.length > 0 && (
                <div className="form-group">
                  <label className="form-label">RECOMMENDED EXPERIENCES</label>
                  <div className="input-container">
                    <select
                      className="form-input"
                      value={selectedActivityId}
                      onChange={(e) => {
                        const actId = Number(e.target.value);
                        setSelectedActivityId(actId);
                        const found = availableActivities.find(a => a.id === actId);
                        if (found) {
                          setCustomActTitle(found.name);
                          setActCost(found.cost);
                        }
                      }}
                    >
                      {availableActivities.map(a => (
                        <option key={a.id} value={a.id}>{a.name} (${a.cost} • {a.duration_hours}h)</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">ACTIVITY NAME / TITLE</label>
                <div className="input-container">
                  <input
                    type="text"
                    className="form-input"
                    value={customActTitle}
                    onChange={(e) => setCustomActTitle(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">TIME SLOT</label>
                  <div className="input-container">
                    <input
                      type="time"
                      className="form-input"
                      value={actTime}
                      onChange={(e) => setActTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">ESTIMATED COST ($)</label>
                  <div className="input-container">
                    <input
                      type="number"
                      className="form-input"
                      value={actCost}
                      onChange={(e) => setActCost(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-submit" style={{ marginTop: '8px' }}>
                <span>Confirm Activity</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
