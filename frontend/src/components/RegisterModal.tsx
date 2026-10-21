import React, { useState } from 'react';
import { UserProfile } from '../types';
import { api } from '../api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess: (user: UserProfile) => void;
}

export const RegisterModal: React.FC<Props> = ({ isOpen, onClose, onRegisterSuccess }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!firstName.trim()) newErrors.firstName = 'First name required';
    if (!lastName.trim()) newErrors.lastName = 'Last name required';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Valid email is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    try {
      const res = await api.register(fullName, email.trim(), 'password123');
      setLoading(false);
      onRegisterSuccess(res.user);
    } catch (err) {
      setTimeout(() => {
        setLoading(false);
        const user: UserProfile = {
          id: 1,
          name: fullName,
          email: email.trim(),
          role: 'Traveler',
          avatar_url: avatar,
          bio: additionalInfo,
          home_country: country || 'India'
        };
        onRegisterSuccess(user);
      }, 300);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="reg-title">
      <div
        className="modal-card"
        style={{
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#FFFFFF',
          border: '2px solid #101010',
          borderRadius: '16px',
          boxShadow: '6px 6px 0px #101010',
          padding: '32px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close modal"
          style={{ color: '#101010', fontWeight: 900 }}
        >
          ✕
        </button>

        {/* Top Photo Circle */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px' }}>
          <label style={{ cursor: 'pointer', position: 'relative' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid #101010',
              boxShadow: '2px 2px 0px #101010',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#F7F6F2'
            }}>
              <img src={avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              background: '#FFD84D',
              color: '#101010',
              border: '1.5px solid #101010',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px'
            }}>
              📷
            </div>
            <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
          </label>
          <span style={{ fontSize: '11px', color: '#555555', marginTop: '6px', fontWeight: 800, textTransform: 'uppercase' }}>
            Click to Upload Photo
          </span>
        </div>

        <h2 className="modal-title" id="reg-title" style={{ textAlign: 'center', margin: '0 0 6px 0', color: '#101010', fontSize: '24px', fontWeight: 900, letterSpacing: '-0.02em' }}>
          Create Voyager Account
        </h2>
        <p className="modal-desc" style={{ textAlign: 'center', margin: '0 0 20px 0', color: '#555555', fontSize: '13.5px' }}>
          Join GlobalTrotter to craft personalized itineraries, track budgets, and explore destination dossiers.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* First Name & Last Name (2 columns) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label" style={{ color: '#101010', fontWeight: 900, fontSize: '11px' }}>FIRST NAME</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Alex"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                style={{ background: '#F7F6F2', border: '1.5px solid #101010', borderRadius: '8px' }}
              />
              {errors.firstName && <span className="field-error">{errors.firstName}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: '#101010', fontWeight: 900, fontSize: '11px' }}>LAST NAME</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Miller"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                style={{ background: '#F7F6F2', border: '1.5px solid #101010', borderRadius: '8px' }}
              />
              {errors.lastName && <span className="field-error">{errors.lastName}</span>}
            </div>
          </div>

          {/* Email Address & Phone Number (2 columns) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label" style={{ color: '#101010', fontWeight: 900, fontSize: '11px' }}>EMAIL ADDRESS</label>
              <input
                type="email"
                className="form-input"
                placeholder="alex@globaltrotter.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ background: '#F7F6F2', border: '1.5px solid #101010', borderRadius: '8px' }}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: '#101010', fontWeight: 900, fontSize: '11px' }}>PHONE NUMBER</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+1 555 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ background: '#F7F6F2', border: '1.5px solid #101010', borderRadius: '8px' }}
              />
            </div>
          </div>

          {/* City & Country (2 columns) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label" style={{ color: '#101010', fontWeight: 900, fontSize: '11px' }}>CITY</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Zurich"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={{ background: '#F7F6F2', border: '1.5px solid #101010', borderRadius: '8px' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: '#101010', fontWeight: 900, fontSize: '11px' }}>COUNTRY</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Switzerland"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                style={{ background: '#F7F6F2', border: '1.5px solid #101010', borderRadius: '8px' }}
              />
            </div>
          </div>

          {/* Additional Information textarea */}
          <div className="form-group">
            <label className="form-label" style={{ color: '#101010', fontWeight: 900, fontSize: '11px' }}>TRAVEL PREFERENCES</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Tell us about your travel style, dietary preferences, favorite destinations..."
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              style={{ background: '#F7F6F2', border: '1.5px solid #101010', borderRadius: '8px' }}
            />
          </div>

          {/* Register button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              marginTop: '8px',
              padding: '13px',
              fontSize: '13.5px',
              fontWeight: 900,
              borderRadius: '8px',
              background: '#FFD84D',
              color: '#101010',
              border: '2px solid #101010',
              cursor: 'pointer',
              boxShadow: '3px 3px 0px #101010',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            {loading ? 'Creating Voyager Account...' : 'Register Voyager Account'}
          </button>
        </form>
      </div>
    </div>
  );
};
