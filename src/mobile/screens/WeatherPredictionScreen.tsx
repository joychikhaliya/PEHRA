import React, { useState } from 'react';
import {
  CloudRain,
  Droplets,
  Wind,
  Thermometer,
  Waves,
  TrendingUp,
  AlertTriangle,
  Clock,
  ChevronDown,
} from 'lucide-react';
import { HOURLY_WEATHER_DATA } from '../../data/floodSafeData.ts';

export const WeatherPredictionScreen: React.FC = () => {
  const [selectedHour, setSelectedHour] = useState<number>(0);
  const current = HOURLY_WEATHER_DATA[selectedHour] || HOURLY_WEATHER_DATA[0];

  return (
    <div className="p-4 space-y-4 max-w-xl mx-auto pb-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-[#173B4D] tracking-tight">
          Weather & Hydrology Nowcast
        </h1>
        <p className="text-xs text-[#5A7382]">
          IMD Doppler Radar, rainfall projection, and tidal locking telemetry.
        </p>
      </div>

      {/* Hero Nowcast Card */}
      <div className="p-5 rounded-2xl bg-[#EEF7F8] border border-[#DCEFF2] shadow-sm space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#2E7D82] uppercase tracking-wider">
              Selected Time: {current.time} hrs
            </span>
            <h2 className="text-2xl font-extrabold text-[#173B4D] mt-0.5">
              {current.condition}
            </h2>
            <div className="flex items-center gap-3 text-xs text-[#5A7382] mt-1">
              <span className="flex items-center gap-1">
                <Thermometer className="h-3.5 w-3.5 text-[#2E7D82]" />
                {current.tempC}°C
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Wind className="h-3.5 w-3.5 text-[#2E7D82]" />
                {current.windKmH} km/h Gusts
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-3xl font-extrabold text-[#173B4D] font-mono">
              {current.rainfallMm}
            </span>
            <span className="text-xs text-[#5A7382] block font-semibold">mm/hr rain</span>
          </div>
        </div>

        {/* Flood Risk Bar */}
        <div className="pt-2 border-t border-[#DCEFF2] space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#5A7382] font-medium">Projected Flood Probability:</span>
            <span className="font-extrabold font-mono text-[#E85D5D]">
              {current.floodRiskPct}% Risk
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-white overflow-hidden">
            <div
              className={`h-full rounded-full ${
                current.floodRiskPct > 70
                  ? 'bg-[#E85D5D]'
                  : current.floodRiskPct > 40
                  ? 'bg-amber-500'
                  : 'bg-[#4F8A68]'
              }`}
              style={{ width: `${current.floodRiskPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Hourly Rainfall Forecast Timeline Strip */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#173B4D] uppercase tracking-wider">
            Hourly Rainfall & Surge (Next 8 Hours)
          </span>
          <span className="text-[10px] text-[#8CA2AE]">Tap bar to view</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {HOURLY_WEATHER_DATA.map((h, idx) => {
            const isSelected = selectedHour === idx;
            const barHeight = Math.min(100, Math.max(15, (h.rainfallMm / 60) * 100));

            return (
              <button
                key={h.time}
                onClick={() => setSelectedHour(idx)}
                className={`p-2 rounded-xl border flex flex-col items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-[#173B4D] text-white border-[#173B4D] shadow-sm'
                    : 'bg-white border-[#E2ECEF] text-[#5A7382] hover:bg-[#EEF7F8]'
                }`}
              >
                <span className="text-[10px] font-mono">{h.time}</span>
                
                {/* Visual Rain Bar */}
                <div className="h-14 w-3 bg-[#EAF2F6] rounded-full my-1.5 flex flex-col justify-end overflow-hidden">
                  <div
                    className={`w-full rounded-full ${
                      isSelected
                        ? 'bg-[#EEF7F8]'
                        : h.rainfallMm > 45
                        ? 'bg-[#E85D5D]'
                        : h.rainfallMm > 25
                        ? 'bg-[#2E7D82]'
                        : 'bg-[#8CA2AE]'
                    }`}
                    style={{ height: `${barHeight}%` }}
                  />
                </div>

                <span className="text-[10px] font-mono font-bold">{h.rainfallMm}m</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Arabian Sea High-Tide & Mithi River Hydrograph Alert */}
      <div className="p-4 rounded-2xl bg-white border border-[#E2ECEF] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Waves className="h-4 w-4 text-[#2E7D82]" />
            <span className="text-xs font-bold text-[#173B4D] uppercase tracking-wider">
              Tidal Lock Hydrograph (Arabian Sea)
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#E85D5D]/10 text-[#E85D5D] text-[10px] font-bold">
            High Tide: 4.45m
          </span>
        </div>

        <p className="text-xs text-[#5A7382] leading-relaxed">
          High tide peaks today at <strong>15:15 PM</strong>. During high tide, Mithi River floodgates cannot discharge into Mahim Bay, causing natural drainage to halt for approx 90 minutes.
        </p>

        {/* River Gauge Metric Strip */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#F0F4F6] text-center text-xs">
          <div>
            <span className="text-[10px] text-[#8CA2AE]">Current River Level</span>
            <span className="text-sm font-bold text-[#173B4D] font-mono block">2.85 m</span>
          </div>
          <div className="border-x border-[#F0F4F6]">
            <span className="text-[10px] text-[#8CA2AE]">Peak Projected</span>
            <span className="text-sm font-bold text-amber-600 font-mono block">3.20 m</span>
          </div>
          <div>
            <span className="text-[10px] text-[#8CA2AE]">Danger Mark</span>
            <span className="text-sm font-bold text-[#E85D5D] font-mono block">3.50 m</span>
          </div>
        </div>
      </div>
    </div>
  );
};
