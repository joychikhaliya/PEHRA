import React, { useState } from 'react';
import {
  BellRing,
  AlertTriangle,
  Clock,
  MapPin,
  ShieldCheck,
  ChevronRight,
  Filter,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { FloodAlertItem } from '../../data/floodSafeData.ts';

interface FloodAlertsScreenProps {
  alerts: FloodAlertItem[];
  onNavigateTab: (tab: string) => void;
}

export const FloodAlertsScreen: React.FC<FloodAlertsScreenProps> = ({ alerts, onNavigateTab }) => {
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'WATCH'>('ALL');
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(alerts[0]?.id || null);

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'ALL') return true;
    return a.severity === filter;
  });

  return (
    <div className="p-4 space-y-4 max-w-xl mx-auto pb-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-[#173B4D] tracking-tight">
          Flood & Tide Alerts
        </h1>
        <p className="text-xs text-[#5A7382]">
          Chronological emergency notices broadcast by MCGM Disaster Management Cell.
        </p>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {(['ALL', 'CRITICAL', 'WARNING', 'WATCH'] as const).map((lvl) => {
          const isSelected = filter === lvl;
          return (
            <button
              key={lvl}
              onClick={() => setFilter(lvl)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-[#173B4D] text-white shadow-sm'
                  : 'bg-white border border-[#E2ECEF] text-[#5A7382] hover:bg-[#EEF7F8]'
              }`}
            >
              {lvl === 'ALL' ? 'All Alerts' : lvl}
            </button>
          );
        })}
      </div>

      {/* Alerts Timeline List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white border border-[#E2ECEF] text-[#5A7382]">
            <CheckCircle2 className="h-8 w-8 text-[#4F8A68] mx-auto mb-2" />
            <div className="text-sm font-bold text-[#173B4D]">No active alerts for this filter</div>
            <div className="text-xs text-[#8CA2AE] mt-1">Water levels in this tier are currently stable.</div>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isExpanded = expandedAlertId === alert.id;

            const severityBadge =
              alert.severity === 'CRITICAL'
                ? 'bg-[#E85D5D] text-white'
                : alert.severity === 'WARNING'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-[#2E7D82] text-white';

            const borderAccent =
              alert.severity === 'CRITICAL'
                ? 'border-l-4 border-l-[#E85D5D]'
                : alert.severity === 'WARNING'
                ? 'border-l-4 border-l-amber-500'
                : 'border-l-4 border-l-[#2E7D82]';

            return (
              <div
                key={alert.id}
                className={`rounded-2xl bg-white border border-[#E2ECEF] p-4 shadow-sm transition-all ${borderAccent}`}
              >
                {/* Header row: Severity, Time & Location */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${severityBadge}`}>
                      {alert.severity}
                    </span>
                    <span className="text-[11px] font-mono text-[#5A7382] flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{alert.timeAgo} ({alert.timestamp})</span>
                    </span>
                  </div>

                  <button
                    onClick={() => setExpandedAlertId(isExpanded ? null : alert.id)}
                    className="text-xs font-semibold text-[#5A7382] hover:text-[#173B4D]"
                  >
                    {isExpanded ? 'Less' : 'Details'}
                  </button>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-[#173B4D] mt-2 leading-snug">
                  {alert.title}
                </h3>

                {/* Location indicator */}
                <div className="flex items-center gap-1 text-xs text-[#2E7D82] font-semibold mt-1">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span>{alert.locationName}</span>
                </div>

                {/* Description */}
                <p className={`text-xs text-[#4B6370] mt-1.5 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                  {alert.description}
                </p>

                {/* Recommended Action Box */}
                <div className="mt-3 p-3 rounded-xl bg-[#F7FAFA] border border-[#E2ECEF] text-xs">
                  <span className="font-bold text-[#173B4D] block mb-0.5">
                    Recommended Action:
                  </span>
                  <p className="text-[#5A7382] leading-relaxed">
                    {alert.recommendedAction}
                  </p>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-[#F0F4F6] space-y-2 text-xs">
                    <div className="text-[#5A7382]">
                      Safe Corridors: <strong className="text-[#173B4D]">{alert.safeDirection}</strong>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => onNavigateTab('routes')}
                        className="px-3 py-1.5 rounded-lg bg-[#173B4D] text-white text-xs font-bold hover:bg-[#1f4a60] transition-colors"
                      >
                        View Evacuation Route
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
