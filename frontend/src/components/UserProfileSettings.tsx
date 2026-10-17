import React, { useState, useEffect } from 'react';
import { UserProfile, City, ActiveTab, Trip } from '../types';
import { api } from '../api';

interface Props {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onNavigate: (tab: ActiveTab, tripId?: number) => void;
}

export const UserProfileSettings: React.FC<Props> = ({ user, onUpdateUser, onNavigate }) => {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || '');
  const [homeCountry, setHomeCountry] = useState(user.home_country || 'India');
  const [currencyPref, setCurrencyPref] = useState(user.currency_pref || 'USD');
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || '');
  const [wishlist, setWishlist] = useState<City[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    api.getWishlist(user.id || 1).then(res => setWishlist(res.wishlist)).catch(console.error);
    api.getTrips(user.id || 1).then(res => setTrips(res.trips)).catch(console.error);
  }, [user.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await api.updateProfile({
        id: user.id || 1,
        name,
        bio,
        home_country: homeCountry,
        currency_pref: currencyPref,
        avatar_url: avatarUrl
      });
      setSaving(false);
      setSavedSuccess(true);
      onUpdateUser(res.user);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setSaving(false);
      alert(err.message || 'Could not update profile');
    }
  };

  const handleRemoveWishlist = async (cityId: number) => {
    try {
      await api.removeFromWishlist(cityId, user.id || 1);
      setWishlist(prev => prev.filter(c => c.id !== cityId));
      window.dispatchEvent(new CustomEvent('wishlist-updated'));
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div style={{ marginTop: '24px', maxWidth: '880px', margin: '24px auto 0' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#292833', letterSpacing: '-0.5px' }}>
          Traveler Dossier & Settings
        </h2>
        <p style={{ fontSize: '14px', color: '#777584' }}>
          Manage your personal voyage identity, currency localization, and saved wishlist destinations
        </p>
      </div>

      {savedSuccess && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(247, 191, 213, 0.25) 0%, rgba(195, 154, 217, 0.25) 100%)',
          border: '1.5px solid #E8E2F0',
          color: '#203F70',
          padding: '14px 20px',
          borderRadius: '16px',
          fontSize: '14px',
          fontWeight: 700,
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>✨</span>
          <span>Your traveler profile and preferences have been updated!</span>
        </div>
      )}

      {/* Profile Form Card */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        border: '1.5px solid #E8E2F0',
        padding: '32px',
        boxShadow: '0 8px 30px rgba(32, 63, 112, 0.05)',
        marginBottom: '28px'
      }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Avatar & Image Selection from PC or Library */}
          <div style={{ paddingBottom: '20px', borderBottom: '1px solid #E8E2F0' }}>
            <label className="form-label" style={{ marginBottom: '12px', display: 'block', color: '#203F70' }}>
              TRAVELER AVATAR IDENTITY
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
              <img
                src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80'}
                alt={name}
                style={{ width: '84px', height: '84px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #8178E8', boxShadow: '0 4px 14px rgba(129, 120, 232, 0.3)' }}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="file"
                    id="pc-avatar-upload"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          alert('Image file size must be under 5MB');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (reader.result) setAvatarUrl(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <label
                    htmlFor="pc-avatar-upload"
                    style={{
                      background: 'linear-gradient(135deg, #8178E8 0%, #A678BD 100%)',
                      color: '#FFFFFF',
                      padding: '10px 22px',
                      borderRadius: '9999px',
                      fontSize: '13px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(129, 120, 232, 0.25)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>Upload from PC</span>
                  </label>

                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      style={{
                        background: '#FAF9FC',
                        color: '#777584',
                        border: '1px solid #E8E2F0',
                        padding: '10px 16px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      title="Reset to default avatar"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <span style={{ fontSize: '11.5px', color: '#777584' }}>
                  PNG, JPG, or WebP up to 5MB from your computer
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">FULL NAME</label>
              <div className="input-container">
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">EMAIL ADDRESS</label>
              <div className="input-container" style={{ background: '#F1F5F9', opacity: 0.8 }}>
                <input
                  type="email"
                  className="form-input"
                  value={user.email}
                  readOnly
                  disabled
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">BIO & TRAVEL MANIFESTO</label>
            <div className="input-container" style={{ height: 'auto', padding: '10px 14px' }}>
              <textarea
                className="form-input"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your travel philosophy..."
                style={{ resize: 'none' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">BASE COUNTRY</label>
              <div className="input-container">
                <input
                  type="text"
                  className="form-input"
                  value={homeCountry}
                  onChange={(e) => setHomeCountry(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">DEFAULT CURRENCY</label>
              <div className="input-container">
                <select
                  className="form-input"
                  value={currencyPref}
                  onChange={(e) => setCurrencyPref(e.target.value)}
                >
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="INR">INR (₹) - Indian Rupee</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                  <option value="JPY">JPY (¥) - Japanese Yen</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn-submit"
            disabled={saving}
            style={{ maxWidth: '240px', marginTop: '10px' }}
          >
            {!saving ? (
              <span>Save Preferences</span>
            ) : (
              <div className="spinner" />
            )}
          </button>
        </form>
      </div>

      {/* Saved Wishlist Destinations */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        border: '1.5px solid #E8E2F0',
        padding: '32px',
        boxShadow: '0 8px 30px rgba(32, 63, 112, 0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#292833' }}>Saved Wishlist Destinations</h3>
            <p style={{ fontSize: '13px', color: '#777584' }}>Places you intend to visit on future journeys</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="nav-link"
              style={{ color: '#203F70', fontWeight: 700, background: 'linear-gradient(135deg, rgba(247, 191, 213, 0.25) 0%, rgba(195, 154, 217, 0.25) 100%)', border: '1px solid #E8E2F0', borderRadius: '9999px', padding: '8px 16px' }}
              onClick={() => onNavigate('saved-places')}
            >
              ❤️ Go to Saved Places Page
            </button>
            <button
              type="button"
              className="nav-link"
              style={{ color: '#FFFFFF', fontWeight: 700, background: 'linear-gradient(135deg, #8178E8 0%, #A678BD 100%)', border: 'none', borderRadius: '9999px', padding: '8px 16px' }}
              onClick={() => onNavigate('cities')}
            >
              + Explore More Cities
            </button>
          </div>
        </div>

        {wishlist.length === 0 ? (
          <p style={{ fontSize: '14px', color: '#777584', textAlign: 'center', padding: '30px' }}>
            Your wishlist is empty. Tap the heart icon on any destination in the Destinations tab.
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
            {wishlist.map(city => (
              <div
                key={city.id}
                style={{
                  background: '#FAF9FC',
                  borderRadius: '16px',
                  border: '1.5px solid #E8E2F0',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  boxShadow: '0 2px 8px rgba(32, 63, 112, 0.03)'
                }}
              >
                <img
                  src={city.image_url}
                  alt={city.name}
                  style={{ width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#292833' }}>{city.name}</h4>
                  <p style={{ fontSize: '12px', color: '#777584' }}>{city.country}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveWishlist(city.id)}
                  title="Remove from wishlist"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#8178E8',
                    cursor: 'pointer',
                    padding: '8px'
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preplanned Trips */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        border: '1.5px solid #E8E2F0',
        padding: '24px',
        marginTop: '24px',
        boxShadow: '0 8px 30px rgba(32, 63, 112, 0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#292833', margin: 0 }}>Preplanned Trips</h3>
            <p style={{ fontSize: '13px', color: '#777584', margin: '4px 0 0 0' }}>Itineraries currently in design or scheduled for upcoming dates</p>
          </div>
        </div>

        {trips.filter(t => t.status === 'Planning' || t.status === 'Active').length === 0 ? (
          <p style={{ fontSize: '13.5px', color: '#777584', textAlign: 'center', padding: '24px' }}>No preplanned trips currently in queue.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
            {trips.filter(t => t.status === 'Planning' || t.status === 'Active').map(trip => (
              <div key={trip.id} style={{ background: '#FAF9FC', borderRadius: '18px', border: '1.5px solid #E8E2F0', overflow: 'hidden' }}>
                <div style={{ height: '110px' }}>
                  <img src={trip.cover_image} alt={trip.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '14px' }}>
                  <div style={{ fontWeight: 800, fontSize: '15px', color: '#292833', marginBottom: '4px' }}>{trip.title}</div>
                  <div style={{ fontSize: '12px', color: '#777584', marginBottom: '12px' }}>📅 {trip.start_date} • ${trip.total_budget}</div>
                  <button
                    type="button"
                    onClick={() => onNavigate('itinerary-view', trip.id)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #8178E8 0%, #A678BD 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Previous Trips */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        border: '1.5px solid #E8E2F0',
        padding: '24px',
        marginTop: '24px',
        boxShadow: '0 8px 30px rgba(32, 63, 112, 0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#292833', margin: 0 }}>Previous Trips</h3>
            <p style={{ fontSize: '13px', color: '#777584', margin: '4px 0 0 0' }}>Completed expedition logs and archived voyages</p>
          </div>
        </div>

        {trips.length === 0 ? (
          <p style={{ fontSize: '13.5px', color: '#777584', textAlign: 'center', padding: '24px' }}>No previous trips logged yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
            {trips.map(trip => (
              <div key={trip.id} style={{ background: '#FAF9FC', borderRadius: '18px', border: '1.5px solid #E8E2F0', overflow: 'hidden' }}>
                <div style={{ height: '110px' }}>
                  <img src={trip.cover_image} alt={trip.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '14px' }}>
                  <div style={{ fontWeight: 800, fontSize: '15px', color: '#292833', marginBottom: '4px' }}>{trip.title}</div>
                  <div style={{ fontSize: '12px', color: '#777584', marginBottom: '12px' }}>Completed • ${trip.total_budget}</div>
                  <button
                    type="button"
                    onClick={() => onNavigate('itinerary-view', trip.id)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #203F70 0%, #192B4D 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
