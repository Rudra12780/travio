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
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div style={{ marginTop: '24px', maxWidth: '880px', margin: '24px auto 0' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#111827', letterSpacing: '-0.5px' }}>
          Traveler Profile & Preferences
        </h2>
        <p style={{ fontSize: '14px', color: '#64748B' }}>
          Manage your personal voyage identity, currency localization, and saved wishlist destinations
        </p>
      </div>

      {savedSuccess && (
        <div style={{
          background: '#ECFDF5',
          border: '1px solid #A7F3D0',
          color: '#065F46',
          padding: '12px 18px',
          borderRadius: '14px',
          fontSize: '14px',
          fontWeight: 600,
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>✓</span>
          <span>Your traveler profile and preferences have been updated!</span>
        </div>
      )}

      {/* Profile Form Card */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid #E2E8F0',
        padding: '32px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
        marginBottom: '28px'
      }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Avatar & Image Selection from PC or Library */}
          <div style={{ paddingBottom: '20px', borderBottom: '1px solid #F1F5F9' }}>
            <label className="form-label" style={{ marginBottom: '12px', display: 'block' }}>
              TRAVELER AVATAR IDENTITY
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
              <img
                src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80'}
                alt={name}
                style={{ width: '84px', height: '84px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #0D9488', boxShadow: '0 4px 14px rgba(13, 148, 136, 0.3)' }}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="file"
                    id="pc-avatar-upload"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
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
                      background: '#0D9488',
                      color: '#FFFFFF',
                      padding: '8px 16px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>📁 Upload from PC</span>
                  </label>
                </div>
                <span style={{ fontSize: '11.5px', color: '#64748B' }}>
                  PNG, JPG, or WebP up to 5MB from your computer
                </span>
              </div>
            </div>

            {/* Curated Travel Avatar Library */}
            <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontSize: '11px' }}>
              OR SELECT FROM CURATED AVATAR LIBRARY:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '10px' }}>
              {[
                { name: 'Aviator', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80' },
                { name: 'Nomad', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80' },
                { name: 'Explorer', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80' },
                { name: 'Hiker', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80' },
                { name: 'Voyager', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80' },
                { name: 'Captain', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80' },
                { name: 'Pilot', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&h=150&q=80' },
                { name: 'Adventurer', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80' }
              ].map((av, idx) => (
                <div
                  key={idx}
                  onClick={() => setAvatarUrl(av.url)}
                  style={{
                    cursor: 'pointer',
                    borderRadius: '12px',
                    padding: '3px',
                    border: avatarUrl === av.url ? '2.5px solid #0D9488' : '1.5px solid #E2E8F0',
                    transition: 'all 0.15s ease',
                    textAlign: 'center'
                  }}
                  title={av.name}
                >
                  <img
                    src={av.url}
                    alt={av.name}
                    style={{ width: '100%', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                  <span style={{ fontSize: '10px', fontWeight: 600, color: '#475569', display: 'block', marginTop: '2px' }}>
                    {av.name}
                  </span>
                </div>
              ))}
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
        borderRadius: '20px',
        border: '1px solid #E2E8F0',
        padding: '32px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#111827' }}>Saved Wishlist Destinations</h3>
            <p style={{ fontSize: '13px', color: '#64748B' }}>Places you intend to visit on future journeys</p>
          </div>
          <button
            type="button"
            className="nav-link"
            style={{ color: '#0D9488', fontWeight: 700 }}
            onClick={() => onNavigate('cities')}
          >
            + Explore More Cities
          </button>
        </div>

        {wishlist.length === 0 ? (
          <p style={{ fontSize: '14px', color: '#94A3B8', textAlign: 'center', padding: '30px' }}>
            Your wishlist is empty. Tap the heart icon on any destination in the Destinations tab.
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
            {wishlist.map(city => (
              <div
                key={city.id}
                style={{
                  background: '#F8FAFC',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px'
                }}
              >
                <img
                  src={city.image_url}
                  alt={city.name}
                  style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#111827' }}>{city.name}</h4>
                  <p style={{ fontSize: '12px', color: '#64748B' }}>{city.country}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveWishlist(city.id)}
                  title="Remove from wishlist"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#EF4444',
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

      {/* Screen 7: Preplanned Trips */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid #E2E8F0',
        padding: '24px',
        marginTop: '24px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Preplanned Trips</h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>Itineraries currently in design or scheduled for upcoming dates</p>
          </div>
        </div>

        {trips.filter(t => t.status === 'Planning' || t.status === 'Active').length === 0 ? (
          <p style={{ fontSize: '13.5px', color: '#94A3B8', textAlign: 'center', padding: '24px' }}>No preplanned trips currently in queue.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
            {trips.filter(t => t.status === 'Planning' || t.status === 'Active').map(trip => (
              <div key={trip.id} style={{ background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                <div style={{ height: '110px' }}>
                  <img src={trip.cover_image} alt={trip.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '14px' }}>
                  <div style={{ fontWeight: 800, fontSize: '15px', color: '#0F172A', marginBottom: '4px' }}>{trip.title}</div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '12px' }}>📅 {trip.start_date} • ${trip.total_budget}</div>
                  <button
                    type="button"
                    onClick={() => onNavigate('itinerary-view', trip.id)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '8px',
                      background: '#0D9488',
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

      {/* Screen 7: Previous Trips */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid #E2E8F0',
        padding: '24px',
        marginTop: '24px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Previous Trips</h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>Completed expedition logs and archived voyages</p>
          </div>
        </div>

        {trips.length === 0 ? (
          <p style={{ fontSize: '13.5px', color: '#94A3B8', textAlign: 'center', padding: '24px' }}>No previous trips logged yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
            {trips.map(trip => (
              <div key={trip.id} style={{ background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                <div style={{ height: '110px' }}>
                  <img src={trip.cover_image} alt={trip.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '14px' }}>
                  <div style={{ fontWeight: 800, fontSize: '15px', color: '#0F172A', marginBottom: '4px' }}>{trip.title}</div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '12px' }}>Completed • ${trip.total_budget}</div>
                  <button
                    type="button"
                    onClick={() => onNavigate('itinerary-view', trip.id)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '8px',
                      background: '#1E293B',
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
