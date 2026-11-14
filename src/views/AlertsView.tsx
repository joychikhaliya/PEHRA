import React, { useState } from 'react';
import {
  Alert,
  AlertStage,
  Village,
  Shelter,
  EvacuationRoute,
  UserRole,
} from '../types/index.ts';
import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Send,
  Users,
  Compass,
  LifeBuoy,
  Plus,
  X,
  FileCheck,
} from 'lucide-react';

interface AlertsViewProps {
  alerts: Alert[];
  villages: Village[];
  shelters: Shelter[];
  routes: EvacuationRoute[];
  activeRole: UserRole;
  onCreateAlert: (alertData: any) => Promise<void>;
  onApproveAlert: (alertId: string, reason: string) => Promise<void>;
  onAcknowledgeAlert: (alertId: string) => Promise<void>;
  onNavigate: (tab: string) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  villages,
  shelters,
  routes,
  activeRole,
  onCreateAlert,
  onApproveAlert,
  onAcknowledgeAlert,
  onNavigate,
}) => {
  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [approvingAlertId, setApprovingAlertId] = useState<string | null>(null);
  const [approvalReason, setApprovalReason] = useState('');

  // New alert form state
  const [formStage, setFormStage] = useState<AlertStage>('WARNING');
  const [formVillageId, setFormVillageId] = useState(villages[0]?.id || '');
  const [formTitle, setFormTitle] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formEtaHours, setFormEtaHours] = useState(1.5);
  const [formShelterId, setFormShelterId] = useState(shelters[0]?.id || '');
  const [formRouteId, setFormRouteId] = useState(routes[0]?.id || '');
  const [confirmedVerificationChecked, setConfirmedVerificationChecked] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const isAuthority = ['AUTHORITY', 'ADMIN', 'SUPER_ADMIN'].includes(activeRole);

  const filteredAlerts = alerts.filter((a) => {
    if (selectedStage === 'ALL') return true;
    return a.stage === selectedStage;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formStage === 'CONFIRMED' && !confirmedVerificationChecked) {
      alert('You must sign off the human verification requirement for CONFIRMED emergency alerts.');
      return;
    }

    setFormSubmitting(true);
    try {
      await onCreateAlert({
        stage: formStage,
        villageId: formVillageId,
        title: formTitle || `Emergency Alert: ${formStage} for ${villages.find((v) => v.id === formVillageId)?.name}`,
        message: formMessage || 'Flash flood conditions anticipated within the next 2 hours. Follow designated evacuation corridor.',
        riskLevel: formStage === 'CONFIRMED' ? 'CRITICAL' : formStage === 'WARNING' ? 'HIGH' : 'MODERATE',
        confidence: 0.9,
        etaHours: formEtaHours,
        shelterId: formShelterId,
        evacuationRouteId: formRouteId,
        authorUserId: 'usr-authority-01',
        authorRole: activeRole,
      });
      setModalOpen(false);
      setFormTitle('');
      setFormMessage('');
      setConfirmedVerificationChecked(false);
    } catch (err: any) {
      alert(err.message || 'Failed to create alert');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleApproveSubmit = async (alertId: string) => {
    try {
      await onApproveAlert(alertId, approvalReason || 'Officer physical/sensor inspection verified threshold escalation.');
      setApprovingAlertId(null);
      setApprovalReason('');
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Early Warning & Alert Operations</h1>
          <p className="text-xs text-slate-400 mt-1">
            Standardized staged alerts with AI model evidence packages, human authority verification, and multi-channel targeting
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Pills */}
          <div className="flex rounded-lg border border-slate-800 bg-slate-900 p-1 text-xs">
            {['ALL', 'CONFIRMED', 'WARNING', 'WATCH'].map((stage) => (
              <button
                key={stage}
                onClick={() => setSelectedStage(stage)}
                className={`rounded px-2.5 py-1 font-medium transition-all ${
                  selectedStage === stage
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {stage}
              </button>
            ))}
          </div>

          {isAuthority && (
            <button
              onClick={() => setModalOpen(true)}
              id="open-create-alert-btn"
              className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-rose-500 shadow-md transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Issue New Alert</span>
            </button>
          )}
        </div>
      </div>

      {/* Authority Protocol Notice */}
      <div className="rounded-xl border border-blue-900/60 bg-blue-950/20 p-4 text-xs">
        <div className="flex items-center gap-2 text-blue-300 font-bold text-sm">
          <ShieldCheck className="h-4 w-4 text-blue-400" />
          <span>Three-Stage Operational Alert Hierarchy</span>
        </div>
        <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-slate-300">
          <div className="rounded bg-slate-950/60 p-2.5 border border-slate-800">
            <span className="font-bold text-amber-400 block mb-1">STAGE 1: WATCH</span>
            <span>Automated advisory when rainfall/water-level risk probability exceeds 45%. Citizens advised to monitor local channels.</span>
          </div>
          <div className="rounded bg-slate-950/60 p-2.5 border border-slate-800">
            <span className="font-bold text-orange-400 block mb-1">STAGE 2: WARNING</span>
            <span>Credible localized threat (probability &gt;70%). Evacuation preparations triggered. Municipal pumps mobilized.</span>
          </div>
          <div className="rounded bg-slate-950/60 p-2.5 border border-slate-800">
            <span className="font-bold text-rose-400 block mb-1">STAGE 3: CONFIRMED EMERGENCY</span>
            <span>Mandatory physical/sensor verification by authorized Officer before siren/SMS sirens trigger. AI cannot auto-issue Stage 3 alerts.</span>
          </div>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400">
            No alerts found matching current filter.
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isConfirmed = alert.stage === 'CONFIRMED';
            const isWarning = alert.stage === 'WARNING';
            const stageStyle = isConfirmed
              ? 'border-rose-700/60 bg-slate-900/90 shadow-sm'
              : isWarning
              ? 'border-amber-700/60 bg-slate-900/90 shadow-sm'
              : 'border-slate-800 bg-slate-900/90 shadow-sm';

            const badgeStyle = isConfirmed
              ? 'bg-rose-600 text-white'
              : isWarning
              ? 'bg-amber-500 text-slate-950'
              : 'bg-blue-600 text-white';

            return (
              <div key={alert.id} className={`rounded-xl border p-5 transition-all ${stageStyle}`}>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded px-2.5 py-0.5 text-xs font-bold uppercase ${badgeStyle}`}>
                        STAGE {isConfirmed ? '3: CONFIRMED' : isWarning ? '2: WARNING' : '1: WATCH'}
                      </span>
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-slate-300">
                        {alert.villageName}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Issued: {new Date(alert.issuedAt).toLocaleTimeString()}</span>
                      </span>
                    </div>

                    <h2 className="mt-2 text-lg font-bold text-white tracking-tight">{alert.title}</h2>
                    <p className="mt-1 text-sm text-slate-200 leading-relaxed max-w-4xl">{alert.message}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Citizen Acknowledge Button */}
                    <button
                      onClick={() => onAcknowledgeAlert(alert.id)}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 transition-all"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Acknowledge</span>
                    </button>

                    {/* Authority Approval Trigger if in draft or pending */}
                    {alert.status === 'PENDING_APPROVAL' && isAuthority && (
                      <button
                        onClick={() => setApprovingAlertId(alert.id)}
                        className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-500 shadow-md"
                      >
                        Authorize Broadcast
                      </button>
                    )}
                  </div>
                </div>

                {/* Evidence Package Matrix */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2 border-t border-slate-800/80 pt-3 text-xs">
                  <div className="rounded bg-slate-950/70 p-2 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Rainfall Rate:</span>
                    <span className="font-mono font-bold text-white">{alert.evidence.rainfallMm} mm/hr</span>
                  </div>
                  <div className="rounded bg-slate-950/70 p-2 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Water Level:</span>
                    <span className="font-mono font-bold text-cyan-400">{alert.evidence.waterLevelM} m</span>
                  </div>
                  <div className="rounded bg-slate-950/70 p-2 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Arabian Sea Tide:</span>
                    <span className="font-mono font-bold text-blue-400">{alert.evidence.tideLevelM} m</span>
                  </div>
                  <div className="rounded bg-slate-950/70 p-2 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Model A Probability:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {(alert.evidence.modelPredictionProb * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="rounded bg-slate-950/70 p-2 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Verified Reports:</span>
                    <span className="font-mono font-bold text-amber-400">{alert.evidence.verifiedReportsCount} field reports</span>
                  </div>
                </div>

                {/* Evacuation Checklist & Route Details */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800/80 pt-3">
                  <div>
                    <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Emergency Action Checklist:
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {alert.checklist.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="h-4 w-4 rounded-full bg-cyan-950 border border-cyan-700 flex items-center justify-center text-[10px] font-bold text-cyan-300 shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Linked Evacuation Facility & Corridor:
                    </div>
                    <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <LifeBuoy className="h-4 w-4 text-cyan-400" />
                          <span>Designated Shelter: <strong>Kurla Municipal School</strong></span>
                        </span>
                        <button
                          onClick={() => onNavigate('evacuation')}
                          className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300"
                        >
                          Shelter Details
                        </button>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-900 pt-2">
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <Compass className="h-4 w-4 text-emerald-400" />
                          <span>Evacuation Route: <strong>Elevated SG Barve Marg</strong></span>
                        </span>
                        <button
                          onClick={() => onNavigate('map')}
                          className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300"
                        >
                          View Corridor on Map
                        </button>
                      </div>
                    </div>

                    {/* Delivery & Acknowledge Tracker */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Push: <strong>{alert.deliveryStats.pushDelivered.toLocaleString()}</strong></span>
                      <span>SMS: <strong>{alert.deliveryStats.smsDelivered.toLocaleString()}</strong></span>
                      <span>Offline Relayed: <strong>{alert.deliveryStats.offlineRelayed}</strong></span>
                      <span className="text-emerald-400 font-bold">
                        Acknowledged: <strong>{alert.deliveryStats.acknowledgedCount.toLocaleString()}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Approval Reason Dialogue if prompted */}
                {approvingAlertId === alert.id && (
                  <div className="mt-4 rounded-lg border border-rose-800 bg-rose-950/80 p-3 text-xs space-y-2">
                    <div className="font-bold text-white">Emergency Officer Broadcast Sign-off:</div>
                    <textarea
                      value={approvalReason}
                      onChange={(e) => setApprovalReason(e.target.value)}
                      placeholder="Enter verification basis (e.g., Physical inspection confirmed water level reached 2.1m at subway)..."
                      className="w-full rounded bg-slate-900 border border-slate-700 p-2 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                      rows={2}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setApprovingAlertId(null)}
                        className="rounded px-3 py-1 text-slate-300 hover:bg-slate-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleApproveSubmit(alert.id)}
                        className="rounded bg-rose-600 px-3 py-1 font-bold text-white hover:bg-rose-500"
                      >
                        Confirm Sign-off & Broadcast
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Create Staged Early Warning Alert */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BellRing className="h-5 w-5 text-rose-500" />
                <h3 className="text-lg font-bold text-white">Author Emergency Alert Broadcast</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Alert Stage:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['WATCH', 'WARNING', 'CONFIRMED'] as AlertStage[]).map((stage) => (
                    <button
                      type="button"
                      key={stage}
                      onClick={() => setFormStage(stage)}
                      className={`rounded-lg py-2 font-bold border transition-all ${
                        formStage === stage
                          ? stage === 'CONFIRMED'
                            ? 'bg-rose-600 border-rose-500 text-white'
                            : stage === 'WARNING'
                            ? 'bg-amber-500 border-amber-400 text-slate-950'
                            : 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Geographic Zone / Ward:</label>
                  <select
                    value={formVillageId}
                    onChange={(e) => setFormVillageId(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    {villages.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.ward})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Estimated Impact ETA (Hours):</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.2"
                    max="12"
                    value={formEtaHours}
                    onChange={(e) => setFormEtaHours(parseFloat(e.target.value))}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Alert Headline:</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. WARNING: Mithi River Spillway Surge at Kurla West"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Detailed Emergency Broadcast Message:</label>
                <textarea
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  rows={3}
                  placeholder="Instructions for citizens, ground floor premises, evacuation route..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              {/* Crucial Human Verification Sign-off for Stage 3 CONFIRMED */}
              {formStage === 'CONFIRMED' && (
                <div className="rounded-lg border border-rose-800/80 bg-rose-950/40 p-3 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-rose-300">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Mandatory Human Verification Sign-off (Section 23 SRS)</span>
                  </div>
                  <label className="flex items-start gap-2 cursor-pointer text-slate-200">
                    <input
                      type="checkbox"
                      checked={confirmedVerificationChecked}
                      onChange={(e) => setConfirmedVerificationChecked(e.target.checked)}
                      className="mt-0.5 rounded bg-slate-900 border-slate-700 text-rose-600 focus:ring-0"
                    />
                    <span>
                      I certify as an Emergency Authority that this Stage 3 CONFIRMED alert has been physically or sensorially validated. I understand AI cannot automatically produce a confirmed emergency broadcast.
                    </span>
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="rounded-lg bg-rose-600 px-5 py-2 font-bold text-white hover:bg-rose-500 shadow-md"
                >
                  {formSubmitting ? 'Transmitting...' : 'Dispatch Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
