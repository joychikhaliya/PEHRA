import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  BellRing,
  Flame,
  Activity,
  ClipboardList,
  LifeBuoy,
  Building2,
  LineChart,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Radio,
  Plane,
  CheckSquare,
  Landmark,
} from 'lucide-react';
import { UserRole } from '../types/index.ts';
import { PehraLogo } from './PehraLogo.tsx';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  activeRole: UserRole;
  activeAlertsCount: number;
  dangerWaterLevelsCount?: number;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  activeRole,
  activeAlertsCount,
  dangerWaterLevelsCount,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  // Define strictly segregated navigation items per portal:
  const getNavItemsForRole = (role: UserRole) => {
    switch (role) {
      case 'CITIZEN':
        return [
          { id: 'dashboard', label: 'Safety Overview', icon: LayoutDashboard },
          { id: 'map', label: 'Live Flood Map', icon: MapPin },
          { id: 'survival-checklist', label: 'Survival Checklist', icon: CheckSquare },
          { id: 'reports', label: 'Report Flooding', icon: ClipboardList },
          { id: 'evacuation', label: 'Safe Shelters', icon: LifeBuoy },
          { id: 'alerts', label: 'Safety Warnings', icon: BellRing, badge: activeAlertsCount },
        ];

      case 'RESPONDER':
        return [
          { id: 'responder-portal', label: 'Rescue Command', icon: Flame },
          { id: 'map', label: 'Operations Map', icon: MapPin },
          { id: 'drone-recon', label: 'Drone Live Recon', icon: Plane },
          { id: 'incidents', label: 'Field Incidents', icon: Activity },
          { id: 'reports', label: 'Verify Reports', icon: ClipboardList },
          { id: 'evacuation', label: 'Hospital Beds', icon: Building2 },
        ];

      case 'SUPER_ADMIN':
      default:
        return [
          { id: 'super-admin-portal', label: 'Crisis War Room', icon: Landmark },
          { id: 'map', label: 'GIS Command Map', icon: MapPin },
          { id: 'drone-recon', label: 'Drone Fleet Recon', icon: Plane },
          { id: 'alerts', label: 'Early Warnings', icon: BellRing, badge: activeAlertsCount },
          { id: 'water-levels', label: 'Hydrological Telemetry', icon: LineChart, badge: dangerWaterLevelsCount },
          { id: 'evacuation', label: 'Shelters & Assets', icon: LifeBuoy },
        ];
    }
  };

  const navItems = getNavItemsForRole(activeRole);

  const handleNavClick = (id: string) => {
    setCurrentTab(id);
    if (isMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      {/* 1. DESKTOP COMPACT FLOATING SIDEBAR */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 rounded-[24px] border border-[#E2EAED] bg-white p-2.5 shadow-xs transition-all duration-200 select-none ${
          isCollapsed ? 'w-16' : 'w-56'
        }`}
      >
        {/* Top Logo & Collapse Toggle */}
        <div className="flex items-center justify-between px-1.5 py-2 mb-2 border-b border-[#E2EAED]/60">
          <PehraLogo size={32} showText={!isCollapsed} />
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1 rounded-lg text-[#6B7C83] hover:text-[#17242A] hover:bg-[#EEF6F7] transition-colors"
              title="Collapse sidebar"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
          )}
          {isCollapsed && (
            <button
              onClick={() => setIsCollapsed(false)}
              className="mx-auto mt-2 p-1 rounded-lg text-[#6B7C83] hover:text-[#17242A] hover:bg-[#EEF6F7] transition-colors"
              title="Expand sidebar"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Portal Station Identity Tag */}
        {!isCollapsed && (
          <div className="px-2 py-1 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase text-[#6B7C83]">
              {activeRole === 'CITIZEN' ? 'Citizen Resident' : activeRole === 'RESPONDER' ? 'Tactical Rescuer' : 'Super Admin'}
            </span>
          </div>
        )}

        {/* Navigation list */}
        <div className="flex-1 space-y-1 overflow-y-auto no-scrollbar py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id || (item.id === 'dashboard' && currentTab === 'landing');

            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => handleNavClick(item.id)}
                  id={`nav-btn-${item.id}`}
                  className={`flex w-full items-center rounded-2xl transition-all duration-150 relative ${
                    isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
                  } ${
                    isActive
                      ? 'bg-[#DDF8F6] text-[#18B7A0] font-bold shadow-xs'
                      : 'text-[#6B7C83] hover:bg-[#EEF6F7] hover:text-[#17242A]'
                  }`}
                >
                  <Icon
                    className={`h-4.5 w-4.5 shrink-0 transition-colors ${
                      isActive ? 'text-[#18B7A0]' : 'text-[#6B7C83] group-hover:text-[#17242A]'
                    }`}
                  />

                  {!isCollapsed && (
                    <div className="flex flex-1 items-center justify-between overflow-hidden text-xs">
                      <span className="truncate">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="ml-2 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-rose-50 border border-rose-200 px-1 text-[10px] font-bold text-rose-600">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Badge in collapsed mode */}
                  {isCollapsed && item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 text-white text-[9px] font-bold shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </button>

                {/* Floating tooltip on hover when collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 hidden group-hover:flex items-center rounded-xl bg-[#17242A] text-white px-2.5 py-1 text-xs font-medium shadow-md whitespace-nowrap pointer-events-none animate-in fade-in">
                    {item.label}
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="ml-1.5 rounded-full bg-rose-500 text-white px-1 text-[9px] font-bold">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Station Status Pill */}
        <div className="pt-2 border-t border-[#E2EAED]/60 mt-auto">
          {!isCollapsed ? (
            <div className="rounded-xl bg-[#EEF6F7] p-2.5 text-xs text-[#17242A] flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <span className="h-2 w-2 rounded-full bg-[#18B7A0] animate-pulse shrink-0" />
                <span className="truncate font-semibold text-[11px]">Real Telemetry Grid</span>
              </div>
              <Radio className="h-3.5 w-3.5 text-[#18B7A0] shrink-0" />
            </div>
          ) : (
            <div className="flex justify-center py-1">
              <span className="h-2.5 w-2.5 rounded-full bg-[#18B7A0] animate-pulse" title="Real Telemetry Grid" />
            </div>
          )}
        </div>
      </aside>

      {/* 2. MOBILE DRAWER NAVIGATION */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative flex w-64 max-w-[80%] flex-1 flex-col bg-white p-4 shadow-xl border-r border-[#E2EAED]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2EAED]">
              <PehraLogo size={28} />
              <button
                onClick={() => setIsMobileOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 space-y-1 overflow-y-auto py-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#DDF8F6] text-[#18B7A0] font-bold'
                        : 'text-[#6B7C83] hover:bg-[#EEF6F7] hover:text-[#17242A]'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="ml-auto rounded-full bg-rose-50 border border-rose-200 px-1.5 py-0.5 text-[10px] font-bold text-rose-600">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
