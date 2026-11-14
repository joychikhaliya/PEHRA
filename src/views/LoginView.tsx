import React, { useState } from 'react';
import {
  Users,
  Flame,
  Landmark,
  Shield,
  ArrowRight,
  Phone,
  Hash,
  MapPin,
  Lock,
  BadgeCheck,
  Radio,
  Fingerprint,
  CheckCircle2,
  AlertTriangle,
  Plane,
} from 'lucide-react';
import { UserRole } from '../types/index.ts';
import { ROLES_CONFIG } from '../data/rolesData.ts';
import { PehraLogo } from '../components/PehraLogo.tsx';

interface LoginViewProps {
  onLoginSuccess: (role: UserRole, userDetails: any) => void;
  onContinueAsGuest: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onContinueAsGuest }) => {
  const [activePortal, setActivePortal] = useState<'CITIZEN' | 'RESPONDER' | 'SUPER_ADMIN'>('CITIZEN');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStepMessage, setAuthStepMessage] = useState('');

  // 1. Citizen Form State
  const [citizenPhone, setCitizenPhone] = useState('+91 98920 44556');
  const [citizenOtp, setCitizenOtp] = useState('8492');
  const [citizenWard, setCitizenWard] = useState('Kurla West (L Ward)');
  const [citizenChannel, setCitizenChannel] = useState<'whatsapp' | 'sms'>('whatsapp');

  // 2. Rescuer Form State
  const [rescuerBadge, setRescuerBadge] = useState('NDRF-05-8842');
  const [rescuerPasscode, setRescuerPasscode] = useState('VHF-TAC-99');
  const [rescuerStation, setRescuerStation] = useState('NDRF Station Kurla Mithi Outpost');
  const [meshSync, setMeshSync] = useState(true);

  // 3. Super Admin Form State
  const [adminEmail, setAdminEmail] = useState('sec.relief@maharashtra.gov.in');
  const [adminKey, setAdminKey] = useState('MAHA-CRISIS-SEC-01');
  const [adminJurisdiction, setAdminJurisdiction] = useState('Maharashtra State Crisis War Room (Mantralaya)');

  const currentRoleConfig = ROLES_CONFIG[activePortal];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setAuthStepMessage(`Connecting to ${currentRoleConfig.portalName}...`);

    setTimeout(() => {
      if (activePortal === 'CITIZEN') {
        setAuthStepMessage('Verifying residential OTP & loading localized flood warnings...');
      } else if (activePortal === 'RESPONDER') {
        setAuthStepMessage('Verifying NDRF/Fire tactical credentials & syncing radio mesh...');
      } else {
        setAuthStepMessage('Validating State Executive Crisis Protocol & authenticating clearance...');
      }
    }, 600);

    setTimeout(() => {
      setIsAuthenticating(false);
      onLoginSuccess(activePortal as UserRole, currentRoleConfig.demoUser);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 h-[450px] w-[450px] rounded-full bg-blue-50/70 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-[450px] w-[450px] rounded-full bg-slate-100/80 blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-[#E5EAF0] bg-white/90 backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <PehraLogo size={32} showText={true} />
          <span className="hidden sm:inline text-xs text-slate-400">|</span>
          <span className="hidden sm:inline text-xs text-slate-500 font-medium">
            Greater Mumbai Hyperlocal Flood Intelligence Network
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Mithi River Sensors: Live</span>
          </div>

          <button
            onClick={onContinueAsGuest}
            id="public-resident-access-btn"
            className="flex items-center gap-1.5 rounded-xl border border-[#E5EAF0] bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-xs transition-colors"
          >
            <span>Public Resident Access</span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-3xl space-y-6">
          {/* Headline */}
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-xs font-semibold text-blue-700">
              <Shield className="h-3.5 w-3.5 text-blue-600" />
              <span>Multi-Portal Emergency Access</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Select Your Access Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              PEHRA features 3 distinct, strictly isolated operational stations. Choose your role below to authenticate.
            </p>
          </div>

          {/* 3 Dedicated Portal Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Citizen Portal Choice */}
            <button
              type="button"
              onClick={() => setActivePortal('CITIZEN')}
              id="choose-citizen-portal-btn"
              className={`p-4 rounded-2xl border text-left transition-all relative ${
                activePortal === 'CITIZEN'
                  ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20 shadow-sm'
                  : 'bg-white border-[#E5EAF0] hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100/70 text-emerald-700">
                  <Users className="h-5 w-5" />
                </span>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Tier 0
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900">Citizen Portal</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                For residents & volunteers. Local flood alerts, safe shelters & survival checklist.
              </p>
            </button>

            {/* 2. Rescuer Portal Choice */}
            <button
              type="button"
              onClick={() => setActivePortal('RESPONDER')}
              id="choose-rescuer-portal-btn"
              className={`p-4 rounded-2xl border text-left transition-all relative ${
                activePortal === 'RESPONDER'
                  ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20 shadow-sm'
                  : 'bg-white border-[#E5EAF0] hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100/70 text-blue-700">
                  <Flame className="h-5 w-5" />
                </span>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  Tier 1
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900">Rescuer Portal</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                For NDRF & Fire rescue teams. Tactical dispatches, live drone recon & field triage.
              </p>
            </button>

            {/* 3. Super Admin Portal Choice */}
            <button
              type="button"
              onClick={() => setActivePortal('SUPER_ADMIN')}
              id="choose-superadmin-portal-btn"
              className={`p-4 rounded-2xl border text-left transition-all relative ${
                activePortal === 'SUPER_ADMIN'
                  ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-500/20 shadow-sm'
                  : 'bg-white border-[#E5EAF0] hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100/70 text-rose-700">
                  <Landmark className="h-5 w-5" />
                </span>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                  Tier 2
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900">Super Admin Portal</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                For State Disaster Authority. Apex crisis command, multi-drone fleet & red warnings.
              </p>
            </button>
          </div>

          {/* Active Portal Authentication Box */}
          <div className="rounded-2xl border border-[#E5EAF0] bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono font-semibold uppercase border ${currentRoleConfig.colorScheme.badgeBg}`}>
                    {currentRoleConfig.badge}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{currentRoleConfig.department}</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-1">{currentRoleConfig.title}</h2>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs font-semibold text-blue-700">Authentication: {currentRoleConfig.loginMethod.name}</span>
                <p className="text-[11px] text-slate-500 max-w-xs mt-0.5">{currentRoleConfig.loginMethod.description}</p>
              </div>
            </div>

            {/* Authentication Loader */}
            {isAuthenticating ? (
              <div className="py-10 flex flex-col items-center justify-center space-y-4 text-center">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full border-3 border-slate-200 border-t-[#2563EB] animate-spin" />
                  <Fingerprint className="h-6 w-6 text-blue-600 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-sm text-slate-900">{authStepMessage}</div>
                  <div className="text-xs text-slate-400 font-mono">Isolated Session Handshake in Progress</div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* 1. CITIZEN FORM */}
                {activePortal === 'CITIZEN' && (
                  <div className="space-y-4 text-xs">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <span className="text-slate-500 font-medium">Verify via:</span>
                      <button
                        type="button"
                        onClick={() => setCitizenChannel('whatsapp')}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          citizenChannel === 'whatsapp'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        💬 WhatsApp Code
                      </button>
                      <button
                        type="button"
                        onClick={() => setCitizenChannel('sms')}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          citizenChannel === 'sms'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        📱 SMS OTP
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 font-medium mb-1">
                          Mobile / WhatsApp Number
                        </label>
                        <div className="relative">
                          <Phone className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="tel"
                            value={citizenPhone}
                            onChange={(e) => setCitizenPhone(e.target.value)}
                            placeholder="+91 98920 44556"
                            className="w-full rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] pl-9 pr-3 py-2 text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-medium mb-1">
                          4-Digit Verification OTP
                        </label>
                        <div className="relative">
                          <Hash className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            maxLength={4}
                            value={citizenOtp}
                            onChange={(e) => setCitizenOtp(e.target.value)}
                            placeholder="8492"
                            className="w-full rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] pl-9 pr-3 py-2 text-slate-900 font-mono tracking-widest focus:bg-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20"
                            required
                          />
                        </div>
                        <span className="text-[10px] text-emerald-600 mt-1 block">
                          Demo OTP: 8492 (Auto-filled)
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        Residential Locality / Ward
                      </label>
                      <select
                        value={citizenWard}
                        onChange={(e) => setCitizenWard(e.target.value)}
                        className="w-full rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                      >
                        <option value="Kurla West (L Ward)">Kurla West (L Ward - Mithi River Basin)</option>
                        <option value="Sion Circle & Gandhi Market (F-North)">Sion Circle & Gandhi Market (F-North)</option>
                        <option value="Dharavi & Mahim Creek (G-North)">Dharavi & Mahim Creek (G-North)</option>
                        <option value="Milan Subway (K-East & H-East)">Milan Subway Underpass (K-East / H-East)</option>
                        <option value="Bandra Kurla Complex (H-East)">Bandra Kurla Complex (BKC)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* 2. RESCUER FORM */}
                {activePortal === 'RESPONDER' && (
                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 font-medium mb-1">
                          Service / Force Badge ID
                        </label>
                        <div className="relative">
                          <BadgeCheck className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            value={rescuerBadge}
                            onChange={(e) => setRescuerBadge(e.target.value)}
                            placeholder="NDRF-05-8842"
                            className="w-full rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] pl-9 pr-3 py-2 text-slate-900 font-mono font-semibold focus:bg-white focus:outline-none focus:border-blue-600"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-medium mb-1">
                          Duty Code / Tactical VHF PIN
                        </label>
                        <div className="relative">
                          <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="password"
                            value={rescuerPasscode}
                            onChange={(e) => setRescuerPasscode(e.target.value)}
                            placeholder="••••••••"
                            className="w-full rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] pl-9 pr-3 py-2 text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-blue-600"
                            required
                          />
                        </div>
                        <span className="text-[10px] text-blue-600 mt-1 block">
                          Demo Passcode: VHF-TAC-99 (Auto-filled)
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        Assigned Tactical Command Post
                      </label>
                      <select
                        value={rescuerStation}
                        onChange={(e) => setRescuerStation(e.target.value)}
                        className="w-full rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                      >
                        <option value="NDRF Station Kurla Mithi Outpost">NDRF Station Kurla Mithi Outpost (Boat Unit #3)</option>
                        <option value="Mumbai Fire Brigade Santacruz Division">Mumbai Fire Brigade Santacruz Division (Subway Sump Pump Team)</option>
                        <option value="SDRF Camp Dharavi Depot">SDRF Camp Dharavi Depot (High-Capacity Dewatering)</option>
                        <option value="Central Railway Emergency Response Matunga">Central Railway Emergency Response Matunga</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-600">
                      <input
                        type="checkbox"
                        id="meshSync"
                        checked={meshSync}
                        onChange={(e) => setMeshSync(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 accent-blue-600"
                      />
                      <label htmlFor="meshSync" className="cursor-pointer">
                        Enable Peer-to-Peer LoRaWAN / 5.8GHz Mesh Synchronization for Zero-Connectivity Zones
                      </label>
                    </div>
                  </div>
                )}

                {/* 3. SUPER ADMIN FORM */}
                {activePortal === 'SUPER_ADMIN' && (
                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 font-medium mb-1">
                          Executive IAS / SDMA Clearance ID
                        </label>
                        <div className="relative">
                          <Landmark className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="email"
                            value={adminEmail}
                            onChange={(e) => setAdminEmail(e.target.value)}
                            placeholder="sec.relief@maharashtra.gov.in"
                            className="w-full rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] pl-9 pr-3 py-2 text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-rose-600"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-medium mb-1">
                          State Disaster Crisis Key
                        </label>
                        <div className="relative">
                          <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="password"
                            value={adminKey}
                            onChange={(e) => setAdminKey(e.target.value)}
                            placeholder="••••••••"
                            className="w-full rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] pl-9 pr-3 py-2 text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-rose-600"
                            required
                          />
                        </div>
                        <span className="text-[10px] text-rose-600 mt-1 block">
                          Demo Key: MAHA-CRISIS-SEC-01 (Auto-filled)
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        Executive Jurisdiction
                      </label>
                      <select
                        value={adminJurisdiction}
                        onChange={(e) => setAdminJurisdiction(e.target.value)}
                        className="w-full rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-rose-600"
                      >
                        <option value="Maharashtra State Crisis War Room (Mantralaya)">Maharashtra State Crisis War Room (Mantralaya)</option>
                        <option value="MCGM Central Disaster Management HQ (CST)">MCGM Central Disaster Management HQ (CST Annex)</option>
                        <option value="MMR Inter-District Flood Coordination Command">MMR Inter-District Flood Coordination Command</option>
                      </select>
                    </div>

                    <div className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-[11px] text-rose-800 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                      <span>
                        Tier 2 Super Admin clearance grants apex authority for city-wide red alerts, drone fleet ingress, and floodgate operations.
                      </span>
                    </div>
                  </div>
                )}

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    id="portal-sign-in-btn"
                    className={`w-full py-3 rounded-xl font-bold text-sm text-white shadow-xs transition-all active:scale-[0.99] flex items-center justify-center gap-2 ${
                      activePortal === 'CITIZEN'
                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                        : activePortal === 'RESPONDER'
                        ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                        : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                    }`}
                  >
                    <span>Sign In to {currentRoleConfig.title}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#E5EAF0] bg-white/80 backdrop-blur-md px-4 sm:px-8 py-3 text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>PEHRA — Predictive Early-warning for Hyperlocal Risk Assessment</span>
          <div className="flex items-center gap-4 text-[11px]">
            <span>MCGM Disaster Cell: <strong className="text-slate-800">1916</strong></span>
            <span>NDRF Emergency: <strong className="text-slate-800">1078</strong></span>
            <span>Fire Brigade: <strong className="text-slate-800">101</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
};
