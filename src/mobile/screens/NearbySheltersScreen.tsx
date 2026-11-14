import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Navigation,
  Phone,
  Search,
  CheckCircle2,
  AlertCircle,
  Users,
  Mountain,
} from 'lucide-react';
import { ShelterData } from '../../data/floodSafeData.ts';

interface NearbySheltersScreenProps {
  shelters: ShelterData[];
  onNavigateTab: (tab: string) => void;
  onSelectShelterForRoute?: (shelter: ShelterData) => void;
}

export const NearbySheltersScreen: React.FC<NearbySheltersScreenProps> = ({
  shelters,
  onNavigateTab,
  onSelectShelterForRoute,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'NEAREST' | 'OPEN' | 'AVAILABLE'>('NEAREST');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredShelters = shelters
    .filter((s) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q) ||
          s.ward.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .filter((s) => {
      if (filter === 'OPEN') return s.status === 'OPEN';
      if (filter === 'AVAILABLE') return s.availableCapacity > 50;
      return true;
    })
    .sort((a, b) => {
      if (filter === 'NEAREST') return a.distanceKm - b.distanceKm;
      if (filter === 'AVAILABLE') return b.availableCapacity - a.availableCapacity;
      return 0;
    });

  return (
    <div className="p-4 space-y-4 max-w-xl mx-auto pb-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-[#173B4D] tracking-tight">
          Designated Safe Shelters
        </h1>
        <p className="text-xs text-[#5A7382]">
          Municipal schools, elevated halls, and flood relief centers with available beds.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="h-4 w-4 text-[#8CA2AE] absolute left-3.5 top-3 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search shelters by ward or road name..."
          className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2ECEF] rounded-xl text-xs text-[#173B4D] placeholder-[#8CA2AE] focus:outline-none focus:border-[#2E7D82]"
        />
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {(['NEAREST', 'OPEN', 'AVAILABLE', 'ALL'] as const).map((f) => {
          const isSelected = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-[#173B4D] text-white shadow-sm'
                  : 'bg-white border border-[#E2ECEF] text-[#5A7382] hover:bg-[#EEF7F8]'
              }`}
            >
              {f === 'NEAREST'
                ? 'Nearest First'
                : f === 'OPEN'
                ? 'Open Now'
                : f === 'AVAILABLE'
                ? 'Beds Available'
                : 'All Shelters'}
            </button>
          );
        })}
      </div>

      {/* Shelters List */}
      <div className="space-y-3">
        {filteredShelters.map((shelter) => {
          const occPct = Math.round((shelter.occupiedCapacity / shelter.totalCapacity) * 100);
          const statusBadge =
            shelter.status === 'OPEN'
              ? 'bg-[#4F8A68]/10 text-[#4F8A68]'
              : shelter.status === 'LIMITED'
              ? 'bg-amber-500/10 text-amber-700'
              : 'bg-[#E85D5D]/10 text-[#E85D5D]';

          return (
            <div
              key={shelter.id}
              className="p-4 rounded-2xl bg-white border border-[#E2ECEF] shadow-sm space-y-3"
            >
              {/* Header: Name, Distance & Status */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-[#2E7D82]" />
                    <span className="text-[10px] font-mono text-[#5A7382] uppercase">{shelter.ward}</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#173B4D] mt-0.5">{shelter.name}</h3>
                  <p className="text-xs text-[#5A7382] mt-0.5">{shelter.address}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusBadge}`}>
                    {shelter.status}
                  </span>
                  <div className="text-sm font-bold text-[#173B4D] font-mono mt-1">
                    {shelter.distanceKm} km
                  </div>
                  <div className="text-[10px] text-[#5A7382]">~{shelter.walkTimeMin} min walk</div>
                </div>
              </div>

              {/* Elevation & Capacity Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#5A7382] flex items-center gap-1">
                    <Mountain className="h-3 w-3 text-[#2E7D82]" />
                    <span>Ground Elevation: <strong>{shelter.elevationM}m</strong> (Safe above water)</span>
                  </span>
                  <span className="font-semibold text-[#173B4D]">
                    {shelter.availableCapacity} beds open
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full rounded-full bg-[#EAF2F6] overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      occPct > 85 ? 'bg-amber-500' : 'bg-[#2E7D82]'
                    }`}
                    style={{ width: `${occPct}%` }}
                  />
                </div>
              </div>

              {/* Amenities Tags */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {shelter.amenities.map((amenity, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-[#F7FAFA] border border-[#E2ECEF] text-[10px] text-[#5A7382]"
                  >
                    {amenity}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-[#F0F4F6] flex items-center justify-between gap-2">
                <a
                  href={`tel:${shelter.contactPhone}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E2ECEF] text-xs font-semibold text-[#173B4D] hover:bg-[#F7FAFA]"
                >
                  <Phone className="h-3.5 w-3.5 text-[#2E7D82]" />
                  <span>Call Desk</span>
                </a>

                <button
                  onClick={() => {
                    if (onSelectShelterForRoute) onSelectShelterForRoute(shelter);
                    onNavigateTab('routes');
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#173B4D] text-white text-xs font-bold hover:bg-[#1f4a60] transition-colors shadow-sm"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  <span>Directions & Safe Route</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
