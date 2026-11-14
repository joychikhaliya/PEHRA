import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Alert } from '../types/index.ts';

interface EmergencyBannerProps {
  alerts: Alert[];
  onViewAlert: (alert: Alert) => void;
  onAcknowledge: (alertId: string) => void;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({
  alerts,
  onViewAlert,
  onAcknowledge,
}) => {
  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE' && (a.stage === 'CONFIRMED' || a.stage === 'WARNING'));
  if (activeAlerts.length === 0) return null;

  const topAlert = activeAlerts[0];
  const isConfirmed = topAlert.stage === 'CONFIRMED';

  return (
    <AnimatePresence>
      <motion.div
        id="emergency-top-banner"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className={`relative border-b px-3 sm:px-5 py-2.5 transition-colors ${
          isConfirmed
            ? 'bg-[#FEF2F2] border-red-200 text-[#991B1B]'
            : 'bg-[#FFFBEB] border-amber-200 text-[#92400E]'
        }`}
      >
        <div className="mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 max-w-7xl">
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                isConfirmed ? 'bg-red-100 text-[#DC2626]' : 'bg-amber-100 text-[#D97706]'
              }`}
            >
              <AlertTriangle className="h-4 w-4" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase border ${
                    isConfirmed
                      ? 'bg-red-100 border-red-200 text-[#DC2626]'
                      : 'bg-amber-100 border-amber-200 text-[#B45309]'
                  }`}
                >
                  STAGE {isConfirmed ? '3: CONFIRMED EMERGENCY' : '2: WARNING'}
                </span>
                <span className="font-semibold text-xs sm:text-sm text-slate-900">{topAlert.title}</span>
                <span className="text-xs text-slate-600 font-medium">({topAlert.villageName})</span>
              </div>
              <p className="mt-0.5 text-xs line-clamp-1 text-slate-700 max-w-4xl">
                {topAlert.message}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            <button
              onClick={() => onAcknowledge(topAlert.id)}
              id="acknowledge-banner-btn"
              className="flex items-center gap-1.5 rounded-lg border border-slate-300/80 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-all shadow-xs"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Acknowledge ({topAlert.deliveryStats.acknowledgedCount})</span>
            </button>

            <button
              onClick={() => onViewAlert(topAlert)}
              id="view-alert-details-btn"
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold active:scale-[0.98] transition-all shadow-xs ${
                isConfirmed
                  ? 'bg-[#DC2626] hover:bg-red-700 text-white'
                  : 'bg-[#D97706] hover:bg-amber-700 text-white'
              }`}
            >
              <span>View Evacuation Plan</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
