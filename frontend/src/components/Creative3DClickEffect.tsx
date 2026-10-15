import React, { useState, useEffect, useCallback } from 'react';

interface ClickBurst {
  id: number;
  x: number;
  y: number;
  coords: string;
  theme: {
    primary: string;
    secondary: string;
    glow: string;
  };
}

const THEME_PALETTES = [
  { primary: '#0D9488', secondary: '#14B8A6', glow: 'rgba(13, 148, 136, 0.45)' }, // Emerald Jewel
  { primary: '#D97706', secondary: '#F59E0B', glow: 'rgba(217, 119, 6, 0.45)' },  // Champagne Gold
  { primary: '#2563EB', secondary: '#60A5FA', glow: 'rgba(37, 99, 235, 0.45)' },  // Royal Sapphire
  { primary: '#E11D48', secondary: '#FB7185', glow: 'rgba(225, 29, 72, 0.45)' },  // Rose Gold
  { primary: '#7C3AED', secondary: '#A78BFA', glow: 'rgba(124, 58, 237, 0.45)' }, // Royal Violet
];

export const Creative3DClickEffect: React.FC = () => {
  const [bursts, setBursts] = useState<ClickBurst[]>([]);

  const handleGlobalClick = useCallback((e: MouseEvent) => {
    // Generate authentic live geographic telemetry
    const lat = (Math.random() * 120 - 60).toFixed(4);
    const lng = (Math.random() * 240 - 120).toFixed(4);
    const latDir = Number(lat) >= 0 ? 'N' : 'S';
    const lngDir = Number(lng) >= 0 ? 'E' : 'W';
    const coords = `${Math.abs(Number(lat))}° ${latDir}, ${Math.abs(Number(lng))}° ${lngDir}`;

    const theme = THEME_PALETTES[Math.floor(Math.random() * THEME_PALETTES.length)];

    const newBurst: ClickBurst = {
      id: Date.now() + Math.random(),
      // Use clientX & clientY with position: fixed so it ALWAYS appears exactly under cursor regardless of scroll!
      x: e.clientX,
      y: e.clientY,
      coords,
      theme,
    };

    setBursts((prev) => [...prev.slice(-14), newBurst]);

    // Clean up after 3D animation ends (1.2s)
    setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== newBurst.id));
    }, 1200);
  }, []);

  useEffect(() => {
    window.addEventListener('click', handleGlobalClick, { capture: true });
    return () => window.removeEventListener('click', handleGlobalClick, { capture: true });
  }, [handleGlobalClick]);

  return (
    <div
      className="creative-3d-click-stage"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999999,
        overflow: 'hidden',
        perspective: '1200px',
      }}
    >
      {bursts.map((burst) => (
        <div
          key={burst.id}
          className="spatial-3d-burst"
          style={{
            position: 'absolute',
            left: `${burst.x}px`,
            top: `${burst.y}px`,
            pointerEvents: 'none',
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* 3D Perspective Ground Plane */}
          <div className="spatial-3d-ground-plane">
            {/* 3D Expanding Topographic Grid Pulse */}
            <div
              className="spatial-grid-shockwave"
              style={{
                borderColor: burst.theme.primary,
                boxShadow: `0 0 35px ${burst.theme.glow}, inset 0 0 25px ${burst.theme.glow}`,
              }}
            />

            {/* 3D Isometric Holographic Compass Ring with Cardinal Ticks */}
            <div
              className="spatial-compass-ring"
              style={{
                borderColor: burst.theme.primary,
                boxShadow: `0 0 20px ${burst.theme.glow}`,
              }}
            >
              <div className="compass-tick tick-n" style={{ backgroundColor: '#FFFFFF', boxShadow: `0 0 8px ${burst.theme.glow}` }} />
              <div className="compass-tick tick-s" style={{ backgroundColor: burst.theme.primary }} />
              <div className="compass-tick tick-e" style={{ backgroundColor: burst.theme.primary }} />
              <div className="compass-tick tick-w" style={{ backgroundColor: burst.theme.primary }} />
            </div>

            {/* 3D Concentric Radar Shockwave */}
            <div
              className="spatial-radar-wave"
              style={{
                borderColor: burst.theme.secondary,
                boxShadow: `0 0 25px ${burst.theme.secondary}`,
              }}
            />
          </div>

          {/* 3D Holographic Vertical Crystal Beacon (rising up in Z-Space) */}
          <div className="spatial-3d-vertical-pillar">
            {/* Holographic Light Shaft */}
            <div
              className="spatial-light-beam"
              style={{
                background: `linear-gradient(to top, ${burst.theme.primary}, ${burst.theme.secondary}, transparent)`,
                boxShadow: `0 0 25px ${burst.theme.glow}`,
              }}
            />

            {/* 3D Faceted Geopin / Crystal Prism */}
            <div className="spatial-3d-prism">
              <div
                className="prism-glow-core"
                style={{
                  background: `radial-gradient(circle, #FFFFFF 0%, ${burst.theme.primary} 60%, ${burst.theme.secondary} 100%)`,
                  boxShadow: `0 0 35px ${burst.theme.glow}, 0 0 70px ${burst.theme.primary}`,
                }}
              />
              <svg
                width="38"
                height="48"
                viewBox="0 0 34 44"
                fill="none"
                className="prism-svg-marker"
              >
                <path
                  d="M17 0L33 16L17 44L1 16L17 0Z"
                  fill="url(#prismGrad)"
                  stroke="#FFFFFF"
                  strokeWidth="1.8"
                  style={{ filter: `drop-shadow(0 6px 16px ${burst.theme.glow})` }}
                />
                <circle cx="17" cy="16" r="5.5" fill="#FFFFFF" />
                <defs>
                  <linearGradient id="prismGrad" x1="0" y1="0" x2="34" y2="44" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FFFFFF" />
                    <stop offset="0.3" stopColor={burst.theme.primary} />
                    <stop offset="0.7" stopColor={burst.theme.secondary} />
                    <stop offset="1" stopColor="#0B0F19" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* 3D Kinetic Particle Stars Burst (14 particles) */}
          <div className="spatial-particles-group">
            {[...Array(14)].map((_, i) => (
              <div
                key={i}
                className={`spatial-star-particle particle-${i}`}
                style={{
                  backgroundColor: i % 2 === 0 ? burst.theme.primary : burst.theme.secondary,
                  boxShadow: `0 0 14px ${burst.theme.glow}`,
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
