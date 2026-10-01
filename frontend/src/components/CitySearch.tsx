import React, { useState, useEffect } from 'react';
import { City, Trip, ActiveTab } from '../types';
import { api } from '../api';
import { GlobalSearchBar } from './GlobalSearchBar';

interface Props {
  userId?: number;
  onNavigate: (tab: ActiveTab, tripId?: number) => void;
}

export const CitySearch: React.FC<Props> = ({ userId = 1, onNavigate }) => {
  const [cities, setCities] = useState<City[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');
  const [selectedSort, setSelectedSort] = useState('Popularity');
  const [selectedGroup, setSelectedGroup] = useState('Default');
  const [wishlistCityIds, setWishlistCityIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick Add Stop Modal State
  const [targetCityForTrip, setTargetCityForTrip] = useState<City | null>(null);
  const [selectedTripId, setSelectedTripId] = useState<number>(1);
  const [arrivalDate, setArrivalDate] = useState('2026-10-15');
  const [departureDate, setDepartureDate] = useState('2026-10-18');
  const [transitMode, setTransitMode] = useState('Flight');

  useEffect(() => {
    setLoading(true);
    api.getCities({ search: searchTerm, region: regionFilter })
      .then(res => {
        setCities(res.cities);
        setLoading(false);
      });

    api.getTrips(userId).then(res => {
      setTrips(res.trips);
      if (res.trips.length > 0) setSelectedTripId(res.trips[0].id);
    });

    api.getWishlist(userId).then(res => {
      setWishlistCityIds(res.wishlist.map(c => c.id));
    });
  }, [searchTerm, regionFilter, userId]);

  const toggleWishlist = async (cityId: number) => {
    if (wishlistCityIds.includes(cityId)) {
      await api.removeFromWishlist(cityId, userId);
      setWishlistCityIds(prev => prev.filter(id => id !== cityId));
    } else {
      await api.addToWishlist(cityId, userId);
      setWishlistCityIds(prev => [...prev, cityId]);
    }
  };

  const handleAddCityToTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCityForTrip) return;

    try {
      await api.addStop(selectedTripId, {
        city_id: targetCityForTrip.id,
        start_date: arrivalDate,
        end_date: departureDate,
        transit_mode: transitMode,
        stay_cost: targetCityForTrip.avg_cost_per_day * 2
      });

      alert(`✅ ${targetCityForTrip.name} added to your expedition!`);
      setTargetCityForTrip(null);
      onNavigate('itinerary-builder', selectedTripId);
    } catch (err: any) {
      alert(err.message || 'Could not add stop');
    }
  };

  const regions = ['All', 'Rajasthan', 'North India', 'Kerala', 'East Asia', 'Europe'];

  return (
    <div style={{ marginTop: '24px' }}>
      {/* Title (Screen 8 Wireframe) */}
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#111827', letterSpacing: '-0.5px', margin: '0 0 6px 0' }}>
          City Search Page (Screen 8)
        </h2>
        <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0 }}>
          Explore world heritage cities, climate metrics, and cost indices to include in your journeys
        </p>
      </div>

      {/* Global Search Bar (Screen 8) */}
      <GlobalSearchBar
        placeholder="Search bar ....."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        groupByOptions={['Default', 'By Region', 'By Climate']}
        filterOptions={['All', 'Rajasthan', 'North India', 'Kerala', 'Europe', 'East Asia']}
        sortByOptions={['Popularity', 'Cost (Low to High)', 'Cost (High to Low)']}
        selectedGroup={selectedGroup}
        onGroupChange={setSelectedGroup}
        selectedFilter={regionFilter}
        onFilterChange={setRegionFilter}
        selectedSort={selectedSort}
        onSortChange={setSelectedSort}
      />

      <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '20px 0 12px 0' }}>
        Results (Options and details)
      </div>

      {/* Cities Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="spinner" style={{ margin: '0 auto 16px', borderTopColor: '#0D9488' }} />
          <p>Scanning destination catalog...</p>
        </div>
      ) : cities.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FFFFFF', borderRadius: '20px' }}>
          <p>No cities found matching your criteria.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {cities.map(city => {
            const isWishlisted = wishlistCityIds.includes(city.id);

            return (
              <div
                key={city.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Image & Wishlist Button */}
                <div style={{ position: 'relative', height: '180px' }}>
                  <img
                    src={city.image_url}
                    alt={city.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  <button
                    type="button"
                    onClick={() => toggleWishlist(city.id)}
                    title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      color: isWishlisted ? '#E11D48' : '#94A3B8'
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                  </button>

                  <span style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '12px',
                    background: 'rgba(17, 24, 39, 0.75)',
                    backdropFilter: 'blur(4px)',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '6px'
                  }}>
                    {city.climate}
                  </span>

                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: '#FFFFFF',
                    color: '#D97706',
                    fontSize: '11.5px',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                  }}>
                    ★ {city.popularity_score}
                  </span>
                </div>

                {/* Content */}
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#111827' }}>{city.name}</h3>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#6366F1' }}>
                      {'$'.repeat(city.cost_index)} ({city.cost_index === 1 ? 'Budget' : city.cost_index === 2 ? 'Moderate' : 'Luxury'})
                    </span>
                  </div>

                  <p style={{ fontSize: '12.5px', color: '#0D9488', fontWeight: 600, marginBottom: '8px' }}>
                    {city.country} • {city.region}
                  </p>

                  <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.45', marginBottom: '16px' }}>
                    {city.description}
                  </p>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '12px',
                    borderTop: '1px solid #F1F5F9',
                    marginTop: 'auto'
                  }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#94A3B8', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Avg Cost</span>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: '#111827' }}>${city.avg_cost_per_day} <span style={{ fontSize: '11px', fontWeight: 500, color: '#64748B' }}>/ day</span></span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setTargetCityForTrip(city)}
                      style={{
                        background: '#0D9488',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '8px 16px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>+ Add to Trip</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add City to Trip Modal */}
      {targetCityForTrip && (
        <div className="modal-overlay" onClick={() => setTargetCityForTrip(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close-btn" onClick={() => setTargetCityForTrip(null)}>✕</button>
            <h2 className="modal-title">Add {targetCityForTrip.name} to Trip</h2>
            <p className="modal-desc">
              Append this destination to your multi-city voyage schedule.
            </p>

            <form onSubmit={handleAddCityToTrip} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">CHOOSE TRIP</label>
                <div className="input-container">
                  <select
                    className="form-input"
                    value={selectedTripId}
                    onChange={(e) => setSelectedTripId(Number(e.target.value))}
                    required
                  >
                    {trips.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">ARRIVAL</label>
                  <div className="input-container">
                    <input
                      type="date"
                      className="form-input"
                      value={arrivalDate}
                      onChange={(e) => setArrivalDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">DEPARTURE</label>
                  <div className="input-container">
                    <input
                      type="date"
                      className="form-input"
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">TRANSIT TO {targetCityForTrip.name.toUpperCase()}</label>
                <div className="input-container">
                  <select
                    className="form-input"
                    value={transitMode}
                    onChange={(e) => setTransitMode(e.target.value)}
                  >
                    <option value="Flight">✈️ Flight</option>
                    <option value="Car">🚗 Chauffeured Sedan</option>
                    <option value="Train">🚆 Scenic Train</option>
                    <option value="Bus">🚌 Luxury Coach</option>
                    <option value="Boat">⛵ Ferry / Cruise</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn-submit" style={{ marginTop: '8px' }}>
                <span>Append Stop to Itinerary</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
