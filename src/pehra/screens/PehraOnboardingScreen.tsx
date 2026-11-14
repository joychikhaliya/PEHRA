import React, { useState } from 'react';
import { ShieldCheck, MapPin, BellRing, ArrowRight } from 'lucide-react';

interface PehraOnboardingScreenProps {
  onComplete: () => void;
  onSkipToLogin: () => void;
}

export const PehraOnboardingScreen: React.FC<PehraOnboardingScreenProps> = ({
  onComplete,
  onSkipToLogin,
}) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: ShieldCheck,
      category: '01 · Vigilance & Oversight',
      title: 'Reliable patrol rounds without clutter',
      description:
        'Log key checkpoints, inspect sluice gates, and verify floodwall barriers along structured community routes.',
    },
    {
      icon: MapPin,
      category: '02 · Hyperlocal Incidents',
      title: 'Report issues directly from the field',
      description:
        'Document waterlogging, blocked culverts, and structural concerns with GPS coordinates and clear timestamps.',
    },
    {
      icon: BellRing,
      category: '03 · Coordinated Safety',
      title: 'Keep responders and residents aligned',
      description:
        'Quiet, structured alerts deliver actionable information during monsoons and high tides without noise or panic.',
    },
  ];

  const current = steps[step];
  const Icon = current.icon;

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="min-h-[640px] flex flex-col justify-between p-6 bg-[#F7F7F4] text-[#1E252B]">
      {/* Header bar */}
      <div className="flex items-center justify-between pt-4">
        <span className="text-xs text-[#6B727A] font-medium tracking-tight">Pehra Guide</span>
        <button
          onClick={onSkipToLogin}
          className="text-xs text-[#6B727A] hover:text-[#1E252B] transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Main Step Content */}
      <div className="py-8">
        <div className="w-12 h-12 rounded-xl bg-[#EFEFEA] border border-[#E5E5DF] flex items-center justify-center text-[#1B3B48] mb-6">
          <Icon className="w-6 h-6 stroke-[1.8px]" />
        </div>

        <span className="text-[11px] font-medium uppercase tracking-wider text-[#6B727A]">
          {current.category}
        </span>

        <h2 className="text-2xl font-semibold tracking-tight text-[#1E252B] mt-1.5 mb-3 leading-snug">
          {current.title}
        </h2>

        <p className="text-sm text-[#555E68] leading-relaxed max-w-sm">
          {current.description}
        </p>

        {/* Step indicator lines */}
        <div className="flex items-center gap-1.5 mt-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-200 ${
                i === step ? 'w-6 bg-[#1B3B48]' : 'w-2 bg-[#DEDEC8]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="pb-4 space-y-2">
        <button
          onClick={handleNext}
          className="w-full py-3 px-4 bg-[#1B3B48] hover:bg-[#152E38] text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <span>{step === steps.length - 1 ? 'Get Started' : 'Continue'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="w-full py-2 text-xs text-[#6B727A] hover:text-[#1E252B] transition-colors text-center"
          >
            Back
          </button>
        )}
      </div>
    </div>
  );
};
