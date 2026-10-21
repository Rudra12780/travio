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

    const loadTripsAndWishlist = () => {
      api.getTrips(userId).then(res => {
        let list = res.trips || [];
        if (list.length === 0) {
          api.getTrips(3).then(fRes => {
            if (fRes.trips && fRes.trips.length > 0) {
              setTrips(fRes.trips);
              setSelectedTripId(fRes.trips[0].id);
            }
          }).catch(() => {});
        } else {
          setTrips(list);
          if (list.length > 0) setSelectedTripId(list[0].id);
        }
      }).catch(() => {});

      api.getWishlist(userId).then(res => {
        if (res.wishlist) {
          setWishlistCityIds(res.wishlist.map(c => c.id));
        }
      }).catch(() => {});
    };

    loadTripsAndWishlist();
    window.addEventListener('wishlist-updated', loadTripsAndWishlist);
    return () => window.removeEventListener('wishlist-updated', loadTripsAndWishlist);
  }, [searchTerm, regionFilter, userId]);

  const toggleWishlist = async (cityId: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const isCurrentlyWishlisted = wishlistCityIds.includes(cityId);

    // Instant optimistic update
    if (isCurrentlyWishlisted) {
      setWishlistCityIds(prev => prev.filter(id => id !== cityId));
    } else {
      setWishlistCityIds(prev => [...prev, cityId]);
    }
    window.dispatchEvent(new CustomEvent('wishlist-updated'));

    try {
      if (isCurrentlyWishlisted) {
        await api.removeFromWishlist(cityId, userId);
      } else {
        await api.addToWishlist(cityId, userId);
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
      // Revert if error
      if (isCurrentlyWishlisted) {
        setWishlistCityIds(prev => [...prev, cityId]);
      } else {
        setWishlistCityIds(prev => prev.filter(id => id !== cityId));
      }
      window.dispatchEvent(new CustomEvent('wishlist-updated'));
    }
  };

  const openAddTripModal = (city: City) => {
    setTargetCityForTrip(city);
    const today = new Date();
    const plus3 = new Date(today);
    plus3.setDate(today.getDate() + 3);
    setArrivalDate(today.toISOString().split('T')[0]);
    setDepartureDate(plus3.toISOString().split('T')[0]);

    // Ensure trips are fresh
    api.getTrips(userId).then(res => {
      let list = res.trips || [];
      if (list.length === 0) {
        api.getTrips(3).then(fRes => {
          if (fRes.trips && fRes.trips.length > 0) {
            setTrips(fRes.trips);
            setSelectedTripId(fRes.trips[0].id);
          }
        }).catch(() => {});
      } else {
        setTrips(list);
        if (!selectedTripId || !list.some(t => t.id === selectedTripId)) {
          setSelectedTripId(list[0].id);
        }
      }
    }).catch(() => {});
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
    <div style={{ marginTop: '24px', color: '#101010' }}>
      {/* Title */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#429FE8', border: '1.5px solid #101010', borderRadius: '4px', padding: '2px 8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '10.5px', fontWeight: 900, color: '#101010', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            DESTINATION EXPLORER // GLOBAL CATALOG
          </span>
        </div>
        <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#101010', letterSpacing: '-0.5px', margin: '0 0 6px 0', fontFamily: "'Syne', sans-serif" }}>
          Explore World Destinations
        </h2>
        <p style={{ fontSize: '14px', color: '#555555', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Discover curated world cities, seasonal climates, and cost metrics to craft your bespoke voyages
        </p>
      </div>

      {/* Global Search Bar */}
      <GlobalSearchBar
        placeholder="Search destinations, cities, or climates..."
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

      <div style={{ fontSize: '16px', fontWeight: 900, color: '#101010', margin: '24px 0 14px 0', fontFamily: "'Syne', sans-serif" }}>
        Curated Dossiers ({cities.length})
      </div>

      {/* Cities Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#555555' }}>
          <div className="spinner" style={{ margin: '0 auto 16px', borderTopColor: '#101010' }} />
          <p style={{ fontWeight: 700 }}>Scanning destination catalog...</p>
        </div>
      ) : cities.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', background: '#FFFFFF', borderRadius: '14px', border: '2px solid #101010', color: '#555555', boxShadow: '4px 4px 0px #101010' }}>
          <p style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>No cities found matching your criteria.</p>
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
                  borderRadius: '16px',
                  border: '2px solid #101010',
                  overflow: 'hidden',
                  boxShadow: '4px 4px 0px #101010',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.15s ease'
                }}
              >
                {/* Image & Wishlist Button */}
                <div style={{ position: 'relative', height: '200px', borderBottom: '2px solid #101010' }}>
                  <img
                    src={city.image_url}
                    alt={city.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  <button
                    type="button"
                    onClick={(e) => toggleWishlist(city.id, e)}
                    title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: isWishlisted ? '#F4AFC1' : '#FFFFFF',
                      border: '1.5px solid #101010',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '2px 2px 0px #101010',
                      color: isWishlisted ? '#101010' : '#555555',
                      transition: 'transform 0.15s ease'
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={isWishlisted ? '#101010' : 'none'} stroke="#101010" strokeWidth="2.2">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                  </button>

                  <span style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '12px',
                    background: '#FFFFFF',
                    color: '#101010',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '4px',
                    border: '1.5px solid #101010'
                  }}>
                    {city.climate}
                  </span>

                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: '#FFD84D',
                    border: '1.5px solid #101010',
                    color: '#101010',
                    fontSize: '11.5px',
                    fontWeight: 900,
                    padding: '3px 10px',
                    borderRadius: '4px',
                    boxShadow: '2px 2px 0px #101010'
                  }}>
                    ★ {city.popularity_score}
                  </span>
                </div>

                {/* Content */}
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#101010', fontFamily: "'Syne', sans-serif", margin: 0 }}>{city.name}</h3>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#36B7B3' }}>
                      {'$'.repeat(city.cost_index)} ({city.cost_index === 1 ? 'Budget' : city.cost_index === 2 ? 'Comfort' : 'Luxury'})
                    </span>
                  </div>

                  <p style={{ fontSize: '13px', color: '#429FE8', fontWeight: 800, margin: '0 0 8px 0' }}>
                    {city.country} • {city.region}
                  </p>

                  <p style={{ fontSize: '13px', color: '#555555', lineHeight: '1.55', margin: '0 0 16px 0' }}>
                    {city.description}
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
                      <span style={{ fontSize: '10.5px', color: '#555555', display: 'block', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>Avg Cost</span>
                      <span style={{ fontSize: '16px', fontWeight: 900, color: '#101010' }}>${city.avg_cost_per_day} <span style={{ fontSize: '12px', fontWeight: 600, color: '#555555' }}>/ day</span></span>
                    </div>

                    <button
                      type="button"
                      onClick={() => openAddTripModal(city)}
                      style={{
                        background: '#FFD84D',
                        color: '#101010',
                        border: '1.5px solid #101010',
                        borderRadius: '6px',
                        padding: '9px 18px',
                        fontSize: '13px',
                        fontWeight: 900,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '2px 2px 0px #101010',
                        transition: 'transform 0.15s ease'
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
              onClick={() => setTargetCityForTrip(null)} 
              style={{ color: '#101010', fontWeight: 800, fontSize: '16px' }}
            >
              ✕
            </button>
            <h2 className="modal-title" style={{ fontSize: '20px', fontWeight: 900, color: '#101010', margin: '0 0 4px 0', fontFamily: "'Syne', sans-serif" }}>
              Add {targetCityForTrip.name} to Trip
            </h2>
            <p className="modal-desc" style={{ fontSize: '13px', color: '#555555', margin: '0 0 18px 0' }}>
              Append this destination to your multi-city voyage schedule.
            </p>

            <form onSubmit={handleAddCityToTrip} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 900, color: '#101010', marginBottom: '6px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  CHOOSE TRIP
                </label>
                {trips.length === 0 ? (
                  <div style={{ padding: '14px', background: '#F7F6F2', borderRadius: '8px', border: '1.5px solid #101010', fontSize: '13px', color: '#555555' }}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: 600 }}>No trips found for this profile.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setTargetCityForTrip(null);
                        onNavigate('my-trips');
                      }}
                      style={{
                        padding: '8px 14px',
                        background: '#FFD84D',
                        color: '#101010',
                        border: '1.5px solid #101010',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 900,
                        cursor: 'pointer',
                        boxShadow: '1.5px 1.5px 0px #101010'
                      }}
                    >
                      + Create a Trip in My Trips
                    </button>
                  </div>
                ) : (
                  <select
                    value={selectedTripId}
                    onChange={(e) => setSelectedTripId(Number(e.target.value))}
                    required
                    style={{
                      width: '100%',
                      height: '46px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #101010',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      color: '#101010',
                      background: '#FFFFFF',
                      cursor: 'pointer',
                      outline: 'none',
                      display: 'block'
                    }}
                  >
                    {trips.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.title} ({t.start_date || 'Upcoming'})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 900, color: '#101010', marginBottom: '6px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    ARRIVAL
                  </label>
                  <input
                    type="date"
                    value={arrivalDate}
                    onChange={(e) => setArrivalDate(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #101010',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#101010',
                      outline: 'none',
                      background: '#FFFFFF'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 900, color: '#101010', marginBottom: '6px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    DEPARTURE
                  </label>
                  <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #101010',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#101010',
                      outline: 'none',
                      background: '#FFFFFF'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 900, color: '#101010', marginBottom: '6px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  TRANSIT TO {targetCityForTrip.name.toUpperCase()}
                </label>
                <select
                  value={transitMode}
                  onChange={(e) => setTransitMode(e.target.value)}
                  style={{
                    width: '100%',
                    height: '46px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #101010',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    color: '#101010',
                    background: '#FFFFFF',
                    cursor: 'pointer',
                    outline: 'none',
                    display: 'block'
                  }}
                >
                  <option value="Flight">✈️ Flight</option>
                  <option value="Car">🚗 Chauffeured Sedan</option>
                  <option value="Train">🚆 Scenic Train</option>
                  <option value="Bus">🚌 Luxury Coach</option>
                  <option value="Boat">⛵ Ferry / Cruise</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={trips.length === 0}
                style={{
                  marginTop: '8px',
                  padding: '12px',
                  borderRadius: '8px',
                  background: '#101010',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 900,
                  cursor: trips.length === 0 ? 'not-allowed' : 'pointer',
                  boxShadow: '3px 3px 0px #FFD84D'
                }}
              >
                <span>Append Stop to Itinerary ↗</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
