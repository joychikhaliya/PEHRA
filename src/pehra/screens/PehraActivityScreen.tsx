import React, { useState } from 'react';
import {
  Clock,
  Filter,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Wrench,
  ChevronRight,
} from 'lucide-react';
import { ActivityItem } from '../../data/pehraData.ts';

interface PehraActivityScreenProps {
  activities: ActivityItem[];
  onSelectActivity: (item: ActivityItem) => void;
  onOpenCreate: () => void;
}

export const PehraActivityScreen: React.FC<PehraActivityScreenProps> = ({
  activities,
  onSelectActivity,
  onOpenCreate,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const categories = [
    { id: 'ALL', label: 'All Activity' },
    { id: 'CHECKPOINT', label: 'Checkpoints' },
    { id: 'INCIDENT', label: 'Incidents' },
    { id: 'SAFETY', label: 'Safety' },
    { id: 'ROUTINE', label: 'Routine' },
  ];

  const filtered = activities.filter(
    (act) => filterCategory === 'ALL' || act.category === filterCategory
  );

  // Group by date
  const todayItems = filtered.filter((act) => act.date === 'Today');
  const yesterdayItems = filtered.filter((act) => act.date === 'Yesterday');

  const getCategoryIcon = (category: ActivityItem['category']) => {
    switch (category) {
      case 'CHECKPOINT':
        return <ShieldCheck className="w-3.5 h-3.5 text-[#3B755D]" />;
      case 'INCIDENT':
        return <AlertTriangle className="w-3.5 h-3.5 text-[#BA3D3B]" />;
      case 'SAFETY':
        return <FileText className="w-3.5 h-3.5 text-[#1B3B48]" />;
      case 'ROUTINE':
        return <Wrench className="w-3.5 h-3.5 text-[#B47834]" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-[#6B727A]" />;
    }
  };

  const renderList = (items: ActivityItem[]) => (
    <div className="bg-white border border-[#E5E5DF] rounded-xl overflow-hidden divide-y divide-[#EFEFEA]">
      {items.map((act) => (
        <div
          key={act.id}
          onClick={() => onSelectActivity(act)}
          className="p-3.5 hover:bg-[#FBFBF9] transition-colors cursor-pointer flex items-center justify-between gap-3 text-left"
        >
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            <div className="w-7 h-7 rounded-md bg-[#F7F7F4] border border-[#E5E5DF] flex items-center justify-center shrink-0 mt-0.5">
              {getCategoryIcon(act.category)}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-medium text-[#1E252B] truncate">
                  {act.title}
                </span>
                <span
                  className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                    act.status === 'Resolved' || act.status === 'Completed'
                      ? 'text-[#3B755D] bg-[#3B755D]/10'
                      : act.status === 'Flagged'
                      ? 'text-[#BA3D3B] bg-[#BA3D3B]/10'
                      : 'text-[#B47834] bg-[#B47834]/10'
                  }`}
                >
                  {act.status}
                </span>
              </div>
              <p className="text-[11px] text-[#6B727A] truncate">
                {act.location} · {act.author}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[11px] text-[#858D95] font-mono block">
              {act.time}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#C5C5BD] ml-auto mt-0.5" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-5 max-w-lg mx-auto bg-[#F7F7F4] text-[#1E252B] space-y-5 animate-fadeIn">
      {/* Title & Action */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-[#1E252B] uppercase tracking-wider">
            Audit Trail
          </span>
          <h1 className="text-xl font-semibold tracking-tight text-[#1E252B] mt-0.5">
            Activity & History
          </h1>
          <p className="text-xs text-[#6B727A] mt-0.5">
            Complete chronological record of patrols, incident logs, and inspections.
          </p>
        </div>

        <button
          onClick={onOpenCreate}
          className="text-xs font-medium text-white bg-[#1B3B48] hover:bg-[#152E38] px-3 py-1.5 rounded-lg transition-colors"
        >
          New Log
        </button>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id)}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap transition-colors border ${
              filterCategory === cat.id
                ? 'bg-[#1B3B48] text-white border-[#1B3B48] font-medium'
                : 'bg-white text-[#555E68] border-[#E5E5DF] hover:bg-[#EFEFEA]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Today Grouping */}
      {todayItems.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold text-[#6B727A] uppercase tracking-wider">
            Today ({todayItems.length})
          </h2>
          {renderList(todayItems)}
        </section>
      )}

      {/* Yesterday Grouping */}
      {yesterdayItems.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold text-[#6B727A] uppercase tracking-wider">
            Yesterday ({yesterdayItems.length})
          </h2>
          {renderList(yesterdayItems)}
        </section>
      )}

      {filtered.length === 0 && (
        <div className="p-8 bg-white border border-[#E5E5DF] rounded-xl text-center space-y-2">
          <p className="text-sm font-medium text-[#1E252B]">
            No records for this category
          </p>
          <p className="text-xs text-[#6B727A]">
            Try switching to 'All Activity' or create a new field log.
          </p>
        </div>
      )}
    </div>
  );
};
