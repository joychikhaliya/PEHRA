import React from 'react';
import {
  User,
  Shield,
  Phone,
  Mail,
  MapPin,
  Settings,
  ChevronRight,
  LogOut,
  AlertCircle,
  HelpCircle,
  Eye,
} from 'lucide-react';
import { UserProfile } from '../../data/pehraData.ts';

interface PehraProfileScreenProps {
  user: UserProfile;
  onNavigateTab: (tab: string) => void;
  onLogout: () => void;
}

export const PehraProfileScreen: React.FC<PehraProfileScreenProps> = ({
  user,
  onNavigateTab,
  onLogout,
}) => {
  return (
    <div className="p-5 max-w-lg mx-auto bg-[#F7F7F4] text-[#1E252B] space-y-6 animate-fadeIn">
      {/* Profile Header */}
      <div className="bg-white border border-[#E5E5DF] rounded-xl p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#EFEFEA] border border-[#E5E5DF] flex items-center justify-center text-[#1B3B48] shrink-0">
          <User className="w-6 h-6 stroke-[1.8px]" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold tracking-tight text-[#1E252B] truncate">
              {user.name}
            </h1>
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-[#EFEFEA] text-[#1B3B48]">
              {user.badgeId}
            </span>
          </div>

          <p className="text-xs text-[#555E68] mt-0.5">{user.title}</p>
          <p className="text-[11px] text-[#6B727A] flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-[#1B3B48]" />
            <span>{user.sector}</span>
          </p>
        </div>
      </div>

      {/* Contact & Assignment Info with subtle dividers */}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold text-[#1E252B] uppercase tracking-wider">
          Official Officer Details
        </h2>

        <div className="bg-white border border-[#E5E5DF] rounded-xl overflow-hidden divide-y divide-[#EFEFEA]">
          <div className="p-3.5 flex items-center justify-between text-xs">
            <span className="text-[#6B727A] flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#858D95]" />
              Official Email
            </span>
            <span className="font-medium text-[#1E252B]">{user.email}</span>
          </div>

          <div className="p-3.5 flex items-center justify-between text-xs">
            <span className="text-[#6B727A] flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#858D95]" />
              Direct Handset
            </span>
            <span className="font-medium text-[#1E252B] font-mono">{user.phone}</span>
          </div>

          <div className="p-3.5 flex items-center justify-between text-xs">
            <span className="text-[#6B727A] flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-[#858D95]" />
              Officer Rank
            </span>
            <span className="font-medium text-[#1E252B]">Lead Field Responder</span>
          </div>
        </div>
      </section>

      {/* Emergency Contact */}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold text-[#1E252B] uppercase tracking-wider">
          Personal Emergency Contact
        </h2>

        <div className="bg-white border border-[#E5E5DF] rounded-xl p-3.5 text-xs flex items-center justify-between">
          <div>
            <span className="font-medium text-[#1E252B] block">
              {user.emergencyContact.name} ({user.emergencyContact.relationship})
            </span>
            <span className="text-[11px] text-[#6B727A] font-mono mt-0.5 block">
              {user.emergencyContact.phone}
            </span>
          </div>

          <a
            href={`tel:${user.emergencyContact.phone}`}
            className="px-2.5 py-1 bg-[#EFEFEA] hover:bg-[#E5E5DF] text-[#1E252B] rounded border border-[#E5E5DF] text-xs font-medium transition-colors"
          >
            Call
          </a>
        </div>
      </section>

      {/* Quick Navigation Links */}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold text-[#1E252B] uppercase tracking-wider">
          System & Tools
        </h2>

        <div className="bg-white border border-[#E5E5DF] rounded-xl overflow-hidden divide-y divide-[#EFEFEA]">
          <button
            onClick={() => onNavigateTab('settings')}
            className="w-full p-3.5 hover:bg-[#FBFBF9] transition-colors flex items-center justify-between text-xs text-left"
          >
            <span className="flex items-center gap-2 font-medium text-[#1E252B]">
              <Settings className="w-3.5 h-3.5 text-[#6B727A]" />
              Account & Operational Settings
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#C5C5BD]" />
          </button>

          <button
            onClick={() => onNavigateTab('empty-state')}
            className="w-full p-3.5 hover:bg-[#FBFBF9] transition-colors flex items-center justify-between text-xs text-left"
          >
            <span className="flex items-center gap-2 font-medium text-[#1E252B]">
              <Eye className="w-3.5 h-3.5 text-[#6B727A]" />
              View Empty State Pattern
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#C5C5BD]" />
          </button>

          <button
            onClick={() => onNavigateTab('loading-error')}
            className="w-full p-3.5 hover:bg-[#FBFBF9] transition-colors flex items-center justify-between text-xs text-left"
          >
            <span className="flex items-center gap-2 font-medium text-[#1E252B]">
              <AlertCircle className="w-3.5 h-3.5 text-[#6B727A]" />
              View Loading & Error States
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#C5C5BD]" />
          </button>
        </div>
      </section>

      {/* Sign Out Button */}
      <div className="pt-2">
        <button
          onClick={onLogout}
          className="w-full py-2.5 px-4 bg-[#EFEFEA] hover:bg-[#E5E5DF] text-[#BA3D3B] text-xs font-medium rounded-lg border border-[#E5E5DF] transition-colors flex items-center justify-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out / Change Officer Account</span>
        </button>
      </div>
    </div>
  );
};
