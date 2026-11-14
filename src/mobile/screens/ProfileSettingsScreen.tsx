import React, { useState } from 'react';
import {
  User,
  MapPin,
  Phone,
  Bell,
  Globe,
  Info,
  Shield,
  Heart,
  Plus,
  ChevronRight,
  Check,
} from 'lucide-react';
import { FloodSafeLocation } from '../../data/floodSafeData.ts';

interface ProfileSettingsScreenProps {
  onSelectLocation: (loc: any) => void;
  allLocations: FloodSafeLocation[];
  onNavigateTab: (tab: string) => void;
}

export const ProfileSettingsScreen: React.FC<ProfileSettingsScreenProps> = ({
  onSelectLocation,
  allLocations,
  onNavigateTab,
}) => {
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [criticalSms, setCriticalSms] = useState(true);
  const [locationTracking, setLocationTracking] = useState(true);
  const [language, setLanguage] = useState<'EN' | 'HI' | 'MR'>('EN');

  const savedLocations = [
    { label: 'Home', location: allLocations[0], icon: '🏠' },
    { label: 'Workplace', location: allLocations[3], icon: '🏢' },
    { label: 'Parents', location: allLocations[4], icon: '👨‍👩‍👦' },
  ];

  const emergencyContacts = [
    { name: 'Priya Sharma (Wife)', phone: '+91 98201 44512', relation: 'Primary Contact' },
    { name: 'Rohan Sharma (Brother)', phone: '+91 98190 22319', relation: 'Family' },
    { name: 'Dr. A. V. Deshmukh', phone: '+91 98205 11094', relation: 'Family Physician' },
  ];

  return (
    <div className="p-4 space-y-4 max-w-xl mx-auto pb-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-[#173B4D] tracking-tight">
          Safety Profile & Settings
        </h1>
        <p className="text-xs text-[#5A7382]">
          Emergency health record, saved locations, and alert preferences.
        </p>
      </div>

      {/* 1. PERSONAL EMERGENCY MEDICAL CARD */}
      <div className="p-4 rounded-2xl bg-white border border-[#E2ECEF] shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-[#EEF7F8] border border-[#DCEFF2] text-[#2E7D82] flex items-center justify-center font-bold text-lg">
            RK
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#173B4D]">Rajesh K. Sharma</h2>
            <div className="text-xs text-[#5A7382]">Kurla West • Ward L-104</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded-full bg-[#E85D5D]/10 text-[#E85D5D] text-[10px] font-bold">
                Blood Group: O+
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#EEF7F8] text-[#2E7D82] text-[10px] font-semibold">
                No Critical Allergies
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SAVED LOCATIONS */}
      <div className="p-4 rounded-2xl bg-white border border-[#E2ECEF] shadow-sm space-y-2.5">
        <span className="text-xs font-bold text-[#173B4D] uppercase tracking-wider block">
          Saved Places (Quick Telemetry)
        </span>

        <div className="space-y-2">
          {savedLocations.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                onSelectLocation(item.location);
                onNavigateTab('home');
              }}
              className="w-full p-2.5 rounded-xl border border-[#E2ECEF] hover:bg-[#EEF7F8] hover:border-[#DCEFF2] flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">{item.icon}</span>
                <div>
                  <div className="text-xs font-bold text-[#173B4D]">{item.label}</div>
                  <div className="text-[11px] text-[#5A7382]">{item.location.name}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    item.location.riskLevel === 'CRITICAL'
                      ? 'bg-[#E85D5D]/10 text-[#E85D5D]'
                      : item.location.riskLevel === 'MODERATE'
                      ? 'bg-amber-400/10 text-amber-700'
                      : 'bg-[#4F8A68]/10 text-[#4F8A68]'
                  }`}
                >
                  {item.location.riskLevel}
                </span>
                <ChevronRight className="h-4 w-4 text-[#8CA2AE]" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. EMERGENCY CONTACTS */}
      <div className="p-4 rounded-2xl bg-white border border-[#E2ECEF] shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#173B4D] uppercase tracking-wider">
            Emergency Contacts (SOS SMS Relay)
          </span>
          <button className="text-[11px] font-semibold text-[#2E7D82] hover:text-[#173B4D] flex items-center gap-0.5">
            <Plus className="h-3 w-3" />
            <span>Add</span>
          </button>
        </div>

        <div className="space-y-2">
          {emergencyContacts.map((c, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-[#F7FAFA] border border-[#E2ECEF] flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-bold text-[#173B4D]">{c.name}</div>
                <div className="text-[10px] text-[#5A7382]">{c.relation}</div>
              </div>

              <a
                href={`tel:${c.phone}`}
                className="flex items-center gap-1 text-xs font-bold text-[#2E7D82] hover:underline"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>{c.phone}</span>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* 4. NOTIFICATION & HARDWARE TOGGLES */}
      <div className="p-4 rounded-2xl bg-white border border-[#E2ECEF] shadow-sm space-y-3 text-xs">
        <span className="font-bold text-[#173B4D] uppercase tracking-wider block">
          Alert Preferences
        </span>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-[#173B4D]">High-Priority Siren Alarm</div>
              <div className="text-[11px] text-[#5A7382]">Play audible tone for Critical Red alerts even in silent mode</div>
            </div>
            <input
              type="checkbox"
              checked={soundAlerts}
              onChange={(e) => setSoundAlerts(e.target.checked)}
              className="h-4 w-4 rounded text-[#2E7D82] focus:ring-[#2E7D82]"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#F0F4F6]">
            <div>
              <div className="font-semibold text-[#173B4D]">Emergency SMS Broadcast Relay</div>
              <div className="text-[11px] text-[#5A7382]">Send automated location coordinates to family when SOS is triggered</div>
            </div>
            <input
              type="checkbox"
              checked={criticalSms}
              onChange={(e) => setCriticalSms(e.target.checked)}
              className="h-4 w-4 rounded text-[#2E7D82] focus:ring-[#2E7D82]"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#F0F4F6]">
            <div>
              <div className="font-semibold text-[#173B4D]">Real-Time GPS Hydrology Geofencing</div>
              <div className="text-[11px] text-[#5A7382]">Update risk score automatically as you move</div>
            </div>
            <input
              type="checkbox"
              checked={locationTracking}
              onChange={(e) => setLocationTracking(e.target.checked)}
              className="h-4 w-4 rounded text-[#2E7D82] focus:ring-[#2E7D82]"
            />
          </div>
        </div>
      </div>

      {/* 5. APP LANGUAGE SELECTOR */}
      <div className="p-4 rounded-2xl bg-white border border-[#E2ECEF] shadow-sm space-y-2.5">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-[#2E7D82]" />
          <span className="text-xs font-bold text-[#173B4D] uppercase tracking-wider">
            Language / भाषा / भाषा
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'EN', label: 'English' },
            { id: 'HI', label: 'हिन्दी (Hindi)' },
            { id: 'MR', label: 'मराठी (Marathi)' },
          ].map((lang) => (
            <button
              key={lang.id}
              onClick={() => setLanguage(lang.id as any)}
              className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                language === lang.id
                  ? 'bg-[#173B4D] text-white border-[#173B4D]'
                  : 'bg-[#F7FAFA] border-[#E2ECEF] text-[#5A7382] hover:bg-[#EEF7F8]'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* 6. ABOUT FLOODSAFE APP */}
      <div className="p-4 rounded-2xl bg-[#EEF7F8] border border-[#DCEFF2] text-xs text-[#5A7382] space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-[#173B4D]">
          <Shield className="h-4 w-4 text-[#2E7D82]" />
          <span>FloodSafe v2.5.0 (Mobile Build)</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Integrated with MCGM Municipal Disaster Management Cell & IMD Radar Telemetry. Offline offline cache active.
        </p>
        <div className="text-[10px] text-[#8CA2AE] pt-1">
          Designed for high-stress usability, minimal battery consumption, and instant risk clarity.
        </div>
      </div>
    </div>
  );
};
