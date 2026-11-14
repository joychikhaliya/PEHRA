import React from 'react';

interface PehraLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textColor?: string;
}

/**
 * PEHRA Minimal Logo
 * Concept: A minimal combination of Water Wave + Location Pin + Warning Signal Beacon
 */
export const PehraLogo: React.FC<PehraLogoProps> = ({
  className = '',
  size = 32,
  showText = true,
  textColor = 'text-[#17242A]',
}) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#18B7A0] to-[#35C9D0] text-white shadow-xs p-1.5 shrink-0"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-white"
        >
          {/* Location pin outer contour with stylized wave curves at bottom */}
          <path
            d="M12 2C8.13401 2 5 5.13401 5 9C5 13.5 12 21 12 21C12 21 19 13.5 19 9C19 5.13401 15.866 2 12 2Z"
            fill="currentColor"
            fillOpacity="0.2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Wave ripple lines inside pin */}
          <path
            d="M8 12C9 10.8 11 10.8 12 12C13 13.2 15 13.2 16 12"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M9 14.5C10 13.8 11.5 13.8 12.5 14.5C13.5 15.2 15 15.2 16 14.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeOpacity="0.8"
          />
          {/* Warning beacon signal dot at center top */}
          <circle cx="12" cy="7" r="1.8" fill="currentColor" />
          <path
            d="M9.5 5C10.2 4.4 11.1 4 12 4C12.9 4 13.8 4.4 14.5 5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeOpacity="0.9"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className={`font-bold tracking-tight text-[17px] font-sans ${textColor}`}>
              PEHRA
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#DDF8F6] text-[#18B7A0] border border-[#35C9D0]/30">
              MMR
            </span>
          </div>
          <span className="text-[10px] text-[#6B7C83] font-medium tracking-tight mt-0.5">
            Flood Risk Intelligence
          </span>
        </div>
      )}
    </div>
  );
};
