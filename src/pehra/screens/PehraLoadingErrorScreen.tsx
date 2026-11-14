import React, { useState } from 'react';
import { ArrowLeft, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

interface PehraLoadingErrorScreenProps {
  onBack: () => void;
}

export const PehraLoadingErrorScreen: React.FC<PehraLoadingErrorScreenProps> = ({ onBack }) => {
  const [viewMode, setViewMode] = useState<'loading' | 'error' | 'resolved'>('loading');
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      setIsRetrying(false);
      setViewMode('resolved');
    }, 1200);
  };

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
        <span className="text-xs font-semibold text-[#1E252B]">State Patterns</span>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center gap-1.5 p-1 bg-[#EFEFEA] rounded-lg border border-[#E5E5DF]">
        <button
          onClick={() => setViewMode('loading')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
            viewMode === 'loading'
              ? 'bg-white text-[#1E252B] shadow-xs'
              : 'text-[#6B727A] hover:text-[#1E252B]'
          }`}
        >
          Loading State
        </button>
        <button
          onClick={() => setViewMode('error')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
            viewMode === 'error'
              ? 'bg-white text-[#1E252B] shadow-xs'
              : 'text-[#6B727A] hover:text-[#1E252B]'
          }`}
        >
          Error State
        </button>
        <button
          onClick={() => setViewMode('resolved')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
            viewMode === 'resolved'
              ? 'bg-white text-[#1E252B] shadow-xs'
              : 'text-[#6B727A] hover:text-[#1E252B]'
          }`}
        >
          Recovered
        </button>
      </div>

      {/* 1. Loading State Pattern */}
      {viewMode === 'loading' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#1E252B] uppercase tracking-wider">
              Telemetry Sync in Progress
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-[#6B727A]">
              <div className="w-3 h-3 border-2 border-[#1B3B48] border-t-transparent rounded-full animate-spin" />
              <span>Fetching logs...</span>
            </div>
          </div>

          {/* Skeleton list with dividers */}
          <div className="bg-white border border-[#E5E5DF] rounded-xl overflow-hidden divide-y divide-[#EFEFEA]">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="p-3.5 space-y-2 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="h-3 bg-[#EFEFEA] rounded w-2/5" />
                  <div className="h-2.5 bg-[#EFEFEA] rounded w-1/6" />
                </div>
                <div className="h-2.5 bg-[#EFEFEA] rounded w-3/5" />
              </div>
            ))}
          </div>

          <p className="text-xs text-[#858D95] text-center">
            Subtle skeleton pulses avoid harsh flashes while data streams in.
          </p>
        </div>
      )}

      {/* 2. Error State Pattern */}
      {viewMode === 'error' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E5E5DF] rounded-xl p-8 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-lg bg-[#FEF2F2] border border-[#FCA5A5] flex items-center justify-center text-[#BA3D3B] mb-4">
              <AlertCircle className="w-5 h-5 stroke-[1.8px]" />
            </div>

            <h2 className="text-base font-semibold tracking-tight text-[#1E252B] mb-1.5">
              Unable to sync field telemetry
            </h2>

            <p className="text-xs text-[#6B727A] max-w-xs leading-relaxed mb-6">
              The municipal repeater at Station Hilltop timed out. Local logs are safely cached on your device.
            </p>

            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="py-2.5 px-5 bg-[#1B3B48] hover:bg-[#152E38] disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-2 active:translate-y-[0.5px]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>{isRetrying ? 'Retrying Link...' : 'Retry Connection'}</span>
            </button>
          </div>

          <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg text-xs text-[#991B1B] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Telemetry buffer: 4 offline logs queued for upload.</span>
          </div>
        </div>
      )}

      {/* 3. Recovered State */}
      {viewMode === 'resolved' && (
        <div className="bg-white border border-[#E5E5DF] rounded-xl p-8 text-center space-y-3">
          <div className="w-10 h-10 rounded-lg bg-[#3B755D]/10 border border-[#3B755D]/20 flex items-center justify-center text-[#3B755D] mx-auto">
            <CheckCircle2 className="w-5 h-5 stroke-[1.8px]" />
          </div>

          <h2 className="text-base font-semibold text-[#1E252B]">
            Connection re-established
          </h2>

          <p className="text-xs text-[#6B727A] max-w-xs mx-auto">
            All offline queued reports were synchronized with the Ward H-West central database.
          </p>

          <button
            onClick={() => setViewMode('loading')}
            className="text-xs font-medium text-[#1B3B48] hover:underline pt-2 inline-block"
          >
            Switch back to loading preview &rarr;
          </button>
        </div>
      )}
    </div>
  );
};
