import React, { useState } from 'react';
import { EvacuationRoute, Shelter, Hospital } from '../types/index.ts';
import {
  LifeBuoy,
  Compass,
  Building2,
  Phone,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Shield,
  Activity,
} from 'lucide-react';

interface EvacuationViewProps {
  routes: EvacuationRoute[];
  shelters: Shelter[];
  hospitals: Hospital[];
  onNavigate: (tab: string) => void;
}

export const EvacuationView: React.FC<EvacuationViewProps> = ({
  routes,
  shelters,
  hospitals,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'ROUTES' | 'SHELTERS' | 'HOSPITALS'>('ROUTES');

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Evacuation Logistics & Safe Havens</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time verified corridors, relief camp inventory stockpiles, and trauma hospital emergency capacities
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-lg border border-slate-800 bg-slate-900 p-1 text-xs">
          <button
            onClick={() => setActiveTab('ROUTES')}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 font-medium transition-all ${
              activeTab === 'ROUTES' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Evacuation Routes ({routes.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('SHELTERS')}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 font-medium transition-all ${
              activeTab === 'SHELTERS' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LifeBuoy className="h-3.5 w-3.5" />
            <span>Relief Shelters ({shelters.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('HOSPITALS')}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 font-medium transition-all ${
              activeTab === 'HOSPITALS' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Hospitals & Beds ({hospitals.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Evacuation Routes */}
      {activeTab === 'ROUTES' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/20 p-4 text-xs text-emerald-200">
            <strong>Dynamic Highway & Subway Safety Status:</strong> Evacuation paths are continuously validated against DEM flood contours and dewatering pump statuses. All subways with &gt;0.5m water are marked BLOCKED with automated elevated bypasses.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {routes.map((route) => {
              const isClear = route.status === 'CLEAR';
              const isCaution = route.status === 'CAUTION';

              return (
                <div key={route.id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                        Route Corridor
                      </span>
                      <h3 className="font-bold text-white text-base mt-0.5">{route.name}</h3>
                    </div>
                    <span
                      className={`rounded px-2 py-0.5 text-[11px] font-bold uppercase ${
                        isClear ? 'bg-emerald-600 text-white' : isCaution ? 'bg-amber-500 text-slate-950' : 'bg-rose-600 text-white'
                      }`}
                    >
                      {route.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-t border-slate-800/80 pt-3 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Corridor Length</span>
                      <span className="font-mono font-bold text-white">{route.distanceKm} km</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Travel Time</span>
                      <span className="font-mono font-bold text-emerald-400">{route.estimatedTravelMinutes} mins</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Hazard Risk</span>
                      <span className="font-mono font-bold text-cyan-400">{(route.riskScore * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300">
                    <span className="font-semibold text-slate-400">Corridor Safety Check: </span>
                    <span className={route.safetyCheckPassed ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                      {route.safetyCheckPassed ? 'Passed (Elevated corridor above flood contour)' : 'Caution (Active Monitoring)'}
                    </span>
                  </div>

                  {route.alternativeRouteWaypoints && (
                    <div className="rounded-lg border border-cyan-900/60 bg-cyan-950/40 p-2.5 text-[11px] text-cyan-200">
                      <strong>Elevated Bypass Verified:</strong> Secondary high-ground route mapped in case of arterial congestion.
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => onNavigate('map')}
                      className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                    >
                      <span>Show Route Geometry on Map</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Shelters */}
      {activeTab === 'SHELTERS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shelters.map((shelter) => {
            const pct = Math.round((shelter.occupancy / shelter.capacity) * 100);

            return (
              <div key={shelter.id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                      Designated Municipal Facility
                    </span>
                    <h3 className="font-bold text-white text-base mt-0.5">{shelter.name}</h3>
                    <p className="text-xs text-slate-400">{shelter.location.address}</p>
                  </div>
                  <span className="rounded bg-emerald-950 border border-emerald-700/60 px-2 py-0.5 text-[10px] font-bold text-emerald-300 uppercase">
                    {shelter.status}
                  </span>
                </div>

                {/* Capacity Progress Bar */}
                <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-xs space-y-1.5">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-400">Current Occupancy:</span>
                    <span className="text-white">
                      {shelter.occupancy} / {shelter.capacity} people ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${pct > 80 ? 'bg-rose-500' : 'bg-cyan-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Emergency Supplies Inventory */}
                <div className="space-y-2 text-xs">
                  <span className="font-bold text-slate-300 block">Stockpile Inventory:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
                    <div className="rounded bg-slate-950 p-2 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Food Packs</span>
                      <span className="font-mono font-bold text-white">{shelter.emergencySupplies.foodPacks}</span>
                    </div>
                    <div className="rounded bg-slate-950 p-2 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Water (L)</span>
                      <span className="font-mono font-bold text-white">{shelter.emergencySupplies.waterLiters}</span>
                    </div>
                    <div className="rounded bg-slate-950 p-2 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">First Aid</span>
                      <span className="font-mono font-bold text-white">{shelter.emergencySupplies.firstAidKits}</span>
                    </div>
                    <div className="rounded bg-slate-950 p-2 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Blankets</span>
                      <span className="font-mono font-bold text-white">{shelter.emergencySupplies.blankets}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs">
                  <span className="text-slate-400">Coordinator: <strong className="text-white">{shelter.contactPerson}</strong></span>
                  <a href={`tel:${shelter.contactPhone}`} className="text-cyan-400 font-bold hover:underline">
                    📞 {shelter.contactPhone}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Hospitals */}
      {activeTab === 'HOSPITALS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hospitals.map((hospital) => (
            <div key={hospital.id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider font-semibold">
                    Emergency Medical Center
                  </span>
                  <h3 className="font-bold text-white text-base mt-0.5">{hospital.name}</h3>
                  <p className="text-xs text-slate-400">{hospital.location.address}</p>
                </div>
                <span className="rounded bg-rose-950 border border-rose-700/60 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                  TRAUMA READY
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-slate-800/80 pt-3 text-xs">
                <div className="rounded bg-slate-950 p-2.5 border border-slate-800 text-center">
                  <span className="text-slate-400 text-[10px] block">Available Beds</span>
                  <span className="font-mono text-lg font-bold text-emerald-400">{hospital.availableBeds}</span>
                  <span className="text-[10px] text-slate-500 block">of {hospital.emergencyCapacity}</span>
                </div>

                <div className="rounded bg-slate-950 p-2.5 border border-slate-800 text-center">
                  <span className="text-slate-400 text-[10px] block">Ambulances Ready</span>
                  <span className="font-mono text-lg font-bold text-cyan-400">{hospital.ambulanceAvailable}</span>
                  <span className="text-[10px] text-slate-500 block">High-Axle</span>
                </div>

                <div className="rounded bg-slate-950 p-2.5 border border-slate-800 text-center">
                  <span className="text-slate-400 text-[10px] block">Blood Bank</span>
                  <span className="font-mono text-lg font-bold text-rose-400">{hospital.bloodBank ? 'YES' : 'NO'}</span>
                  <span className="text-[10px] text-slate-500 block">O-Neg Avail</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs">
                <span className="text-slate-400">Helpline: <strong className="text-white font-mono">{hospital.contactPhone}</strong></span>
                <a
                  href={`tel:${hospital.contactPhone}`}
                  className="rounded bg-rose-600 px-3 py-1 text-white font-bold hover:bg-rose-500"
                >
                  Call Casualty
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
