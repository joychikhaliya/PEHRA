import React, { useState } from 'react';
import {
  UserCheck,
  Shield,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Lock,
  Unlock,
  KeyRound,
  ExternalLink,
  Building2,
  Users,
  Flame,
  Settings,
  Landmark,
  Zap,
  AlertTriangle,
  Info,
  Radio,
  Navigation,
  Compass,
  FileText,
  LifeBuoy,
} from 'lucide-react';
import { UserRole } from '../types/index.ts';
import { ROLES_CONFIG, PERMISSION_MATRIX_ROWS } from '../data/rolesData.ts';

interface RbacHubViewProps {
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  onNavigate: (tab: string) => void;
  onOpenLogin: () => void;
}

export const RbacHubView: React.FC<RbacHubViewProps> = ({
  activeRole,
  setActiveRole,
  onNavigate,
  onOpenLogin,
}) => {
  const [selectedInspectionRole, setSelectedInspectionRole] = useState<UserRole>(activeRole);
  const [testResult, setTestResult] = useState<{
    attemptedAction: string;
    allowed: boolean;
    reason: string;
  } | null>(null);

  const currentRoleDetail = ROLES_CONFIG[activeRole];
  const inspectedRoleDetail = ROLES_CONFIG[selectedInspectionRole];

  // RBAC Permission Test Handler
  const handleTestPermission = (actionName: string, requiredRole: UserRole, requiredTier: number) => {
    const isAllowed = currentRoleDetail.clearanceTier >= requiredTier;

    if (isAllowed) {
      setTestResult({
        attemptedAction: actionName,
        allowed: true,
        reason: `Access Granted: Your active persona "${currentRoleDetail.title}" holds Tier ${currentRoleDetail.clearanceTier} clearance (minimum required: Tier ${requiredTier}).`,
      });
    } else {
      setTestResult({
        attemptedAction: actionName,
        allowed: false,
        reason: `403 Forbidden [RBAC Policy Violation]: Action requires "${ROLES_CONFIG[requiredRole].title}" (Tier ${requiredTier}). Your current clearance is Tier ${currentRoleDetail.clearanceTier} (${currentRoleDetail.shortLabel}).`,
      });
    }
  };

  const handleSwitchAndVisit = (role: UserRole, portalTab: string) => {
    setActiveRole(role);
    onNavigate(portalTab);
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'CITIZEN':
        return Users;
      case 'RESPONDER':
        return Flame;
      case 'AUTHORITY':
        return Building2;
      case 'ADMIN':
        return Settings;
      case 'SUPER_ADMIN':
        return Landmark;
      default:
        return UserCheck;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-[#E5EAF0] bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB] border border-blue-200 shrink-0">
              <UserCheck className="h-5 w-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-blue-700 border border-blue-200">
                  RBAC SIMULATION & GOVERNANCE MATRIX
                </span>
                <span className="text-xs text-slate-500 font-medium">5 Clearance Tiers</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
                Switch Active Role & Dedicated Portals
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                Inspect how PEHRA partitions critical capabilities — early warning sirens, rescue dispatch, sluice gates, and SDRF funding — across 5 distinct operational identities.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs transition-colors"
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>Sign In / Change Login Method</span>
            </button>
          </div>
        </div>

        {/* Current Active Persona Summary Pill */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-slate-500 font-medium">Currently Active Persona:</span>
            <span
              className={`rounded-lg border px-2.5 py-1 font-semibold ${currentRoleDetail.colorScheme.bg} ${currentRoleDetail.colorScheme.border} ${currentRoleDetail.colorScheme.text}`}
            >
              {currentRoleDetail.title} ({currentRoleDetail.clearanceLevel})
            </span>
            <span className="text-slate-400 font-mono hidden md:inline">User: {currentRoleDetail.demoUser.name}</span>
          </div>

          <button
            onClick={() => onNavigate(currentRoleDetail.portalTab)}
            className="flex items-center gap-1.5 rounded-xl bg-slate-100 border border-[#E5EAF0] px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors"
          >
            <span>Visit Dedicated {currentRoleDetail.portalName}</span>
            <ArrowRight className="h-3.5 w-3.5 text-blue-600" />
          </button>
        </div>
      </div>

      {/* Role View Tabs & Detailed Persona Inspector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Select Role to Inspect & Switch
          </h2>
          <span className="text-xs text-slate-400">Click a tab to view specialized workflows</span>
        </div>

        {/* 5 Segmented Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-1.5 rounded-2xl bg-slate-100 border border-[#E5EAF0]">
          {(Object.keys(ROLES_CONFIG) as UserRole[]).map((roleKey) => {
            const role = ROLES_CONFIG[roleKey];
            const isInspected = selectedInspectionRole === roleKey;
            const isActive = activeRole === roleKey;
            const Icon = getRoleIcon(roleKey);

            return (
              <button
                key={roleKey}
                onClick={() => setSelectedInspectionRole(roleKey)}
                className={`flex items-center justify-between p-2.5 rounded-xl transition-all text-left ${
                  isInspected
                    ? 'bg-white text-slate-900 shadow-xs font-semibold border border-[#E5EAF0]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${isInspected ? 'text-[#2563EB]' : 'text-slate-500'}`} />
                  <div>
                    <div className="text-xs leading-tight font-semibold">{role.shortLabel}</div>
                    <div className="text-[10px] text-slate-400 font-mono">Tier {role.clearanceTier}</div>
                  </div>
                </div>
                {isActive && (
                  <span className="h-2 w-2 rounded-full bg-emerald-500" title="Active Simulated Role" />
                )}
              </button>
            );
          })}
        </div>

        {/* Detailed Inspected Persona Spotlight Card */}
        <div className="rounded-2xl border border-[#E5EAF0] bg-white p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-start gap-3">
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${inspectedRoleDetail.colorScheme.badgeBg}`}>
                {React.createElement(getRoleIcon(selectedInspectionRole), { className: 'h-6 w-6' })}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                    Tier {inspectedRoleDetail.clearanceTier} • {inspectedRoleDetail.clearanceLevel}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{inspectedRoleDetail.department}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{inspectedRoleDetail.title}</h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeRole !== selectedInspectionRole ? (
                <button
                  onClick={() => setActiveRole(selectedInspectionRole)}
                  className="px-4 py-2 rounded-xl bg-slate-100 border border-[#E5EAF0] text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  Activate This Persona
                </button>
              ) : (
                <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Currently Active</span>
                </span>
              )}

              <button
                onClick={() => handleSwitchAndVisit(selectedInspectionRole, inspectedRoleDetail.portalTab)}
                className="px-4 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span>Visit {inspectedRoleDetail.portalName}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">{inspectedRoleDetail.overview}</p>

          {/* Quick Info Matrix for Inspected Role */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] p-3">
              <span className="text-slate-400 text-[10px] block uppercase tracking-wider font-semibold">
                Simulated User
              </span>
              <div className="font-semibold text-slate-900 mt-0.5">{inspectedRoleDetail.demoUser.name}</div>
              <span className="text-[11px] text-slate-500">{inspectedRoleDetail.demoUser.designation}</span>
            </div>

            <div className="rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] p-3">
              <span className="text-slate-400 text-[10px] block uppercase tracking-wider font-semibold">
                Authentication Way
              </span>
              <div className="font-semibold text-slate-900 mt-0.5">{inspectedRoleDetail.loginMethod.name}</div>
              <span className="text-[11px] text-slate-500">{inspectedRoleDetail.loginMethod.description}</span>
            </div>

            <div className="rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] p-3">
              <span className="text-slate-400 text-[10px] block uppercase tracking-wider font-semibold">
                Dedicated View Page
              </span>
              <div className="font-semibold text-blue-700 mt-0.5">{inspectedRoleDetail.portalName}</div>
              <button
                onClick={() => handleSwitchAndVisit(selectedInspectionRole, inspectedRoleDetail.portalTab)}
                className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
              >
                <span>Open view directly &rarr;</span>
              </button>
            </div>
          </div>

          {/* Dedicated Sub-Pages to Visit for this Role */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-700 block mb-2">
              Recommended Workflows & View Pages for {inspectedRoleDetail.shortLabel}:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {selectedInspectionRole === 'CITIZEN' && (
                <>
                  <button
                    onClick={() => { setActiveRole('CITIZEN'); onNavigate('citizen-portal'); }}
                    className="p-2.5 rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] hover:bg-slate-100 text-left font-medium text-slate-700 transition-colors"
                  >
                    🏠 Citizen Dashboard
                  </button>
                  <button
                    onClick={() => { setActiveRole('CITIZEN'); onNavigate('reports'); }}
                    className="p-2.5 rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] hover:bg-slate-100 text-left font-medium text-slate-700 transition-colors"
                  >
                    📸 Submit Flood Photo
                  </button>
                  <button
                    onClick={() => { setActiveRole('CITIZEN'); onNavigate('evacuation'); }}
                    className="p-2.5 rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] hover:bg-slate-100 text-left font-medium text-slate-700 transition-colors"
                  >
                    🏃 Safe Evacuation Routes
                  </button>
                  <button
                    onClick={() => { setActiveRole('CITIZEN'); onNavigate('map'); }}
                    className="p-2.5 rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] hover:bg-slate-100 text-left font-medium text-slate-700 transition-colors"
                  >
                    🗺️ Ward Flood Inundation
                  </button>
                </>
              )}

              {selectedInspectionRole === 'RESPONDER' && (
                <>
                  <button
                    onClick={() => { setActiveRole('RESPONDER'); onNavigate('responder-portal'); }}
                    className="p-2.5 rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] hover:bg-slate-100 text-left font-medium text-slate-700 transition-colors"
                  >
                    🚒 Tactical Dispatch Desk
                  </button>
                  <button
                    onClick={() => { setActiveRole('RESPONDER'); onNavigate('incidents'); }}
                    className="p-2.5 rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] hover:bg-slate-100 text-left font-medium text-slate-700 transition-colors"
                  >
                    ⚠️ Incident Response Log
                  </button>
                  <button
                    onClick={() => { setActiveRole('RESPONDER'); onNavigate('evacuation'); }}
                    className="p-2.5 rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] hover:bg-slate-100 text-left font-medium text-slate-700 transition-colors"
                  >
                    🧭 Corridor Road Status
                  </button>
                  <button
                    onClick={() => { setActiveRole('RESPONDER'); onNavigate('map'); }}
                    className="p-2.5 rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] hover:bg-slate-100 text-left font-medium text-slate-700 transition-colors"
                  >
                    🌊 3D High Ground Map
                  </button>
                </>
              )}

              {selectedInspectionRole === 'AUTHORITY' && (
                <>
                  <button
                    onClick={() => { setActiveRole('AUTHORITY'); onNavigate('authority-portal'); }}
                    className="p-2.5 rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] hover:bg-slate-100 text-left font-medium text-slate-700 transition-colors"
                  >
                    🏛️ EOC Command Center
                  </button>
                  <button
                    onClick={() => { setActiveRole('AUTHORITY'); onNavigate('alerts'); }}
                    className="p-2.5 rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] hover:bg-slate-100 text-left font-medium text-slate-700 transition-colors"
                  >
                    📢 Broadcast Siren / Alert
                  </button>
                  <button
                    onClick={() => { setActiveRole('AUTHORITY'); onNavigate('water-levels'); }}
                    className="p-2.5 rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] hover:bg-slate-100 text-left font-medium text-slate-700 transition-colors"
                  >
                    💧 Sluice Gate Control
                  </button>
                  <button
                    onClick={() => { setActiveRole('AUTHORITY'); onNavigate('ai-intel'); }}
                    className="p-2.5 rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] hover:bg-slate-100 text-left font-medium text-slate-700 transition-colors"
                  >
                    🤖 IITB Hydrology AI
                  </button>
                </>
              )}

              {selectedInspectionRole === 'ADMIN' && (
                <>
                  <button
                    onClick={() => { setActiveRole('ADMIN'); onNavigate('admin'); }}
                    className="p-2.5 rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] hover:bg-slate-100 text-left font-medium text-slate-700 transition-colors"
                  >
                    ⚙️ Telemetry Mesh Cluster
                  </button>
                  <button
                    onClick={() => { setActiveRole('ADMIN'); onNavigate('simulation'); }}
                    className="p-2.5 rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] hover:bg-slate-100 text-left font-medium text-slate-700 transition-colors"
                  >
                    🧪 What-If Cloudburst Sim
                  </button>
                  <button
                    onClick={() => { setActiveRole('ADMIN'); onNavigate('water-levels'); }}
                    className="p-2.5 rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] hover:bg-slate-100 text-left font-medium text-slate-700 transition-colors"
                  >
                    📡 Sensor Calibration
                  </button>
                  <button
                    onClick={() => { setActiveRole('ADMIN'); onNavigate('replay'); }}
                    className="p-2.5 rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] hover:bg-slate-100 text-left font-medium text-slate-700 transition-colors"
                  >
                    ⏪ Historical Deluge Replay
                  </button>
                </>
              )}

              {selectedInspectionRole === 'SUPER_ADMIN' && (
                <>
                  <button
                    onClick={() => { setActiveRole('SUPER_ADMIN'); onNavigate('super-admin-portal'); }}
                    className="p-2.5 rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] hover:bg-slate-100 text-left font-medium text-slate-700 transition-colors"
                  >
                    👑 Apex Mantralaya War Room
                  </button>
                  <button
                    onClick={() => { setActiveRole('SUPER_ADMIN'); onNavigate('alerts'); }}
                    className="p-2.5 rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] hover:bg-slate-100 text-left font-medium text-slate-700 transition-colors"
                  >
                    🚨 State Disaster Red Alert
                  </button>
                  <button
                    onClick={() => { setActiveRole('SUPER_ADMIN'); onNavigate('dashboard'); }}
                    className="p-2.5 rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] hover:bg-slate-100 text-left font-medium text-slate-700 transition-colors"
                  >
                    📊 All-MMR Risk Overview
                  </button>
                  <button
                    onClick={() => { setActiveRole('SUPER_ADMIN'); onNavigate('ai-intel'); }}
                    className="p-2.5 rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] hover:bg-slate-100 text-left font-medium text-slate-700 transition-colors"
                  >
                    🧠 Executive Strategic AI
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5 Distinct Role Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            All 5 Operational Personas Summary
          </h2>
          <span className="text-xs text-slate-400">Click any card to switch active role</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Object.keys(ROLES_CONFIG) as UserRole[]).map((roleKey) => {
            const role = ROLES_CONFIG[roleKey];
            const isCurrent = activeRole === roleKey;
            const Icon = getRoleIcon(roleKey);

            return (
              <div
                key={roleKey}
                className={`rounded-2xl border p-5 flex flex-col justify-between transition-all bg-white shadow-xs ${
                  isCurrent
                    ? 'border-[#2563EB] ring-1 ring-[#2563EB]/30'
                    : 'border-[#E5EAF0] hover:border-slate-300'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`flex h-9 w-9 items-center justify-center rounded-xl border ${role.colorScheme.badgeBg}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400">
                          Tier {role.clearanceTier} Clearance
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm">{role.title}</h3>
                      </div>
                    </div>

                    {isCurrent && (
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[9px] font-mono font-bold text-emerald-700">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-3">{role.overview}</p>

                  <div className="rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] p-2.5 space-y-1 text-[11px]">
                    <div className="text-slate-500">
                      Login: <strong className="text-slate-800">{role.loginMethod.name}</strong>
                    </div>
                    <div className="text-slate-500 truncate">
                      User: <strong className="text-slate-800">{role.demoUser.name}</strong>
                    </div>
                    <div className="text-slate-500">
                      Department: <strong className="text-slate-800">{role.department}</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => setActiveRole(roleKey)}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition-colors ${
                      isCurrent
                        ? 'bg-slate-100 text-slate-500 border border-[#E5EAF0]'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isCurrent ? 'Current' : 'Switch Role'}
                  </button>

                  <button
                    onClick={() => handleSwitchAndVisit(roleKey, role.portalTab)}
                    className="py-1.5 px-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs"
                    title={`Visit ${role.portalName}`}
                  >
                    <span>Visit Portal</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Permission Guard Sandbox */}
      <div className="rounded-2xl border border-[#E5EAF0] bg-white p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              <span>Interactive RBAC Permission Guard Sandbox</span>
            </h3>
            <p className="text-xs text-slate-500">
              Test how the security policy engine guards high-stakes municipal capabilities against unauthorized tiers.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Active: <strong className="text-blue-700 font-bold">{currentRoleDetail.title}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          <button
            onClick={() => handleTestPermission('Submit Field Flood Photo', 'CITIZEN', 0)}
            className="rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] p-3 text-left hover:border-slate-300 hover:bg-white transition-all shadow-xs"
          >
            <div className="font-semibold text-slate-900">1. Submit Flood Photo</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Tier 0 (Citizen & Above)</div>
          </button>

          <button
            onClick={() => handleTestPermission('Deploy Dewatering Pump / Boat', 'RESPONDER', 1)}
            className="rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] p-3 text-left hover:border-slate-300 hover:bg-white transition-all shadow-xs"
          >
            <div className="font-semibold text-slate-900">2. Deploy Rescue Boat</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Tier 1 (Responder & Above)</div>
          </button>

          <button
            onClick={() => handleTestPermission('Broadcast Official Warning Siren', 'AUTHORITY', 2)}
            className="rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] p-3 text-left hover:border-slate-300 hover:bg-white transition-all shadow-xs"
          >
            <div className="font-semibold text-slate-900">3. Broadcast Red Alert</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Tier 2 (Authority & Above)</div>
          </button>

          <button
            onClick={() => handleTestPermission('Sanction ₹50 Cr SDRF Treasury Funds', 'SUPER_ADMIN', 4)}
            className="rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] p-3 text-left hover:border-slate-300 hover:bg-white transition-all shadow-xs"
          >
            <div className="font-semibold text-slate-900">4. Sanction SDRF Funds</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Tier 4 (Super Admin Only)</div>
          </button>
        </div>

        {testResult && (
          <div
            className={`rounded-xl border p-4 text-xs flex items-start gap-3 transition-all ${
              testResult.allowed
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                : 'border-rose-200 bg-rose-50 text-rose-900'
            }`}
          >
            {testResult.allowed ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5">
              <div className="font-bold text-xs uppercase tracking-wider">
                {testResult.allowed ? 'Action Authorized' : 'Access Denied: 403 Forbidden'}
              </div>
              <div className="text-[11px] leading-relaxed">{testResult.reason}</div>
            </div>
          </div>
        )}
      </div>

      {/* Permissions Comparison Matrix */}
      <div className="rounded-2xl border border-[#E5EAF0] bg-white p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Comprehensive Capabilities & Permissions Matrix</h3>
            <p className="text-xs text-slate-500">Side-by-side privilege comparison across all 5 operational tiers.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E5EAF0] text-slate-500 font-medium text-[11px] bg-[#F8FAFC]">
                <th className="py-2.5 px-3">Operational Capability</th>
                <th className="py-2.5 px-2 text-center">Citizen</th>
                <th className="py-2.5 px-2 text-center">Responder</th>
                <th className="py-2.5 px-2 text-center">Authority</th>
                <th className="py-2.5 px-2 text-center">Admin</th>
                <th className="py-2.5 px-2 text-center">Super Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PERMISSION_MATRIX_ROWS.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-800">{row.capability}</div>
                    <div className="text-[11px] text-slate-500">{row.description}</div>
                  </td>

                  <td className="py-2.5 px-2 text-center">
                    {row.CITIZEN ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" />
                    ) : (
                      <XCircle className="h-4 w-4 text-slate-300 mx-auto" />
                    )}
                  </td>

                  <td className="py-2.5 px-2 text-center">
                    {row.RESPONDER ? (
                      <CheckCircle2 className="h-4 w-4 text-blue-600 mx-auto" />
                    ) : (
                      <XCircle className="h-4 w-4 text-slate-300 mx-auto" />
                    )}
                  </td>

                  <td className="py-2.5 px-2 text-center">
                    {row.AUTHORITY ? (
                      <CheckCircle2 className="h-4 w-4 text-amber-600 mx-auto" />
                    ) : (
                      <XCircle className="h-4 w-4 text-slate-300 mx-auto" />
                    )}
                  </td>

                  <td className="py-2.5 px-2 text-center">
                    {row.ADMIN ? (
                      <CheckCircle2 className="h-4 w-4 text-purple-600 mx-auto" />
                    ) : (
                      <XCircle className="h-4 w-4 text-slate-300 mx-auto" />
                    )}
                  </td>

                  <td className="py-2.5 px-2 text-center">
                    {row.SUPER_ADMIN ? (
                      <CheckCircle2 className="h-4 w-4 text-rose-600 mx-auto" />
                    ) : (
                      <XCircle className="h-4 w-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
