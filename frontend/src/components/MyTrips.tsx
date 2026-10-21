import React, { useState, useEffect } from 'react';
import { Trip, ActiveTab } from '../types';
import { api } from '../api';
import { GlobalSearchBar } from './GlobalSearchBar';

interface Props {
  userId?: number;
  onNavigate: (tab: ActiveTab, tripId?: number) => void;
  onPlanTripClick: () => void;
  onShareClick: (trip: Trip) => void;
}

export const MyTrips: React.FC<Props> = ({
  userId = 1,
  onNavigate,
  onPlanTripClick,
  onShareClick
}) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('Default');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedSort, setSelectedSort] = useState('Newest');
  const [loading, setLoading] = useState(true);

  const loadTrips = () => {
    setLoading(true);
    api.getTrips(userId)
      .then(res => {
        setTrips(res.trips);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadTrips();
  }, [userId]);

  const handleDelete = async (tripId: number, title: string) => {
    if (window.confirm(`Are you sure you want to delete the expedition "${title}"?`)) {
      try {
        await api.deleteTrip(tripId);
        loadTrips();
      } catch (err: any) {
        alert(err.message || 'Could not delete trip');
      }
    }
  };

  const filteredTrips = trips.filter(trip => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term || trip.title.toLowerCase().includes(term) ||
                          (trip.description && trip.description.toLowerCase().includes(term));
    const matchesFilter = selectedFilter === 'All' || trip.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const ongoingTrips = filteredTrips.filter(t => t.status === 'Active');
  const upcomingTrips = filteredTrips.filter(t => t.status === 'Planning');
  const completedTrips = filteredTrips.filter(t => t.status === 'Completed');

  const renderTripCard = (trip: Trip) => (
    <div
      key={trip.id}
      style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '2px solid #101010',
        overflow: 'hidden',
        boxShadow: '4px 4px 0px #101010',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translate(-2px, -2px)';
        e.currentTarget.style.boxShadow = '6px 6px 0px #101010';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = '4px 4px 0px #101010';
      }}
    >
      {/* Cover Image & Status Badge */}
      <div style={{ position: 'relative', height: '180px', borderBottom: '2px solid #101010' }}>
        <img
          src={trip.cover_image}
          alt={trip.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        <span style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          background: '#101010',
          color: '#FFFFFF',
          fontSize: '11px',
          fontWeight: 800,
          padding: '4px 10px',
          borderRadius: '999px',
          letterSpacing: '0.04em',
          textTransform: 'uppercase'
        }}>
          📍 {trip.stops_count || 0} Cities
        </span>

        <span style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: trip.status === 'Active' ? '#FFD84D' : trip.status === 'Planning' ? '#429FE8' : '#E8E6E0',
          color: '#101010',
          border: '1.5px solid #101010',
          fontSize: '10.5px',
          fontWeight: 900,
          padding: '4px 12px',
          borderRadius: '999px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          {trip.status}
        </span>
      </div>

      {/* Content */}
      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#101010', marginBottom: '8px', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
          {trip.title}
        </h3>
        <p style={{
          fontSize: '13px',
          color: '#555555',
          lineHeight: '1.5',
          marginBottom: '16px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {trip.description || 'Personalized multi-city route, verified stays, and curated adventure experiences.'}
        </p>

        {/* Date and Budget Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          color: '#101010',
          marginBottom: '16px',
          background: '#F7F6F2',
          border: '1.5px solid #101010',
          padding: '10px 14px',
          borderRadius: '10px',
          fontWeight: 600
        }}>
          <span>📅 {trip.start_date} → {trip.end_date}</span>
          <span style={{ fontWeight: 900, color: '#101010' }}>${trip.total_budget}</span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', borderTop: '1.5px solid #E8E6E0', paddingTop: '16px' }}>
          <button
            type="button"
            onClick={() => onNavigate('itinerary-builder', trip.id)}
            style={{
              flex: 1,
              padding: '10px 14px',
              fontSize: '12px',
              justifyContent: 'center',
              background: '#FFD84D',
              color: '#101010',
              fontWeight: 800,
              border: '2px solid #101010',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '2px 2px 0px #101010',
              transition: 'all 0.15s ease'
            }}
          >
            Edit Itinerary
          </button>

          <button
            type="button"
            onClick={() => onNavigate('itinerary-view', trip.id)}
            style={{
              padding: '10px 14px',
              fontSize: '12px',
              background: '#FFFFFF',
              color: '#101010',
              border: '2px solid #101010',
              borderRadius: '8px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '2px 2px 0px #101010',
              transition: 'all 0.15s ease'
            }}
          >
            Timeline
          </button>

          <button
            type="button"
            onClick={() => onShareClick(trip)}
            title="Share Trip"
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '2px solid #101010',
              background: '#FFFFFF',
              color: '#101010',
              cursor: 'pointer',
              boxShadow: '2px 2px 0px #101010',
              fontWeight: 800
            }}
          >
            🔗
          </button>

          <button
            type="button"
            onClick={() => handleDelete(trip.id, trip.title)}
            title="Delete Trip"
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '2px solid #101010',
              background: '#F4AFC1',
              color: '#101010',
              cursor: 'pointer',
              boxShadow: '2px 2px 0px #101010',
              fontWeight: 800
            }}
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ marginTop: '20px', paddingBottom: '60px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.12em', color: '#101010', textTransform: 'uppercase', display: 'inline-block', marginBottom: '6px' }}>
            PERSONALIZED JOURNALS
          </span>
          <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#101010', letterSpacing: '-0.03em', margin: '0 0 6px', lineHeight: 1.15 }}>
            Expeditions & Itineraries
          </h2>
          <p style={{ fontSize: '14px', color: '#555555', margin: 0 }}>
            Active voyages, upcoming journeys, and archived adventures crafted for discovery.
          </p>
        </div>

        <button
          type="button"
          onClick={onPlanTripClick}
          style={{
            padding: '12px 22px',
            fontSize: '13px',
            fontWeight: 900,
            borderRadius: '10px',
            background: '#FFD84D',
            color: '#101010',
            border: '2px solid #101010',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '3px 3px 0px #101010',
            transition: 'all 0.15s ease'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          <span style={{ letterSpacing: '0.04em', textTransform: 'uppercase' }}>+ Plan New Expedition</span>
        </button>
      </div>

      {/* Global Search Bar */}
      <GlobalSearchBar
        placeholder="Filter your expeditions by destination, status or budget..."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        groupByOptions={['Default', 'By Status', 'By Budget']}
        filterOptions={['All', 'Active', 'Planning', 'Completed']}
        sortByOptions={['Newest', 'Alphabetical', 'Budget']}
        selectedGroup={selectedGroup}
        onGroupChange={setSelectedGroup}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        selectedSort={selectedSort}
        onSortChange={setSelectedSort}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#555555' }}>
          <div className="spinner" style={{ margin: '0 auto 16px', borderTopColor: '#101010' }} />
          <p style={{ fontWeight: 700 }}>Loading expeditions...</p>
        </div>
      ) : filteredTrips.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FFFFFF', borderRadius: '16px', border: '2px solid #101010', boxShadow: '4px 4px 0px #101010' }}>
          <div style={{ fontSize: '44px', marginBottom: '14px' }}>🗺️</div>
          <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#101010', marginBottom: '8px' }}>No expeditions found</h3>
          <p style={{ fontSize: '14px', color: '#555555', marginBottom: '24px' }}>Start your first personalized travel itinerary today.</p>
          <button
            type="button"
            onClick={onPlanTripClick}
            style={{
              padding: '12px 26px',
              fontSize: '13px',
              fontWeight: 900,
              borderRadius: '10px',
              background: '#FFD84D',
              color: '#101010',
              border: '2px solid #101010',
              cursor: 'pointer',
              boxShadow: '3px 3px 0px #101010',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            Plan an Expedition
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', marginTop: '24px' }}>
          {/* SECTION 1: Ongoing */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FFD84D', border: '2px solid #101010', display: 'inline-block' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#101010', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                01 // Ongoing Expeditions
              </h3>
              <span style={{ fontSize: '12px', color: '#101010', background: '#FFD84D', padding: '2px 8px', borderRadius: '999px', fontWeight: 800, border: '1.5px solid #101010' }}>
                {ongoingTrips.length}
              </span>
            </div>
            {ongoingTrips.length === 0 ? (
              <div style={{ padding: '20px 24px', background: '#FFFFFF', borderRadius: '12px', border: '2px dashed #101010', color: '#555555', fontSize: '13px', fontWeight: 600 }}>
                No active journeys underway right now. Ready to launch an adventure?
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                {ongoingTrips.map(renderTripCard)}
              </div>
            )}
          </section>

          {/* SECTION 2: Upcoming */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#429FE8', border: '2px solid #101010', display: 'inline-block' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#101010', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                02 // Upcoming Departures
              </h3>
              <span style={{ fontSize: '12px', color: '#101010', background: '#429FE8', padding: '2px 8px', borderRadius: '999px', fontWeight: 800, border: '1.5px solid #101010' }}>
                {upcomingTrips.length}
              </span>
            </div>
            {upcomingTrips.length === 0 ? (
              <div style={{ padding: '20px 24px', background: '#FFFFFF', borderRadius: '12px', border: '2px dashed #101010', color: '#555555', fontSize: '13px', fontWeight: 600 }}>
                No upcoming departures scheduled yet. Select a destination to begin planning.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                {upcomingTrips.map(renderTripCard)}
              </div>
            )}
          </section>

          {/* SECTION 3: Completed */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#E8E6E0', border: '2px solid #101010', display: 'inline-block' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#101010', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                03 // Completed Archives
              </h3>
              <span style={{ fontSize: '12px', color: '#101010', background: '#E8E6E0', padding: '2px 8px', borderRadius: '999px', fontWeight: 800, border: '1.5px solid #101010' }}>
                {completedTrips.length}
              </span>
            </div>
            {completedTrips.length === 0 ? (
              <div style={{ padding: '20px 24px', background: '#FFFFFF', borderRadius: '12px', border: '2px dashed #101010', color: '#555555', fontSize: '13px', fontWeight: 600 }}>
                No completed expedition chronicles archived yet.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                {completedTrips.map(renderTripCard)}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};
