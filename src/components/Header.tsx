import React, { useState } from 'react';
import {
  Search,
  BellRing,
  PhoneCall,
  Menu,
  Globe,
  LogOut,
  User,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { UserRole } from '../types/index.ts';
import { useBatteryStatus } from '../hooks/useBatteryStatus.ts';
import { BatteryAlertPill } from './BatteryAlertPill.tsx';
import { PehraLogo } from './PehraLogo.tsx';
import { Language, TRANSLATIONS } from '../utils/i18n.ts';
import { ROLES_CONFIG } from '../data/rolesData.ts';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  activeRole: UserRole;
  setActiveRole?: (role: UserRole) => void;
  activeAlertsCount: number;
  dangerWaterLevelsCount?: number;
  sourceFreshnessSec: number;
  isOnline: boolean;
  language?: Language;
  onToggleLanguage?: () => void;
  onOpenLogin?: () => void;
  onOpenMobileSidebar?: () => void;
  onSearch?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  activeRole,
  activeAlertsCount,
  sourceFreshnessSec,
  isOnline,
  language = 'en',
  onToggleLanguage,
  onOpenLogin,
  onOpenMobileSidebar,
  onSearch,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const batteryStatus = useBatteryStatus();
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const currentRoleInfo = ROLES_CONFIG[activeRole] || ROLES_CONFIG.CITIZEN;

  const roleStyles: Record<
    string,
    { bg: string; text: string; label: string; dotColor: string }
  > = {
    CITIZEN: {
      bg: 'bg-emerald-50 border-emerald-200',
      text: 'text-emerald-800',
      label: 'Citizen Resident',
      dotColor: 'bg-emerald-500',
    },
    RESPONDER: {
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-800',
      label: 'NDRF Rescuer',
      dotColor: 'bg-blue-500',
    },
    SUPER_ADMIN: {
      bg: 'bg-rose-50 border-rose-200',
      text: 'text-rose-800',
      label: 'Super Admin',
      dotColor: 'bg-rose-500',
    },
  };

  const style = roleStyles[activeRole] || roleStyles.CITIZEN;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleSignOut = () => {
    setProfileOpen(false);
    if (onOpenLogin) {
      onOpenLogin();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2EAED] px-4 sm:px-6 py-2.5 transition-all">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Mobile Menu + PEHRA Logo */}
        <div className="flex items-center gap-3">
          {onOpenMobileSidebar && (
            <button
              onClick={onOpenMobileSidebar}
              aria-label="Open Navigation Menu"
              className="lg:hidden flex h-8 w-8 items-center justify-center rounded-xl border border-[#E2EAED] bg-[#F5F8FA] text-[#6B7C83] hover:text-[#17242A]"
            >
              <Menu className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={() => {
              if (activeRole === 'CITIZEN') setCurrentTab('dashboard');
              else if (activeRole === 'RESPONDER') setCurrentTab('responder-portal');
              else setCurrentTab('super-admin-portal');
            }}
            className="flex items-center text-left focus:outline-none"
          >
            <PehraLogo size={32} showText={true} />
          </button>
        </div>

        {/* Center: Search Box */}
        <div className="flex-1 max-w-md mx-2 sm:mx-6">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6B7C83] pointer-events-none" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 rounded-full bg-[#F5F8FA] pl-9 pr-4 text-xs text-[#17242A] border border-[#E2EAED] placeholder:text-[#6B7C83] focus:bg-white focus:border-[#18B7A0] focus:ring-2 focus:ring-[#DDF8F6] focus:outline-none transition-all"
            />
          </form>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Real-time certified sensor status pill */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-[#DDF8F6] border border-[#35C9D0]/30 px-3 py-1 text-xs font-semibold text-[#18B7A0] select-none">
            <span className="h-2 w-2 rounded-full bg-[#18B7A0] animate-pulse" />
            <span className="tracking-tight text-[11px] uppercase">
              {isOnline ? 'SENSORS LIVE' : 'OFFLINE CACHED'}
            </span>
          </div>

          {/* Battery Percentage Shower Indicator */}
          <BatteryAlertPill battery={batteryStatus} />

          {/* Language Toggle: EN / मराठी */}
          {onToggleLanguage && (
            <button
              onClick={onToggleLanguage}
              className="flex items-center gap-1 rounded-full border border-[#E2EAED] bg-[#F5F8FA] px-2.5 py-1 text-xs font-semibold text-[#17242A] hover:bg-[#EEF6F7] hover:border-[#18B7A0] transition-colors"
              title="Toggle Language: English / मराठी"
            >
              <Globe className="h-3.5 w-3.5 text-[#18B7A0]" />
              <span className="text-[11px]">{language === 'en' ? 'मराठी' : 'EN'}</span>
            </button>
          )}

          {/* Hotline 1916 */}
          <a
            href="tel:1916"
            className="hidden md:flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-100 transition-colors"
            title="MCGM Emergency Helpline 1916"
          >
            <PhoneCall className="h-3 w-3" />
            <span>1916</span>
          </a>

          {/* Alerts Bell */}
          <button
            onClick={() => setCurrentTab('alerts')}
            className="relative flex h-8 w-8 items-center justify-center rounded-full border border-[#E2EAED] bg-[#F5F8FA] text-[#6B7C83] hover:text-[#17242A] hover:bg-white transition-colors"
            title="Active Alerts & Warnings"
          >
            <BellRing className="h-4 w-4" />
            {activeAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#E65A68] text-white px-1 text-[9px] font-bold shadow-xs">
                {activeAlertsCount}
              </span>
            )}
          </button>

          {/* Clean Direct Sign Out Button (No Role Dropdown Option) */}
          {onOpenLogin && (
            <button
              onClick={handleSignOut}
              id="header-signout-btn"
              className="flex items-center gap-1.5 rounded-full border border-[#E2EAED] bg-[#F5F8FA] hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 px-3 py-1.5 text-xs font-semibold text-[#17242A] transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
