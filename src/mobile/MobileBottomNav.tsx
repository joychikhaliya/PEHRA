import React from 'react';
import {
  Home,
  Map,
  BellRing,
  Building2,
  User,
  ShieldCheck,
  Compass,
} from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  activeAlertsCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  activeAlertsCount,
}) => {
  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
    },
    {
      id: 'map',
      label: 'Map',
      icon: Map,
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: BellRing,
      badge: activeAlertsCount,
    },
    {
      id: 'shelters',
      label: 'Shelters',
      icon: Building2,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
    },
  ];

  return (
    <nav className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#E2ECEF] px-2 py-1.5 shadow-[0_-4px_16px_rgba(23,59,77,0.03)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 min-h-[44px] min-w-[56px] select-none ${
                isActive
                  ? 'text-[#173B4D]'
                  : 'text-[#8CA2AE] hover:text-[#4B6370]'
              }`}
            >
              {/* Active Pill Indicator */}
              {isActive && (
                <div className="absolute -top-1.5 w-7 h-1 rounded-full bg-[#2E7D82]" />
              )}

              <div className="relative">
                <Icon
                  className={`h-5 w-5 transition-transform duration-150 ${
                    isActive ? 'scale-105 stroke-[2.4px] text-[#2E7D82]' : 'stroke-[1.8px]'
                  }`}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 h-4 min-w-4 px-1 rounded-full bg-[#E85D5D] text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                    {item.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] mt-0.5 tracking-tight font-medium ${
                  isActive ? 'text-[#173B4D] font-bold' : 'text-[#8CA2AE]'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
