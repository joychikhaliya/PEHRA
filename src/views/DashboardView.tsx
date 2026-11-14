import React from 'react';
import {
  AlertTriangle,
  Flame,
  Users,
  Building2,
  ShieldCheck,
  Radio,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Activity,
  Droplets,
  Wind,
  Waves,
  ExternalLink,
} from 'lucide-react';
import { Incident, Alert, Village, FloodReport, DataSource } from '../types/index.ts';

interface DashboardViewProps {
  incidents: Incident[];
  alerts: Alert[];
  villages: Village[];
  reports: FloodReport[];
  sources: DataSource[];
  onNavigate: (tab: string) => void;
  onSelectIncident: (inc: Incident) => void;
  onSelectAlert: (alert: Alert) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  incidents,
  alerts,
  villages,
  reports,
  sources,
  onNavigate,
  onSelectIncident,
  onSelectAlert,
}) => {
  const activeIncidents = incidents.filter((i) => i.status === 'ACTIVE');
  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE');
  const peopleAtRisk = villages.reduce((acc, v) => acc + (v.riskLevel === 'CRITICAL' || v.riskLevel === 'HIGH' ? v.exposurePopulation : 0), 0);
  const healthySources = sources.filter((s) => s.status === 'HEALTHY').length;

  return (
    <div className="space-y-6 pb-16">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Command & Operations Center</h1>
            <span className="rounded bg-rose-950 border border-rose-700/60 px-2 py-0.5 text-[11px] font-bold text-rose-300 font-mono">
              LEVEL 2 INCIDENT
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-source situational awareness for Municipal Disaster Management Cell & Responders
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('alerts')}
            className="rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-rose-500 shadow-sm"
          >
            + Authorize Emergency Alert
          </button>
          <button
            onClick={() => onNavigate('simulation')}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
          >
            Launch Scenario
          </button>
        </div>
      </div>

      {/* 6 Key Operational Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/80 p-3.5 hover:border-rose-700/50 transition-all duration-200 group">
          <div className="flex items-center justify-between text-rose-400 text-xs font-semibold">
            <span>Active Incidents</span>
            <Flame className="h-4 w-4 text-rose-400/80 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white tracking-tight">{activeIncidents.length}</div>
          <div className="mt-1 text-[11px] text-slate-400 font-medium">1 Breach, 1 Urban</div>
        </div>

        <div className="rounded-xl border border-slate-800/80 bg-slate-900/80 p-3.5 hover:border-amber-700/50 transition-all duration-200 group">
          <div className="flex items-center justify-between text-amber-400 text-xs font-semibold">
            <span>Active Warnings</span>
            <AlertTriangle className="h-4 w-4 text-amber-400/80 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white tracking-tight">{activeAlerts.length}</div>
          <div className="mt-1 text-[11px] text-slate-400 font-medium">Stage 2 & 3 Broadcasted</div>
        </div>

        <div className="rounded-xl border border-slate-800/80 bg-slate-900/80 p-3.5 hover:border-cyan-700/50 transition-all duration-200 group">
          <div className="flex items-center justify-between text-cyan-400 text-xs font-semibold">
            <span>People at Risk</span>
            <Users className="h-4 w-4 text-cyan-400/80 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white tracking-tight">{peopleAtRisk.toLocaleString()}</div>
          <div className="mt-1 text-[11px] text-slate-400 font-medium">Kurla West & Sion</div>
        </div>

        <div className="rounded-xl border border-slate-800/80 bg-slate-900/80 p-3.5 hover:border-blue-700/50 transition-all duration-200 group">
          <div className="flex items-center justify-between text-blue-400 text-xs font-semibold">
            <span>Critical Subways</span>
            <Building2 className="h-4 w-4 text-blue-400/80 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white tracking-tight">3 Closed</div>
          <div className="mt-1 text-[11px] text-slate-400 font-medium">Milan, Andheri, Sion</div>
        </div>

        <div className="rounded-xl border border-slate-800/80 bg-slate-900/80 p-3.5 hover:border-emerald-700/50 transition-all duration-200 group">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold">
            <span>Model Confidence</span>
            <TrendingUp className="h-4 w-4 text-emerald-400/80 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white tracking-tight">89.4%</div>
          <div className="mt-1 text-[11px] text-emerald-400 font-medium">Lead Time 2.4h</div>
        </div>

        <div className="rounded-xl border border-slate-800/80 bg-slate-900/80 p-3.5 hover:border-purple-700/50 transition-all duration-200 group">
          <div className="flex items-center justify-between text-purple-400 text-xs font-semibold">
            <span>Source Feeds</span>
            <Radio className="h-4 w-4 text-purple-400/80 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white tracking-tight">{healthySources} / {sources.length}</div>
          <div className="mt-1 text-[11px] text-slate-400 font-medium">1 Degraded (KR-04)</div>
        </div>
      </div>

      {/* Real-time Telemetry & Hydrology Ticker */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Activity className="h-3.5 w-3.5 text-cyan-400" />
            <span>Environmental Telemetry (Live Observation Matrix)</span>
          </div>
          <span className="text-[11px] font-mono text-cyan-400">Updated 45s ago via IIT-B & MCGM</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
            <div className="flex items-center justify-between text-slate-400">
              <span>Kurla West Rainfall</span>
              <Droplets className="h-3.5 w-3.5 text-cyan-400" />
            </div>
            <div className="mt-1 text-xl font-bold font-mono text-white">74.5 mm/hr</div>
            <div className="mt-1 text-[10px] text-rose-400 font-semibold">Drainage Capacity: 22 mm/hr (Stress 338%)</div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
            <div className="flex items-center justify-between text-slate-400">
              <span>Sion Circle Rainfall</span>
              <Droplets className="h-3.5 w-3.5 text-cyan-400" />
            </div>
            <div className="mt-1 text-xl font-bold font-mono text-white">86.2 mm/hr</div>
            <div className="mt-1 text-[10px] text-rose-400 font-semibold">Cloudburst Threshold: &gt;100 mm/hr</div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
            <div className="flex items-center justify-between text-slate-400">
              <span>Mithi River Culvert Gate #3</span>
              <Activity className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <div className="mt-1 text-xl font-bold font-mono text-amber-300">3.42 m Gauge</div>
            <div className="mt-1 text-[10px] text-amber-400 font-semibold">Danger Level: 3.50 m (Rate: +0.45m/15m)</div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
            <div className="flex items-center justify-between text-slate-400">
              <span>Arabian Sea Apollo Bunder</span>
              <Wind className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <div className="mt-1 text-xl font-bold font-mono text-blue-300">4.45 m Tide</div>
            <div className="mt-1 text-[10px] text-rose-400 font-semibold">Peak High Tide: 16:30 IST (Locks Outflow)</div>
          </div>
        </div>
      </div>

      {/* Real-Time Water Level System Stream Card */}
      <div className="rounded-xl border border-cyan-800/50 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900 p-4 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
            <Waves className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm">Real-Time Water Level System Active</h3>
              <span className="rounded-full bg-emerald-950/80 border border-emerald-700/60 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-300">
                LIVE STREAM INGESTION
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              Connected to 12 hydro-acoustic stations along Mithi River, Poisar, Dahisar, Milan Subway, & Arabian Sea outfalls.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('water-levels')}
          className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 shadow-sm transition-all active:scale-[0.98] shrink-0"
        >
          <span>Open Water Level Deck</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Priority Queue with "Why Priority?" Explainability */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">Operator Priority Queue</h2>
              <span className="rounded bg-rose-950/80 border border-rose-800 px-1.5 py-0.5 text-[10px] font-mono text-rose-300">
                Action Required
              </span>
            </div>
            <span className="text-xs text-slate-400">Ranked by Hazard × Exposure × Confidence</span>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 border-l-4 border-l-rose-500 shadow-sm hover:border-slate-700 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                      PRIORITY 1 • CRITICAL
                    </span>
                    <span className="font-bold text-white text-sm">Mithi River Spillage at Kurla Bail Bazar</span>
                  </div>
                  <div className="rounded-lg bg-rose-950/40 border border-rose-900/40 p-2.5 text-xs text-rose-200/90 leading-relaxed">
                    <strong className="text-rose-300">Why Priority?</strong> Sensor rise rate exceeds 0.45m/15min while 4.45m high tide locks sluice gates. Downhill flow model predicts 1.85m depth within 45 minutes affecting 48,500 residents.
                  </div>
                  <div className="text-xs text-slate-300">
                    <strong className="text-slate-200">Required Action:</strong> Verify Model B spread contour and dispatch Stage 2 WARNING to Kurla East/West.
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('alerts')}
                  className="shrink-0 rounded-lg bg-rose-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-rose-500 shadow-sm active:scale-[0.98] transition-all"
                >
                  Manage Alert
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 border-l-4 border-l-amber-500 shadow-sm hover:border-slate-700 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-slate-950 uppercase tracking-wider">
                      PRIORITY 2 • HIGH
                    </span>
                    <span className="font-bold text-white text-sm">Sion Circle Subway Submersion</span>
                  </div>
                  <div className="rounded-lg bg-amber-950/40 border border-amber-900/40 p-2.5 text-xs text-amber-200/90 leading-relaxed">
                    <strong className="text-amber-300">Why Priority?</strong> Gandhi Market highway dip has 2.15m water. Dr. Ambedkar Road arterial highway halted.
                  </div>
                  <div className="text-xs text-slate-300">
                    <strong className="text-slate-200">Required Action:</strong> Direct traffic detour via elevated flyover and activate 6 high-capacity stormwater dewatering pumps.
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('evacuation')}
                  className="shrink-0 rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 shadow-sm active:scale-[0.98] transition-all"
                >
                  Check Routes
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 border-l-4 border-l-blue-500 shadow-sm hover:border-slate-700 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                      PRIORITY 3 • SENSOR
                    </span>
                    <span className="font-bold text-white text-sm">Telemetry Station KR-04 Degraded</span>
                  </div>
                  <div className="rounded-lg bg-slate-800/60 border border-slate-700/50 p-2.5 text-xs text-slate-300 leading-relaxed">
                    <strong className="text-blue-300">Why Priority?</strong> CWC telemetry packet dropped last contact 14 mins ago. Prediction engine fell back to adjacent station IITB-SN08.
                  </div>
                  <div className="text-xs text-slate-300">
                    <strong className="text-slate-200">Required Action:</strong> Ping provider gateway or dispatch field technician.
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('admin')}
                  className="shrink-0 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-700 active:scale-[0.98] transition-all"
                >
                  Inspect Source
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Citizen Field Reports Stream */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white tracking-tight">Verified Field Reports</h2>
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
            >
              View all ({reports.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {reports.slice(0, 3).map((rep) => (
              <div key={rep.id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{rep.location.address}</span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                      rep.status === 'VERIFIED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60' : 'bg-amber-950 text-amber-300 border border-amber-700/60'
                    }`}
                  >
                    {rep.status}
                  </span>
                </div>

                <div className="mt-1 text-slate-300">
                  Depth: <strong className="text-amber-400">{rep.waterDepthM}m ({rep.depthCategory})</strong>
                </div>
                <p className="mt-1 text-slate-400 line-clamp-2">"{rep.description}"</p>

                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80 pt-2">
                  <span>Reported by {rep.reporterName}</span>
                  <span>{new Date(rep.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Disaster Contact Card */}
          <div className="rounded-xl border border-cyan-900/60 bg-cyan-950/30 p-4 text-xs">
            <div className="font-bold text-cyan-300 flex items-center gap-1.5 mb-1">
              <ShieldCheck className="h-4 w-4" />
              <span>NDRF & MCGM Emergency Coordination</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              5th Battalion NDRF inflatable motorized boats stationed at Kurla Fire Station. MCGM Central Control Room hotline: <strong>1916</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
