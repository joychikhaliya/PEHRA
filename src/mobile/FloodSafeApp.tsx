import React, { useState } from 'react';
import {
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryWarning,
  Wifi,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { MobileTopBar } from './MobileTopBar.tsx';
import { MobileBottomNav } from './MobileBottomNav.tsx';
import { SosEmergencyModal } from './SosEmergencyModal.tsx';
import { SplashScreen } from './screens/SplashScreen.tsx';
import { HomeDashboardScreen } from './screens/HomeDashboardScreen.tsx';
import { LiveFloodMapScreen } from './screens/LiveFloodMapScreen.tsx';
import { FloodAlertsScreen } from './screens/FloodAlertsScreen.tsx';
import { EmergencyInfoScreen } from './screens/EmergencyInfoScreen.tsx';
import { NearbySheltersScreen } from './screens/NearbySheltersScreen.tsx';
import { SafeRouteScreen } from './screens/SafeRouteScreen.tsx';
import { WeatherPredictionScreen } from './screens/WeatherPredictionScreen.tsx';
import { NotificationsScreen } from './screens/NotificationsScreen.tsx';
import { ProfileSettingsScreen } from './screens/ProfileSettingsScreen.tsx';
import {
  FLOODSAFE_LOCATIONS,
  SHELTERS_DATA,
  FLOOD_ALERTS,
  SAFE_ROUTES,
  FloodSafeLocation,
  ShelterData,
} from '../data/floodSafeData.ts';

interface FloodSafeAppProps {
  onSwitchToDesktopPortal?: () => void;
}

export const FloodSafeApp: React.FC<FloodSafeAppProps> = ({ onSwitchToDesktopPortal }) => {
  // App navigation state: 10 screens
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [currentLocation, setCurrentLocation] = useState<FloodSafeLocation>(FLOODSAFE_LOCATIONS[0]);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(2);
  const [isMobileDeviceFrame, setIsMobileDeviceFrame] = useState(false);
  const [selectedShelterForRoute, setSelectedShelterForRoute] = useState<ShelterData>(SHELTERS_DATA[0]);
  const [batteryLevel, setBatteryLevel] = useState<number>(18); // Simulated battery percentage

  // Cycle battery simulation on tap (18% -> 42% -> 85% -> 9% -> 18%)
  const cycleBatteryLevel = () => {
    setBatteryLevel((prev) => {
      if (prev === 18) return 42;
      if (prev === 42) return 85;
      if (prev === 85) return 9;
      return 18;
    });
  };

  const getBatteryInfo = (level: number) => {
    if (level <= 20) {
      return {
        color: '#E85D5D',
        textColor: 'text-[#E85D5D]',
        bgColor: 'bg-rose-50',
        borderColor: 'border-rose-200',
        fillColor: 'bg-[#E85D5D]',
        label: 'Low',
        isLow: true,
        Icon: BatteryWarning,
      };
    }
    if (level <= 50) {
      return {
        color: '#D97706',
        textColor: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        fillColor: 'bg-amber-500',
        label: 'Medium',
        isLow: false,
        Icon: BatteryMedium,
      };
    }
    return {
      color: '#4F8A68',
      textColor: 'text-[#4F8A68]',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      fillColor: 'bg-[#4F8A68]',
      label: 'Normal',
      isLow: false,
      Icon: Battery,
    };
  };

  const batteryInfo = getBatteryInfo(batteryLevel);
  const BatteryIconComponent = batteryInfo.Icon;

  const activeAlertsCount = FLOOD_ALERTS.filter((a) => a.severity === 'CRITICAL' || a.severity === 'WARNING').length;

  // Render Splash Screen directly when splash tab is active
  if (currentTab === 'splash') {
    return (
      <div className="min-h-screen bg-[#F7FAFA] flex items-center justify-center p-0 sm:p-4 font-sans text-[#173B4D]">
        <div className="w-full max-w-md bg-[#F7FAFA] rounded-3xl shadow-xl overflow-hidden border border-[#E2ECEF]">
          <SplashScreen
            onEnterApp={() => setCurrentTab('home')}
            onNavigateTab={setCurrentTab}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EAF2F6] flex flex-col items-center justify-start text-[#173B4D] font-sans antialiased">
      {/* Top Banner for Desktop Viewers: Switch between Mobile View & Desktop Control Portal */}
      {onSwitchToDesktopPortal && (
        <div className="w-full bg-[#173B4D] text-white py-1.5 px-4 text-xs flex items-center justify-between border-b border-[#2E7D82]/30 shrink-0">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#4F8A68] animate-pulse" />
            <span className="font-bold tracking-tight">FloodSafe Mobile App</span>
            <span className="hidden sm:inline text-white/70">• Clean, Minimal Early-Warning UX</span>
          </div>

          <button
            onClick={onSwitchToDesktopPortal}
            className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition-colors"
          >
            Switch to Authority / Responder Desk &rarr;
          </button>
        </div>
      )}

      {/* Main Container: Supports either Phone Simulator Mockup or Responsive Fluid View */}
      <div
        className={`w-full transition-all duration-200 ${
          isMobileDeviceFrame
            ? 'max-w-[430px] my-4 rounded-[36px] border-[8px] border-[#173B4D] shadow-2xl overflow-hidden bg-[#F7FAFA] ring-1 ring-black/10'
            : 'max-w-2xl bg-[#F7FAFA] min-h-screen shadow-sm'
        }`}
      >
        {/* Mobile Status Bar (Simulated clock, connectivity & dynamic battery) */}
        <div className="bg-[#F7FAFA] px-4 sm:px-6 pt-2.5 pb-1.5 flex items-center justify-between text-[11px] font-bold text-[#173B4D] select-none border-b border-[#E2ECEF]/60">
          <div className="flex items-center gap-2">
            <span>15:12</span>
            <span className="text-[10px] text-[#5A7382] font-normal hidden xs:inline">• Mumbai MMR</span>
          </div>

          {/* Center simulated speaker notch when in phone frame */}
          {isMobileDeviceFrame && (
            <div className="w-20 h-4 bg-black/10 rounded-full mx-auto" />
          )}

          {/* Right Status: Cellular 5G, WiFi & Dynamic Battery */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-[#5A7382]">
              <span className="text-[10px] font-semibold">5G</span>
              <Wifi className="h-3 w-3 text-[#173B4D]" />
            </div>

            {/* Dynamic Battery Level with Color & Icon */}
            <button
              onClick={cycleBatteryLevel}
              title={`Simulated Battery: ${batteryLevel}% (${batteryInfo.label}). Tap to cycle levels.`}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md border transition-all cursor-pointer ${batteryInfo.bgColor} ${batteryInfo.borderColor} ${batteryInfo.textColor}`}
            >
              <BatteryIconComponent
                className={`h-3.5 w-3.5 shrink-0 ${batteryInfo.isLow ? 'animate-pulse' : ''}`}
              />
              <span className="font-mono text-[10px] font-extrabold tracking-tight">
                {batteryLevel}%
              </span>

              {/* Physical battery cell representation */}
              <div
                className={`h-2.5 w-4 rounded-2xs border p-0.5 flex items-center relative ml-0.5 ${
                  batteryInfo.isLow ? 'border-[#E85D5D]' : 'border-[#173B4D]/60'
                }`}
              >
                <div
                  className={`h-full rounded-3xs transition-all duration-300 ${batteryInfo.fillColor}`}
                  style={{ width: `${Math.max(12, Math.min(100, batteryLevel))}%` }}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Low-Battery Emergency Awareness Banner (Triggered when battery <= 20%) */}
        {batteryInfo.isLow && (
          <div className="bg-[#FEF2F2] border-b border-[#FCA5A5] px-3 sm:px-4 py-1.5 flex items-center justify-between text-[11px] text-[#991B1B] transition-all">
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex h-5 w-5 rounded-full bg-[#E85D5D]/20 items-center justify-center shrink-0">
                <BatteryWarning className="h-3 w-3 text-[#E85D5D] animate-pulse" />
              </span>
              <p className="truncate">
                <strong className="font-semibold text-[#E85D5D]">Emergency Low Battery ({batteryLevel}%):</strong>{' '}
                <span className="text-[#7F1D1D]">GPS tracking throttled to preserve SOS calling.</span>
              </p>
            </div>
            <button
              onClick={cycleBatteryLevel}
              className="text-[10px] font-semibold text-[#B91C1C] hover:text-[#7F1D1D] underline shrink-0 ml-2 whitespace-nowrap"
            >
              Cycle &rarr;
            </button>
          </div>
        )}

        {/* Sticky Mobile Top Bar */}
        <MobileTopBar
          currentLocation={currentLocation}
          allLocations={FLOODSAFE_LOCATIONS}
          onSelectLocation={(loc) => {
            setCurrentLocation(loc);
            setIsLocationDropdownOpen(false);
          }}
          unreadNotificationsCount={unreadNotifications}
          onOpenNotifications={() => setCurrentTab('notifications')}
          onOpenSos={() => setIsSosOpen(true)}
          onNavigateTab={setCurrentTab}
          isLocationDropdownOpen={isLocationDropdownOpen}
          setIsLocationDropdownOpen={setIsLocationDropdownOpen}
          isMobileDeviceFrame={isMobileDeviceFrame}
          setIsMobileDeviceFrame={setIsMobileDeviceFrame}
        />

        {/* Secondary Quick Navigation Strip for 10 screens */}
        <div className="bg-white border-b border-[#E2ECEF] px-3 py-2 overflow-x-auto no-scrollbar flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setCurrentTab('home')}
            className={`px-3 py-1 rounded-full whitespace-nowrap text-xs font-semibold transition-colors ${
              currentTab === 'home' ? 'bg-[#173B4D] text-white' : 'text-[#5A7382] hover:bg-[#EEF7F8]'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentTab('map')}
            className={`px-3 py-1 rounded-full whitespace-nowrap text-xs font-semibold transition-colors ${
              currentTab === 'map' ? 'bg-[#173B4D] text-white' : 'text-[#5A7382] hover:bg-[#EEF7F8]'
            }`}
          >
            Live Map
          </button>
          <button
            onClick={() => setCurrentTab('alerts')}
            className={`px-3 py-1 rounded-full whitespace-nowrap text-xs font-semibold transition-colors ${
              currentTab === 'alerts' ? 'bg-[#173B4D] text-white' : 'text-[#5A7382] hover:bg-[#EEF7F8]'
            }`}
          >
            Alerts ({activeAlertsCount})
          </button>
          <button
            onClick={() => setCurrentTab('shelters')}
            className={`px-3 py-1 rounded-full whitespace-nowrap text-xs font-semibold transition-colors ${
              currentTab === 'shelters' ? 'bg-[#173B4D] text-white' : 'text-[#5A7382] hover:bg-[#EEF7F8]'
            }`}
          >
            Shelters
          </button>
          <button
            onClick={() => setCurrentTab('routes')}
            className={`px-3 py-1 rounded-full whitespace-nowrap text-xs font-semibold transition-colors ${
              currentTab === 'routes' ? 'bg-[#173B4D] text-white' : 'text-[#5A7382] hover:bg-[#EEF7F8]'
            }`}
          >
            Safe Routes
          </button>
          <button
            onClick={() => setCurrentTab('weather')}
            className={`px-3 py-1 rounded-full whitespace-nowrap text-xs font-semibold transition-colors ${
              currentTab === 'weather' ? 'bg-[#173B4D] text-white' : 'text-[#5A7382] hover:bg-[#EEF7F8]'
            }`}
          >
            Weather & Forecast
          </button>
          <button
            onClick={() => setCurrentTab('guide')}
            className={`px-3 py-1 rounded-full whitespace-nowrap text-xs font-semibold transition-colors ${
              currentTab === 'guide' ? 'bg-[#173B4D] text-white' : 'text-[#5A7382] hover:bg-[#EEF7F8]'
            }`}
          >
            Emergency Guide
          </button>
          <button
            onClick={() => setCurrentTab('notifications')}
            className={`px-3 py-1 rounded-full whitespace-nowrap text-xs font-semibold transition-colors ${
              currentTab === 'notifications' ? 'bg-[#173B4D] text-white' : 'text-[#5A7382] hover:bg-[#EEF7F8]'
            }`}
          >
            Notifications
          </button>
          <button
            onClick={() => setCurrentTab('profile')}
            className={`px-3 py-1 rounded-full whitespace-nowrap text-xs font-semibold transition-colors ${
              currentTab === 'profile' ? 'bg-[#173B4D] text-white' : 'text-[#5A7382] hover:bg-[#EEF7F8]'
            }`}
          >
            Profile & Settings
          </button>
        </div>

        {/* Screen Content Viewport */}
        <main className="min-h-[70vh] bg-[#F7FAFA]">
          {currentTab === 'home' && (
            <HomeDashboardScreen
              currentLocation={currentLocation}
              shelters={SHELTERS_DATA}
              alerts={FLOOD_ALERTS}
              routes={SAFE_ROUTES}
              onNavigateTab={setCurrentTab}
              onOpenSos={() => setIsSosOpen(true)}
            />
          )}

          {currentTab === 'map' && (
            <LiveFloodMapScreen
              currentLocation={currentLocation}
              shelters={SHELTERS_DATA}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'alerts' && (
            <FloodAlertsScreen
              alerts={FLOOD_ALERTS}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'shelters' && (
            <NearbySheltersScreen
              shelters={SHELTERS_DATA}
              onNavigateTab={setCurrentTab}
              onSelectShelterForRoute={(sh) => {
                setSelectedShelterForRoute(sh);
                setCurrentTab('routes');
              }}
            />
          )}

          {currentTab === 'routes' && (
            <SafeRouteScreen onNavigateTab={setCurrentTab} />
          )}

          {currentTab === 'weather' && <WeatherPredictionScreen />}

          {currentTab === 'guide' && <EmergencyInfoScreen />}

          {currentTab === 'notifications' && (
            <NotificationsScreen onNavigateTab={setCurrentTab} />
          )}

          {currentTab === 'profile' && (
            <ProfileSettingsScreen
              allLocations={FLOODSAFE_LOCATIONS}
              onSelectLocation={(loc) => {
                setCurrentLocation(loc);
                setCurrentTab('home');
              }}
              onNavigateTab={setCurrentTab}
            />
          )}
        </main>

        {/* Clean 5-Item Sticky Bottom Navigation */}
        <MobileBottomNav
          currentTab={
            ['home', 'map', 'alerts', 'shelters', 'profile'].includes(currentTab)
              ? currentTab
              : 'home'
          }
          onSelectTab={setCurrentTab}
          activeAlertsCount={activeAlertsCount}
        />
      </div>

      {/* Emergency SOS Distress Modal */}
      <SosEmergencyModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
        currentLocation={currentLocation}
      />
    </div>
  );
};
