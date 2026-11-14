import React from 'react';
import {
  ShieldCheck,
  Clock,
  ChevronRight,
  Plus,
  AlertTriangle,
  FileText,
  MapPin,
} from 'lucide-react';
import {
  ActivityItem,
  UpcomingItem,
  UserProfile,
} from '../../data/pehraData.ts';

interface PehraHomeScreenProps {
  user: UserProfile;
  activities: ActivityItem[];
  upcoming: UpcomingItem[];
  onNavigateTab: (tab: string) => void;
  onSelectActivity: (item: ActivityItem) => void;
  onOpenCreate: () => void;
}

export const PehraHomeScreen: React.FC<PehraHomeScreenProps> = ({
  user,
  activities,
  upcoming,
  onNavigateTab,
  onSelectActivity,
  onOpenCreate,
}) => {
  // Get time of day for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getStatusBadge = (status: ActivityItem['status']) => {
    switch (status) {
      case 'Completed':
      case 'Resolved':
        return 'text-[#3B755D] bg-[#3B755D]/10';
      case 'In Review':
      case 'Pending':
        return 'text-[#B47834] bg-[#B47834]/10';
      case 'Flagged':
        return 'text-[#BA3D3B] bg-[#BA3D3B]/10';
      default:
        return 'text-[#6B727A] bg-[#EFEFEA]';
    }
  };

  return (
    <div className="p-5 max-w-lg mx-auto bg-[#F7F7F4] text-[#1E252B] space-y-7 animate-fadeIn">
      {/* 1. Header: Greeting and User Name */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs text-[#6B727A] font-normal tracking-wide">
            {getGreeting()}
          </span>
          <h1 className="text-xl font-semibold tracking-tight text-[#1E252B] mt-0.5">
            {user.name}
          </h1>
          <p className="text-xs text-[#6B727A] mt-0.5">
            {user.sector}
          </p>
        </div>

        <button
          onClick={onOpenCreate}
          id="home-create-log-btn"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1B3B48] hover:bg-[#152E38] text-white text-xs font-medium rounded-lg transition-colors shadow-xs active:translate-y-[0.5px]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Log</span>
        </button>
      </div>

      {/* 2. Primary Information Section: Today's Overview (Clean flat surface, no floating card) */}
      <section className="bg-white border border-[#E5E5DF] rounded-xl p-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#EFEFEA]">
          <span className="text-xs font-semibold text-[#1E252B] uppercase tracking-wider">
            Today's Overview
          </span>
          <span className="text-[11px] text-[#3B755D] font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B755D]" />
            Perimeter Normal
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-3 text-left">
          <div>
            <span className="text-[11px] text-[#6B727A] block">Rounds Done</span>
            <span className="text-lg font-semibold text-[#1E252B] tracking-tight">
              3 of 4
            </span>
            <span className="text-[10px] text-[#6B727A] block mt-0.5">75% complete</span>
          </div>

          <div>
            <span className="text-[11px] text-[#6B727A] block">Open Issues</span>
            <span className="text-lg font-semibold text-[#1E252B] tracking-tight">
              1 pending
            </span>
            <span className="text-[10px] text-[#B47834] block mt-0.5">Station Culvert</span>
          </div>

          <div>
            <span className="text-[11px] text-[#6B727A] block">High Tide Lock</span>
            <span className="text-lg font-semibold text-[#1E252B] tracking-tight">
              19:42 IST
            </span>
            <span className="text-[10px] text-[#6B727A] block mt-0.5">4.45m Datum</span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-[#EFEFEA] flex items-center justify-between text-xs">
          <span className="text-[#6B727A] text-[11px]">
            Next scheduled patrol round: <strong>21:00</strong>
          </span>
          <button
            onClick={() => onNavigateTab('rounds')}
            className="text-[11px] font-medium text-[#1B3B48] hover:underline flex items-center gap-0.5"
          >
            <span>View Round</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </section>

      {/* 3. Recent Activity (Clean list with dividers, NOT floating cards) */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-[#1E252B] uppercase tracking-wider">
            Recent Activity
          </h2>
          <button
            onClick={() => onNavigateTab('activity')}
            className="text-xs text-[#6B727A] hover:text-[#1E252B] transition-colors"
          >
            View all ({activities.length})
          </button>
        </div>

        <div className="bg-white border border-[#E5E5DF] rounded-xl overflow-hidden divide-y divide-[#EFEFEA]">
          {activities.slice(0, 4).map((act) => (
            <div
              key={act.id}
              onClick={() => onSelectActivity(act)}
              className="p-3.5 hover:bg-[#FBFBF9] transition-colors cursor-pointer flex items-center justify-between gap-3 text-left"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-medium text-[#1E252B] truncate">
                    {act.title}
                  </span>
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${getStatusBadge(
                      act.status
                    )}`}
                  >
                    {act.status}
                  </span>
                </div>
                <p className="text-[11px] text-[#6B727A] truncate">
                  {act.location} · by {act.author}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] text-[#858D95] font-mono block">
                  {act.time}
                </span>
                <span className="text-[10px] text-[#6B727A] block">
                  {act.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Upcoming Section (List with dividers) */}
      <section className="space-y-2 pb-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-[#1E252B] uppercase tracking-wider">
            Upcoming
          </h2>
          <span className="text-xs text-[#6B727A]">Next 24 hours</span>
        </div>

        <div className="bg-white border border-[#E5E5DF] rounded-xl overflow-hidden divide-y divide-[#EFEFEA]">
          {upcoming.map((up) => (
            <div
              key={up.id}
              className="p-3.5 hover:bg-[#FBFBF9] transition-colors flex items-center justify-between gap-3 text-left"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-[#1E252B] truncate">
                  {up.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#6B727A]">
                  <span className="truncate">{up.location}</span>
                  <span>·</span>
                  <span className="text-[#1B3B48] font-medium">{up.type}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-medium text-[#1E252B] font-mono block">
                  {up.time}
                </span>
                <span className="text-[10px] text-[#858D95] block">
                  {up.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Sector Emergency Quick Contact (Quiet, practical link) */}
      <div className="p-3 bg-[#EFEFEA] rounded-lg border border-[#E5E5DF] flex items-center justify-between text-xs text-[#555E68]">
        <div>
          <span className="font-medium text-[#1E252B] block">Sector 4 Disaster Liaison</span>
          <span className="text-[11px] text-[#6B727A]">MCGM Ward H-West Control Room: 1916</span>
        </div>
        <a
          href="tel:1916"
          className="px-2.5 py-1 bg-white border border-[#D5D5CD] rounded text-xs font-medium text-[#1E252B] hover:bg-[#F7F7F4] transition-colors"
        >
          Call 1916
        </a>
      </div>
    </div>
  );
};
