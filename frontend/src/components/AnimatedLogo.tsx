import React from 'react';

interface AnimatedLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  title?: string;
  badge?: string;
  className?: string;
  onClick?: () => void;
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({
  size = 'md',
  showText = true,
  title = 'Trovio',
  badge = 'GlobalTrotters',
  className = '',
  onClick,
}) => {
  const iconSizes = {
    sm: { container: 34, svg: 22 },
    md: { container: 42, svg: 28 },
    lg: { container: 52, svg: 34 },
  };

  const currentSize = iconSizes[size] || iconSizes.md;

  return (
    <div 
      className={`animated-brand-logo size-${size} ${className}`} 
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick() : undefined}
      aria-label="Trovio GlobalTrotters Logo"
    >
      <div 
        className="logo-emblem-wrapper"
        style={{ width: currentSize.container, height: currentSize.container }}
      >
        {/* Orbital Halo Flare */}
        <div className="logo-ambient-aura" aria-hidden="true" />

        {/* Orbiting Flight Ring */}
        <div className="logo-orbital-ring" aria-hidden="true">
          <span className="orbital-flight-dot" />
        </div>

        {/* Dynamic Glass Badge */}
        <div className="logo-glass-badge">
          <svg 
            width={currentSize.svg} 
            height={currentSize.svg} 
            viewBox="0 0 36 36" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="logo-compass-svg"
          >
            <defs>
              <linearGradient id="logoGradPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22D3EE" />
                <stop offset="50%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>

              <linearGradient id="needleNorth" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#38BDF8" />
              </linearGradient>

              <linearGradient id="needleSouth" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F43F5E" />
                <stop offset="100%" stopColor="#FB7185" />
              </linearGradient>

              <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Subtle Outer Dial Ring */}
            <circle 
              cx="18" 
              cy="18" 
              r="15" 
              stroke="rgba(255, 255, 255, 0.35)" 
              strokeWidth="1.2" 
              strokeDasharray="2 3"
              className="logo-dial-ring"
            />

            {/* Radar Sweep Arc */}
            <circle 
              cx="18" 
              cy="18" 
              r="11.5" 
              stroke="url(#logoGradPrimary)" 
              strokeWidth="1.6" 
              strokeLinecap="round"
              strokeDasharray="18 45"
              className="logo-radar-sweep"
            />

            {/* 4 Cardinal Point Ticks */}
            <line x1="18" y1="4" x2="18" y2="7" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="18" y1="29" x2="18" y2="32" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="4" y1="18" x2="7" y2="18" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="29" y1="18" x2="32" y2="18" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />

            {/* Dynamic Animated Compass Needle Group */}
            <g className="logo-compass-needle-group">
              {/* North Needle Point (Cyan / White) */}
              <polygon points="18,5 21.5,18 18,16" fill="url(#needleNorth)" filter="url(#logoGlow)" />
              <polygon points="18,5 14.5,18 18,16" fill="#0284C7" />

              {/* South Needle Point (Coral Rose) */}
              <polygon points="18,31 21.5,18 18,20" fill="url(#needleSouth)" />
              <polygon points="18,31 14.5,18 18,20" fill="#BE123C" />

              {/* East / West Micro-Fins */}
              <polygon points="31,18 18,20.5 19.5,18" fill="rgba(255,255,255,0.85)" />
              <polygon points="5,18 18,15.5 16.5,18" fill="rgba(255,255,255,0.6)" />

              {/* Center Pivot Jewel */}
              <circle cx="18" cy="18" r="3.2" fill="#0F172A" stroke="#FFFFFF" strokeWidth="1.2" />
              <circle cx="18" cy="18" r="1.4" fill="#38BDF8" className="logo-center-sparkle" />
            </g>
          </svg>
        </div>
      </div>

      {showText && (
        <div className="brand-logo-text">
          <span className="logo-title">{title}</span>
          {badge && <span className="logo-badge">{badge}</span>}
        </div>
      )}
    </div>
  );
};
