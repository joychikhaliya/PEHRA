import React, { useState, useEffect } from 'react';
import {
  Settings,
  Activity,
  Radio,
  Cpu,
  Sliders,
  Users,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Save,
  RotateCcw,
} from 'lucide-react';
import {
  DataSource,
  ModelVersion,
  AuditLog,
  SystemThresholds,
  User,
  UserRole,
} from '../types/index.ts';
import { api } from '../api/client.ts';

interface AdminViewProps {
  activeRole: UserRole;
}

export const AdminView: React.FC<AdminViewProps> = ({ activeRole }) => {
  const [activeTab, setActiveTab] = useState<
    'HEALTH' | 'SOURCES' | 'MODELS' | 'THRESHOLDS' | 'USERS' | 'AUDIT'
  >('SOURCES');

  const [health, setHealth] = useState<any>(null);
  const [sources, setSources] = useState<DataSource[]>([]);
  const [models, setModels] = useState<ModelVersion[]>([]);
  const [thresholds, setThresholds] = useState<SystemThresholds | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [testingSourceId, setTestingSourceId] = useState<string | null>(null);
  const [savingThresholds, setSavingThresholds] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const [hRes, sRes, mRes, tRes, uRes, aRes] = await Promise.all([
        api.getHealth(),
        api.getSources(),
        api.getModels(),
        api.getThresholds(),
        api.getUsers(),
        api.getAuditLogs(),
      ]);

      setHealth(hRes);
      setSources(sRes.sources || []);
      setModels(mRes.models || []);
      setThresholds(tRes.thresholds || null);
      setUsers(uRes.users || []);
      setAuditLogs(aRes.logs || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTestSource = async (sourceId: string) => {
    setTestingSourceId(sourceId);
    try {
      const res = await api.testSource(sourceId);
      alert(`Source Gateway Ping Result:\nStatus: ${res.status}\nLatency: ${res.latencyMs}ms\nQuality: ${res.dataQuality}`);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Ping failed');
    } finally {
      setTestingSourceId(null);
    }
  };

  const handleToggleSource = async (sourceId: string, config: { enabled?: boolean; isSimulation?: boolean }) => {
    try {
      await api.toggleSource(sourceId, config);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Toggle failed');
    }
  };

  const handleActivateModel = async (modelId: string) => {
    try {
      await api.activateModel(modelId);
      alert('Model version activated into live inference pipeline.');
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Activation failed');
    }
  };

  const handleSaveThresholds = async () => {
    if (!thresholds) return;
    setSavingThresholds(true);
    try {
      await api.updateThresholds(thresholds);
      alert('System operational thresholds updated and recorded in audit log.');
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Update failed');
    } finally {
      setSavingThresholds(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin & ML Operations Console</h1>
          <p className="text-xs text-slate-400 mt-1">
            Sensor telemetry gateways, model governance, early warning thresholds, and immutable audit logs
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1 rounded-lg border border-slate-800 bg-slate-900 p-1 text-xs">
          {[
            { id: 'SOURCES', label: 'Data Feeds' },
            { id: 'MODELS', label: 'ML Models' },
            { id: 'THRESHOLDS', label: 'Thresholds' },
            { id: 'HEALTH', label: 'System Health' },
            { id: 'USERS', label: 'RBAC Users' },
            { id: 'AUDIT', label: 'Audit Trail' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`rounded px-3 py-1.5 font-medium transition-all ${
                activeTab === tab.id ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: DATA SOURCES */}
      {activeTab === 'SOURCES' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Integrated Environmental Telemetry Feeds ({sources.length})
            </span>
            <button
              onClick={loadAdminData}
              className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Refresh Sources</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sources.map((src) => {
              const isHealthy = src.status === 'HEALTHY';
              const isDegraded = src.status === 'DEGRADED';

              return (
                <div key={src.id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                        {src.type}
                      </span>
                      <h3 className="font-bold text-white text-base mt-0.5">{src.name}</h3>
                      <p className="text-xs text-slate-400 font-mono truncate max-w-xs">{src.endpointUrl}</p>
                    </div>

                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                        isHealthy
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : isDegraded
                          ? 'bg-amber-950 text-amber-300 border border-amber-700'
                          : 'bg-rose-950 text-rose-300 border border-rose-700'
                      }`}
                    >
                      {src.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-t border-slate-800/80 pt-3 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Freshness</span>
                      <span className="font-mono font-bold text-white">
                        {Math.round((Date.now() - new Date(src.lastUpdate).getTime()) / 1000)}s ago
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Polling Cadence</span>
                      <span className="font-mono font-bold text-slate-300">{src.updateFrequencySec}s</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Quality Score</span>
                      <span className="font-mono font-bold text-cyan-400">
                        {(src.qualityScore * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleSource(src.id, { enabled: !src.enabled })}
                        className={`rounded px-2.5 py-1 font-bold ${
                          src.enabled
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {src.enabled ? 'Enabled' : 'Disabled'}
                      </button>

                      <button
                        onClick={() => handleToggleSource(src.id, { isSimulation: !src.isSimulation })}
                        className="rounded bg-slate-800 px-2 py-1 text-slate-300 hover:bg-slate-700"
                      >
                        {src.isSimulation ? 'Switch Live' : 'Simulate'}
                      </button>
                    </div>

                    <button
                      onClick={() => handleTestSource(src.id)}
                      disabled={testingSourceId === src.id}
                      className="rounded bg-cyan-600 px-3 py-1 font-bold text-white hover:bg-cyan-500 shadow-sm"
                    >
                      {testingSourceId === src.id ? 'Testing...' : 'Test Gateway'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: ML MODEL GOVERNANCE */}
      {activeTab === 'MODELS' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-blue-900/60 bg-blue-950/20 p-4 text-xs text-blue-200">
            <strong>Model Governance & Lineage (Section 17 SRS):</strong> Model A (Conditions) and Model B (DEM Downhill Spread) support active version switching, precision/recall verification, and zero-downtime rollbacks.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {models.map((mod) => (
              <div key={mod.id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                        {mod.type}
                      </span>
                      {mod.status === 'ACTIVE' && (
                        <span className="rounded bg-emerald-950 border border-emerald-700/60 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                          CURRENTLY ACTIVE
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-white text-base mt-1">{mod.name} (v{mod.version})</h3>
                  </div>

                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-slate-300">
                    {mod.algorithm}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 border-t border-slate-800/80 pt-3 text-xs text-center">
                  <div className="rounded bg-slate-950 p-2 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Precision</span>
                    <span className="font-mono font-bold text-white">{(mod.metrics.precision * 100).toFixed(1)}%</span>
                  </div>
                  <div className="rounded bg-slate-950 p-2 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Recall</span>
                    <span className="font-mono font-bold text-white">{(mod.metrics.recall * 100).toFixed(1)}%</span>
                  </div>
                  <div className="rounded bg-slate-950 p-2 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">F1 Score</span>
                    <span className="font-mono font-bold text-cyan-400">{(mod.metrics.f1Score * 100).toFixed(1)}%</span>
                  </div>
                  <div className="rounded bg-slate-950 p-2 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Lead Time</span>
                    <span className="font-mono font-bold text-emerald-400">{mod.metrics.arrivalLeadTimeHours || 2}h</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs">
                  <span className="text-slate-400">Created: {new Date(mod.createdAt).toLocaleDateString()}</span>
                  {mod.status !== 'ACTIVE' && (
                    <button
                      onClick={() => handleActivateModel(mod.id)}
                      className="rounded bg-cyan-500 px-3.5 py-1.5 font-bold text-slate-950 hover:bg-cyan-400 shadow-md"
                    >
                      Activate Version
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: EARLY WARNING THRESHOLDS */}
      {activeTab === 'THRESHOLDS' && thresholds && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-lg font-bold text-white">Operational Early Warning Thresholds & Hysteresis</h2>
              <p className="text-xs text-slate-400">
                Adjust model sensitivity margins, automated cooldown periods, and mandatory human sign-off triggers
              </p>
            </div>

            <button
              onClick={handleSaveThresholds}
              disabled={savingThresholds}
              className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-2 font-bold text-slate-950 hover:bg-cyan-400 shadow-md"
            >
              <Save className="h-4 w-4" />
              <span>{savingThresholds ? 'Saving...' : 'Save & Record Audit Log'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300 font-semibold">STAGE 1: WATCH Risk Trigger:</span>
                  <span className="font-mono font-bold text-cyan-400">
                    {(thresholds.watchRiskThreshold * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="0.6"
                  step="0.05"
                  value={thresholds.watchRiskThreshold}
                  onChange={(e) =>
                    setThresholds({ ...thresholds, watchRiskThreshold: parseFloat(e.target.value) })
                  }
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300 font-semibold">STAGE 2: WARNING Risk Trigger:</span>
                  <span className="font-mono font-bold text-cyan-400">
                    {(thresholds.warningRiskThreshold * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="0.9"
                  step="0.05"
                  value={thresholds.warningRiskThreshold}
                  onChange={(e) =>
                    setThresholds({ ...thresholds, warningRiskThreshold: parseFloat(e.target.value) })
                  }
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300 font-semibold">Alert Cooldown Window (Minutes):</span>
                  <span className="font-mono font-bold text-cyan-400">{thresholds.alertCooldownMinutes} mins</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={thresholds.alertCooldownMinutes}
                  onChange={(e) =>
                    setThresholds({ ...thresholds, alertCooldownMinutes: parseInt(e.target.value) })
                  }
                  className="w-full accent-cyan-400"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300 font-semibold">Hysteresis Margin (Anti-Flapping):</span>
                  <span className="font-mono font-bold text-cyan-400">
                    {(thresholds.alertHysteresisPct * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.02"
                  max="0.25"
                  step="0.01"
                  value={thresholds.alertHysteresisPct}
                  onChange={(e) =>
                    setThresholds({ ...thresholds, alertHysteresisPct: parseFloat(e.target.value) })
                  }
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300 font-semibold">Alert Expiration Timeout (Hours):</span>
                  <span className="font-mono font-bold text-cyan-400">{thresholds.alertExpiryHours} Hours</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="1"
                  value={thresholds.alertExpiryHours}
                  onChange={(e) =>
                    setThresholds({ ...thresholds, alertExpiryHours: parseInt(e.target.value) })
                  }
                  className="w-full accent-cyan-400"
                />
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                  <input
                    type="checkbox"
                    checked={thresholds.confirmedApprovalRequired}
                    onChange={(e) =>
                      setThresholds({ ...thresholds, confirmedApprovalRequired: e.target.checked })
                    }
                    className="rounded bg-slate-800 text-cyan-500"
                  />
                  <span>Mandatory Human Officer Approval for Stage 3 CONFIRMED</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                  <input
                    type="checkbox"
                    checked={thresholds.smsFallbackEnabled}
                    onChange={(e) =>
                      setThresholds({ ...thresholds, smsFallbackEnabled: e.target.checked })
                    }
                    className="rounded bg-slate-800 text-cyan-500"
                  />
                  <span>Emergency SMS broadcast gateway fallback active</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: SYSTEM HEALTH */}
      {activeTab === 'HEALTH' && health && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 text-xs">
          <h2 className="text-base font-bold text-white">Infrastructure Health Matrix</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(health.services || {}).map(([service, status]: any) => (
              <div key={service} className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                <span className="text-slate-400 capitalize block text-[11px]">{service.replace(/([A-Z])/g, ' $1')}</span>
                <span className="font-mono font-bold text-emerald-400 text-sm mt-1 block">{status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: RBAC USERS */}
      {activeTab === 'USERS' && (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950 text-slate-400 font-mono uppercase text-[11px]">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Role</th>
                <th className="p-3">Jurisdiction / Location</th>
                <th className="p-3">Phone</th>
                <th className="p-3">MFA & Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/30">
                  <td className="p-3 font-medium text-white">
                    <div>{u.fullName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{u.email}</div>
                  </td>
                  <td className="p-3">
                    <span className="rounded bg-slate-800 px-2 py-0.5 font-mono font-bold text-cyan-300">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300 font-mono">{u.homeLocation?.address || 'MMR Metropolitan'}</td>
                  <td className="p-3 text-slate-400 font-mono">{u.phone || '+91 98200 00000'}</td>
                  <td className="p-3">
                    <span className="rounded bg-emerald-950 border border-emerald-800 px-2 py-0.5 text-[10px] text-emerald-300 font-semibold mr-1">
                      {u.status}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      MFA: {u.mfaEnabled ? 'Enforced' : 'Optional'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 6: AUDIT TRAIL */}
      {activeTab === 'AUDIT' && (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950 text-slate-400 font-mono uppercase text-[11px]">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Actor</th>
                <th className="p-3">Action</th>
                <th className="p-3">Target Resource</th>
                <th className="p-3">Reason / Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30">
                  <td className="p-3 font-mono text-slate-400 text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="p-3 font-semibold text-white">
                    {log.userName} ({log.userRole})
                  </td>
                  <td className="p-3">
                    <span className="rounded bg-cyan-950 border border-cyan-800 px-2 py-0.5 font-mono text-cyan-300 text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300 font-mono">{log.resource}</td>
                  <td className="p-3 text-slate-300">{log.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
