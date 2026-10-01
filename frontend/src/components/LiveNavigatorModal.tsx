import React, { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveNavigatorModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeSpeed, setActiveSpeed] = useState(82);
  const [chauffeurConnected, setChauffeurConnected] = useState(false);
  const [callingState, setCallingState] = useState<'idle' | 'dialing' | 'connected'>('idle');

  if (!isOpen) return null;

  const handleCallChauffeur = () => {
    if (callingState === 'connected') {
      setCallingState('idle');
      return;
    }
    setCallingState('dialing');
    setTimeout(() => {
      setCallingState('connected');
    }, 1500);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" style={{ maxWidth: '680px', padding: '36px' }} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">✕</button>

        {/* Live Expedition Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#EF4444',
            boxShadow: '0 0 10px #EF4444',
            animation: 'pulseRipple 1.5s infinite'
          }} />
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#E11D48', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            TELEMETRY BROADCAST ACTIVE
          </span>
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#111827', letterSpacing: '-0.4px', margin: '4px 0' }}>
          Rajasthan Royal Heritage Odyssey
        </h2>
        <p style={{ fontSize: '13.5px', color: '#64748B', marginTop: '2px', marginBottom: '22px' }}>
          Live satellite transit tracking, vehicle telemetry, and waypoint guidance
        </p>

        {/* Radar & Metrics Grid */}
        <div style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          borderRadius: '20px',
          padding: '24px',
          color: '#FFFFFF',
          marginBottom: '22px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', textAlign: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px 8px' }}>
              <span style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>GPS Latitude</span>
              <p style={{ fontSize: '16px', fontWeight: 800, color: '#2DD4BF', marginTop: '4px' }}>24.5854° N</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px 8px' }}>
              <span style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>GPS Longitude</span>
              <p style={{ fontSize: '16px', fontWeight: 800, color: '#2DD4BF', marginTop: '4px' }}>73.7125° E</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px 8px' }}>
              <span style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>Ground Speed</span>
              <p style={{ fontSize: '16px', fontWeight: 800, color: '#FCD34D', marginTop: '4px' }}>{activeSpeed} km/h</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px 8px' }}>
              <span style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>Station Weather</span>
              <p style={{ fontSize: '16px', fontWeight: 800, color: '#F472B6', marginTop: '4px' }}>29°C Clear</p>
            </div>
          </div>

          {/* Compass & Progress Bar */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '8px' }}>
              <span style={{ color: '#94A3B8' }}>Current Leg: Udaipur → Jodhpur Highway</span>
              <span style={{ color: '#2DD4BF', fontWeight: 700 }}>78% Leg Completed (184 km)</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ width: '78%', height: '100%', background: 'linear-gradient(90deg, #0D9488, #2DD4BF)', borderRadius: '9999px' }} />
            </div>
          </div>
        </div>

        {/* Live Waypoints Sequence */}
        <div style={{ marginBottom: '22px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
            Expedition Waypoints
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: '#10B981', fontWeight: 800 }}>✓</span>
                <span style={{ fontWeight: 700, color: '#111827' }}>Delhi Airport & Old City Walk</span>
              </div>
              <span style={{ fontSize: '12px', color: '#64748B' }}>Departed Oct 1</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: '#10B981', fontWeight: 800 }}>✓</span>
                <span style={{ fontWeight: 700, color: '#111827' }}>Jaipur Amber Fort & Palaces</span>
              </div>
              <span style={{ fontSize: '12px', color: '#64748B' }}>Completed Oct 5</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#ECFDF5', borderRadius: '12px', border: '1.5px solid #0D9488' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: '#0D9488', fontWeight: 900 }}>◉</span>
                <span style={{ fontWeight: 800, color: '#065F46' }}>Udaipur (Lake Pichola Station)</span>
              </div>
              <span style={{ fontSize: '12px', color: '#0D9488', fontWeight: 700 }}>CURRENT STATION (29°C)</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: '#94A3B8', fontWeight: 800 }}>○</span>
                <span style={{ fontWeight: 700, color: '#475569' }}>Jodhpur Mehrangarh Fort & Thar Dunes</span>
              </div>
              <span style={{ fontSize: '12px', color: '#E11D48', fontWeight: 700 }}>Next Stop in 4h 30m</span>
            </div>
          </div>
        </div>

        {/* Animated Chauffeur Calling Card (Replaces native browser alert popup) */}
        {callingState !== 'idle' && (
          <div style={{
            background: callingState === 'dialing' ? '#FEF3C7' : '#ECFDF5',
            border: callingState === 'dialing' ? '1.5px solid #FCD34D' : '1.5px solid #6EE7B7',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            animation: 'fadeIn 0.3s ease-in-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: callingState === 'dialing' ? '#F59E0B' : '#10B981',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                boxShadow: '0 0 14px rgba(16, 185, 129, 0.4)'
              }}>
                📞
              </div>
              <div>
                <p style={{ fontWeight: 800, color: '#111827', margin: 0, fontSize: '14px' }}>
                  {callingState === 'dialing' ? 'Dialing Driver Vikram Singh via Satellite VoIP...' : 'Connected with Driver Vikram Singh'}
                </p>
                <p style={{ fontSize: '12px', color: '#475569', margin: '2px 0 0 0' }}>
                  Toyota Fortuner 4x4 (RJ-27-UB-4082) • Udaipur Standby • Audio Channel Clear
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCallingState('idle')}
              style={{
                background: '#EF4444',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '9999px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              End Call
            </button>
          </div>
        )}

        {/* Audio Guide & Chauffeur Action Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <button
            type="button"
            onClick={() => setIsPlayingAudio(!isPlayingAudio)}
            style={{
              background: isPlayingAudio ? '#4F46E5' : '#F1F5F9',
              color: isPlayingAudio ? '#FFFFFF' : '#1E293B',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <span>{isPlayingAudio ? '🔊 Playing Mewar Guide...' : '🎙️ Play Cultural Audio Guide'}</span>
          </button>

          <button
            type="button"
            onClick={handleCallChauffeur}
            style={{
              background: callingState === 'connected' ? '#10B981' : '#0D9488',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)'
            }}
          >
            <span>{callingState === 'connected' ? '🟢 Audio Live: Vikram Singh' : '📞 Contact Chauffeur'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
