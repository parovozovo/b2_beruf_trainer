import React from 'react';

interface AppLogoProps {
  className?: string;
  size?: number;
  showBadge?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({ className = '', size = 40 }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none group-hover:scale-105 transition-all duration-200 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          {/* Main Background Gradient */}
          <linearGradient id="bgGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="45%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#030712" />
          </linearGradient>

          {/* Border Metallic Glow */}
          <linearGradient id="borderGlow" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.6" />
          </linearGradient>

          {/* B2 Monogram Golden-Amber Gradient */}
          <linearGradient id="goldMonogram" x1="8" y1="12" x2="32" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          {/* Plus Sign Gradient */}
          <linearGradient id="plusGrad" x1="32" y1="12" x2="42" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>

          {/* German Flag Subtle Ribbon Gradients */}
          <linearGradient id="flagBlack" x1="0" y1="0" x2="16" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
          <linearGradient id="flagRed" x1="16" y1="0" x2="32" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
          <linearGradient id="flagGold" x1="32" y1="0" x2="48" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          {/* Radial Center Lighting */}
          <radialGradient id="centerLight" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Squircle App Container */}
        <rect width="48" height="48" rx="14" fill="url(#bgGrad)" />
        <rect width="48" height="48" rx="14" fill="url(#centerLight)" />
        <rect x="0.75" y="0.75" width="46.5" height="46.5" rx="13.25" stroke="url(#borderGlow)" strokeWidth="1.5" />

        {/* German Flag Micro-Accents Top Header */}
        <path d="M 12 2.5 H 20" stroke="url(#flagBlack)" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 20 2.5 H 28" stroke="url(#flagRed)" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 28 2.5 H 36" stroke="url(#flagGold)" strokeWidth="2.5" strokeLinecap="round" />

        {/* Monogram "B" */}
        <text
          x="9.5"
          y="32"
          fill="url(#goldMonogram)"
          fontSize="21"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          letterSpacing="-1px"
        >
          B
        </text>

        {/* Monogram "2" */}
        <text
          x="21.5"
          y="32"
          fill="url(#goldMonogram)"
          fontSize="21"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          letterSpacing="-1px"
        >
          2
        </text>

        {/* Floating Plus Badge */}
        <g transform="translate(34.5, 14)">
          <circle cx="5" cy="5" r="6" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.2" />
          <path d="M 5 2.5 V 7.5 M 2.5 5 H 7.5" stroke="url(#plusGrad)" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
};
