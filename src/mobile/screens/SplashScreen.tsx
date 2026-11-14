import React from 'react';
import {
  Shield,
  ArrowRight,
  Waves,
  CheckCircle2,
  MapPin,
  LifeBuoy,
  BellRing,
} from 'lucide-react';

interface SplashScreenProps {
  onEnterApp: () => void;
  onNavigateTab: (tab: string) => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onEnterApp, onNavigateTab }) => {
  return (
    <div className="min-h-[85vh] flex flex-col justify-between p-6 bg-[#F7FAFA] text-[#173B4D]">
      {/* Top Tag */}
      <div className="flex items-center justify-between pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF7F8] border border-[#DCEFF2] text-[#2E7D82] text-xs font-semibold">
          <span className="h-2 w-2 rounded-full bg-[#4F8A68] animate-pulse" />
          <span>Greater Mumbai Early-Warning</span>
        </div>
        <button
          onClick={onEnterApp}
          className="text-xs font-bold text-[#5A7382] hover:text-[#173B4D] px-2 py-1 rounded-lg"
        >
          Skip &rarr;
        </button>
      </div>

      {/* Main Center Brand Visual */}
      <div className="my-auto text-center space-y-6 max-w-sm mx-auto">
        {/* Subtle Water-Inspired Visual Motif */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          {/* Gentle concentric water ripple rings */}
          <div className="absolute inset-0 rounded-full bg-[#DCEFF2]/60 animate-ping opacity-75 duration-1000" />
          <div className="absolute inset-2 rounded-full bg-[#EEF7F8] border border-[#DCEFF2]" />
          <div className="relative h-16 w-16 rounded-2xl bg-[#2E7D82] text-white flex items-center justify-center shadow-md shadow-[#2E7D82]/20">
            <Waves className="h-8 w-8 stroke-[2.2px]" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-[#173B4D] tracking-tight">
            FloodSafe
          </h1>
          <p className="text-sm text-[#5A7382] leading-relaxed max-w-xs mx-auto">
            Hyperlocal flood surveillance, real-time risk telemetry, and safe evacuation corridors.
          </p>
        </div>

        {/* 3 Core Trust Pillars */}
        <div className="grid grid-cols-1 gap-2 text-left bg-white p-4 rounded-2xl border border-[#E2ECEF] shadow-sm">
          <div className="flex items-start gap-2.5">
            <div className="h-5 w-5 rounded-full bg-[#EEF7F8] text-[#2E7D82] flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#173B4D]">Instant Risk Clarity</div>
              <div className="text-[11px] text-[#5A7382]">Know in 2 seconds if your street is flood-prone or safe.</div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 pt-2 border-t border-[#F0F4F6]">
            <div className="h-5 w-5 rounded-full bg-[#EEF7F8] text-[#2E7D82] flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="h-3.5 w-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#173B4D]">Elevated Evacuation Routes</div>
              <div className="text-[11px] text-[#5A7382]">Directions that route away from submerged subways & drains.</div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 pt-2 border-t border-[#F0F4F6]">
            <div className="h-5 w-5 rounded-full bg-[#EEF7F8] text-[#2E7D82] flex items-center justify-center shrink-0 mt-0.5">
              <BellRing className="h-3.5 w-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#173B4D]">Official Verified Alerts</div>
              <div className="text-[11px] text-[#5A7382]">Synchronized with MCGM Disaster Cell & River Radars.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="space-y-3 pt-4">
        <button
          onClick={onEnterApp}
          className="w-full py-3.5 px-6 rounded-xl bg-[#173B4D] hover:bg-[#1f4a60] active:scale-[0.99] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm shadow-[#173B4D]/15 transition-all"
        >
          <span>Open Live Dashboard</span>
          <ArrowRight className="h-4 w-4" />
        </button>

        <p className="text-center text-[10px] text-[#8CA2AE]">
          Free public emergency platform • Operates in offline mode during cellular outages
        </p>
      </div>
    </div>
  );
};
