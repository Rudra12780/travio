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

  const handleDuplicate = async (tripId: number) => {
    try {
      const res = await api.copyTrip(tripId, userId);
      alert(`Trip copied as "${res.trip.title}"!`);
      loadTrips();
    } catch (err: any) {
      alert(err.message || 'Could not copy trip');
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
        borderRadius: '20px',
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
      }}
    >
      {/* Cover Image & Status Badge */}
      <div style={{ position: 'relative', height: '160px' }}>
        <img
          src={trip.cover_image}
          alt={trip.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <span style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          background: 'rgba(17, 24, 39, 0.75)',
          backdropFilter: 'blur(4px)',
          color: '#FFFFFF',
          fontSize: '11px',
          fontWeight: 700,
          padding: '4px 10px',
          borderRadius: '8px'
        }}>
          📍 {trip.stops_count || 0} Cities
        </span>

        <span style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: trip.status === 'Active' ? '#EC4899' : trip.status === 'Planning' ? '#0D9488' : '#64748B',
          color: '#FFFFFF',
          fontSize: '10.5px',
          fontWeight: 800,
          padding: '4px 10px',
          borderRadius: '9999px',
          textTransform: 'uppercase'
        }}>
          {trip.status}
        </span>
      </div>

      {/* Content: Short Overview of the Trip (Screen 6) */}
      <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>
          {trip.title}
        </h3>
        <p style={{
          fontSize: '12.5px',
          color: '#64748B',
          lineHeight: '1.45',
          marginBottom: '14px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {trip.description || 'Short Overview of the Trip - Multi-city scheduled route, verified hotel stays, and activity schedule.'}
        </p>

        {/* Date and Budget Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569', marginBottom: '14px', background: '#F8FAFC', padding: '10px 12px', borderRadius: '10px' }}>
          <span>📅 {trip.start_date} → {trip.end_date}</span>
          <span style={{ fontWeight: 700, color: '#0F172A' }}>Budget: ${trip.total_budget}</span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
          <button
            type="button"
            className="btn-plan-budget"
            onClick={() => onNavigate('itinerary-builder', trip.id)}
            style={{ flex: 1, padding: '8px 12px', fontSize: '12.5px', justifyContent: 'center' }}
          >
            <span>Edit Itinerary</span>
          </button>

          <button
            type="button"
            className="btn-explore-packages"
            onClick={() => onNavigate('itinerary-view', trip.id)}
            style={{ padding: '8px 12px', fontSize: '12.5px' }}
          >
            <span>View Timeline</span>
          </button>

          <button
            type="button"
            onClick={() => onShareClick(trip)}
            title="Share Trip"
            style={{
              padding: '8px 12px',
              borderRadius: '999px',
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              cursor: 'pointer'
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
              borderRadius: '999px',
              border: '1px solid #FECACA',
              background: '#FEF2F2',
              color: '#EF4444',
              cursor: 'pointer'
            }}
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ marginTop: '20px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#111827', letterSpacing: '-0.5px' }}>
            User Trip Listing (Screen 6)
          </h2>
          <p style={{ fontSize: '13.5px', color: '#64748B' }}>
            Ongoing, up-coming, and completed expeditions overview
          </p>
        </div>

        <button type="button" className="btn-plan-budget" onClick={onPlanTripClick}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          <span>+ Plan New Trip</span>
        </button>
      </div>

      {/* Global Search Bar (Screen 6 Wireframe) */}
      <GlobalSearchBar
        placeholder="Search bar ....."
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
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>
          <div className="spinner" style={{ margin: '0 auto 16px', borderTopColor: '#0D9488' }} />
          <p>Loading your trips...</p>
        </div>
      ) : filteredTrips.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🗺️</div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>No expeditions found</h3>
          <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '20px' }}>Start your first personalized travel itinerary today.</p>
          <button type="button" className="btn-plan-budget" onClick={onPlanTripClick} style={{ margin: '0 auto' }}>
            <span>Plan a New Trip</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '16px' }}>
          {/* SECTION 1: Ongoing (Screen 6 Wireframe) */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EC4899', display: 'inline-block' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Ongoing</h3>
              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>({ongoingTrips.length})</span>
            </div>
            {ongoingTrips.length === 0 ? (
              <div style={{ padding: '16px', background: '#FFFFFF', borderRadius: '16px', border: '1px dashed #CBD5E1', color: '#64748B', fontSize: '13px' }}>
                No ongoing trips right now.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
                {ongoingTrips.map(renderTripCard)}
              </div>
            )}
          </section>

          {/* SECTION 2: Up-coming (Screen 6 Wireframe) */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0D9488', display: 'inline-block' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Up-coming</h3>
              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>({upcomingTrips.length})</span>
            </div>
            {upcomingTrips.length === 0 ? (
              <div style={{ padding: '16px', background: '#FFFFFF', borderRadius: '16px', border: '1px dashed #CBD5E1', color: '#64748B', fontSize: '13px' }}>
                No up-coming trips scheduled yet.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
                {upcomingTrips.map(renderTripCard)}
              </div>
            )}
          </section>

          {/* SECTION 3: Completed (Screen 6 Wireframe) */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#64748B', display: 'inline-block' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Completed</h3>
              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>({completedTrips.length})</span>
            </div>
            {completedTrips.length === 0 ? (
              <div style={{ padding: '16px', background: '#FFFFFF', borderRadius: '16px', border: '1px dashed #CBD5E1', color: '#64748B', fontSize: '13px' }}>
                No completed voyages yet.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
                {completedTrips.map(renderTripCard)}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};
