import React from 'react';
import {
  MapPin,
  ChevronDown,
  Bell,
  AlertOctagon,
  Shield,
  Activity,
  Compass,
  Smartphone,
  Maximize2,
} from 'lucide-react';
import { FloodSafeLocation } from '../data/floodSafeData.ts';

interface MobileTopBarProps {
  currentLocation: FloodSafeLocation;
  allLocations: FloodSafeLocation[];
  onSelectLocation: (loc: FloodSafeLocation) => void;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenSos: () => void;
  onNavigateTab: (tab: string) => void;
  isLocationDropdownOpen: boolean;
  setIsLocationDropdownOpen: (open: boolean) => void;
  isMobileDeviceFrame: boolean;
  setIsMobileDeviceFrame: (frame: boolean) => void;
}

export const MobileTopBar: React.FC<MobileTopBarProps> = ({
  currentLocation,
  allLocations,
  onSelectLocation,
  unreadNotificationsCount,
  onOpenNotifications,
  onOpenSos,
  onNavigateTab,
  isLocationDropdownOpen,
  setIsLocationDropdownOpen,
  isMobileDeviceFrame,
  setIsMobileDeviceFrame,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#F7FAFA]/95 backdrop-blur-md border-b border-[#E2ECEF] px-4 py-2.5 transition-all">
      <div className="flex items-center justify-between gap-2">
        {/* App Logo & Location Selector */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => onNavigateTab('splash')}
            className="flex items-center justify-center h-9 w-9 rounded-xl bg-[#EEF7F8] border border-[#DCEFF2] text-[#2E7D82] shrink-0 hover:bg-[#DCEFF2] transition-colors"
            title="FloodSafe About / Splash"
          >
            <Shield className="h-5 w-5" />
          </button>

          <div className="relative min-w-0">
            <button
              onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
              className="flex items-center gap-1 text-left px-2 py-1 -ml-1 rounded-lg hover:bg-[#EEF7F8] transition-colors group"
            >
              <MapPin className="h-3.5 w-3.5 text-[#2E7D82] shrink-0 group-hover:scale-110 transition-transform" />
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-[#173B4D] truncate max-w-[130px] sm:max-w-[200px]">
                    {currentLocation.name}
                  </span>
                  <ChevronDown className="h-3 w-3 text-[#5A7382] shrink-0" />
                </div>
                <span className="text-[10px] text-[#5A7382] block leading-none truncate">
                  {currentLocation.ward} • Elevation {currentLocation.elevationM}m
                </span>
              </div>
            </button>

            {/* Location Switcher Menu */}
            {isLocationDropdownOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-72 bg-white rounded-xl border border-[#E2ECEF] shadow-lg shadow-[#173B4D]/5 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2 py-1 text-[11px] font-semibold text-[#8CA2AE] uppercase tracking-wider">
                  Select Monitored Area
                </div>
                <div className="space-y-1 mt-1 max-h-60 overflow-y-auto">
                  {allLocations.map((loc) => {
                    const isSelected = loc.id === currentLocation.id;
                    const badgeBg =
                      loc.riskLevel === 'CRITICAL'
                        ? 'bg-[#E85D5D]/10 text-[#E85D5D]'
                        : loc.riskLevel === 'HIGH'
                        ? 'bg-amber-500/10 text-amber-700'
                        : loc.riskLevel === 'MODERATE'
                        ? 'bg-amber-400/10 text-amber-600'
                        : 'bg-[#4F8A68]/10 text-[#4F8A68]';

                    return (
                      <button
                        key={loc.id}
                        onClick={() => {
                          onSelectLocation(loc);
                          setIsLocationDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs transition-colors ${
                          isSelected ? 'bg-[#EEF7F8] font-bold text-[#173B4D]' : 'hover:bg-[#F7FAFA] text-[#4B6370]'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="truncate text-xs font-semibold">{loc.name}</div>
                          <div className="text-[10px] text-[#8CA2AE]">{loc.ward}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0 ${badgeBg}`}>
                          {loc.riskLevel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls: Responsive Frame Toggle, Notifications, and Urgent SOS Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Frame Toggle (only shown on larger screens to switch between phone simulator & wide fluid view) */}
          <button
            onClick={() => setIsMobileDeviceFrame(!isMobileDeviceFrame)}
            className="hidden md:flex items-center gap-1 px-2 py-1 rounded-lg border border-[#E2ECEF] bg-white text-[11px] font-medium text-[#5A7382] hover:text-[#173B4D] hover:bg-[#EEF7F8] transition-colors"
            title={isMobileDeviceFrame ? 'Switch to Full Screen View' : 'Switch to Mobile Frame'}
          >
            {isMobileDeviceFrame ? <Maximize2 className="h-3.5 w-3.5" /> : <Smartphone className="h-3.5 w-3.5" />}
            <span>{isMobileDeviceFrame ? 'Full Width' : 'Mobile View'}</span>
          </button>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            className="relative flex items-center justify-center h-9 w-9 rounded-xl border border-[#E2ECEF] bg-white text-[#5A7382] hover:text-[#173B4D] hover:bg-[#EEF7F8] transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#E85D5D] ring-2 ring-white" />
            )}
          </button>

          {/* Quick SOS Action Button (Touch-Friendly, prominent coral alert) */}
          <button
            onClick={onOpenSos}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E85D5D] hover:bg-[#d94f4f] active:scale-95 text-white text-xs font-bold shadow-sm shadow-[#E85D5D]/25 transition-all"
            aria-label="Emergency SOS"
          >
            <AlertOctagon className="h-3.5 w-3.5" />
            <span>SOS</span>
          </button>
        </div>
      </div>
    </header>
  );
};
