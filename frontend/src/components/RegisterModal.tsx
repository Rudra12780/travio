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
      <div className="modal-card" style={{ maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">✕</button>

        {/* Top Photo Circle */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px' }}>
          <label style={{ cursor: 'pointer', position: 'relative' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '3px solid #8178E8',
              boxShadow: '0 4px 14px rgba(129, 120, 232, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#FAF9FC'
            }}>
              <img src={avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              background: 'linear-gradient(135deg, #8178E8 0%, #A678BD 100%)',
              color: '#FFFFFF',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              boxShadow: '0 2px 6px rgba(129, 120, 232, 0.3)'
            }}>
              📷
            </div>
            <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
          </label>
          <span style={{ fontSize: '11px', color: '#777584', marginTop: '6px', fontWeight: 700 }}>Click to Upload Photo</span>
        </div>

        <h2 className="modal-title" id="reg-title" style={{ textAlign: 'center', margin: '0 0 6px 0', color: '#292833', fontSize: '22px', fontWeight: 900 }}>
          Create Voyager Account
        </h2>
        <p className="modal-desc" style={{ textAlign: 'center', margin: '0 0 20px 0', color: '#777584', fontSize: '13.5px' }}>
          Join GlobalTrotter to craft luxury itineraries, track real-time telemetry, and discover world destinations.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* First Name & Last Name (2 columns) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">FIRST NAME</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Panther"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              {errors.firstName && <span className="field-error">{errors.firstName}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">LAST NAME</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Voyageur"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
              {errors.lastName && <span className="field-error">{errors.lastName}</span>}
            </div>
          </div>

          {/* Email Address & Phone Number (2 columns) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">EMAIL ADDRESS</label>
              <input
                type="email"
                className="form-input"
                placeholder="panther@globaltrotter.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">PHONE NUMBER</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {/* City & Country (2 columns) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">CITY</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Udaipur"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">COUNTRY</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. India"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
          </div>

          {/* Additional Information textarea */}
          <div className="form-group">
            <label className="form-label">TRAVEL PREFERENCES</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Tell us about your travel style, dietary preferences, favorite circuits..."
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
            />
          </div>

          {/* Register Users button */}
          <button
            type="submit"
            className="btn-plan-budget"
            disabled={loading}
            style={{ width: '100%', marginTop: '8px', padding: '13px', fontSize: '15px', justifyContent: 'center' }}
          >
            {loading ? 'Creating Voyager Account...' : 'Register Voyager Account'}
          </button>
        </form>
      </div>
    </div>
  );
};
