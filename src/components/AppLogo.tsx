import React from 'react';

interface AppLogoProps {
  className?: string;
  size?: number;
}

export const AppLogo: React.FC<AppLogoProps> = ({ className = '', size = 38 }) => {
  return (
    <div
      className={`relative rounded-2xl overflow-hidden shadow-md flex items-center justify-center shrink-0 select-none group-hover:scale-105 transition-transform ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Dark Premium Background */}
        <rect width="44" height="44" rx="12" fill="#0f172a" />
        <rect width="44" height="44" rx="12" stroke="#334155" strokeWidth="1.5" />

        {/* German Tricolor Flag Micro-Strip */}
        <rect x="0" y="0" width="14.66" height="3" fill="#1e293b" />
        <rect x="14.66" y="0" width="14.66" height="3" fill="#dc2626" />
        <rect x="29.32" y="0" width="14.68" height="3" fill="#f59e0b" />

        {/* Subtle Inner Glow */}
        <circle cx="22" cy="24" r="14" fill="#4f46e5" fillOpacity="0.25" />

        {/* Monogram Text: B2+ */}
        <text
          x="12"
          y="29"
          fill="#f59e0b"
          fontSize="17"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="-0.5px"
        >
          B2
        </text>
        <text
          x="30"
          y="27"
          fill="#818cf8"
          fontSize="16"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          +
        </text>
      </svg>
    </div>
  );
};
