import React from 'react';
import { Search, Bell, Battery, BatteryWarning, Wifi } from 'lucide-react';

interface PehraTopBarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  unreadCount: number;
  batteryLevel?: number;
  isDeviceFrame: boolean;
  onToggleDeviceFrame: () => void;
  onSwitchToDesktop?: () => void;
}

export const PehraTopBar: React.FC<PehraTopBarProps> = ({
  currentTab,
  onNavigate,
  unreadCount,
  batteryLevel = 84,
  isDeviceFrame,
  onToggleDeviceFrame,
  onSwitchToDesktop,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#F7F7F4]/95 backdrop-blur-sm border-b border-[#E5E5DF]">
      {/* Subtle Mobile Status Bar (System indicators) */}
      <div className="px-5 pt-2 pb-1.5 flex items-center justify-between text-[11px] font-medium text-[#6B727A] select-none">
        <span className="font-semibold text-[#1E252B]">19:40</span>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-[10px]">5G</span>
            <Wifi className="w-3 h-3 text-[#6B727A]" />
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] font-medium">{batteryLevel}%</span>
            <div className="w-4 h-2.5 rounded-[2px] border border-[#6B727A] p-[1px] flex items-center">
              <div
                className={`h-full rounded-[1px] ${
                  batteryLevel <= 20 ? 'bg-[#BA3D3B]' : 'bg-[#3B755D]'
                }`}
                style={{ width: `${Math.min(100, Math.max(15, batteryLevel))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Bar: App Name & Actions */}
      <div className="px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('home')}
            className="text-left focus:outline-none"
          >
            <div className="flex items-center gap-2">
              <span className="text-[17px] font-semibold tracking-tight text-[#1E252B]">
                Pehra
              </span>
              <span className="text-[11px] text-[#6B727A] font-normal px-1.5 py-0.5 rounded bg-[#EFEFEA]">
                Sector 4
              </span>
            </div>
          </button>

          {/* Subtle battery warning pill if battery falls below 15% */}
          {batteryLevel < 15 && (
            <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-900 animate-in fade-in">
              <BatteryWarning className="h-3.5 w-3.5 text-amber-600 animate-pulse shrink-0" />
              <span>Battery {batteryLevel}% • Low Power</span>
            </div>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onNavigate('search')}
            id="pehra-search-btn"
            aria-label="Search records"
            className={`p-2 rounded-lg text-[#4A5560] hover:text-[#1E252B] hover:bg-[#EFEFEA] transition-colors ${
              currentTab === 'search' ? 'bg-[#EFEFEA] text-[#1E252B]' : ''
            }`}
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('notifications')}
            id="pehra-notifications-btn"
            aria-label="Notifications"
            className={`relative p-2 rounded-lg text-[#4A5560] hover:text-[#1E252B] hover:bg-[#EFEFEA] transition-colors ${
              currentTab === 'notifications' ? 'bg-[#EFEFEA] text-[#1E252B]' : ''
            }`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#BA3D3B]" />
            )}
          </button>

          {/* Device Frame View Toggle */}
          <button
            onClick={onToggleDeviceFrame}
            title={isDeviceFrame ? 'Switch to responsive view' : 'Switch to mobile frame'}
            className="ml-1 text-[11px] text-[#6B727A] hover:text-[#1E252B] px-2 py-1 rounded border border-[#E5E5DF] hover:bg-[#EFEFEA] transition-colors hidden sm:inline-block"
          >
            {isDeviceFrame ? 'Fluid' : 'Frame'}
          </button>
        </div>
      </div>
    </header>
  );
};
