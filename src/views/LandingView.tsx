import React from 'react';
import {
  ShieldAlert,
  ArrowRight,
  Radio,
  MapPin,
  TrendingUp,
  Compass,
  WifiOff,
  PhoneCall,
  CheckCircle2,
  AlertOctagon,
  Cpu,
  Layers,
  Droplets,
  Activity,
  ShieldCheck,
  LifeBuoy,
} from 'lucide-react';
import { Village, Alert, Incident } from '../types/index.ts';

interface LandingViewProps {
  villages: Village[];
  alerts: Alert[];
  incidents: Incident[];
  onNavigate: (tab: string) => void;
  onSelectVillage: (village: Village) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  villages,
  alerts,
  incidents,
  onNavigate,
  onSelectVillage,
}) => {
  const criticalCount = villages.filter((v) => v.riskLevel === 'CRITICAL' || v.riskLevel === 'HIGH').length;
  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE');

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Section - Clean White Card with Cool Blue Accent */}
      <section className="relative overflow-hidden rounded-2xl border border-[#E5EAF0] bg-white p-6 sm:p-10 shadow-xs">
        {/* Soft background ambient gradient */}
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-blue-50/60 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-cyan-50/50 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-xs font-medium text-blue-700 mb-4">
            <span className="h-2 w-2 rounded-full bg-[#2563EB] animate-pulse" />
            <span>OPERATIONAL EARLY WARNING SYSTEM • GREATER MUMBAI</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
            Predictive Early-warning for{' '}
            <span className="text-[#2563EB]">
              Hyperlocal Flood Risk
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            PEHRA combines real-time rainfall gauges, Mithi River hydro-telemetry, Arabian Sea tidal dynamics, and hydrodynamic DEM flood-spread modeling to deliver verified, staged early warnings before water enters homes and transit subways.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('map')}
              id="hero-open-map-btn"
              className="flex items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-2.5 font-semibold text-white hover:bg-blue-700 shadow-sm transition-all"
            >
              <MapPin className="h-4 w-4" />
              <span>Explore Hyperlocal Map</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => onNavigate('alerts')}
              id="hero-view-alerts-btn"
              className="flex items-center gap-2 rounded-xl border border-[#E5EAF0] bg-white px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-xs transition-all"
            >
              <span>View Active Alerts ({activeAlerts.length})</span>
            </button>

            <button
              onClick={() => onNavigate('reports')}
              id="hero-report-flood-btn"
              className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/60 px-5 py-2.5 font-medium text-blue-700 hover:bg-blue-100/60 transition-all"
            >
              <span>Report Local Waterlogging</span>
            </button>
          </div>
        </div>

        {/* Live Key Metrics Row */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-[#E5EAF0] pt-6">
          <div className="rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] p-4">
            <div className="text-xs text-slate-500 font-medium">Critical / High Wards</div>
            <div className="mt-1 text-2xl font-bold font-mono text-rose-600">{criticalCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Kurla West, Sion Circle</div>
          </div>

          <div className="rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] p-4">
            <div className="text-xs text-slate-500 font-medium">Active Warning Stages</div>
            <div className="mt-1 text-2xl font-bold font-mono text-amber-600">{activeAlerts.length}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Stage 2 & Stage 3 Active</div>
          </div>

          <div className="rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] p-4">
            <div className="text-xs text-slate-500 font-medium">Max River Level</div>
            <div className="mt-1 text-2xl font-bold font-mono text-blue-600">2.15 m</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Gandhi Market, Sion</div>
          </div>

          <div className="rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] p-4">
            <div className="text-xs text-slate-500 font-medium">Lead Time Provided</div>
            <div className="mt-1 text-2xl font-bold font-mono text-emerald-600">2.4 hrs</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Pre-impact evacuation</div>
          </div>
        </div>
      </section>

      {/* Core Disaster Management Capabilities (6 Clean Cards) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Core Disaster Management Capabilities</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            A unified operations platform bridging hydrology, machine learning, and tactical emergency response.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-[#E5EAF0] bg-white p-5 hover:border-slate-300 transition-all shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB] mb-3">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-base">Model A: Flood Conditions Engine</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Predicts probability and time-to-impact before inundation occurs, calculating rainfall intensity, 3-hour cumulative accumulation, river discharge, and high tide backwater pressure.
            </p>
          </div>

          <div className="rounded-xl border border-[#E5EAF0] bg-white p-5 hover:border-slate-300 transition-all shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 mb-3">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-base">Model B: Hydrodynamic DEM Spread</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Propagates floodwater across elevation rasters and culvert networks, determining specific downstream cells, hourly spread contours, water depth in meters, and arrival ETAs.
            </p>
          </div>

          <div className="rounded-xl border border-[#E5EAF0] bg-white p-5 hover:border-slate-300 transition-all shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 mb-3">
              <AlertOctagon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-base">Staged Alerting & Verification</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Strictly enforces staged escalation: <strong>WATCH</strong> (automated), <strong>WARNING</strong> (credible threat), and <strong>CONFIRMED</strong> (requires human authority verification before emergency broadcast).
            </p>
          </div>

          <div className="rounded-xl border border-[#E5EAF0] bg-white p-5 hover:border-slate-300 transition-all shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-3">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-base">Dynamic Evacuation Routing</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Calculates safest evacuation corridors avoiding submerged subways (Milan, Andheri, Sion), dynamically linking citizens to nearby municipal schools with available beds and rations.
            </p>
          </div>

          <div className="rounded-xl border border-[#E5EAF0] bg-white p-5 hover:border-slate-300 transition-all shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-3">
              <WifiOff className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-base">Offline Resilience & Mesh Payloads</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Operates under severe telecommunications degradation with local cache fallback and cryptographic BLE relay packet schemas for peer-to-peer warning propagation.
            </p>
          </div>

          <div className="rounded-xl border border-[#E5EAF0] bg-white p-5 hover:border-slate-300 transition-all shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 mb-3">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-base">Scenario Simulation & Replay</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Enables disaster planners to simulate extreme compound scenarios (100mm/hr cloudburst + 4.8m tide) and replay historic deluge milestones to audit response readiness.
            </p>
          </div>
        </div>
      </section>

      {/* Mumbai Hotspots Status Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Hyperlocal Flood Hotspots (Greater Mumbai)</h2>
            <p className="text-sm text-slate-500 mt-0.5">Live risk assessment calculated per municipal ward.</p>
          </div>
          <button
            onClick={() => onNavigate('map')}
            className="text-xs font-semibold text-[#2563EB] hover:text-blue-700 flex items-center gap-1"
          >
            <span>View all on map</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {villages.map((village) => {
            const riskStyles: Record<string, { border: string; badge: string }> = {
              CRITICAL: { border: 'border-rose-200 hover:border-rose-400', badge: 'bg-rose-50 text-rose-700 border-rose-200' },
              HIGH: { border: 'border-amber-200 hover:border-amber-400', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
              MODERATE: { border: 'border-amber-200 hover:border-amber-300', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
              LOW: { border: 'border-blue-200 hover:border-blue-300', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
              SAFE: { border: 'border-emerald-200 hover:border-emerald-300', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
            };
            const style = riskStyles[village.riskLevel] || riskStyles.SAFE;

            return (
              <div
                key={village.id}
                onClick={() => {
                  onSelectVillage(village);
                  onNavigate('map');
                }}
                className={`cursor-pointer rounded-xl border bg-white p-4 transition-all hover:shadow-sm ${style.border}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider">{village.ward}</span>
                    <h4 className="font-semibold text-slate-900 text-base mt-0.5">{village.name}</h4>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border ${style.badge}`}>
                    {village.riskLevel}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block font-medium">Water Depth</span>
                    <span className="font-mono font-semibold text-slate-900">{village.waterLevelM} m</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block font-medium">Elevation</span>
                    <span className="font-mono font-medium text-slate-700">{village.elevationM} m</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block font-medium">At Risk</span>
                    <span className="font-mono font-medium text-slate-700">{(village.exposurePopulation / 1000).toFixed(0)}k</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Emergency Helplines Quick Action */}
      <section className="rounded-2xl border border-red-200 bg-[#FEF2F2] p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#DC2626] font-semibold text-sm">
              <PhoneCall className="h-4 w-4" />
              <span>Official Emergency Disaster Helplines</span>
            </div>
            <p className="mt-1 text-xs text-slate-700">
              In case of life-threatening flooding, collapsed structures, or trapped citizens, contact emergency responders immediately.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="tel:1916"
              className="flex items-center gap-2 rounded-xl bg-[#DC2626] px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 shadow-xs transition-colors"
            >
              <span>MCGM Disaster Cell: 1916</span>
            </a>
            <a
              href="tel:112"
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 hover:bg-slate-50 transition-colors"
            >
              <span>Police / NDRF: 112</span>
            </a>
            <a
              href="tel:108"
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 hover:bg-slate-50 transition-colors"
            >
              <span>Ambulance: 108</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
