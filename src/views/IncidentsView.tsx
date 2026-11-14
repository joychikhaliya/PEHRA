import React, { useState } from 'react';
import { Incident } from '../types/index.ts';
import {
  Flame,
  Clock,
  Layers,
  MapPin,
  TrendingUp,
  Shield,
  Activity,
  ChevronRight,
  ArrowRight,
  Droplets,
} from 'lucide-react';

interface IncidentsViewProps {
  incidents: Incident[];
  onNavigate: (tab: string) => void;
}

export const IncidentsView: React.FC<IncidentsViewProps> = ({ incidents, onNavigate }) => {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(incidents[0]?.id || '');

  const currentIncident = incidents.find((i) => i.id === selectedIncidentId) || incidents[0];

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Active Flood Incidents & DEM Spread Engine</h1>
          <p className="text-xs text-slate-400 mt-1">
            Tracking multi-stage flood progression, cellular downhill propagation, and inter-agency dispatch timelines
          </p>
        </div>

        <button
          onClick={() => onNavigate('map')}
          className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-400"
        >
          <span>View on Map</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incidents List Column */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Recorded Flood Incidents</div>

          {incidents.map((inc) => {
            const isSelected = inc.id === currentIncident?.id;
            const isCritical = inc.severity === 'CRITICAL';

            return (
              <div
                key={inc.id}
                onClick={() => setSelectedIncidentId(inc.id)}
                className={`cursor-pointer rounded-xl border p-4 transition-all ${
                  isSelected
                    ? 'border-cyan-500 bg-slate-900 shadow-lg shadow-cyan-950/30'
                    : 'border-slate-800 bg-slate-950/60 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase">
                      {inc.incidentType}
                    </span>
                    <h3 className="font-bold text-white text-sm mt-0.5">{inc.title}</h3>
                  </div>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                      isCritical ? 'bg-rose-600 text-white' : 'bg-orange-600 text-white'
                    }`}
                  >
                    {inc.severity}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2.5">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(inc.startedAt).toLocaleTimeString()}</span>
                  </span>
                  <span>Affected: <strong className="text-white">{inc.estimatedAffectedPeople.toLocaleString()}</strong></span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Incident Detail & DEM Spread Matrix */}
        <div className="lg:col-span-2 space-y-6">
          {currentIncident && (
            <>
              {/* Incident Summary Card */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                        {currentIncident.status}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">ID: {currentIncident.id}</span>
                    </div>
                    <h2 className="text-xl font-bold text-white mt-1">{currentIncident.title}</h2>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 text-xs block">Origin Epicenter</span>
                    <span className="font-semibold text-cyan-400 text-sm">{currentIncident.originLocation.name}</span>
                  </div>
                </div>

                {/* Assigned Responder Teams */}
                <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-xs">
                  <span className="text-slate-400 font-semibold block mb-1">Assigned Operational Teams:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentIncident.assignedTeams.map((team, i) => (
                      <span key={i} className="rounded bg-slate-800 border border-slate-700 px-2 py-0.5 text-slate-200">
                        🛡️ {team}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Model B: Flood Spread Propagation Cells */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-cyan-400" />
                      <h3 className="font-bold text-white text-sm">Model B: Hydrodynamic DEM Flood Spread Propagation</h3>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">Downhill Cell Expansion Matrix</span>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-800 bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 font-mono">
                        <tr>
                          <th className="p-2.5">Spread Cell</th>
                          <th className="p-2.5">Arrival ETA</th>
                          <th className="p-2.5">Water Depth</th>
                          <th className="p-2.5">Confidence</th>
                          <th className="p-2.5">Verification Source</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {currentIncident.spreadEvents.map((evt) => (
                          <tr key={evt.id} className="hover:bg-slate-900/40">
                            <td className="p-2.5 font-medium text-white">
                              <div>{evt.cellName}</div>
                              <span className="text-[10px] font-mono text-slate-500">{evt.cellId}</span>
                            </td>
                            <td className="p-2.5 font-mono">
                              {evt.etaHours === 0 ? (
                                <span className="text-rose-400 font-bold">Submerged (Current)</span>
                              ) : (
                                <span className="text-amber-400 font-semibold">+{evt.etaHours} hrs</span>
                              )}
                            </td>
                            <td className="p-2.5 font-mono font-bold text-cyan-400">{evt.depthM} m</td>
                            <td className="p-2.5 font-mono text-slate-300">{(evt.confidence * 100).toFixed(0)}%</td>
                            <td className="p-2.5">
                              <span
                                className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-bold ${
                                  evt.source === 'SENSOR'
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                    : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                                }`}
                              >
                                {evt.source}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Multi-Stage Incident Timeline */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-cyan-400" />
                    <h3 className="font-bold text-white text-sm">Chronological Event Timeline</h3>
                  </div>

                  <div className="relative border-l border-slate-800 pl-4 ml-2 space-y-4 text-xs">
                    {currentIncident.timeline.map((item) => (
                      <div key={item.id} className="relative">
                        <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-cyan-400 border-2 border-slate-950" />
                        <div className="text-[10px] font-mono text-slate-400">
                          {new Date(item.timestamp).toLocaleTimeString()} • {item.source}
                        </div>
                        <h4 className="font-bold text-white mt-0.5">{item.title}</h4>
                        <p className="text-slate-300 mt-0.5">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
