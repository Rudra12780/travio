import React, { useState, useEffect, useCallback } from 'react';

interface ClickBurst {
  id: number;
  x: number;
  y: number;
  theme: {
    primary: string;
    secondary: string;
    glow: string;
  };
}

const THEME_PALETTES = [
  { primary: '#0D9488', secondary: '#14B8A6', glow: 'rgba(13, 148, 136, 0.45)' }, // Emerald
  { primary: '#D97706', secondary: '#F59E0B', glow: 'rgba(217, 119, 6, 0.45)' },  // Gold
  { primary: '#2563EB', secondary: '#60A5FA', glow: 'rgba(37, 99, 235, 0.45)' },  // Sapphire
  { primary: '#E11D48', secondary: '#FB7185', glow: 'rgba(225, 29, 72, 0.45)' },  // Rose
  { primary: '#7C3AED', secondary: '#A78BFA', glow: 'rgba(124, 58, 237, 0.45)' }, // Violet
];

export const Creative3DClickEffect: React.FC = () => {
  const [bursts, setBursts] = useState<ClickBurst[]>([]);

  const handleGlobalClick = useCallback((e: MouseEvent) => {
    // Pick next dynamic color theme
    const theme = THEME_PALETTES[Math.floor(Math.random() * THEME_PALETTES.length)];

    const newBurst: ClickBurst = {
      id: Date.now() + Math.random(),
      x: e.clientX,
      y: e.clientY,
      theme,
    };

    setBursts((prev) => [...prev.slice(-10), newBurst]);

    // Fast, crisp animation cleanup after 650ms
    setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== newBurst.id));
    }, 650);
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
      }}
    >
      <style>{`
        @keyframes microRipple {
          0% {
            transform: translate(-50%, -50%) scale(0.2);
            opacity: 0.9;
          }
          100% {
            transform: translate(-50%, -50%) scale(2.4);
            opacity: 0;
          }
        }

        @keyframes microBeaconPop {
          0% {
            transform: translate(-50%, -20%) scale(0.4);
            opacity: 0;
          }
          35% {
            transform: translate(-50%, -60%) scale(1.1);
            opacity: 1;
          }
          70% {
            transform: translate(-50%, -85%) scale(1);
            opacity: 0.9;
          }
          100% {
            transform: translate(-50%, -120%) scale(0.7);
            opacity: 0;
          }
        }

        @keyframes microSparkle {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--dx), var(--dy)) scale(0);
            opacity: 0;
          }
        }
      `}</style>

      {bursts.map((burst) => (
        <div
          key={burst.id}
          style={{
            position: 'absolute',
            left: `${burst.x}px`,
            top: `${burst.y}px`,
            pointerEvents: 'none',
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Subtle concentric ripple ring */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              border: `1.5px solid ${burst.theme.primary}`,
              boxShadow: `0 0 10px ${burst.theme.glow}`,
              animation: 'microRipple 0.65s cubic-bezier(0.12, 0.9, 0.22, 1) forwards',
              pointerEvents: 'none',
            }}
          />

          {/* Dainty compact waypoint pin / diamond beacon */}
          <div
            style={{
              position: 'absolute',
              top: '0',
              left: '0',
              animation: 'microBeaconPop 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              pointerEvents: 'none',
            }}
          >
            <svg
              width="18"
              height="22"
              viewBox="0 0 18 22"
              fill="none"
              style={{
                filter: `drop-shadow(0 2px 6px ${burst.theme.glow})`,
                display: 'block',
              }}
            >
              <path
                d="M9 0L17 7L9 21L1 7L9 0Z"
                fill={burst.theme.primary}
                stroke="#FFFFFF"
                strokeWidth="1.2"
              />
              <circle cx="9" cy="7" r="2.5" fill="#FFFFFF" />
            </svg>
          </div>

          {/* 6 delicate micro-sparkle specks */}
          {[
            { dx: '14px', dy: '-14px' },
            { dx: '-14px', dy: '-14px' },
            { dx: '18px', dy: '0px' },
            { dx: '-18px', dy: '0px' },
            { dx: '12px', dy: '14px' },
            { dx: '-12px', dy: '14px' },
          ].map((spark, idx) => (
            <div
              key={idx}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '3.5px',
                height: '3.5px',
                borderRadius: '50%',
                backgroundColor: idx % 2 === 0 ? burst.theme.primary : burst.theme.secondary,
                boxShadow: `0 0 6px ${burst.theme.glow}`,
                ['--dx' as any]: spark.dx,
                ['--dy' as any]: spark.dy,
                animation: 'microSparkle 0.55s ease-out forwards',
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
