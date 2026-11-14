import React, { useState, useRef, useEffect } from 'react';
import {
  BatteryWarning,
  BatteryLow,
  BatteryCharging,
  Battery,
  Zap,
  ShieldAlert,
  Moon,
  Info,
  X,
  Sliders,
} from 'lucide-react';
import { BatteryStatus } from '../hooks/useBatteryStatus.ts';

interface BatteryAlertPillProps {
  battery: BatteryStatus;
  className?: string;
}

export const BatteryAlertPill: React.FC<BatteryAlertPillProps> = ({
  battery,
  className = '',
}) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const {
    level,
    isCharging,
    isLowBattery,
    isCritical,
    isSimulated,
    cycleSimulatedLevel,
    setSimulatedLevel,
  } = battery;

  // Reset dismissal if battery drops further into critical range (< 10%)
  useEffect(() => {
    if (isCritical) {
      setIsDismissed(false);
    }
  }, [isCritical]);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setPopoverOpen(false);
      }
    };

    if (popoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [popoverOpen]);

  // Always display the battery percentage shower so user can see device battery level at all times
  const isCriticalLevel = level < 10;
  const isLowLevel = level < 15;

  return (
    <div className={`relative inline-flex items-center ${className}`} ref={popoverRef}>
      {/* Battery Percentage Shower Pill */}
      <button
        onClick={() => setPopoverOpen(!popoverOpen)}
        id="topbar-battery-percentage-shower"
        type="button"
        aria-expanded={popoverOpen}
        aria-label={`Battery status: ${level}% ${isCharging ? 'charging' : 'remaining'}`}
        className={`group flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap border transition-all duration-200 cursor-pointer shadow-xs select-none ${
          isCriticalLevel
            ? 'bg-rose-50/95 border-rose-300 text-rose-800 hover:bg-rose-100 ring-2 ring-rose-200/50'
            : isLowLevel
            ? 'bg-amber-50/95 border-amber-300 text-amber-900 hover:bg-amber-100 ring-1 ring-amber-200/50'
            : isCharging
            ? 'bg-[#DDF8F6] border-[#35C9D0]/60 text-[#18B7A0] hover:bg-[#cbf3f0]'
            : 'bg-[#F5F8FA] border-[#E2EAED] text-[#17242A] hover:bg-[#EEF6F7] hover:border-[#18B7A0]'
        }`}
        title={`Device battery: ${level}% (${isCharging ? 'Charging' : isLowLevel ? 'Low' : 'Healthy'}). Click for power settings & testing.`}
      >
        {/* Pulsating or steady indicator dot */}
        <span
          className={`h-1.5 w-1.5 rounded-full shrink-0 ${
            isCriticalLevel
              ? 'bg-rose-500 animate-pulse'
              : isLowLevel
              ? 'bg-amber-500 animate-pulse'
              : isCharging
              ? 'bg-[#18B7A0] animate-ping'
              : level >= 50
              ? 'bg-[#18B7A0]'
              : 'bg-[#6B7C83]'
          }`}
        />

        {/* Battery Icon */}
        {isCharging ? (
          <BatteryCharging
            className={`h-3.5 w-3.5 shrink-0 ${
              isCriticalLevel ? 'text-rose-600' : isLowLevel ? 'text-amber-600' : 'text-[#18B7A0]'
            }`}
          />
        ) : isCriticalLevel ? (
          <BatteryWarning className="h-3.5 w-3.5 shrink-0 text-rose-600 animate-pulse" />
        ) : isLowLevel ? (
          <BatteryLow className="h-3.5 w-3.5 shrink-0 text-amber-600" />
        ) : (
          <Battery className="h-3.5 w-3.5 shrink-0 text-[#18B7A0]" />
        )}

        {/* Percentage Display - "Battery Percentage Shower" */}
        <span className="font-mono font-bold tracking-tight text-xs">
          {level}%
        </span>

        {/* Status label: responsive */}
        {isCharging ? (
          <span className="hidden sm:inline text-[11px] font-semibold text-[#18B7A0]">
            ⚡ Charge
          </span>
        ) : isCriticalLevel ? (
          <span className="hidden sm:inline text-[11px] font-bold text-rose-700">
            Critical
          </span>
        ) : isLowLevel ? (
          <span className="hidden sm:inline text-[11px] font-medium text-amber-800">
            Low
          </span>
        ) : (
          <span className="hidden lg:inline text-[11px] font-normal text-[#6B7C83]">
            Battery
          </span>
        )}

        {isSimulated && (
          <span className="text-[9px] font-mono uppercase bg-[#17242A]/10 text-[#17242A] px-1 rounded">
            SIM
          </span>
        )}
      </button>

      {/* Contextual Battery Popover */}
      {popoverOpen && (
        <div
          id="battery-alert-popover"
          className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-[#E2EAED] bg-white p-4 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150 text-[#17242A]"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-[#E2EAED] pb-3">
            <div className="flex items-center gap-2.5">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-xl border ${
                  isCriticalLevel
                    ? 'bg-rose-50 text-rose-600 border-rose-200'
                    : isLowLevel
                    ? 'bg-amber-50 text-amber-600 border-amber-200'
                    : 'bg-[#DDF8F6] text-[#18B7A0] border-[#35C9D0]/30'
                }`}
              >
                {isCharging ? (
                  <BatteryCharging className="h-4 w-4 text-[#18B7A0]" />
                ) : isCriticalLevel ? (
                  <BatteryWarning className="h-4 w-4 text-rose-600" />
                ) : (
                  <Battery className="h-4 w-4 text-[#18B7A0]" />
                )}
              </span>
              <div>
                <div className="text-xs font-bold text-[#17242A] flex items-center gap-1.5">
                  <span>Device Battery Shower</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-[#EEF6F7] text-[#18B7A0] font-semibold">
                    {level}%
                  </span>
                </div>
                <p className="text-[11px] text-[#6B7C83]">
                  {isCharging
                    ? 'Connected to power source'
                    : isCriticalLevel
                    ? 'Critical: immediate recharge needed'
                    : isLowLevel
                    ? 'Power saving active (<15%)'
                    : 'Field battery endurance healthy'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setPopoverOpen(false)}
              className="text-[#6B7C83] hover:text-[#17242A] p-1 rounded-md transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Battery Level Visual Meter */}
          <div className="mt-3 p-3 rounded-xl border border-[#E2EAED] bg-[#F5F8FA] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#6B7C83] font-medium">Current Charge</span>
              <span
                className={`font-mono font-bold text-sm ${
                  isCriticalLevel
                    ? 'text-rose-600'
                    : isLowLevel
                    ? 'text-amber-700'
                    : 'text-[#18B7A0]'
                }`}
              >
                {level}% Remaining
              </span>
            </div>

            {/* Visual Gauge Bar */}
            <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isCriticalLevel
                    ? 'bg-rose-500'
                    : isLowLevel
                    ? 'bg-amber-500'
                    : 'bg-gradient-to-r from-[#35C9D0] to-[#18B7A0]'
                }`}
                style={{ width: `${Math.max(5, Math.min(100, level))}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#6B7C83] pt-0.5">
              <span>Est. Runtime: ~{Math.round((level / 100) * 6.5 * 10) / 10} hrs</span>
              <span className="font-semibold text-[#17242A]">
                {isCharging ? '⚡ AC Charging' : 'Discharging'}
              </span>
            </div>
          </div>

          {/* Low Battery Tactical Recommendations for Flood Emergency */}
          <div className="mt-3 space-y-1.5 text-xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B7C83]">
              Emergency Field Advisory
            </div>
            <ul className="space-y-1 text-[11px] text-[#6B7C83] leading-snug">
              <li className="flex items-start gap-1.5">
                <span className="text-[#18B7A0] font-bold">•</span>
                <span>Critical flood maps & safe shelters remain cached offline.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#18B7A0] font-bold">•</span>
                <span>Dim screen brightness to preserve field operational life.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#18B7A0] font-bold">•</span>
                <span>Keep voice lines free for urgent municipal SOS dispatches (1916).</span>
              </li>
            </ul>
          </div>

          {/* Quick Simulation Presets */}
          <div className="mt-3 pt-2.5 border-t border-[#E2EAED]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-[#6B7C83] uppercase tracking-wider">
                Test Battery States:
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              <button
                onClick={() => setSimulatedLevel(8)}
                className="px-1.5 py-1 text-[10px] font-mono font-bold rounded bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-center"
                title="Simulate 8% critical battery"
              >
                8% Crit
              </button>
              <button
                onClick={() => setSimulatedLevel(14)}
                className="px-1.5 py-1 text-[10px] font-mono font-bold rounded bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 text-center"
                title="Simulate 14% low battery"
              >
                14% Low
              </button>
              <button
                onClick={() => setSimulatedLevel(82)}
                className="px-1.5 py-1 text-[10px] font-mono font-bold rounded bg-[#DDF8F6] text-[#18B7A0] border border-[#35C9D0]/30 hover:bg-[#c6f3ef] text-center"
                title="Simulate 82% normal battery"
              >
                82% OK
              </button>
              <button
                onClick={() => setSimulatedLevel(null)}
                className="px-1.5 py-1 text-[10px] font-mono font-bold rounded bg-slate-100 text-[#17242A] border border-[#E2EAED] hover:bg-slate-200 text-center"
                title="Reset to live device battery"
              >
                Live API
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
