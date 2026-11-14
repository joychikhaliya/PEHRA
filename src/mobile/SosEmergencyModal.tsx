import React, { useState, useRef } from 'react';
import {
  X,
  PhoneCall,
  Share2,
  AlertTriangle,
  Volume2,
  VolumeX,
  Sun,
  ShieldAlert,
  MapPin,
  Check,
  LifeBuoy,
} from 'lucide-react';
import { EMERGENCY_HELPLINES, FloodSafeLocation } from '../data/floodSafeData.ts';

interface SosEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: FloodSafeLocation;
}

export const SosEmergencyModal: React.FC<SosEmergencyModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
}) => {
  const [sirenPlaying, setSirenPlaying] = useState(false);
  const [strobeActive, setStrobeActive] = useState(false);
  const [copied, setCopied] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);

  if (!isOpen) return null;

  const toggleSiren = () => {
    if (sirenPlaying) {
      if (oscRef.current) {
        try {
          oscRef.current.stop();
          oscRef.current.disconnect();
        } catch (e) {}
        oscRef.current = null;
      }
      setSirenPlaying(false);
    } else {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';

        // Modulate siren between 600Hz and 950Hz
        osc.frequency.setValueAtTime(650, ctx.currentTime);
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = 2; // 2Hz siren cycle
        lfoGain.gain.value = 250;
        lfo.connect(osc.frequency);
        lfo.start();

        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        oscRef.current = osc;
        setSirenPlaying(true);
      } catch (err) {
        console.warn('Audio not allowed without user interaction:', err);
      }
    }
  };

  const handleShareLocation = () => {
    const lat = 19.0688;
    const lng = 72.8795;
    const shareText = `EMERGENCY ALERT: I need flood assistance. Location: ${currentLocation.name} (${currentLocation.ward}), Water Depth: ${currentLocation.waterLevelM}m. GPS: https://maps.google.com/?q=${lat},${lng}`;

    if (navigator.share) {
      navigator.share({
        title: 'Emergency Flood Assistance Needed',
        text: shareText,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#173B4D]/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      {/* Screen strobe simulator if active */}
      {strobeActive && (
        <div className="fixed inset-0 z-[60] bg-white pointer-events-none animate-ping opacity-90" />
      )}

      <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl border border-[#E2ECEF] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="bg-[#E85D5D] px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center">
              <ShieldAlert className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Emergency Assistance (SOS)</h2>
              <p className="text-xs text-white/90">Immediate rescue contacts & telemetry broadcast</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (sirenPlaying) toggleSiren();
              onClose();
            }}
            className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Current Location Badge */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#EEF7F8] border border-[#DCEFF2]">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#2E7D82]" />
              <div className="text-xs font-semibold text-[#173B4D]">{currentLocation.name}</div>
            </div>
            <span className="text-[11px] font-mono text-[#5A7382]">Depth: {currentLocation.waterLevelM}m</span>
          </div>

          {/* Quick 1-Touch Call Grid */}
          <div>
            <div className="text-xs font-bold text-[#173B4D] mb-2 uppercase tracking-wider">
              1-Touch Official Responders
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <a
                href="tel:112"
                className="flex items-center justify-between p-3 rounded-xl bg-[#F7FAFA] border border-[#E2ECEF] hover:border-[#E85D5D] hover:bg-[#E85D5D]/5 transition-all group"
              >
                <div>
                  <span className="text-xs font-bold text-[#173B4D] group-hover:text-[#E85D5D] block">
                    Police / Disaster
                  </span>
                  <span className="text-sm font-extrabold text-[#E85D5D]">Dial 112</span>
                </div>
                <div className="h-8 w-8 rounded-lg bg-[#E85D5D]/10 text-[#E85D5D] flex items-center justify-center">
                  <PhoneCall className="h-4 w-4" />
                </div>
              </a>

              <a
                href="tel:1916"
                className="flex items-center justify-between p-3 rounded-xl bg-[#F7FAFA] border border-[#E2ECEF] hover:border-[#2E7D82] hover:bg-[#EEF7F8] transition-all group"
              >
                <div>
                  <span className="text-xs font-bold text-[#173B4D] group-hover:text-[#2E7D82] block">
                    MCGM Disaster Cell
                  </span>
                  <span className="text-sm font-extrabold text-[#2E7D82]">Dial 1916</span>
                </div>
                <div className="h-8 w-8 rounded-lg bg-[#2E7D82]/10 text-[#2E7D82] flex items-center justify-center">
                  <PhoneCall className="h-4 w-4" />
                </div>
              </a>

              <a
                href="tel:108"
                className="flex items-center justify-between p-3 rounded-xl bg-[#F7FAFA] border border-[#E2ECEF] hover:border-[#173B4D] transition-all group"
              >
                <div>
                  <span className="text-xs font-bold text-[#173B4D] block">Ambulance</span>
                  <span className="text-sm font-extrabold text-[#173B4D]">Dial 108</span>
                </div>
                <div className="h-8 w-8 rounded-lg bg-[#EAF2F6] text-[#173B4D] flex items-center justify-center">
                  <PhoneCall className="h-4 w-4" />
                </div>
              </a>

              <a
                href="tel:103"
                className="flex items-center justify-between p-3 rounded-xl bg-[#F7FAFA] border border-[#E2ECEF] hover:border-[#173B4D] transition-all group"
              >
                <div>
                  <span className="text-xs font-bold text-[#173B4D] block">Traffic Police</span>
                  <span className="text-sm font-extrabold text-[#173B4D]">Dial 103</span>
                </div>
                <div className="h-8 w-8 rounded-lg bg-[#EAF2F6] text-[#173B4D] flex items-center justify-center">
                  <PhoneCall className="h-4 w-4" />
                </div>
              </a>
            </div>
          </div>

          {/* Distress Tools: Share GPS, Siren & Strobe */}
          <div className="pt-2 border-t border-[#E2ECEF] space-y-2">
            <div className="text-xs font-bold text-[#173B4D] mb-1 uppercase tracking-wider">
              Distress & Beacon Tools
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleShareLocation}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#EEF7F8] border border-[#DCEFF2] hover:bg-[#DCEFF2] transition-colors text-[#173B4D]"
              >
                <Share2 className="h-4 w-4 text-[#2E7D82] mb-1" />
                <span className="text-[11px] font-bold">
                  {copied ? 'Copied!' : 'Share GPS'}
                </span>
              </button>

              <button
                onClick={toggleSiren}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-colors ${
                  sirenPlaying
                    ? 'bg-[#E85D5D] border-[#E85D5D] text-white'
                    : 'bg-[#F7FAFA] border-[#E2ECEF] text-[#173B4D] hover:bg-[#EEF7F8]'
                }`}
              >
                {sirenPlaying ? (
                  <VolumeX className="h-4 w-4 mb-1 animate-pulse" />
                ) : (
                  <Volume2 className="h-4 w-4 text-[#E85D5D] mb-1" />
                )}
                <span className="text-[11px] font-bold">{sirenPlaying ? 'Stop Siren' : 'Loud Siren'}</span>
              </button>

              <button
                onClick={() => setStrobeActive(!strobeActive)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-colors ${
                  strobeActive
                    ? 'bg-amber-500 border-amber-500 text-white'
                    : 'bg-[#F7FAFA] border-[#E2ECEF] text-[#173B4D] hover:bg-[#EEF7F8]'
                }`}
              >
                <Sun className="h-4 w-4 text-amber-500 mb-1" />
                <span className="text-[11px] font-bold">{strobeActive ? 'Beacon ON' : 'Strobe'}</span>
              </button>
            </div>
          </div>

          {/* Quick Immediate Action Rules */}
          <div className="p-3.5 rounded-xl bg-[#F7FAFA] border border-[#E2ECEF] text-xs text-[#4B6370] space-y-1.5">
            <div className="font-bold text-[#173B4D] flex items-center gap-1.5">
              <LifeBuoy className="h-3.5 w-3.5 text-[#2E7D82]" />
              <span>While waiting for responders:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px]">
              <li>Move to the highest concrete structure or upper floor.</li>
              <li>Disconnect home main electrical breakers immediately.</li>
              <li>Do NOT attempt to walk or drive through moving water.</li>
            </ul>
          </div>
        </div>

        {/* Footer Close */}
        <div className="p-4 bg-[#F7FAFA] border-t border-[#E2ECEF] flex justify-end">
          <button
            onClick={() => {
              if (sirenPlaying) toggleSiren();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-[#173B4D] text-white text-xs font-bold hover:bg-[#1f4a60] transition-colors"
          >
            Dismiss SOS Screen
          </button>
        </div>
      </div>
    </div>
  );
};
