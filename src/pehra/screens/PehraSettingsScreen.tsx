import React, { useState } from 'react';
import { ArrowLeft, Shield, Bell, Moon, Database, Check } from 'lucide-react';

interface PehraSettingsScreenProps {
  onBack: () => void;
}

export const PehraSettingsScreen: React.FC<PehraSettingsScreenProps> = ({ onBack }) => {
  const [pushAlerts, setPushAlerts] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(false);
  const [highTideAlerts, setHighTideAlerts] = useState(true);
  const [offlineSync, setOfflineSync] = useState(true);
  const [denseLayout, setDenseLayout] = useState(false);
  const [savedNote, setSavedNote] = useState(false);

  const triggerSave = () => {
    setSavedNote(true);
    setTimeout(() => setSavedNote(false), 2000);
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
        <span className="text-xs font-semibold text-[#1E252B]">Settings</span>
      </div>

      <div>
        <h1 className="text-xl font-semibold tracking-tight text-[#1E252B]">
          System & Preferences
        </h1>
        <p className="text-xs text-[#6B727A] mt-0.5">
          Configure notification thresholds, offline storage, and field verification settings.
        </p>
      </div>

      {savedNote && (
        <div className="p-3 bg-[#3B755D]/10 text-[#3B755D] border border-[#3B755D]/20 rounded-lg text-xs flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>Preferences updated successfully</span>
        </div>
      )}

      {/* Notifications Section */}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold text-[#1E252B] uppercase tracking-wider">
          Alert Thresholds
        </h2>

        <div className="bg-white border border-[#E5E5DF] rounded-xl overflow-hidden divide-y divide-[#EFEFEA]">
          <div className="p-3.5 flex items-center justify-between text-xs">
            <div>
              <span className="font-medium text-[#1E252B] block">Emergency Push Alerts</span>
              <span className="text-[11px] text-[#6B727A]">Deliver critical flood & perimeter warnings</span>
            </div>
            <input
              type="checkbox"
              checked={pushAlerts}
              onChange={(e) => {
                setPushAlerts(e.target.checked);
                triggerSave();
              }}
              className="accent-[#1B3B48] w-4 h-4 rounded cursor-pointer"
            />
          </div>

          <div className="p-3.5 flex items-center justify-between text-xs">
            <div>
              <span className="font-medium text-[#1E252B] block">Audible High Tide Warnings</span>
              <span className="text-[11px] text-[#6B727A]">Chime during 4.0m+ Arabian Sea tide crests</span>
            </div>
            <input
              type="checkbox"
              checked={highTideAlerts}
              onChange={(e) => {
                setHighTideAlerts(e.target.checked);
                triggerSave();
              }}
              className="accent-[#1B3B48] w-4 h-4 rounded cursor-pointer"
            />
          </div>

          <div className="p-3.5 flex items-center justify-between text-xs">
            <div>
              <span className="font-medium text-[#1E252B] block">Field Radio Chime</span>
              <span className="text-[11px] text-[#6B727A]">Vibration feedback on checkpoint completion</span>
            </div>
            <input
              type="checkbox"
              checked={soundAlerts}
              onChange={(e) => {
                setSoundAlerts(e.target.checked);
                triggerSave();
              }}
              className="accent-[#1B3B48] w-4 h-4 rounded cursor-pointer"
            />
          </div>
        </div>
      </section>

      {/* Offline Storage & Sync */}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold text-[#1E252B] uppercase tracking-wider">
          Offline & Bandwidth
        </h2>

        <div className="bg-white border border-[#E5E5DF] rounded-xl overflow-hidden divide-y divide-[#EFEFEA]">
          <div className="p-3.5 flex items-center justify-between text-xs">
            <div>
              <span className="font-medium text-[#1E252B] block">Local Offline Queue</span>
              <span className="text-[11px] text-[#6B727A]">Queue checkpoint scans when cellular drop occurs</span>
            </div>
            <input
              type="checkbox"
              checked={offlineSync}
              onChange={(e) => {
                setOfflineSync(e.target.checked);
                triggerSave();
              }}
              className="accent-[#1B3B48] w-4 h-4 rounded cursor-pointer"
            />
          </div>

          <div className="p-3.5 flex items-center justify-between text-xs">
            <div>
              <span className="font-medium text-[#1E252B] block">High Density View</span>
              <span className="text-[11px] text-[#6B727A]">Compact lists for fast operational reading</span>
            </div>
            <input
              type="checkbox"
              checked={denseLayout}
              onChange={(e) => {
                setDenseLayout(e.target.checked);
                triggerSave();
              }}
              className="accent-[#1B3B48] w-4 h-4 rounded cursor-pointer"
            />
          </div>
        </div>
      </section>

      {/* About & Security */}
      <div className="p-4 bg-[#EFEFEA] rounded-xl border border-[#E5E5DF] text-xs text-[#555E68] space-y-1">
        <p className="font-semibold text-[#1E252B]">Pehra Mobile Platform · v2.4.0</p>
        <p className="text-[11px] text-[#6B727A]">
          Municipal Disaster Management & Community Vigilance Directive. End-to-end telemetry authenticated.
        </p>
      </div>
    </div>
  );
};
