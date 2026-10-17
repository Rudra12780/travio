import React from 'react';

export interface WaypointInfo {
  icon: string;
  title: string;
  subtitle: string;
  category: string;
  duration: string;
  elevation: string;
  description: string;
  highlights: string[];
  tips: string;
}

interface Props {
  waypoint: WaypointInfo | null;
  onClose: () => void;
}

export const WaypointDetailModal: React.FC<Props> = ({ waypoint, onClose }) => {
  if (!waypoint) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">✕</button>

        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(247, 191, 213, 0.25) 0%, rgba(195, 154, 217, 0.25) 100%)',
          color: '#8178E8',
          fontSize: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          border: '1px solid rgba(129, 120, 232, 0.2)'
        }}>
          {waypoint.icon}
        </div>

        <span style={{ fontSize: '11px', fontWeight: 800, color: '#8178E8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {waypoint.category}
        </span>
        <h2 className="modal-title" style={{ marginTop: '2px', marginBottom: '6px', color: '#292833' }}>{waypoint.title}</h2>
        <p style={{ fontSize: '13.5px', color: '#777584', marginBottom: '20px' }}>{waypoint.subtitle}</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
          <div style={{ background: '#FAF9FC', padding: '10px 14px', borderRadius: '14px', border: '1.5px solid #E8E2F0' }}>
            <span style={{ fontSize: '11px', color: '#777584', textTransform: 'uppercase', fontWeight: 700 }}>Duration</span>
            <p style={{ fontSize: '14px', fontWeight: 800, color: '#292833', marginTop: '2px' }}>{waypoint.duration}</p>
          </div>
          <div style={{ background: '#FAF9FC', padding: '10px 14px', borderRadius: '14px', border: '1.5px solid #E8E2F0' }}>
            <span style={{ fontSize: '11px', color: '#777584', textTransform: 'uppercase', fontWeight: 700 }}>Elevation / Speed</span>
            <p style={{ fontSize: '14px', fontWeight: 800, color: '#292833', marginTop: '2px' }}>{waypoint.elevation}</p>
          </div>
        </div>

        <p style={{ fontSize: '13.5px', color: '#292833', lineHeight: '1.55', marginBottom: '18px' }}>
          {waypoint.description}
        </p>

        <div style={{ marginBottom: '18px' }}>
          <h4 style={{ fontSize: '12.5px', fontWeight: 800, color: '#292833', textTransform: 'uppercase', marginBottom: '8px' }}>
            Expedition Highlights
          </h4>
          <ul style={{ paddingLeft: '18px', fontSize: '13px', color: '#777584', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {waypoint.highlights.map((h, idx) => (
              <li key={idx}>{h}</li>
            ))}
          </ul>
        </div>

        <div style={{ background: 'rgba(129, 120, 232, 0.08)', border: '1px solid rgba(129, 120, 232, 0.2)', padding: '12px 14px', borderRadius: '14px', fontSize: '12.5px', color: '#203F70', marginBottom: '20px' }}>
          💡 <strong>Traveler Tip:</strong> {waypoint.tips}
        </div>

        <button
          type="button"
          className="btn-submit"
          onClick={onClose}
          style={{ background: 'linear-gradient(135deg, #8178E8 0%, #A678BD 100%)', boxShadow: '0 8px 20px rgba(129, 120, 232, 0.3)' }}
        >
          <span>Continue Journey Track</span>
        </button>
      </div>
    </div>
  );
};
