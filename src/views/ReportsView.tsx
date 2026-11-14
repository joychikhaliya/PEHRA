import React, { useState } from 'react';
import { FloodReport, UserRole } from '../types/index.ts';
import {
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Clock,
  MapPin,
  Send,
  XCircle,
  ThumbsUp,
  Image,
} from 'lucide-react';

interface ReportsViewProps {
  reports: FloodReport[];
  activeRole: UserRole;
  onSubmitReport: (data: any) => Promise<void>;
  onVerifyReport: (reportId: string, verificationData: any) => Promise<void>;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  reports,
  activeRole,
  onSubmitReport,
  onVerifyReport,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Form State
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState(19.0688);
  const [lng, setLng] = useState(72.8705);
  const [depthCategory, setDepthCategory] = useState<'ANKLE' | 'KNEE' | 'WAIST' | 'OVERHEAD'>('KNEE');
  const [waterDepthM, setWaterDepthM] = useState(0.45);
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isVerifier = ['RESPONDER', 'AUTHORITY', 'ADMIN', 'SUPER_ADMIN'].includes(activeRole);

  const filteredReports = reports.filter((r) => {
    if (filterStatus === 'ALL') return true;
    return r.status === filterStatus;
  });

  const handleDepthSelect = (cat: 'ANKLE' | 'KNEE' | 'WAIST' | 'OVERHEAD') => {
    setDepthCategory(cat);
    if (cat === 'ANKLE') setWaterDepthM(0.15);
    else if (cat === 'KNEE') setWaterDepthM(0.45);
    else if (cat === 'WAIST') setWaterDepthM(0.85);
    else if (cat === 'OVERHEAD') setWaterDepthM(1.4);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmitReport({
        location: {
          lat,
          lng,
          address: address || 'Kurla West, Bail Bazar Road',
        },
        waterDepthM,
        depthCategory,
        description: description || 'Water entering shops along the main junction.',
        reporterName: reporterName || 'Local Citizen',
        reporterPhone: reporterPhone || '+91 98200 11223',
        photoUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
      });
      setDescription('');
      setAddress('');
      alert('Report submitted successfully! Thank you for aiding flood telemetry.');
    } catch (err: any) {
      alert(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Citizen Waterlogging Reports & Verification</h1>
          <p className="text-xs text-slate-400 mt-1">
            Crowdsourced on-ground field observations weighted and triangulated into Model A/B early warning engines
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex rounded-lg border border-slate-800 bg-slate-900 p-1 text-xs">
          {['ALL', 'VERIFIED', 'UNDER_REVIEW', 'SUBMITTED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`rounded px-3 py-1 font-medium transition-all ${
                filterStatus === status ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submit Report Form */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <ClipboardList className="h-5 w-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Report Local Flooding</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Select Water Depth:</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'ANKLE', label: 'Ankle (<0.2m)', icon: '🌊' },
                  { id: 'KNEE', label: 'Knee (0.2–0.5m)', icon: '⚠️' },
                  { id: 'WAIST', label: 'Waist (0.5–1.0m)', icon: '🚨' },
                  { id: 'OVERHEAD', label: 'Overhead (>1.0m)', icon: '🛑' },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => handleDepthSelect(item.id as any)}
                    className={`rounded-lg p-2 text-left border transition-all ${
                      depthCategory === item.id
                        ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-base mb-0.5">{item.icon}</div>
                    <div>{item.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Street Location / Landmark:</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Near Gandhi Market, Kings Circle, Sion"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Observation Description:</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe current road conditions, stranded vehicles, manhole overflows, or rising water rate..."
                rows={3}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Your Name:</label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="Citizen / Volunteer"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Contact Phone:</label>
                <input
                  type="tel"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  placeholder="+91 98..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Photo upload attachment mockup */}
            <div className="rounded-lg border border-dashed border-slate-700 bg-slate-950/60 p-3 text-center cursor-pointer hover:border-slate-500">
              <Upload className="mx-auto h-5 w-5 text-slate-400 mb-1" />
              <span className="text-[11px] text-slate-400 block">Tap or drop photo of flood depth</span>
              <span className="text-[9px] text-cyan-400">(Geo-tagged EXIF will auto-validate location)</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-cyan-500 py-2.5 font-bold text-slate-950 hover:bg-cyan-400 shadow-md transition-all"
            >
              <Send className="h-4 w-4" />
              <span>{submitting ? 'Transmitting...' : 'Submit Field Report'}</span>
            </button>
          </form>
        </div>

        {/* Live Verified Field Reports Feed */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Live Field Reports Stream ({filteredReports.length})
            </span>
            <span className="text-[11px] text-slate-500">
              Role Mode: <strong className="text-cyan-400">{activeRole}</strong>
            </span>
          </div>

          <div className="space-y-3">
            {filteredReports.map((report) => {
              const isVerified = report.status === 'VERIFIED';
              const isRejected = report.status === 'REJECTED';

              return (
                <div key={report.id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            isVerified
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                              : isRejected
                              ? 'bg-rose-950 text-rose-300 border border-rose-700'
                              : 'bg-amber-950 text-amber-300 border border-amber-700'
                          }`}
                        >
                          {report.status}
                        </span>
                        <span className="font-bold text-white text-sm">{report.location.address}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>Reported by {report.reporterName}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(report.timestamp).toLocaleTimeString()}</span>
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-slate-400 text-[10px] block">Water Depth</span>
                      <span className="text-base font-bold font-mono text-cyan-400">
                        {report.waterDepthM} m ({report.depthCategory})
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                    "{report.description}"
                  </p>

                  {/* Verification Actions for Responders / Authority */}
                  {isVerifier && report.status !== 'VERIFIED' && (
                    <div className="flex items-center justify-between border-t border-slate-800/80 pt-2.5 text-xs">
                      <span className="text-slate-400 text-[11px]">Officer Verification Protocol:</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            onVerifyReport(report.id, {
                              status: 'REJECTED',
                              notes: 'Discarded as duplicate / false alarm.',
                            })
                          }
                          className="flex items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-slate-300 hover:bg-slate-700"
                        >
                          <XCircle className="h-3.5 w-3.5 text-rose-400" />
                          <span>Reject</span>
                        </button>
                        <button
                          onClick={() =>
                            onVerifyReport(report.id, {
                              status: 'VERIFIED',
                              verifiedBy: 'Officer In-charge',
                              notes: 'Verified via CCTV stream and patrolling vehicle.',
                              triangulatedDepthM: report.waterDepthM,
                            })
                          }
                          className="flex items-center gap-1 rounded bg-emerald-600 px-3 py-1 font-bold text-white hover:bg-emerald-500 shadow-sm"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Verify & Inject into Model</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
