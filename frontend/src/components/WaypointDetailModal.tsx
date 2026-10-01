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
          background: '#E6FFFA',
          color: '#0D9488',
          fontSize: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}>
          {waypoint.icon}
        </div>

        <span style={{ fontSize: '11px', fontWeight: 800, color: '#0D9488', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {waypoint.category}
        </span>
        <h2 className="modal-title" style={{ marginTop: '2px', marginBottom: '6px' }}>{waypoint.title}</h2>
        <p style={{ fontSize: '13.5px', color: '#64748B', marginBottom: '20px' }}>{waypoint.subtitle}</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
          <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>Duration</span>
            <p style={{ fontSize: '14px', fontWeight: 800, color: '#111827', marginTop: '2px' }}>{waypoint.duration}</p>
          </div>
          <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>Elevation / Speed</span>
            <p style={{ fontSize: '14px', fontWeight: 800, color: '#111827', marginTop: '2px' }}>{waypoint.elevation}</p>
          </div>
        </div>

        <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: '1.55', marginBottom: '18px' }}>
          {waypoint.description}
        </p>

        <div style={{ marginBottom: '18px' }}>
          <h4 style={{ fontSize: '12.5px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
            Expedition Highlights
          </h4>
          <ul style={{ paddingLeft: '18px', fontSize: '13px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {waypoint.highlights.map((h, idx) => (
              <li key={idx}>{h}</li>
            ))}
          </ul>
        </div>

        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '12px 14px', borderRadius: '12px', fontSize: '12.5px', color: '#92400E', marginBottom: '20px' }}>
          💡 <strong>Traveler Tip:</strong> {waypoint.tips}
        </div>

        <button
          type="button"
          className="btn-submit"
          onClick={onClose}
          style={{ background: '#0D9488' }}
        >
          <span>Continue Journey Track</span>
        </button>
      </div>
    </div>
  );
};
