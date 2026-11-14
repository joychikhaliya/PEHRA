import React from 'react';
import { Shield } from 'lucide-react';

interface PehraSplashScreenProps {
  onContinue: () => void;
  onGoToOnboarding: () => void;
}

export const PehraSplashScreen: React.FC<PehraSplashScreenProps> = ({
  onContinue,
  onGoToOnboarding,
}) => {
  return (
    <div className="min-h-[680px] flex flex-col justify-between p-6 bg-[#F7F7F4] text-[#1E252B]">
      {/* Top spacing */}
      <div className="pt-8">
        <span className="text-[11px] uppercase tracking-wider text-[#6B727A] font-medium">
          Vigilance & Safety Platform
        </span>
      </div>

      {/* Centered Brand Content */}
      <div className="py-12">
        <div className="w-12 h-12 rounded-xl bg-[#EFEFEA] border border-[#E5E5DF] flex items-center justify-center text-[#1B3B48] mb-6">
          <Shield className="w-6 h-6 stroke-[1.8px]" />
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-[#1E252B] mb-2">
          Pehra
        </h1>

        <p className="text-sm text-[#555E68] leading-relaxed max-w-xs mb-8">
          Reliable perimeter vigilance, quiet community oversight, and structured incident reporting.
        </p>

        <div className="space-y-2 border-l-2 border-[#E5E5DF] pl-3 py-1">
          <p className="text-xs text-[#6B727A]">Current Deployment</p>
          <p className="text-xs font-medium text-[#1E252B]">
            Greater Mumbai Coastal & Urban Wards · v2.4.0
          </p>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="pb-4 space-y-2.5">
        <button
          onClick={onContinue}
          className="w-full py-3 px-4 bg-[#1B3B48] hover:bg-[#152E38] text-white text-sm font-medium rounded-lg transition-colors active:translate-y-[1px]"
        >
          Enter Dashboard
        </button>

        <button
          onClick={onGoToOnboarding}
          className="w-full py-2.5 px-4 text-xs font-medium text-[#555E68] hover:text-[#1E252B] transition-colors text-center"
        >
          View Introduction & Workflow
        </button>

        <div className="pt-4 flex items-center justify-between text-[11px] text-[#858D95]">
          <span>Offline-first ready</span>
          <span>End-to-end verified</span>
        </div>
      </div>
    </div>
  );
};
