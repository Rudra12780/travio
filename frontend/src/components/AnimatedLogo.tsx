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
  title = 'GlobalTrotter',
  badge = 'PERSONALIZED TRAVEL EXPERIENCES',
  className = '',
  onClick,
}) => {
  const iconSizes = {
    sm: { container: 32, svg: 20 },
    md: { container: 40, svg: 26 },
    lg: { container: 48, svg: 32 },
  };

  const currentSize = iconSizes[size] || iconSizes.md;

  return (
    <div 
      className={`animated-brand-logo size-${size} ${className}`} 
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick() : undefined}
      aria-label="GlobalTrotter Logo"
      style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', cursor: onClick ? 'pointer' : 'default' }}
    >
      <div 
        className="logo-emblem-wrapper"
        style={{ 
          width: currentSize.container, 
          height: currentSize.container,
          borderRadius: '50%',
          background: '#101010',
          border: '1.5px solid #101010',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          boxShadow: '2px 2px 0px #429FE8',
          flexShrink: 0
        }}
      >
        <svg 
          width={currentSize.svg} 
          height={currentSize.svg} 
          viewBox="0 0 36 36" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Compass Circle */}
          <circle 
            cx="18" 
            cy="18" 
            r="15" 
            stroke="#E8E6E0" 
            strokeWidth="1.2" 
            strokeDasharray="2 3"
          />

          {/* Bold Crosshairs */}
          <line x1="18" y1="4" x2="18" y2="8" stroke="#FFD84D" strokeWidth="2" strokeLinecap="round" />
          <line x1="18" y1="28" x2="18" y2="32" stroke="#429FE8" strokeWidth="2" strokeLinecap="round" />
          <line x1="4" y1="18" x2="8" y2="18" stroke="#F4AFC1" strokeWidth="2" strokeLinecap="round" />
          <line x1="28" y1="18" x2="32" y2="18" stroke="#36B7B3" strokeWidth="2" strokeLinecap="round" />

          {/* Sharp Modern Needles */}
          <polygon points="18,5 21.5,18 18,15.5" fill="#FFFFFF" />
          <polygon points="18,5 14.5,18 18,15.5" fill="#FFD84D" />
          <polygon points="18,31 21.5,18 18,20.5" fill="#429FE8" />
          <polygon points="18,31 14.5,18 18,20.5" fill="#36B7B3" />

          {/* Center Pivot Point */}
          <circle cx="18" cy="18" r="3" fill="#101010" stroke="#FFFFFF" strokeWidth="1.5" />
        </svg>
      </div>

      {showText && (
        <div className="brand-logo-text" style={{ display: 'flex', flexDirection: 'column' }}>
          <span 
            className="logo-title" 
            style={{ 
              fontFamily: "'Syne', -apple-system, sans-serif", 
              fontWeight: 900, 
              fontSize: size === 'lg' ? '22px' : size === 'sm' ? '16px' : '18px', 
              color: '#101010', 
              letterSpacing: '-0.04em',
              lineHeight: 1.1
            }}
          >
            {title}
          </span>
          {badge && (
            <span 
              className="logo-badge" 
              style={{ 
                fontSize: '9.5px', 
                fontWeight: 800, 
                color: '#555555', 
                letterSpacing: '0.12em', 
                textTransform: 'uppercase',
                marginTop: '2px'
              }}
            >
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
