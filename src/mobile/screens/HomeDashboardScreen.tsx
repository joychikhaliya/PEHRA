import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Droplets,
  CloudRain,
  Waves,
  Clock,
  ArrowRight,
  MapPin,
  Building2,
  Navigation,
  PhoneCall,
  AlertOctagon,
  ChevronRight,
  Compass,
  LifeBuoy,
} from 'lucide-react';
import {
  FloodSafeLocation,
  ShelterData,
  FloodAlertItem,
  RouteOption,
} from '../../data/floodSafeData.ts';

interface HomeDashboardScreenProps {
  currentLocation: FloodSafeLocation;
  shelters: ShelterData[];
  alerts: FloodAlertItem[];
  routes: RouteOption[];
  onNavigateTab: (tab: string) => void;
  onOpenSos: () => void;
}

export const HomeDashboardScreen: React.FC<HomeDashboardScreenProps> = ({
  currentLocation,
  shelters,
  alerts,
  routes,
  onNavigateTab,
  onOpenSos,
}) => {
  const nearestShelter = shelters[0];
  const primaryRoute = routes[0];
  const activeAlert = alerts[0];

  // Risk styling configuration
  const riskStyles = {
    CRITICAL: {
      bg: 'bg-[#E85D5D]/10',
      border: 'border-[#E85D5D]/30',
      badge: 'bg-[#E85D5D] text-white',
      text: 'text-[#E85D5D]',
      statusText: 'Critical Flood Hazard',
      guidance: 'Evacuate immediately to designated high-ground shelter. Avoid all low-lying roads and subways.',
      icon: ShieldAlert,
    },
    HIGH: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      badge: 'bg-amber-500 text-slate-950',
      text: 'text-amber-600',
      statusText: 'High Flood Risk',
      guidance: 'Water accumulation rising. Prepare essential go-bag and monitor evacuation corridors.',
      icon: AlertTriangle,
    },
    MODERATE: {
      bg: 'bg-[#EEF7F8]',
      border: 'border-[#DCEFF2]',
      badge: 'bg-[#2E7D82] text-white',
      text: 'text-[#2E7D82]',
      statusText: 'Moderate Flood Risk',
      guidance: 'Localized waterlogging near storm drains. Ground floor residents should remain alert.',
      icon: Droplets,
    },
    LOW: {
      bg: 'bg-[#EAF2F6]',
      border: 'border-[#D5E2E6]',
      badge: 'bg-[#173B4D] text-white',
      text: 'text-[#173B4D]',
      statusText: 'Low Risk • Normal Flow',
      guidance: 'Ground water draining normally. Municipal stormwater pumps operating at nominal levels.',
      icon: ShieldCheck,
    },
    SAFE: {
      bg: 'bg-[#4F8A68]/10',
      border: 'border-[#4F8A68]/30',
      badge: 'bg-[#4F8A68] text-white',
      text: 'text-[#4F8A68]',
      statusText: 'Normal Safe Conditions',
      guidance: 'No imminent flood danger detected. Water levels well within safe thresholds.',
      icon: ShieldCheck,
    },
  };

  const currentRisk = riskStyles[currentLocation.riskLevel] || riskStyles.MODERATE;
  const RiskIcon = currentRisk.icon;

  return (
    <div className="p-4 space-y-4 max-w-xl mx-auto pb-6">
      {/* 1. PRIMARY RISK STATUS CARD: Answer "Am I currently at risk?" */}
      <div className={`rounded-2xl border p-4 sm:p-5 transition-all ${currentRisk.bg} ${currentRisk.border}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[11px] font-semibold text-[#5A7382] uppercase tracking-wider block">
              Your Monitored Area
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#173B4D] tracking-tight mt-0.5">
              {currentLocation.name}
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-[#5A7382] mt-0.5">
              <MapPin className="h-3.5 w-3.5 text-[#2E7D82]" />
              <span>{currentLocation.ward}</span>
              <span>•</span>
              <span>Elevation: {currentLocation.elevationM}m MSL</span>
            </div>
          </div>

          <span className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${currentRisk.badge}`}>
            {currentRisk.statusText}
          </span>
        </div>

        {/* Immediate Guidance */}
        <div className="mt-3.5 pt-3 border-t border-black/5 flex items-start gap-2.5">
          <RiskIcon className={`h-4 w-4 shrink-0 mt-0.5 ${currentRisk.text}`} />
          <p className="text-xs text-[#4B6370] leading-relaxed">
            {currentRisk.guidance}
          </p>
        </div>
      </div>

      {/* 2. COMPACT INFORMATION CARDS: Answer "What is happening around me?" */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[#173B4D] uppercase tracking-wider">
            Real-Time Telemetry
          </span>
          <span className="text-[10px] text-[#8CA2AE] flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Updated {currentLocation.lastUpdated}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Card 1: Water Level */}
          <div className="p-3.5 rounded-xl bg-white border border-[#E2ECEF] shadow-sm hover:border-[#DCEFF2] transition-colors">
            <div className="flex items-center justify-between text-[#5A7382] text-xs mb-1">
              <span className="font-medium">Street Water Level</span>
              <Droplets className="h-4 w-4 text-[#2E7D82]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-[#173B4D] font-mono">
                {currentLocation.waterLevelM.toFixed(2)}
              </span>
              <span className="text-xs text-[#5A7382] font-semibold">meters</span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-[10px]">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  currentLocation.waterLevelStatus === 'DANGER'
                    ? 'bg-[#E85D5D]'
                    : currentLocation.waterLevelStatus === 'WARNING'
                    ? 'bg-amber-500'
                    : 'bg-[#4F8A68]'
                }`}
              />
              <span className="text-[#5A7382]">
                {currentLocation.waterLevelStatus === 'DANGER'
                  ? 'Knee to waist depth'
                  : currentLocation.waterLevelStatus === 'WARNING'
                  ? 'Ankle to calf depth'
                  : 'Pavement dry'}
              </span>
            </div>
          </div>

          {/* Card 2: Rainfall Intensity */}
          <div className="p-3.5 rounded-xl bg-white border border-[#E2ECEF] shadow-sm hover:border-[#DCEFF2] transition-colors">
            <div className="flex items-center justify-between text-[#5A7382] text-xs mb-1">
              <span className="font-medium">Rainfall Intensity</span>
              <CloudRain className="h-4 w-4 text-[#2E7D82]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-[#173B4D] font-mono">
                {currentLocation.rainfallMmHr}
              </span>
              <span className="text-xs text-[#5A7382] font-semibold">mm/hr</span>
            </div>
            <div className="mt-1 text-[10px] text-[#5A7382] truncate">
              {currentLocation.rainfallMmHr > 50
                ? 'Very heavy cloudburst'
                : currentLocation.rainfallMmHr > 25
                ? 'Moderate downpour'
                : 'Light precipitation'}
            </div>
          </div>

          {/* Card 3: River Level (Mithi Basin) */}
          <div className="p-3.5 rounded-xl bg-white border border-[#E2ECEF] shadow-sm hover:border-[#DCEFF2] transition-colors">
            <div className="flex items-center justify-between text-[#5A7382] text-xs mb-1">
              <span className="font-medium">River Level (Mithi)</span>
              <Waves className="h-4 w-4 text-[#2E7D82]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-[#173B4D] font-mono">
                {currentLocation.riverLevelM.toFixed(2)}
              </span>
              <span className="text-xs text-[#5A7382] font-semibold">/ {currentLocation.riverDangerMarkM}m</span>
            </div>
            <div className="mt-1 text-[10px] text-[#5A7382]">
              Danger clearance: {(currentLocation.riverDangerMarkM - currentLocation.riverLevelM).toFixed(2)}m
            </div>
          </div>

          {/* Card 4: Weather & Prediction Shortcut */}
          <button
            onClick={() => onNavigateTab('weather')}
            className="p-3.5 rounded-xl bg-[#EEF7F8] border border-[#DCEFF2] hover:bg-[#DCEFF2] transition-colors text-left flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between text-xs text-[#2E7D82] mb-1">
              <span className="font-semibold">Next 24h Trend</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#173B4D]">High Tide Peak</div>
              <div className="text-[11px] text-[#5A7382]">4.45m tide at 15:15 PM</div>
            </div>
            <div className="text-[10px] font-semibold text-[#2E7D82] mt-1">View Forecast &rarr;</div>
          </button>
        </div>
      </div>

      {/* 3. ACTIVE EMERGENCY ALERT BANNER (If present) */}
      {activeAlert && (
        <div className="p-4 rounded-2xl bg-white border border-[#E2ECEF] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#E85D5D] animate-ping" />
              <span className="text-[11px] font-bold text-[#E85D5D] uppercase tracking-wider">
                Official {activeAlert.severity} Notice
              </span>
            </div>
            <span className="text-[11px] text-[#8CA2AE]">{activeAlert.timeAgo}</span>
          </div>

          <h3 className="text-sm font-bold text-[#173B4D] leading-snug">
            {activeAlert.title}
          </h3>
          <p className="text-xs text-[#5A7382] line-clamp-2">
            {activeAlert.description}
          </p>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-[#2E7D82] font-semibold">
              Action: {activeAlert.recommendedAction.substring(0, 45)}...
            </span>
            <button
              onClick={() => onNavigateTab('alerts')}
              className="text-xs font-bold text-[#173B4D] hover:text-[#2E7D82] flex items-center gap-1 shrink-0"
            >
              <span>Details</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 4. SAFE HAVEN / NEARBY SHELTER PREVIEW: Answer "Where is the nearest safe place?" */}
      {nearestShelter && (
        <div className="p-4 rounded-2xl bg-white border border-[#E2ECEF] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#173B4D] uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-[#2E7D82]" />
              <span>Nearest Designated Safe Shelter</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#4F8A68]/10 text-[#4F8A68] text-[10px] font-bold">
              {nearestShelter.status}
            </span>
          </div>

          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold text-[#173B4D]">{nearestShelter.name}</h4>
              <p className="text-xs text-[#5A7382] mt-0.5">{nearestShelter.address}</p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-bold text-[#173B4D] font-mono">{nearestShelter.distanceKm} km</div>
              <div className="text-[10px] text-[#5A7382]">~{nearestShelter.walkTimeMin} min walk</div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#F0F4F6] text-xs">
            <div className="text-[#5A7382] text-[11px]">
              Available beds: <strong className="text-[#173B4D]">{nearestShelter.availableCapacity}</strong> / {nearestShelter.totalCapacity}
            </div>

            <button
              onClick={() => onNavigateTab('routes')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#173B4D] text-white text-xs font-bold hover:bg-[#1f4a60] transition-colors"
            >
              <Navigation className="h-3 w-3" />
              <span>Safe Route</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. SAFE ROUTE CARD: Answer "Which route should I take?" */}
      {primaryRoute && (
        <div
          onClick={() => onNavigateTab('routes')}
          className="p-4 rounded-2xl bg-[#EEF7F8] border border-[#DCEFF2] shadow-sm cursor-pointer hover:border-[#2E7D82]/50 transition-all flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#2E7D82] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#2E7D82]/20">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#173B4D]">Elevated High-Ground Path</span>
                <span className="px-1.5 py-0.2 rounded bg-[#4F8A68] text-white text-[9px] font-bold">
                  {primaryRoute.safetyScore}% Safe
                </span>
              </div>
              <p className="text-[11px] text-[#5A7382] mt-0.5">
                Avoids flooded Kranti Nagar drain • Gain: +{primaryRoute.elevationGainM}m elevation
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-[#2E7D82] shrink-0" />
        </div>
      )}

      {/* 6. PROMINENT ELEGANT SOS BUTTON: Answer "What should I do now in panic?" */}
      <div className="pt-2">
        <button
          onClick={onOpenSos}
          className="w-full py-4 px-5 rounded-2xl bg-[#E85D5D] hover:bg-[#d94f4f] active:scale-[0.99] text-white text-sm font-extrabold flex items-center justify-between shadow-md shadow-[#E85D5D]/25 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center">
              <AlertOctagon className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div className="text-left">
              <div className="text-sm font-extrabold">Emergency SOS & Helplines</div>
              <div className="text-[11px] text-white/90">Instant dial 112 / 1916, broadcast GPS & distress siren</div>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-white shrink-0" />
        </button>
      </div>

      {/* 7. QUICK ACCESS SHORTCUTS FOR ESSENTIAL ACTIONS */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        <button
          onClick={() => onNavigateTab('guide')}
          className="p-3 rounded-xl bg-white border border-[#E2ECEF] hover:bg-[#F7FAFA] transition-colors text-center"
        >
          <LifeBuoy className="h-4 w-4 text-[#2E7D82] mx-auto mb-1" />
          <span className="text-[11px] font-bold text-[#173B4D] block">Flood Guide</span>
          <span className="text-[9px] text-[#8CA2AE]">What to do</span>
        </button>

        <button
          onClick={() => onNavigateTab('map')}
          className="p-3 rounded-xl bg-white border border-[#E2ECEF] hover:bg-[#F7FAFA] transition-colors text-center"
        >
          <MapPin className="h-4 w-4 text-[#2E7D82] mx-auto mb-1" />
          <span className="text-[11px] font-bold text-[#173B4D] block">Live Map</span>
          <span className="text-[9px] text-[#8CA2AE]">Water zones</span>
        </button>

        <button
          onClick={() => onNavigateTab('alerts')}
          className="p-3 rounded-xl bg-white border border-[#E2ECEF] hover:bg-[#F7FAFA] transition-colors text-center"
        >
          <ShieldAlert className="h-4 w-4 text-[#2E7D82] mx-auto mb-1" />
          <span className="text-[11px] font-bold text-[#173B4D] block">All Alerts</span>
          <span className="text-[9px] text-[#8CA2AE]">{alerts.length} active</span>
        </button>
      </div>
    </div>
  );
};
