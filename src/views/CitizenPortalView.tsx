import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  MapPin,
  LifeBuoy,
  PhoneCall,
  Camera,
  Navigation,
  Send,
  CheckCircle2,
  Clock,
  Compass,
  Bell,
  Waves,
  ArrowRight,
  Info,
  Share2,
} from 'lucide-react';
import { Village, Shelter, Alert, FloodReport } from '../types/index.ts';
import { SurvivalChecklist } from '../components/SurvivalChecklist.tsx';

interface CitizenPortalViewProps {
  villages: Village[];
  shelters: Shelter[];
  alerts: Alert[];
  reports: FloodReport[];
  onNavigate: (tab: string) => void;
  onSubmitReport: (reportData: any) => Promise<void>;
}

export const CitizenPortalView: React.FC<CitizenPortalViewProps> = ({
  villages,
  shelters,
  alerts,
  reports,
  onNavigate,
  onSubmitReport,
}) => {
  const [selectedWardId, setSelectedWardId] = useState<string>('mumbai-kurla-w');
  const [sosTriggered, setSosTriggered] = useState<boolean>(false);
  const [sosConfirmStep, setSosConfirmStep] = useState<boolean>(false);
  const [reportSuccess, setReportSuccess] = useState<boolean>(false);
  const [submittingReport, setSubmittingReport] = useState<boolean>(false);

  // Quick report state
  const [reportDepth, setReportDepth] = useState<string>('KNEE');
  const [reportDescription, setReportDescription] = useState<string>('');
  const [reportAddress, setReportAddress] = useState<string>('Near Bhabha Hospital, Kurla West');

  const selectedVillage = villages.find((v) => v.id === selectedWardId) || villages[0];
  const wardAlerts = alerts.filter((a) => a.villageId === selectedWardId && a.status === 'ACTIVE');
  const nearestShelter = shelters.find((s) => s.status === 'OPEN') || shelters[0];

  const handleTriggerSos = () => {
    setSosTriggered(true);
    setSosConfirmStep(false);
  };

  const handleQuickReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReport(true);
    try {
      await onSubmitReport({
        reporterName: 'Aarav Sharma (Resident)',
        reporterPhone: '+91 98920 44556',
        location: {
          lat: selectedVillage?.center.lat || 19.0688,
          lng: selectedVillage?.center.lng || 72.8795,
          address: reportAddress,
          villageId: selectedVillage?.id,
        },
        waterDepthM: reportDepth === 'ANKLE' ? 0.3 : reportDepth === 'KNEE' ? 0.6 : reportDepth === 'WAIST' ? 1.2 : 2.0,
        depthCategory: reportDepth,
        description: reportDescription || 'Water accumulating rapidly across roadway. Inflow from nearby nullah.',
      });
      setReportSuccess(true);
      setReportDescription('');
      setTimeout(() => setReportSuccess(false), 5000);
    } finally {
      setSubmittingReport(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Citizen Persona Header */}
      <div className="rounded-2xl border border-[#E5EAF0] bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-emerald-700 border border-emerald-200">
                  CITIZEN PUBLIC SAFETY PORTAL
                </span>
                <span className="text-xs text-slate-500 font-medium">Verified Citizen: Aarav Sharma (Kurla L Ward)</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
                Hyperlocal Flood Safety for Mumbai Residents
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                Real-time safety assessments, verified dry walking paths to municipal relief camps, instant SOS emergency beacons, and crowd hazard reporting.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('map')}
              className="rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Live Map
            </button>
            <button
              onClick={() => onNavigate('evacuation')}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
            >
              <LifeBuoy className="h-3.5 w-3.5" />
              <span>Safe Shelters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Citizen Flood Survival Preparedness Checklist */}
      <SurvivalChecklist />

      {/* Ward Safety Checker & Emergency SOS Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ward Safety Checker Card */}
        <div className="lg:col-span-2 rounded-2xl border border-[#E5EAF0] bg-white p-5 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-600" />
                <span>Check Your Neighborhood Safety</span>
              </h2>
              <p className="text-xs text-slate-500">Select your ward or locality to get instant flood risk & advisories</p>
            </div>

            <select
              value={selectedWardId}
              onChange={(e) => setSelectedWardId(e.target.value)}
              className="rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#2563EB]"
            >
              {villages.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.ward})
                </option>
              ))}
            </select>
          </div>

          {/* Current Status Box */}
          {selectedVillage && (
            <div className="space-y-4">
              <div
                className={`rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  selectedVillage.riskLevel === 'CRITICAL'
                    ? 'border-rose-200 bg-rose-50 text-rose-900'
                    : selectedVillage.riskLevel === 'HIGH'
                    ? 'border-amber-200 bg-amber-50 text-amber-900'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-900'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-2.5 w-2.5 rounded-full ${
                        selectedVillage.riskLevel === 'CRITICAL'
                          ? 'bg-rose-600 animate-ping'
                          : selectedVillage.riskLevel === 'HIGH'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <span className="font-mono text-xs font-bold uppercase tracking-wider">
                      Current Status: {selectedVillage.riskLevel} RISK
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{selectedVillage.name}</h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Drainage Stress: {selectedVillage.drainageCapacityMmHr} mm/hr threshold • River Gauge: {selectedVillage.waterLevelM}m
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onNavigate('map')}
                    className="flex items-center gap-1.5 rounded-xl bg-white border border-[#E5EAF0] px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Compass className="h-3.5 w-3.5 text-blue-600" />
                    <span>View on Live Map</span>
                  </button>
                  <button
                    onClick={() => onNavigate('evacuation')}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    <span>Safe Walking Route</span>
                  </button>
                </div>
              </div>

              {/* Active Warnings for this Ward */}
              {wardAlerts.length > 0 ? (
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Official MCGM Alerts for Your Ward
                  </span>
                  {wardAlerts.map((alt) => (
                    <div
                      key={alt.id}
                      className="rounded-xl border border-rose-200 bg-rose-50/60 p-3.5 flex items-start gap-3"
                    >
                      <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                      <div className="space-y-1 text-xs">
                        <div className="font-bold text-rose-900">{alt.title}</div>
                        <p className="text-slate-700">{alt.message}</p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono pt-1">
                          <span>Stage: {alt.stage}</span>
                          <span>•</span>
                          <span>Issued: {new Date(alt.issuedAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>No active evacuations ordered for {selectedVillage.name}. Heavy rain advisory remains in effect.</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SOS Emergency Beacon & Quick Dial */}
        <div className="rounded-2xl border border-rose-200 bg-rose-50/30 p-5 space-y-4 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase">
                EMERGENCY RESCUE DISPATCH
              </span>
              <LifeBuoy className="h-5 w-5 text-rose-600" />
            </div>

            <h3 className="text-base font-bold text-slate-900 mt-2">Stranded or In Danger?</h3>
            <p className="text-xs text-slate-600 mt-1">
              Pressing the emergency beacon alerts NDRF Battalion 5 and Kurla Fire Station with your live GPS location.
            </p>
          </div>

          <div className="space-y-3">
            {sosTriggered ? (
              <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto animate-bounce" />
                <div className="font-bold text-emerald-900 text-sm">SOS BEACON TRANSMITTED</div>
                <p className="text-xs text-slate-600">
                  NDRF Quick Response Team 4 dispatched to your ward coordinates. Keep your mobile line open.
                </p>
                <div className="text-xs font-mono font-bold text-slate-900 bg-white border border-emerald-200 py-1 rounded-lg">
                  REF: SOS-MUM-8921-ACT
                </div>
              </div>
            ) : sosConfirmStep ? (
              <div className="space-y-2">
                <div className="text-xs font-bold text-rose-800 text-center">Confirm Emergency Dispatch?</div>
                <button
                  onClick={handleTriggerSos}
                  className="w-full py-3 rounded-xl bg-rose-600 text-white font-bold text-sm hover:bg-rose-700 shadow-xs transition-colors"
                >
                  YES, SEND RESCUE TEAM NOW
                </button>
                <button
                  onClick={() => setSosConfirmStep(false)}
                  className="w-full py-2 rounded-xl border border-[#E5EAF0] bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSosConfirmStep(true)}
                className="w-full py-4 rounded-xl bg-rose-600 text-white font-bold text-sm hover:bg-rose-700 shadow-xs transition-all flex items-center justify-center gap-2 group"
              >
                <LifeBuoy className="h-5 w-5 group-hover:animate-spin" />
                <span>BROADCAST EMERGENCY SOS</span>
              </button>
            )}

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <a
                href="tel:1916"
                className="p-2.5 rounded-xl border border-[#E5EAF0] bg-white hover:bg-slate-50 text-slate-900 font-semibold flex items-center justify-center gap-1.5 shadow-xs"
              >
                <PhoneCall className="h-3.5 w-3.5 text-rose-600" />
                <span>MCGM: 1916</span>
              </a>
              <a
                href="tel:112"
                className="p-2.5 rounded-xl border border-[#E5EAF0] bg-white hover:bg-slate-50 text-slate-900 font-semibold flex items-center justify-center gap-1.5 shadow-xs"
              >
                <PhoneCall className="h-3.5 w-3.5 text-blue-600" />
                <span>Police: 112</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Quick Report Hazard + Nearest Relief Shelter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Report Hazard */}
        <div className="rounded-2xl border border-[#E5EAF0] bg-white p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Camera className="h-4 w-4 text-blue-600" />
                <span>Report Local Waterlogging / Hazard</span>
              </h3>
              <p className="text-xs text-slate-500">Your ground report updates the city-wide live flood map</p>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              GPS Tagged
            </span>
          </div>

          {reportSuccess ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center space-y-1">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto" />
              <div className="font-bold text-emerald-900 text-xs">Report Submitted Successfully</div>
              <p className="text-xs text-slate-600">
                Forwarded to Ward L Disaster Cell. Thank you for keeping your neighborhood safe.
              </p>
            </div>
          ) : (
            <form onSubmit={handleQuickReport} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Water Depth Category</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { key: 'ANKLE', label: 'Ankle (0.3m)' },
                    { key: 'KNEE', label: 'Knee (0.6m)' },
                    { key: 'WAIST', label: 'Waist (1.2m)' },
                    { key: 'CHEST', label: 'Chest (>1.8m)' },
                  ].map((d) => (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => setReportDepth(d.key)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        reportDepth === d.key
                          ? 'border-[#2563EB] bg-blue-50 text-blue-700 font-semibold'
                          : 'border-[#E5EAF0] bg-[#F8FAFC] text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Specific Landmark / Crossroad</label>
                <input
                  type="text"
                  value={reportAddress}
                  onChange={(e) => setReportAddress(e.target.value)}
                  placeholder="e.g. Near Bhabha Hospital, Kurla West"
                  className="w-full rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Observation Details (Optional)</label>
                <textarea
                  rows={2}
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="e.g. Manhole cover displaced, vehicles stalling, current is fast..."
                  className="w-full rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReport}
                className="w-full py-2.5 rounded-xl bg-[#2563EB] text-white font-semibold text-xs hover:bg-blue-700 shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{submittingReport ? 'Submitting Report...' : 'Broadcast Citizen Hazard Report'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Nearest Municipal Relief Camp / Shelter */}
        <div className="rounded-2xl border border-[#E5EAF0] bg-white p-5 space-y-4 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <LifeBuoy className="h-4 w-4 text-emerald-600" />
                  <span>Nearest High-Ground Relief Shelter</span>
                </h3>
                <p className="text-xs text-slate-500">Designated dry shelter equipped with food, drinking water, & first aid</p>
              </div>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 text-[10px] font-mono font-semibold">
                OPEN NOW
              </span>
            </div>

            {nearestShelter && (
              <div className="mt-3 space-y-3 text-xs">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{nearestShelter.name}</div>
                  <div className="text-slate-500 mt-0.5">{nearestShelter.location.address}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] p-2.5">
                    <span className="text-slate-500 text-[10px] block">Capacity Available</span>
                    <span className="font-semibold text-slate-900">
                      {nearestShelter.capacity - nearestShelter.occupancy} beds left
                    </span>
                  </div>

                  <div className="rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] p-2.5">
                    <span className="text-slate-500 text-[10px] block">Stocked Supplies</span>
                    <span className="font-semibold text-emerald-600">Water, Food, Medical</span>
                  </div>
                </div>

                <div className="rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] p-3">
                  <span className="text-slate-500 text-[10px] block">Camp Contact:</span>
                  <div className="font-semibold text-slate-900">{nearestShelter.contactPerson}</div>
                  <a href={`tel:${nearestShelter.contactPhone}`} className="text-blue-600 font-mono block mt-0.5">
                    📞 {nearestShelter.contactPhone}
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
            <button
              onClick={() => onNavigate('evacuation')}
              className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Navigation className="h-3.5 w-3.5" />
              <span>Get Walking Navigation</span>
            </button>
            <button
              onClick={() => onNavigate('map')}
              className="py-2 px-3 rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
            >
              View on Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
