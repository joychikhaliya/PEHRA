import React, { useState } from 'react';
import {
  Navigation,
  Compass,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MapPin,
  ArrowRight,
  Mountain,
  Clock,
  ShieldCheck,
  ChevronRight,
  Info,
} from 'lucide-react';
import { SAFE_ROUTES, RouteOption, SHELTERS_DATA } from '../../data/floodSafeData.ts';

interface SafeRouteScreenProps {
  onNavigateTab: (tab: string) => void;
}

export const SafeRouteScreen: React.FC<SafeRouteScreenProps> = ({ onNavigateTab }) => {
  const [selectedRouteId, setSelectedRouteId] = useState<string>(SAFE_ROUTES[0].id);
  const [navigating, setNavigating] = useState(false);

  const activeRoute = SAFE_ROUTES.find((r) => r.id === selectedRouteId) || SAFE_ROUTES[0];
  const targetShelter = SHELTERS_DATA[0];

  return (
    <div className="p-4 space-y-4 max-w-xl mx-auto pb-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-[#2E7D82] font-semibold mb-0.5">
          <Compass className="h-3.5 w-3.5" />
          <span>Topographic Flood-Safe Navigation</span>
        </div>
        <h1 className="text-xl font-extrabold text-[#173B4D] tracking-tight">
          Safe Evacuation Route
        </h1>
        <p className="text-xs text-[#5A7382]">
          Calculated away from submerged culverts, low-lying drains, and road closures.
        </p>
      </div>

      {/* Target Shelter Banner */}
      <div className="p-4 rounded-2xl bg-white border border-[#E2ECEF] shadow-sm flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold text-[#5A7382] uppercase tracking-wider block">
            Destination Safe Haven
          </span>
          <h3 className="text-sm font-bold text-[#173B4D]">{targetShelter.name}</h3>
          <span className="text-xs text-[#5A7382]">{targetShelter.address} • {targetShelter.availableCapacity} beds open</span>
        </div>
        <div className="h-10 w-10 rounded-xl bg-[#EEF7F8] text-[#2E7D82] flex items-center justify-center shrink-0">
          <ShieldCheck className="h-5 w-5" />
        </div>
      </div>

      {/* Route Option Switcher */}
      <div className="grid grid-cols-2 gap-2">
        {SAFE_ROUTES.map((route) => {
          const isSelected = selectedRouteId === route.id;
          const isHighGround = route.type === 'RECOMMENDED_HIGH_GROUND';

          return (
            <button
              key={route.id}
              onClick={() => setSelectedRouteId(route.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-[#EEF7F8] border-[#2E7D82] ring-1 ring-[#2E7D82]/30'
                  : 'bg-white border-[#E2ECEF] hover:bg-[#F7FAFA]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                    isHighGround ? 'bg-[#4F8A68] text-white' : 'bg-amber-500 text-slate-950'
                  }`}
                >
                  {isHighGround ? 'RECOMMENDED' : 'CAUTION'}
                </span>
                <span className="text-xs font-mono font-bold text-[#173B4D]">
                  {route.safetyScore}% Safe
                </span>
              </div>
              <div className="text-xs font-bold text-[#173B4D] truncate">{route.name}</div>
              <div className="text-[11px] text-[#5A7382] mt-0.5 font-mono">
                {route.distanceKm} km • ~{route.walkTimeMin} min
              </div>
            </button>
          );
        })}
      </div>

      {/* Route Overview Metric Strip */}
      <div className="grid grid-cols-3 gap-2 bg-white p-3.5 rounded-2xl border border-[#E2ECEF] shadow-sm text-center">
        <div>
          <span className="text-[10px] text-[#8CA2AE] block font-medium">Estimated Walk</span>
          <span className="text-base font-extrabold text-[#173B4D] font-mono">
            {activeRoute.walkTimeMin} mins
          </span>
        </div>
        <div className="border-x border-[#F0F4F6]">
          <span className="text-[10px] text-[#8CA2AE] block font-medium">Safe Distance</span>
          <span className="text-base font-extrabold text-[#173B4D] font-mono">
            {activeRoute.distanceKm} km
          </span>
        </div>
        <div>
          <span className="text-[10px] text-[#8CA2AE] block font-medium">Elevation Gain</span>
          <span className="text-base font-extrabold text-[#4F8A68] font-mono">
            +{activeRoute.elevationGainM}m MSL
          </span>
        </div>
      </div>

      {/* Road Segment Conditions Breakdown */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-[#173B4D] uppercase tracking-wider block">
          Road Conditions Along This Route
        </span>

        <div className="space-y-2">
          {activeRoute.roads.map((road) => {
            const isSafe = road.status === 'SAFE';
            const isWaterlogged = road.status === 'WATERLOGGED';

            return (
              <div
                key={road.id}
                className="p-3 rounded-xl bg-white border border-[#E2ECEF] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`h-6 w-6 rounded-full flex items-center justify-center text-white text-[11px] font-bold ${
                      isSafe ? 'bg-[#4F8A68]' : isWaterlogged ? 'bg-amber-500' : 'bg-[#E85D5D]'
                    }`}
                  >
                    {isSafe ? '✓' : '!'}
                  </div>
                  <div>
                    <div className="font-bold text-[#173B4D]">{road.name}</div>
                    <div className="text-[11px] text-[#5A7382]">{road.conditionNote}</div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isSafe
                        ? 'bg-[#4F8A68]/10 text-[#4F8A68]'
                        : 'bg-amber-500/10 text-amber-700'
                    }`}
                  >
                    {road.status}
                  </span>
                  <div className="text-[10px] text-[#8CA2AE] font-mono mt-0.5">
                    Water: {road.waterDepthCm} cm
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step-by-Step Guidance */}
      <div className="p-4 rounded-2xl bg-white border border-[#E2ECEF] shadow-sm space-y-3">
        <span className="text-xs font-bold text-[#173B4D] uppercase tracking-wider block">
          Step-by-Step Directions
        </span>

        <div className="space-y-3">
          {activeRoute.turns.map((step, idx) => (
            <div key={idx} className="flex items-start gap-3 text-xs">
              <div className="h-6 w-6 rounded-full bg-[#EEF7F8] border border-[#DCEFF2] text-[#2E7D82] font-bold flex items-center justify-center shrink-0 text-xs">
                {idx + 1}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[#173B4D] leading-snug">
                  {step.instruction}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-[#8CA2AE] mt-0.5">
                  <span>{step.distanceM} meters</span>
                  <span>•</span>
                  <span>Elevation: {step.elevation}m MSL</span>
                </div>
                {step.hazardWarning && (
                  <div className="mt-1 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 text-[10px] font-medium flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    <span>{step.hazardWarning}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation CTA */}
      <div className="pt-2">
        <button
          onClick={() => setNavigating(!navigating)}
          className={`w-full py-3.5 px-5 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all ${
            navigating
              ? 'bg-[#4F8A68] hover:bg-[#3d6f52]'
              : 'bg-[#173B4D] hover:bg-[#1f4a60]'
          }`}
        >
          <Navigation className={`h-4 w-4 ${navigating ? 'animate-spin' : ''}`} />
          <span>{navigating ? 'Navigation Active (Tracking GPS)' : 'Start Evacuation Guidance'}</span>
        </button>
      </div>
    </div>
  );
};
