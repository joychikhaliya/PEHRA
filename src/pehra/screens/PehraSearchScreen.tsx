import React, { useState } from 'react';
import { Search, X, Clock, ChevronRight, Filter } from 'lucide-react';
import { ActivityItem } from '../../data/pehraData.ts';

interface PehraSearchScreenProps {
  activities: ActivityItem[];
  onSelectActivity: (item: ActivityItem) => void;
  onBack: () => void;
}

export const PehraSearchScreen: React.FC<PehraSearchScreenProps> = ({
  activities,
  onSelectActivity,
  onBack,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Culvert water accumulation',
    'North Gate barrier',
    'Mithi river gauge',
    'Generator fuel check',
  ]);

  const categories = [
    { id: 'ALL', label: 'All' },
    { id: 'INCIDENT', label: 'Incidents' },
    { id: 'CHECKPOINT', label: 'Checkpoints' },
    { id: 'SAFETY', label: 'Safety' },
    { id: 'ROUTINE', label: 'Routine' },
  ];

  const filteredActivities = activities.filter((act) => {
    const matchesCategory =
      selectedCategory === 'ALL' || act.category === selectedCategory;
    const matchesQuery =
      query.trim() === '' ||
      act.title.toLowerCase().includes(query.toLowerCase()) ||
      act.location.toLowerCase().includes(query.toLowerCase()) ||
      act.author.toLowerCase().includes(query.toLowerCase()) ||
      (act.description && act.description.toLowerCase().includes(query.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="p-5 max-w-lg mx-auto bg-[#F7F7F4] text-[#1E252B] space-y-5 animate-fadeIn">
      {/* Search Input Header */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#858D95] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search activities, incidents, checkpoints..."
            autoFocus
            className="w-full pl-9 pr-8 py-2.5 bg-white border border-[#D5D5CD] rounded-lg text-xs text-[#1E252B] focus:outline-none focus:border-[#1B3B48] focus:ring-1 focus:ring-[#1B3B48] transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#858D95] hover:text-[#1E252B]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={onBack}
          className="text-xs font-medium text-[#6B727A] hover:text-[#1E252B] px-2 py-1 transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* Filter Category Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap transition-colors border ${
              selectedCategory === cat.id
                ? 'bg-[#1B3B48] text-white border-[#1B3B48] font-medium'
                : 'bg-white text-[#555E68] border-[#E5E5DF] hover:bg-[#EFEFEA]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Query Results or Recent Searches */}
      {query.trim() === '' ? (
        <section className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#1E252B] uppercase tracking-wider">
              Recent Searches
            </span>
            <button
              onClick={() => setRecentSearches([])}
              className="text-[11px] text-[#858D95] hover:text-[#1E252B] transition-colors"
            >
              Clear
            </button>
          </div>

          {recentSearches.length > 0 ? (
            <div className="bg-white border border-[#E5E5DF] rounded-xl overflow-hidden divide-y divide-[#EFEFEA]">
              {recentSearches.map((term, i) => (
                <div
                  key={i}
                  onClick={() => setQuery(term)}
                  className="p-3 hover:bg-[#FBFBF9] transition-colors cursor-pointer flex items-center justify-between text-xs text-[#555E68]"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#858D95]" />
                    <span>{term}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#858D95]" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#858D95] italic py-2">
              No recent searches recorded.
            </p>
          )}

          {/* Quick Shortcuts */}
          <div className="pt-3">
            <span className="text-xs font-semibold text-[#1E252B] uppercase tracking-wider block mb-2">
              Quick Queries
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setQuery('water accumulation')}
                className="text-xs px-2.5 py-1 bg-[#EFEFEA] hover:bg-[#E5E5DF] text-[#1E252B] rounded border border-[#E5E5DF] transition-colors"
              >
                Water Accumulation
              </button>
              <button
                onClick={() => setQuery('North Gate')}
                className="text-xs px-2.5 py-1 bg-[#EFEFEA] hover:bg-[#E5E5DF] text-[#1E252B] rounded border border-[#E5E5DF] transition-colors"
              >
                North Gate
              </button>
              <button
                onClick={() => setQuery('Sluice')}
                className="text-xs px-2.5 py-1 bg-[#EFEFEA] hover:bg-[#E5E5DF] text-[#1E252B] rounded border border-[#E5E5DF] transition-colors"
              >
                Sluice Gates
              </button>
            </div>
          </div>
        </section>
      ) : (
        /* Filtered Search Results */
        <section className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#1E252B] uppercase tracking-wider">
              Search Results ({filteredActivities.length})
            </span>
            <span className="text-xs text-[#6B727A]">
              Matching "{query}"
            </span>
          </div>

          {filteredActivities.length > 0 ? (
            <div className="bg-white border border-[#E5E5DF] rounded-xl overflow-hidden divide-y divide-[#EFEFEA]">
              {filteredActivities.map((act) => (
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
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#EFEFEA] text-[#555E68]">
                        {act.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6B727A] truncate">
                      {act.location} · {act.category}
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
          ) : (
            <div className="bg-white border border-[#E5E5DF] rounded-xl p-8 text-center space-y-2">
              <p className="text-sm font-medium text-[#1E252B]">
                No matching records found
              </p>
              <p className="text-xs text-[#6B727A] max-w-xs mx-auto">
                No reports, checkpoints, or incidents matched "{query}". Try checking your spelling or selecting another category.
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
};
