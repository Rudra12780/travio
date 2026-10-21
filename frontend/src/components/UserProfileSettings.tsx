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
    <div style={{ marginTop: '20px', maxWidth: '920px', margin: '20px auto 60px', padding: '0 16px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <span style={{ fontSize: '11px', fontWeight: 900, color: '#101010', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'inline-block', marginBottom: '6px' }}>
          TRAVELER SETTINGS
        </span>
        <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#101010', letterSpacing: '-0.03em', margin: '0 0 6px' }}>
          Traveler Dossier & Settings
        </h2>
        <p style={{ fontSize: '14px', color: '#555555', margin: 0 }}>
          Manage your personal voyage identity, currency preferences, and saved wishlist destinations.
        </p>
      </div>

      {savedSuccess && (
        <div style={{
          background: '#FFD84D',
          border: '2px solid #101010',
          color: '#101010',
          padding: '14px 20px',
          borderRadius: '10px',
          fontSize: '13.5px',
          fontWeight: 800,
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '3px 3px 0px #101010'
        }}>
          <span>✨</span>
          <span>Your traveler profile and preferences have been updated!</span>
        </div>
      )}

      {/* Profile Form Card */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '2px solid #101010',
        padding: '32px',
        boxShadow: '4px 4px 0px #101010',
        marginBottom: '28px'
      }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Avatar Identity */}
          <div style={{ paddingBottom: '22px', borderBottom: '2px solid #E8E6E0' }}>
            <label style={{ marginBottom: '14px', display: 'block', color: '#101010', fontSize: '11.5px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              TRAVELER AVATAR IDENTITY
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <img
                src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80'}
                alt={name}
                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #101010', boxShadow: '2px 2px 0px #101010' }}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
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
                      background: '#FFD84D',
                      color: '#101010',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontWeight: 900,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      border: '2px solid #101010',
                      boxShadow: '2px 2px 0px #101010',
                      textTransform: 'uppercase'
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
                        background: '#FFFFFF',
                        color: '#101010',
                        border: '2px solid #101010',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: '2px 2px 0px #101010'
                      }}
                      title="Reset to default avatar"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <span style={{ fontSize: '11.5px', color: '#555555', fontWeight: 600 }}>
                  PNG, JPG, or WebP up to 5MB from your computer
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#101010', marginBottom: '6px', textTransform: 'uppercase' }}>
                FULL NAME
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1.5px solid #101010',
                  background: '#F7F6F2',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  color: '#101010',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#101010', marginBottom: '6px', textTransform: 'uppercase' }}>
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={user.email}
                readOnly
                disabled
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1.5px solid #E8E6E0',
                  background: '#F7F6F2',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: '#777777',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#101010', marginBottom: '6px', textTransform: 'uppercase' }}>
              BIO & TRAVEL MANIFESTO
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Share your travel philosophy..."
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1.5px solid #101010',
                background: '#F7F6F2',
                fontSize: '13.5px',
                fontWeight: 500,
                color: '#101010',
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#101010', marginBottom: '6px', textTransform: 'uppercase' }}>
                BASE COUNTRY
              </label>
              <input
                type="text"
                value={homeCountry}
                onChange={(e) => setHomeCountry(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1.5px solid #101010',
                  background: '#F7F6F2',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  color: '#101010',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#101010', marginBottom: '6px', textTransform: 'uppercase' }}>
                DEFAULT CURRENCY
              </label>
              <select
                value={currencyPref}
                onChange={(e) => setCurrencyPref(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1.5px solid #101010',
                  background: '#F7F6F2',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  color: '#101010',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                <option value="USD">USD ($) - US Dollar</option>
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="JPY">JPY (¥) - Japanese Yen</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              maxWidth: '240px',
              marginTop: '6px',
              padding: '12px 24px',
              borderRadius: '8px',
              background: '#FFD84D',
              color: '#101010',
              fontWeight: 900,
              fontSize: '13px',
              border: '2px solid #101010',
              cursor: 'pointer',
              boxShadow: '3px 3px 0px #101010',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            {!saving ? (
              <span>Save Preferences</span>
            ) : (
              <div className="spinner" style={{ width: '16px', height: '16px', borderTopColor: '#101010' }} />
            )}
          </button>
        </form>
      </div>

      {/* Saved Wishlist Destinations */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '2px solid #101010',
        padding: '28px',
        boxShadow: '4px 4px 0px #101010',
        marginBottom: '28px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#101010', margin: 0 }}>
              Saved Wishlist Destinations
            </h3>
            <p style={{ fontSize: '13px', color: '#555555', margin: '3px 0 0' }}>
              Places you intend to visit on future journeys
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              style={{
                color: '#101010',
                fontWeight: 800,
                fontSize: '12px',
                background: '#F4AFC1',
                border: '2px solid #101010',
                borderRadius: '8px',
                padding: '8px 16px',
                cursor: 'pointer',
                boxShadow: '2px 2px 0px #101010'
              }}
              onClick={() => onNavigate('saved-places')}
            >
              ❤️ Saved Places
            </button>
            <button
              type="button"
              style={{
                color: '#101010',
                fontWeight: 800,
                fontSize: '12px',
                background: '#FFD84D',
                border: '2px solid #101010',
                borderRadius: '8px',
                padding: '8px 16px',
                cursor: 'pointer',
                boxShadow: '2px 2px 0px #101010'
              }}
              onClick={() => onNavigate('cities')}
            >
              + Explore Cities
            </button>
          </div>
        </div>

        {wishlist.length === 0 ? (
          <p style={{ fontSize: '14px', color: '#555555', textAlign: 'center', padding: '30px', background: '#F7F6F2', borderRadius: '8px', border: '1.5px dashed #101010' }}>
            Your wishlist is empty. Tap the bookmark icon on any destination in the Destinations explorer.
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
            {wishlist.map(city => (
              <div
                key={city.id}
                style={{
                  background: '#F7F6F2',
                  borderRadius: '12px',
                  border: '1.5px solid #101010',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  boxShadow: '2px 2px 0px #101010'
                }}
              >
                <img
                  src={city.image_url}
                  alt={city.name}
                  style={{ width: '54px', height: '54px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #101010' }}
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 900, color: '#101010', margin: 0 }}>{city.name}</h4>
                  <p style={{ fontSize: '12px', color: '#555555', margin: '2px 0 0' }}>{city.country}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveWishlist(city.id)}
                  title="Remove from wishlist"
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #101010',
                    color: '#101010',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    padding: '6px 8px',
                    fontWeight: 900,
                    fontSize: '12px'
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
        borderRadius: '16px',
        border: '2px solid #101010',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '4px 4px 0px #101010'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#101010', margin: 0 }}>Preplanned Expeditions</h3>
            <p style={{ fontSize: '13px', color: '#555555', margin: '4px 0 0 0' }}>Itineraries currently in design or scheduled for upcoming departures</p>
          </div>
        </div>

        {trips.filter(t => t.status === 'Planning' || t.status === 'Active').length === 0 ? (
          <p style={{ fontSize: '13.5px', color: '#555555', textAlign: 'center', padding: '24px', background: '#F7F6F2', borderRadius: '8px', border: '1.5px dashed #101010' }}>
            No preplanned expeditions currently in queue.
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
            {trips.filter(t => t.status === 'Planning' || t.status === 'Active').map(trip => (
              <div key={trip.id} style={{ background: '#F7F6F2', borderRadius: '12px', border: '1.5px solid #101010', overflow: 'hidden' }}>
                <div style={{ height: '110px', borderBottom: '1.5px solid #101010' }}>
                  <img src={trip.cover_image} alt={trip.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '14px' }}>
                  <div style={{ fontWeight: 900, fontSize: '15px', color: '#101010', marginBottom: '4px' }}>{trip.title}</div>
                  <div style={{ fontSize: '12px', color: '#555555', marginBottom: '12px', fontWeight: 600 }}>📅 {trip.start_date} • ${trip.total_budget}</div>
                  <button
                    type="button"
                    onClick={() => onNavigate('itinerary-view', trip.id)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '6px',
                      background: '#FFD84D',
                      color: '#101010',
                      border: '1.5px solid #101010',
                      fontWeight: 800,
                      fontSize: '12px',
                      cursor: 'pointer',
                      boxShadow: '1.5px 1.5px 0px #101010',
                      textTransform: 'uppercase'
                    }}
                  >
                    View Timeline
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
        borderRadius: '16px',
        border: '2px solid #101010',
        padding: '24px',
        boxShadow: '4px 4px 0px #101010'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#101010', margin: 0 }}>Archived Journeys</h3>
            <p style={{ fontSize: '13px', color: '#555555', margin: '4px 0 0 0' }}>Completed expedition logs and archived voyages</p>
          </div>
        </div>

        {trips.length === 0 ? (
          <p style={{ fontSize: '13.5px', color: '#555555', textAlign: 'center', padding: '24px', background: '#F7F6F2', borderRadius: '8px', border: '1.5px dashed #101010' }}>
            No previous trips logged yet.
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
            {trips.map(trip => (
              <div key={trip.id} style={{ background: '#F7F6F2', borderRadius: '12px', border: '1.5px solid #101010', overflow: 'hidden' }}>
                <div style={{ height: '110px', borderBottom: '1.5px solid #101010' }}>
                  <img src={trip.cover_image} alt={trip.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '14px' }}>
                  <div style={{ fontWeight: 900, fontSize: '15px', color: '#101010', marginBottom: '4px' }}>{trip.title}</div>
                  <div style={{ fontSize: '12px', color: '#555555', marginBottom: '12px', fontWeight: 600 }}>Completed • ${trip.total_budget}</div>
                  <button
                    type="button"
                    onClick={() => onNavigate('itinerary-view', trip.id)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '6px',
                      background: '#FFFFFF',
                      color: '#101010',
                      border: '1.5px solid #101010',
                      fontWeight: 800,
                      fontSize: '12px',
                      cursor: 'pointer',
                      boxShadow: '1.5px 1.5px 0px #101010',
                      textTransform: 'uppercase'
                    }}
                  >
                    View Archive
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
