import React, { useState } from 'react';
import { api } from '../api';
import { Trip } from '../types';

interface Props {
  isOpen: boolean;
  userId?: number;
  onClose: () => void;
  onTripCreated: (newTrip: Trip) => void;
}

const PRESET_PLACES = [
  { name: 'Udaipur, Rajasthan', image: 'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&w=600&q=80', activity: 'Lake Pichola Sunset Boating' },
  { name: 'Jodhpur, Rajasthan', image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=600&q=80', activity: 'Mehrangarh Fort Zip-Lining' },
  { name: 'Jaipur, Pink City', image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=600&q=80', activity: 'Amber Palace Elephant Trail' },
  { name: 'Munnar & Alleppey', image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80', activity: 'Backwater Houseboat Cruise' },
  { name: 'Manali, Himalayas', image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80', activity: 'Solang Valley Paragliding' },
  { name: 'Old Goa Coastline', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80', activity: 'Dudhsagar Waterfall Trek' }
];

export const CreateTripModal: React.FC<Props> = ({ isOpen, userId = 1, onClose, onTripCreated }) => {
  const [title, setTitle] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(PRESET_PLACES[0].name);
  const [startDate, setStartDate] = useState('2026-10-15');
  const [endDate, setEndDate] = useState('2026-10-25');
  const [totalBudget, setTotalBudget] = useState(2500);
  const [coverImage, setCoverImage] = useState(PRESET_PLACES[0].image);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSelectSuggestion = (place: typeof PRESET_PLACES[0]) => {
    setSelectedPlace(place.name);
    setCoverImage(place.image);
    if (!title) setTitle(`${place.name.split(',')[0]} Expedition`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Trip title is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.createTrip({
        user_id: Number(userId) || 1,
        title: title.trim(),
        description: `Voyage to ${selectedPlace}. Includes curated stops and personalized activities.`,
        start_date: startDate,
        end_date: endDate,
        total_budget: Number(totalBudget) || 2000,
        cover_image: coverImage
      });

      // Pre-seed the first city stop if a recognized destination city is matched
      try {
        const rawPlace = selectedPlace.split(',')[0].trim().toLowerCase();
        const citiesRes = await api.getCities();
        const matchedCity = citiesRes.cities.find(c => 
          c.name.toLowerCase() === rawPlace ||
          rawPlace.includes(c.name.toLowerCase()) ||
          c.name.toLowerCase().includes(rawPlace)
        );
        if (matchedCity && res.trip && res.trip.id) {
          await api.addStop(res.trip.id, {
            city_id: matchedCity.id,
            start_date: startDate,
            end_date: endDate,
            transit_mode: 'Flight',
            stay_cost: Math.round((Number(totalBudget) || 2000) * 0.25)
          });
        }
      } catch (stopErr) {
        console.warn('Auto stop attachment notice:', stopErr);
      }

      setLoading(false);
      onTripCreated(res.trip);
      onClose();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Failed to create trip');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" style={{ maxWidth: '680px', maxHeight: '92vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">✕</button>

        <div className="modal-icon-badge" style={{ background: '#FDF4F8', color: '#8178E8' }}>
          🌸
        </div>

        <h2 className="modal-title" style={{ color: '#292833', fontSize: '22px', fontWeight: 900 }}>Plan a New Expedition</h2>
        <p className="modal-desc" style={{ color: '#777584' }}>
          Personalized voyage builder: select destination, calendar dates, budget, and curated experiences.
        </p>

        {error && (
          <div style={{ padding: '10px 14px', background: '#FEE2E2', color: '#B91C1C', borderRadius: '10px', fontSize: '13px', marginBottom: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Trip Name */}
          <div className="form-group">
            <label className="form-label">TRIP NAME</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Royal Rajasthan Heritage Trail"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Select a Place (Screen 4) */}
          <div className="form-group">
            <label className="form-label">SELECT A PLACE</label>
            <input
              type="text"
              className="form-input"
              placeholder="Select or enter destination city"
              value={selectedPlace}
              onChange={(e) => setSelectedPlace(e.target.value)}
              required
            />
          </div>

          {/* Dates: Start Date & End Date (Screen 4) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">START DATE</label>
              <input
                type="date"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">END DATE</label>
              <input
                type="date"
                className="form-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">TOTAL ESTIMATED BUDGET (USD)</label>
            <input
              type="number"
              className="form-input"
              value={totalBudget}
              onChange={(e) => setTotalBudget(Number(e.target.value))}
            />
          </div>

          {/* Trip Cover Photo / Upload from PC */}
          <div style={{ marginTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="form-label" style={{ margin: 0 }}>
                TRIP COVER PHOTO
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="file"
                  id="user-trip-cover-upload"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 8 * 1024 * 1024) {
                        alert('Photo file size must be under 8MB');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        if (reader.result) setCoverImage(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <label
                  htmlFor="user-trip-cover-upload"
                  style={{
                    background: 'linear-gradient(135deg, #8178E8 0%, #A678BD 100%)',
                    color: '#FFFFFF',
                    padding: '6px 14px',
                    borderRadius: '10px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(129, 120, 232, 0.25)'
                  }}
                >
                  <span>📁 Upload from PC</span>
                </label>
              </div>
            </div>

            {coverImage && (
              <div style={{ position: 'relative', height: '110px', borderRadius: '14px', overflow: 'hidden', border: '1.5px solid #E8E2F0', marginBottom: '10px' }}>
                <img
                  src={coverImage}
                  alt="Trip Cover"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '6px',
                  left: '10px',
                  background: 'rgba(32, 63, 112, 0.8)',
                  color: '#FFFFFF',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600
                }}>
                  Selected Cover Photo
                </div>
              </div>
            )}
          </div>

          {/* Suggestion for Places to Visit / Activities to perform */}
          <div style={{ marginTop: '10px' }}>
            <label className="form-label" style={{ marginBottom: '8px', display: 'block', color: '#777584' }}>
              SUGGESTION FOR PLACES TO VISIT / ACTIVITIES TO PERFORM
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {PRESET_PLACES.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectSuggestion(item)}
                  style={{
                    border: selectedPlace === item.name ? '2px solid #8178E8' : '1px solid #E8E2F0',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    background: selectedPlace === item.name ? '#FDF4F8' : '#FFFFFF',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ height: '70px', overflow: 'hidden' }}>
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '8px' }}>
                    <div style={{ fontWeight: 700, fontSize: '12px', color: '#292833', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#8178E8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      🎯 {item.activity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn-plan-budget"
            disabled={loading}
            style={{ width: '100%', marginTop: '12px', padding: '12px', fontSize: '15px' }}
          >
            {loading ? 'Creating Trip...' : 'Plan Trip & Begin Itinerary'}
          </button>
        </form>
      </div>
    </div>
  );
};
