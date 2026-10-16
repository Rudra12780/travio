import React, { useState, useEffect, useMemo } from 'react';
import { City, Trip, ActiveTab } from '../types';
import { api } from '../api';
import { CountryDossierModal } from './CountryDossierModal';
import { COUNTRIES_DATA, CountryDossier } from '../data/countryData';

interface Props {
  userId: number;
  onNavigate: (tab: ActiveTab, tripId?: number) => void;
  onPlanTripClick?: () => void;
}

export const SavedPlaces: React.FC<Props> = ({
  userId,
  onNavigate,
  onPlanTripClick
}) => {
  const [savedPlaces, setSavedPlaces] = useState<City[]>([]);
  const [allCities, setAllCities] = useState<City[]>([]);
  const [userTrips, setUserTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search Controls
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'cost_asc' | 'cost_desc' | 'name'>('recent');

  // Interactive Modals & Drawers
  const [selectedCountryDossier, setSelectedCountryDossier] = useState<CountryDossier | null>(null);
  const [addToTripModalCity, setAddToTripModalCity] = useState<City | null>(null);
  const [selectedTripId, setSelectedTripId] = useState<number | ''>('');
  const [stopStartDate, setStopStartDate] = useState('');
  const [stopEndDate, setStopEndDate] = useState('');
  const [stopTransitMode, setStopTransitMode] = useState('Flight');
  const [stopStayCost, setStopStayCost] = useState<number>(150);
  const [stopNotes, setStopNotes] = useState('');
  const [isSubmittingStop, setIsSubmittingStop] = useState(false);

  // Discover Explorer
  const [showDiscover, setShowDiscover] = useState(false);
  const [discoverSearch, setDiscoverSearch] = useState('');

  // Toast & Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastRemovedCity, setLastRemovedCity] = useState<City | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 4000);
  };

  // Load Initial Data
  const loadData = async () => {
    setLoading(true);
    try {
      const [wishlistRes, citiesRes, tripsRes] = await Promise.all([
        api.getWishlist(userId),
        api.getCities(),
        api.getTrips(userId)
      ]);
      setSavedPlaces(wishlistRes.wishlist || []);
      setAllCities(citiesRes.cities || []);
      setUserTrips(tripsRes.trips || []);
      if (tripsRes.trips && tripsRes.trips.length > 0) {
        setSelectedTripId(tripsRes.trips[0].id);
      }
    } catch (err) {
      console.error('Error loading saved places:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  // Remove Place from Wishlist
  const handleRemove = async (city: City) => {
    try {
      await api.removeFromWishlist(city.id, userId);
      setSavedPlaces(prev => prev.filter(c => c.id !== city.id));
      setLastRemovedCity(city);
      window.dispatchEvent(new CustomEvent('wishlist-updated'));
      showToast(`Removed "${city.name}" from your saved places.`);
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      showToast('Failed to remove place. Please try again.');
    }
  };

  // Undo Remove
  const handleUndoRemove = async () => {
    if (!lastRemovedCity) return;
    try {
      await api.addToWishlist(lastRemovedCity.id, userId);
      setSavedPlaces(prev => [lastRemovedCity, ...prev]);
      setLastRemovedCity(null);
      window.dispatchEvent(new CustomEvent('wishlist-updated'));
      showToast(`Restored "${lastRemovedCity.name}" to your saved places.`);
    } catch (err) {
      console.error('Error restoring place:', err);
    }
  };

  // Quick Save Place to Wishlist
  const handleSavePlace = async (city: City) => {
    try {
      await api.addToWishlist(city.id, userId);
      setSavedPlaces(prev => {
        if (prev.some(c => c.id === city.id)) return prev;
        return [city, ...prev];
      });
      window.dispatchEvent(new CustomEvent('wishlist-updated'));
      showToast(`Saved "${city.name}, ${city.country}" to your favourites!`);
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      showToast('Failed to save place. Please try again.');
    }
  };

  // Open Add to Trip Modal
  const openAddToTripModal = (city: City) => {
    setAddToTripModalCity(city);
    const today = new Date();
    const plus3 = new Date(today);
    plus3.setDate(today.getDate() + 3);

    setStopStartDate(today.toISOString().split('T')[0]);
    setStopEndDate(plus3.toISOString().split('T')[0]);
    setStopStayCost(city.avg_cost_per_day * 3);
    setStopTransitMode('Flight');
    setStopNotes(`Saved destination stop. Recommended local boutique hotel.`);
    if (userTrips.length > 0 && !selectedTripId) {
      setSelectedTripId(userTrips[0].id);
    }
  };

  // Confirm Adding Stop to Trip
  const handleConfirmAddToTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addToTripModalCity) return;

    if (!selectedTripId) {
      showToast('Please select a trip or create a new trip first.');
      return;
    }

    setIsSubmittingStop(true);
    try {
      await api.addStop(Number(selectedTripId), {
        city_id: addToTripModalCity.id,
        start_date: stopStartDate,
        end_date: stopEndDate,
        transit_mode: stopTransitMode,
        stay_cost: Number(stopStayCost) || 120,
        notes: stopNotes
      });

      const targetTrip = userTrips.find(t => t.id === Number(selectedTripId));
      showToast(`Added ${addToTripModalCity.name} to "${targetTrip?.title || 'Trip'}"!`);
      setAddToTripModalCity(null);
    } catch (err) {
      console.error('Error adding stop to trip:', err);
      showToast('Failed to add stop to trip. Please try again.');
    } finally {
      setIsSubmittingStop(false);
    }
  };

  // Open Country Dossier Modal
  const openCountryDossier = (cityName: string, countryName: string) => {
    const found = COUNTRIES_DATA.find(
      c => c.name.toLowerCase() === countryName.toLowerCase() ||
           cityName.toLowerCase().includes(c.name.toLowerCase())
    );
    if (found) {
      setSelectedCountryDossier(found);
    } else {
      const fallback = COUNTRIES_DATA.find(c => countryName.toLowerCase().includes(c.name.toLowerCase()));
      if (fallback) {
        setSelectedCountryDossier(fallback);
      } else {
        showToast(`Dossier coming soon for ${countryName}!`);
      }
    }
  };

  // Unique Regions from saved places
  const availableRegions = useMemo(() => {
    const set = new Set<string>();
    savedPlaces.forEach(p => {
      if (p.region) set.add(p.region);
    });
    return ['All', ...Array.from(set)];
  }, [savedPlaces]);

  // Filtered & Sorted Places
  const displayedPlaces = useMemo(() => {
    let result = savedPlaces.filter(city => {
      const matchesSearch =
        city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (city.description && city.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (city.region && city.region.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesRegion =
        selectedRegion === 'All' || city.region === selectedRegion;

      return matchesSearch && matchesRegion;
    });

    result.sort((a, b) => {
      if (sortBy === 'rating') return (b.popularity_score || 0) - (a.popularity_score || 0);
      if (sortBy === 'cost_asc') return (a.avg_cost_per_day || 0) - (b.avg_cost_per_day || 0);
      if (sortBy === 'cost_desc') return (b.avg_cost_per_day || 0) - (a.avg_cost_per_day || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0; // 'recent'
    });

    return result;
  }, [savedPlaces, searchTerm, selectedRegion, sortBy]);

  // Unsaved Cities for Discover Section
  const unsavedCities = useMemo(() => {
    const savedIds = new Set(savedPlaces.map(c => c.id));
    return allCities.filter(c => {
      if (savedIds.has(c.id)) return false;
      if (!discoverSearch) return true;
      const q = discoverSearch.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        (c.region && c.region.toLowerCase().includes(q))
      );
    });
  }, [allCities, savedPlaces, discoverSearch]);

  // Aggregate Stats
  const totalSaved = savedPlaces.length;
  const uniqueCountriesCount = new Set(savedPlaces.map(p => p.country)).size;
  const avgDailyCost =
    totalSaved > 0
      ? Math.round(savedPlaces.reduce((sum, p) => sum + (p.avg_cost_per_day || 0), 0) / totalSaved)
      : 0;
  const topRated = savedPlaces.reduce<City | null>((top, p) => {
    if (!top || (p.popularity_score || 0) > (top.popularity_score || 0)) return p;
    return top;
  }, null);

  return (
    <div className="saved-places-page" style={{ paddingBottom: '60px' }}>
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 1100,
            background: '#0F172A',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            border: '1px solid #334155',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '13.5px',
            fontWeight: 600,
            animation: 'fadeInUp 0.2s ease'
          }}
        >
          <span style={{ fontSize: '16px' }}>📌</span>
          <span>{toastMessage}</span>
          {lastRemovedCity && (
            <button
              type="button"
              onClick={handleUndoRemove}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#FFFFFF',
                borderRadius: '6px',
                padding: '3px 8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                marginLeft: '6px'
              }}
            >
              Undo
            </button>
          )}
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              fontSize: '15px',
              marginLeft: '4px'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Banner - Matching GlobalTrotters Clean Luxury System */}
      <section
        style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#E6FFFA',
                color: '#0D9488',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '10px',
                border: '1px solid #CCFBF1'
              }}
            >
              <span>⭐</span>
              <span>Personal Collection</span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.5px', margin: '0 0 6px 0' }}>
              Saved Places
            </h1>
            <p style={{ fontSize: '14px', color: '#64748B', maxWidth: '600px', margin: 0, lineHeight: 1.5 }}>
              Your collection of dream destinations and bookmarked cities.
              Easily organize them into your itineraries or explore local activities.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setShowDiscover(!showDiscover)}
              style={{
                padding: '10px 18px',
                borderRadius: '12px',
                background: showDiscover ? '#0D9488' : '#FFFFFF',
                color: showDiscover ? '#FFFFFF' : '#0F172A',
                border: showDiscover ? 'none' : '1.5px solid #CBD5E1',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s'
              }}
            >
              <span>{showDiscover ? '✕ Close' : '+ Discover Places'}</span>
            </button>

            {onPlanTripClick && (
              <button
                type="button"
                onClick={onPlanTripClick}
                style={{
                  padding: '10px 20px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(13, 148, 136, 0.25)',
                  transition: 'all 0.15s'
                }}
              >
                <span>✈️ Plan New Trip</span>
              </button>
            )}
          </div>
        </div>

        {/* Metrics Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '14px',
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid #F1F5F9'
          }}
        >
          <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Saved Places
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
              <span style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A' }}>{totalSaved}</span>
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>destinations</span>
            </div>
          </div>

          <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Countries
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
              <span style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A' }}>{uniqueCountriesCount}</span>
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>nations</span>
            </div>
          </div>

          <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Avg Daily Cost
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
              <span style={{ fontSize: '22px', fontWeight: 900, color: '#0D9488' }}>
                ${avgDailyCost}
              </span>
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>/ day</span>
            </div>
          </div>

          <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Highest Rated
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
              <span style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {topRated ? topRated.name : '—'}
              </span>
              {topRated && <span style={{ fontSize: '12px', color: '#D97706', fontWeight: 700 }}>★ {topRated.popularity_score}</span>}
            </div>
          </div>
        </div>
      </section>

      {/* Discover & Add More Places Section */}
      {showDiscover && (
        <section
          style={{
            background: '#FFFFFF',
            borderRadius: '18px',
            border: '1px solid #CBD5E1',
            padding: '20px',
            marginBottom: '24px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Explore Other Destinations
              </h3>
              <p style={{ fontSize: '12.5px', color: '#64748B', margin: '3px 0 0 0' }}>
                Add more destinations directly to your saved list.
              </p>
            </div>
            <div style={{ position: 'relative', width: '260px' }}>
              <input
                type="text"
                placeholder="Search destinations..."
                value={discoverSearch}
                onChange={(e) => setDiscoverSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 32px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  fontSize: '12.5px',
                  outline: 'none'
                }}
              />
              <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '13px' }}>
                🔍
              </span>
            </div>
          </div>

          {unsavedCities.length === 0 ? (
            <p style={{ color: '#94A3B8', fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>
              {discoverSearch ? 'No matching destinations found.' : 'All destinations are currently saved!'}
            </p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '12px',
                maxHeight: '300px',
                overflowY: 'auto',
                paddingRight: '4px'
              }}
            >
              {unsavedCities.map(city => (
                <div
                  key={city.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    background: '#F8FAFC'
                  }}
                >
                  <img
                    src={city.image_url}
                    alt={city.name}
                    style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '13px', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {city.name}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748B' }}>
                      {city.country} • ${city.avg_cost_per_day}/day
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSavePlace(city)}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      color: '#0F172A',
                      borderRadius: '8px',
                      padding: '5px 9px',
                      cursor: 'pointer',
                      fontSize: '11.5px',
                      fontWeight: 700
                    }}
                    title="Save to list"
                  >
                    + Save
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Filter and Search Bar */}
      <section
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '14px 18px',
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
        }}
      >
        {/* Search input */}
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: '340px' }}>
          <input
            type="text"
            placeholder="Search saved places..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '10px',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
              outline: 'none',
              background: '#F8FAFC'
            }}
          />
          <svg
            style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        {/* Region Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
          {availableRegions.map(region => (
            <button
              key={region}
              type="button"
              onClick={() => setSelectedRegion(region)}
              style={{
                padding: '5px 12px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: selectedRegion === region ? 700 : 600,
                border: selectedRegion === region ? '1px solid #CCFBF1' : '1px solid #E2E8F0',
                background: selectedRegion === region ? '#E6FFFA' : '#FFFFFF',
                color: selectedRegion === region ? '#0D9488' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {region}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '12.5px',
              fontWeight: 600,
              color: '#0F172A',
              background: '#FFFFFF',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="recent">Recently Added</option>
            <option value="rating">Highest Rated</option>
            <option value="cost_asc">Cost: Low to High</option>
            <option value="cost_desc">Cost: High to Low</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>
      </section>

      {/* Main Saved Places Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="spinner" style={{ margin: '0 auto 12px', borderTopColor: '#0D9488' }} />
          <p style={{ color: '#64748B', fontSize: '13.5px' }}>Loading saved places...</p>
        </div>
      ) : displayedPlaces.length === 0 ? (
        /* Empty State */
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E2E8F0',
            padding: '48px 24px',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: '#F0FDFA',
              color: '#0D9488',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              marginBottom: '16px'
            }}
          >
            📌
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
            {searchTerm || selectedRegion !== 'All' ? 'No matching places found' : 'No Saved Places Yet'}
          </h2>
          <p style={{ fontSize: '13.5px', color: '#64748B', maxWidth: '420px', margin: '0 auto 24px', lineHeight: 1.5 }}>
            {searchTerm || selectedRegion !== 'All'
              ? 'Try adjusting your search query or region filter.'
              : 'Save destinations you love so you can easily include them in your next trip.'}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setShowDiscover(true)}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                background: '#0D9488',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              + Discover Places
            </button>
            <button
              type="button"
              onClick={() => onNavigate('cities')}
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                background: '#F1F5F9',
                color: '#334155',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Browse Destinations
            </button>
          </div>
        </div>
      ) : (
        /* Cards Grid */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
            gap: '20px'
          }}
        >
          {displayedPlaces.map(city => {
            return (
              <div
                key={city.id}
                className="saved-place-card"
                style={{
                  background: '#FFFFFF',
                  borderRadius: '18px',
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden',
                  boxShadow: '0 4px 15px rgba(15, 23, 42, 0.04)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Visual Image Header */}
                <div style={{ position: 'relative', width: '100%', height: '190px', overflow: 'hidden' }}>
                  <img
                    src={city.image_url}
                    alt={city.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.65) 100%)'
                    }}
                  />

                  {/* Top Badges */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span
                      style={{
                        background: 'rgba(15, 23, 42, 0.75)',
                        backdropFilter: 'blur(8px)',
                        color: '#FFFFFF',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '9999px'
                      }}
                    >
                      {city.region || city.country}
                    </span>

                    {city.climate && (
                      <span
                        style={{
                          background: 'rgba(13, 148, 136, 0.85)',
                          backdropFilter: 'blur(8px)',
                          color: '#FFFFFF',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '9999px'
                        }}
                      >
                        {city.climate}
                      </span>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemove(city)}
                    title="Remove from saved places"
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      border: 'none',
                      color: '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#0D9488" stroke="#0D9488" strokeWidth="2">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  </button>

                  {/* Bottom Image Title */}
                  <div style={{ position: 'absolute', bottom: '10px', left: '12px', right: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                      <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#FFFFFF', margin: 0, textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                        {city.name}
                      </h3>
                      <div
                        style={{
                          background: 'rgba(217, 119, 6, 0.9)',
                          color: '#FFFFFF',
                          padding: '2px 7px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 800
                        }}
                      >
                        ★ {city.popularity_score}
                      </div>
                    </div>
                    <p style={{ fontSize: '12.5px', color: '#E2E8F0', margin: '2px 0 0 0', fontWeight: 600 }}>
                      {city.country}
                    </p>
                  </div>
                </div>

                {/* Card Content */}
                <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <p
                    style={{
                      fontSize: '12.5px',
                      color: '#64748B',
                      lineHeight: 1.5,
                      margin: '0 0 12px 0',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {city.description}
                  </p>

                  {/* Details Strip */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      background: '#F8FAFC',
                      borderRadius: '10px',
                      border: '1px solid #F1F5F9',
                      marginBottom: '14px',
                      fontSize: '11.5px'
                    }}
                  >
                    <div>
                      <span style={{ color: '#94A3B8' }}>Est. Cost:</span>
                      <strong style={{ color: '#0D9488', marginLeft: '4px' }}>
                        ${city.avg_cost_per_day}/day
                      </strong>
                    </div>

                    <div>
                      <span style={{ color: '#94A3B8' }}>Tier:</span>
                      <strong style={{ color: '#0F172A', marginLeft: '4px' }}>
                        {city.cost_index === 1 ? 'Budget' : city.cost_index === 2 ? 'Moderate' : 'Luxury'}
                      </strong>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => openAddToTripModal(city)}
                        style={{
                          padding: '9px 10px',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
                          color: '#FFFFFF',
                          border: 'none',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px'
                        }}
                      >
                        <span>✈️ Add to Trip</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onNavigate('activities')}
                        style={{
                          padding: '9px 10px',
                          borderRadius: '10px',
                          background: '#F1F5F9',
                          color: '#0F172A',
                          border: '1px solid #CBD5E1',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px'
                        }}
                      >
                        <span>🎯 Activities</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => openCountryDossier(city.name, city.country)}
                      style={{
                        padding: '6px',
                        borderRadius: '8px',
                        background: 'transparent',
                        color: '#64748B',
                        border: '1px solid #E2E8F0',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      📖 View Country Guide
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add To Trip Modal */}
      {addToTripModalCity && (
        <div className="modal-overlay" onClick={() => setAddToTripModalCity(null)} role="dialog" aria-modal="true">
          <div className="modal-card" style={{ maxWidth: '480px', padding: '26px' }} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setAddToTripModalCity(null)}
              aria-label="Close modal"
            >
              ✕
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <img
                src={addToTripModalCity.image_url}
                alt={addToTripModalCity.name}
                style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }}
              />
              <div>
                <span style={{ fontSize: '11px', color: '#0D9488', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ADD STOP TO EXPEDITION
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  {addToTripModalCity.name}, {addToTripModalCity.country}
                </h3>
              </div>
            </div>

            <form onSubmit={handleConfirmAddToTrip} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  Select Trip
                </label>
                {userTrips.length === 0 ? (
                  <div style={{ padding: '10px', background: '#F8FAFC', borderRadius: '8px', fontSize: '12.5px', color: '#64748B' }}>
                    You have no trips planned yet. Create your first trip from the My Trips tab.
                  </div>
                ) : (
                  <select
                    value={selectedTripId}
                    onChange={(e) => setSelectedTripId(Number(e.target.value))}
                    required
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      color: '#0F172A',
                      outline: 'none',
                      background: '#FFFFFF'
                    }}
                  >
                    {userTrips.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.title} ({t.start_date} to {t.end_date})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    Arrival Date
                  </label>
                  <input
                    type="date"
                    value={stopStartDate}
                    onChange={(e) => setStopStartDate(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12.5px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    Departure Date
                  </label>
                  <input
                    type="date"
                    value={stopEndDate}
                    onChange={(e) => setStopEndDate(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12.5px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    Transit Mode
                  </label>
                  <select
                    value={stopTransitMode}
                    onChange={(e) => setStopTransitMode(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12.5px',
                      outline: 'none',
                      background: '#FFFFFF'
                    }}
                  >
                    <option value="Flight">✈️ Flight</option>
                    <option value="Train">🚂 Train</option>
                    <option value="Car">🚗 Rental / Drive</option>
                    <option value="Ferry">🚢 Ferry</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    Stay Budget ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stopStayCost}
                    onChange={(e) => setStopStayCost(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12.5px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={stopNotes}
                  onChange={(e) => setStopNotes(e.target.value)}
                  placeholder="Key places to visit or notes..."
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12.5px',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setAddToTripModalCity(null)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '10px',
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingStop || userTrips.length === 0}
                  style={{
                    flex: 1.5,
                    padding: '10px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: userTrips.length === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSubmittingStop ? 'Adding...' : 'Add Stop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Country Dossier Modal */}
      {selectedCountryDossier && (
        <CountryDossierModal
          country={selectedCountryDossier}
          onClose={() => setSelectedCountryDossier(null)}
          onPlanTrip={(_cName) => {
            setSelectedCountryDossier(null);
            if (onPlanTripClick) onPlanTripClick();
          }}
        />
      )}
    </div>
  );
};
