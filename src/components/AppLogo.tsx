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
      <img
        src="/pwa-192x192.png"
        alt="Beruf B2+ Trainer Logo"
        width={size}
        height={size}
        className="w-full h-full object-contain rounded-xl drop-shadow-md select-none pointer-events-none"
        loading="eager"
        decoding="async"
      />
    </div>
  );
};
