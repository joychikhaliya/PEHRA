import React from 'react';
import { ArrowLeft, Inbox, Plus } from 'lucide-react';

interface PehraEmptyStateScreenProps {
  onBack: () => void;
  onGetStarted: () => void;
}

export const PehraEmptyStateScreen: React.FC<PehraEmptyStateScreenProps> = ({
  onBack,
  onGetStarted,
}) => {
  return (
    <div className="p-5 max-w-lg mx-auto bg-[#F7F7F4] text-[#1E252B] space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E5E5DF]">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-[#6B727A] hover:text-[#1E252B] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
        <span className="text-xs font-semibold text-[#1E252B]">Empty State Pattern</span>
      </div>

      {/* Main Empty State Container adhering strictly to the prompt */}
      <div className="min-h-[420px] bg-white border border-[#E5E5DF] rounded-xl p-8 flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 rounded-lg bg-[#F7F7F4] border border-[#E5E5DF] flex items-center justify-center text-[#1B3B48] mb-4">
          <Inbox className="w-5 h-5 stroke-[1.8px]" />
        </div>

        <h2 className="text-base font-semibold tracking-tight text-[#1E252B] mb-1.5">
          Nothing here yet
        </h2>

        <p className="text-xs text-[#6B727A] max-w-xs leading-relaxed mb-6">
          Your activity will appear here when you start using Pehra.
        </p>

        <button
          onClick={onGetStarted}
          className="py-2.5 px-5 bg-[#1B3B48] hover:bg-[#152E38] text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 active:translate-y-[0.5px]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Get Started</span>
        </button>
      </div>

      <div className="p-3 bg-[#EFEFEA] rounded-lg border border-[#E5E5DF] text-[11px] text-[#6B727A]">
        Designed with simple typography, functional iconography, and zero decorative fluff.
      </div>
    </div>
  );
};
