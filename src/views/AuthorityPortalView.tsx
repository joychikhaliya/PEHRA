import React, { useState } from 'react';
import {
  ShieldAlert,
  Radio,
  Sliders,
  BellRing,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Waves,
  Users,
  Compass,
  ArrowRight,
  FileCheck,
  Zap,
} from 'lucide-react';
import { Alert, Village, DataSource } from '../types/index.ts';

interface AuthorityPortalViewProps {
  alerts: Alert[];
  villages: Village[];
  sources: DataSource[];
  onApproveAlert: (alertId: string, reason: string) => Promise<void>;
  onCreateAlert: (alertData: any) => Promise<void>;
  onNavigate: (tab: string) => void;
}

export const AuthorityPortalView: React.FC<AuthorityPortalViewProps> = ({
  alerts,
  villages,
  sources,
  onApproveAlert,
  onCreateAlert,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'BROADCAST' | 'SLUICE_GATES' | 'WARD_ORDERS'>('BROADCAST');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Sluice Gate State
  const [gatesState, setGatesState] = useState([
    { id: 'gate-mahim', name: 'Mahim Causeway Mithi Outfall Gates (4x)', status: 'LOCKED_TIDE', flowM3s: 180, oceanLevelM: 4.45 },
    { id: 'gate-cleveland', name: 'Cleveland Bunder Worli Sluice', status: 'DISCHARGING', flowM3s: 290, oceanLevelM: 4.20 },
    { id: 'gate-lovegrove', name: 'Love Grove Pumping Station (Worli)', status: 'FULL_PUMPING', flowM3s: 410, oceanLevelM: 4.30 },
    { id: 'gate-hajiali', name: 'Haji Ali Bay Stormwater Outfall', status: 'LOCKED_TIDE', flowM3s: 110, oceanLevelM: 4.40 },
  ]);

  // Alert Creation Studio state
  const [newTitle, setNewTitle] = useState('CRITICAL EVACUATION ORDER: Mithi River Corridor & Kurla Kranti Nagar');
  const [newVillageId, setNewVillageId] = useState('mumbai-kurla-w');
  const [newStage, setNewStage] = useState<'WATCH' | 'WARNING' | 'CONFIRMED'>('CONFIRMED');
  const [newRisk, setNewRisk] = useState<'HIGH' | 'CRITICAL'>('CRITICAL');
  const [newReason, setNewReason] = useState('Water level exceeded 3.45m danger gauge. High tide at 16:30 prevents outflow. Move to relief camps immediately.');
  const [publishingAlert, setPublishingAlert] = useState(false);

  const handleToggleGate = (gateId: string) => {
    setGatesState((prev) =>
      prev.map((g) => {
        if (g.id === gateId) {
          const newStatus = g.status === 'LOCKED_TIDE' ? 'FORCE_OPEN_PUMPING' : 'LOCKED_TIDE';
          return { ...g, status: newStatus };
        }
        return g;
      })
    );
    setActionSuccessMsg(`Sluice actuator command transmitted to MCGM Stormwater Telemetry unit for ${gateId}.`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handlePublishOfficialAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishingAlert(true);
    try {
      const village = villages.find((v) => v.id === newVillageId) || villages[0];
      await onCreateAlert({
        title: newTitle,
        villageId: village.id,
        villageName: village.name,
        stage: newStage,
        riskLevel: newRisk,
        message: newReason,
        confidence: 0.96,
        etaHours: 1.0,
        approvedBy: 'usr-authority-01 (Officer Vikramaditya Kadam)',
        checklist: [
          'Immediate evacuation of ground floor residences in lane 2, 3, and 4',
          'Avoid power transformers and submerged open trenches',
          'Designated shelter: Kurla Municipal High School (Hot meals ready)',
        ],
      });
      setActionSuccessMsg(`Official Municipal ${newStage} Alert broadcasted across SMS, Push, and Ward PA Sirens.`);
      setTimeout(() => setActionSuccessMsg(null), 5000);
    } finally {
      setPublishingAlert(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Authority Apex Header */}
      <div className="rounded-2xl border border-[#E5EAF0] bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200 shrink-0">
              <Building2 className="h-5 w-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-amber-700 border border-amber-200">
                  MUNICIPAL EOC COMMAND CONSOLE (TIER 2)
                </span>
                <span className="text-xs text-slate-500 font-medium">Officer Vikramaditya Kadam • MCGM Disaster Cell HQ</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
                Disaster Operations Command & Early Warning Broadcast
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                Authority to sanction emergency broadcast sirens, override coastal storm sluice gates, and declare formal evacuation zones under the Disaster Management Act.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('rbac-hub')}
              className="rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Switch Role
            </button>
            <button
              onClick={() => onNavigate('alerts')}
              className="flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs transition-colors"
            >
              <BellRing className="h-3.5 w-3.5" />
              <span>Public Alert Feed</span>
            </button>
          </div>
        </div>

        {/* Quick Sluice Status Pill Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100 text-xs">
          <div className="rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] p-3">
            <div className="text-slate-500 font-medium">Arabian Sea Tide</div>
            <div className="mt-1 text-xl font-bold font-mono text-amber-600">4.45 m (Peak)</div>
            <div className="text-[10px] text-slate-500">Tidal Backflow Locking Nullahs</div>
          </div>

          <div className="rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] p-3">
            <div className="text-slate-500 font-medium">Active Warning Sirens</div>
            <div className="mt-1 text-xl font-bold font-mono text-slate-900">
              {alerts.filter((a) => a.status === 'ACTIVE').length} Sounding
            </div>
            <div className="text-[10px] text-slate-500">PA System & Cell Broadcast</div>
          </div>

          <div className="rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] p-3">
            <div className="text-slate-500 font-medium">Sluice Discharge</div>
            <div className="mt-1 text-xl font-bold font-mono text-emerald-600">990 m³/sec</div>
            <div className="text-[10px] text-slate-500">Love Grove & Worli Pumping</div>
          </div>

          <div className="rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] p-3">
            <div className="text-slate-500 font-medium">EOC Shift Commander</div>
            <div className="mt-1 text-sm font-bold font-mono text-slate-900">DESK-01 (ACTIVE)</div>
            <div className="text-[10px] text-slate-500">Token: MCGM-DM-2026-X9</div>
          </div>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionSuccessMsg && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-3.5 text-xs text-blue-900 flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
            <span className="font-semibold">{actionSuccessMsg}</span>
          </div>
          <span className="text-[10px] font-mono text-blue-700">AUTHORIZED</span>
        </div>
      )}

      {/* Segmented Mode Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[#E5EAF0] pb-2 text-xs">
        <button
          onClick={() => setActiveTab('BROADCAST')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
            activeTab === 'BROADCAST'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BellRing className="h-3.5 w-3.5" />
          <span>Broadcast Warning Siren Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('SLUICE_GATES')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
            activeTab === 'SLUICE_GATES'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Waves className="h-3.5 w-3.5" />
          <span>Sluice Gates & Actuators ({gatesState.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('WARD_ORDERS')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
            activeTab === 'WARD_ORDERS'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileCheck className="h-3.5 w-3.5" />
          <span>Ward Evacuation Orders ({villages.length})</span>
        </button>
      </div>

      {/* TAB 1: BROADCAST WARNING STUDIO */}
      {activeTab === 'BROADCAST' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Creator Form */}
          <div className="lg:col-span-2 rounded-2xl border border-[#E5EAF0] bg-white p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Radio className="h-4 w-4 text-rose-600" />
                  <span>Issue Official Hyperlocal Flood Siren & Advisory</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Dispatches emergency broadcast across mobile networks (CB-SMS), local PA sirens, and app notifications.
                </p>
              </div>
              <span className="rounded-full bg-rose-50 border border-rose-200 text-rose-700 px-2 py-0.5 text-[10px] font-mono font-bold">
                TIER 2 CLEARANCE
              </span>
            </div>

            <form onSubmit={handlePublishOfficialAlert} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Target Ward / Municipal Locality</label>
                  <select
                    value={newVillageId}
                    onChange={(e) => setNewVillageId(e.target.value)}
                    className="w-full rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                  >
                    {villages.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.ward}) — Current Risk: {v.riskLevel}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Alert Stage Classification</label>
                  <select
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value as any)}
                    className="w-full rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="WATCH">WATCH (T-3 hours to expected overflow)</option>
                    <option value="WARNING">WARNING (T-1 hour: High runoff approaching)</option>
                    <option value="CONFIRMED">CONFIRMED (Critical Deluge / Evacuate Now)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Broadcast Alert Headline</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] px-3 py-2 text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-[#2563EB]"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Public Safety Directive & Evacuation Details</label>
                <textarea
                  rows={3}
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="w-full rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div className="text-[11px] text-slate-500">
                  Signed with digital token: <strong className="text-slate-800 font-mono">MCGM-DM-2026-X9</strong>
                </div>

                <button
                  type="submit"
                  disabled={publishingAlert}
                  className="py-2.5 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Radio className="h-4 w-4" />
                  <span>{publishingAlert ? 'Broadcasting...' : 'Authenticate & Sound Siren'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Guidelines Sidebar */}
          <div className="rounded-2xl border border-[#E5EAF0] bg-white p-5 space-y-4 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm">MCGM Standard Operating Protocol</h3>
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] space-y-1">
                <div className="font-semibold text-slate-900">1. Tidal Lock Threshold</div>
                <p className="text-[11px]">
                  When Arabian Sea tide exceeds 4.2m coincident with rainfall &gt;40mm/hr, Mithi gravity discharge drops to zero. Warning level mandatory.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] space-y-1">
                <div className="font-semibold text-slate-900">2. Pre-Evacuation Buffer</div>
                <p className="text-[11px]">
                  Order evacuation of ground floor shanties in Kranti Nagar at least 1.5 hours prior to high tide peak.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] space-y-1">
                <div className="font-semibold text-slate-900">3. Transit Corridor Security</div>
                <p className="text-[11px]">
                  Ensure police cordons isolate submerged pedestrian subways (Milan, Andheri, Khar).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SLUICE GATES & ACTUATORS */}
      {activeTab === 'SLUICE_GATES' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gatesState.map((g) => (
              <div
                key={g.id}
                className="rounded-2xl border border-[#E5EAF0] bg-white p-5 space-y-4 shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{g.name}</h3>
                    <span className="text-xs text-slate-500 font-mono">SCADA Actuator ID: {g.id}</span>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase border ${
                      g.status.includes('LOCKED')
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {g.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl border border-[#E5EAF0] bg-[#F8FAFC]">
                    <span className="text-slate-500 text-[10px] block">Current Discharge</span>
                    <span className="text-base font-bold font-mono text-slate-900">{g.flowM3s} m³/s</span>
                  </div>

                  <div className="p-2.5 rounded-xl border border-[#E5EAF0] bg-[#F8FAFC]">
                    <span className="text-slate-500 text-[10px] block">Ocean Side Gauge</span>
                    <span className="text-base font-bold font-mono text-blue-600">{g.oceanLevelM} m MSL</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    {g.status.includes('LOCKED')
                      ? 'Closed to prevent sea backflow'
                      : 'Actively flushing inland stormwater'}
                  </span>

                  <button
                    onClick={() => handleToggleGate(g.id)}
                    className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors border border-[#E5EAF0]"
                  >
                    Toggle Actuator State
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: WARD ORDERS */}
      {activeTab === 'WARD_ORDERS' && (
        <div className="rounded-2xl border border-[#E5EAF0] bg-white p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base">Ward Emergency Directives Overview</h3>
            <span className="text-xs text-slate-500">{villages.length} Municipal Surveillance Zones</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5EAF0] text-slate-500 font-medium text-[11px] bg-[#F8FAFC]">
                  <th className="py-2.5 px-3">Ward & Basin</th>
                  <th className="py-2.5 px-2">Risk Level</th>
                  <th className="py-2.5 px-2">Water Gauge</th>
                  <th className="py-2.5 px-2">Population Exposed</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {villages.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{v.name}</div>
                      <div className="text-[11px] text-slate-500">{v.ward}</div>
                    </td>

                    <td className="py-3 px-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                          v.riskLevel === 'CRITICAL'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : v.riskLevel === 'HIGH'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {v.riskLevel}
                      </span>
                    </td>

                    <td className="py-3 px-2 font-mono font-semibold text-slate-800">{v.waterLevelM} m</td>
                    <td className="py-3 px-2 font-mono text-rose-600 font-semibold">{v.exposurePopulation.toLocaleString()}</td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          setNewVillageId(v.id);
                          setActiveTab('BROADCAST');
                        }}
                        className="py-1 px-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-[11px] font-semibold transition-colors"
                      >
                        Issue Ward Siren
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
