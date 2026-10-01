import React, { useState } from 'react';
import { Trip } from '../types';
import { api } from '../api';

interface Props {
  trip: Trip | null;
  userId?: number;
  onClose: () => void;
  onTripCopied?: (newTrip: Trip) => void;
}

export const SharedTripModal: React.FC<Props> = ({ trip, userId = 1, onClose, onTripCopied }) => {
  const [copied, setCopied] = useState(false);
  const [cloning, setCloning] = useState(false);

  if (!trip) return null;

  const publicUrl = `${window.location.origin}/trip/${trip.id}?share=true`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCloneTrip = async () => {
    setCloning(true);
    try {
      const res = await api.copyTrip(trip.id, userId);
      setCloning(false);
      alert(`🎉 Voyage "${res.trip.title}" has been copied into your personal expeditions!`);
      if (onTripCopied) onTripCopied(res.trip);
      onClose();
    } catch (err: any) {
      setCloning(false);
      alert(err.message || 'Could not copy trip');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" style={{ maxWidth: '620px' }} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">✕</button>

        <div className="modal-icon-badge" style={{ background: '#EEF2FF', color: '#4F46E5' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </div>

        <h2 className="modal-title">Share Public Expedition</h2>
        <p className="modal-desc">
          Inspire fellow travelers. Anyone with this link can view this curated journey or copy it directly into their personal itinerary planner.
        </p>

        {/* Trip Preview Card */}
        <div style={{
          display: 'flex',
          gap: '16px',
          background: '#F8FAFC',
          borderRadius: '16px',
          padding: '16px',
          border: '1px solid #E2E8F0',
          marginBottom: '20px'
        }}>
          <img
            src={trip.cover_image}
            alt={trip.title}
            style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover' }}
          />
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>{trip.title}</h4>
            <p style={{ fontSize: '12.5px', color: '#64748B', margin: '4px 0' }}>
              📅 {trip.start_date} → {trip.end_date} • {trip.stops?.length || trip.stops_count || 0} Destination Stops
            </p>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0D9488' }}>
              Est. Investment: ${trip.total_budget}
            </span>
          </div>
        </div>

        {/* Share Link Input */}
        <div className="form-group" style={{ marginBottom: '18px' }}>
          <label className="form-label">PUBLIC VOYAGE LINK</label>
          <div className="input-container" style={{ display: 'flex', justifyContent: 'space-between', paddingRight: '8px' }}>
            <input
              type="text"
              readOnly
              value={publicUrl}
              className="form-input"
              style={{ fontSize: '13px', color: '#475569' }}
            />
            <button
              type="button"
              onClick={handleCopyLink}
              style={{
                background: copied ? '#10B981' : '#0D9488',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {copied ? 'Copied! ✓' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* Social Share Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          <a
            href={`https://twitter.com/intent/tweet?text=Check+out+my+GlobeTrotter+expedition:+${encodeURIComponent(trip.title)}&url=${encodeURIComponent(publicUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1,
              textAlign: 'center',
              background: '#F1F5F9',
              color: '#0F172A',
              padding: '10px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            𝕏 Share
          </a>
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out my travel plan "${trip.title}": ${publicUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1,
              textAlign: 'center',
              background: '#ECFDF5',
              color: '#059669',
              padding: '10px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            WhatsApp
          </a>
          <a
            href={`mailto:?subject=${encodeURIComponent(trip.title)}&body=${encodeURIComponent(`Here is the itinerary: ${publicUrl}`)}`}
            style={{
              flex: 1,
              textAlign: 'center',
              background: '#F1F5F9',
              color: '#475569',
              padding: '10px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            Email
          </a>
        </div>

        {/* Copy Trip Action */}
        <button
          type="button"
          onClick={handleCloneTrip}
          disabled={cloning}
          className="btn-submit"
          style={{ background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)' }}
        >
          {!cloning ? (
            <span>Copy This Trip to My Plans 📑</span>
          ) : (
            <div className="spinner" />
          )}
        </button>
      </div>
    </div>
  );
};
