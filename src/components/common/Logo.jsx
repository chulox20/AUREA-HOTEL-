import React from 'react';
import { Link } from 'react-router-dom';

export default function Logo({ variant = 'default', size = 'md', to = '/', showText = true }) {
  // Sizes
  const emblemSizes = {
    sm: 28,
    md: 36,
    lg: 48,
  };
  const iconSize = emblemSizes[size] || 36;

  const isLight = variant === 'light' || variant === 'transparent';

  const logoContent = (
    <div className="flex items-center gap-sm" style={{ textDecoration: 'none', userSelect: 'none' }}>
      {/* Luxury Golden Emblem SVG */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, filter: 'drop-shadow(0 2px 8px rgba(184, 155, 94, 0.3))' }}
      >
        <defs>
          <linearGradient id="aureaGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DFC896" />
            <stop offset="50%" stopColor="#B89B5E" />
            <stop offset="100%" stopColor="#8A6E32" />
          </linearGradient>
          <linearGradient id="aureaGoldGlow" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#B89B5E" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Diamond Outer Frame */}
        <rect
          x="24"
          y="4"
          width="28"
          height="28"
          rx="4"
          transform="rotate(45 24 4)"
          stroke="url(#aureaGoldGrad)"
          strokeWidth="1.5"
          fill="rgba(23, 23, 23, 0.4)"
        />

        {/* Inner Diamond Accent */}
        <rect
          x="24"
          y="8"
          width="22.5"
          height="22.5"
          rx="2"
          transform="rotate(45 24 8)"
          stroke="url(#aureaGoldGrad)"
          strokeWidth="0.75"
          strokeDasharray="2 2"
          opacity="0.6"
        />

        {/* Monogram 'A' */}
        <path
          d="M24 13L17 33H20.5L22.2 28H25.8L27.5 33H31L24 13ZM24 18.5L25.1 25H22.9L24 18.5Z"
          fill="url(#aureaGoldGrad)"
        />

        {/* Crown / Star Sparkle on Apex */}
        <circle cx="24" cy="11.5" r="1.5" fill="#FFF8E7" />
        <path
          d="M24 9.5V13.5M22 11.5H26"
          stroke="#DFC896"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
      </svg>

      {/* Brand Wordmark */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: size === 'lg' ? '1.5rem' : size === 'sm' ? '1.1rem' : '1.3rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: isLight ? '#FAF9F6' : 'var(--obsidian)',
              textTransform: 'uppercase',
              transition: 'color 0.2s',
            }}
          >
            Aurea
          </span>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: size === 'lg' ? '9px' : size === 'sm' ? '7px' : '8px',
              fontWeight: 600,
              letterSpacing: '0.28em',
              color: 'var(--gold)',
              textTransform: 'uppercase',
              marginTop: '2px',
            }}
          >
            Hotel & Resort
          </span>
        </div>
      )}
    </div>
  );

  if (!to) return logoContent;

  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      {logoContent}
    </Link>
  );
}
