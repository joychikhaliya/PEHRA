import React, { useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Share2,
  FileCheck,
} from 'lucide-react';
import { ActivityItem } from '../../data/pehraData.ts';

interface PehraDetailScreenProps {
  item: ActivityItem;
  onBack: () => void;
  onUpdateStatus: (id: string, newStatus: ActivityItem['status']) => void;
}

export const PehraDetailScreen: React.FC<PehraDetailScreenProps> = ({
  item,
  onBack,
  onUpdateStatus,
}) => {
  const [currentStatus, setCurrentStatus] = useState<ActivityItem['status']>(item.status);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleStatusChange = (status: ActivityItem['status']) => {
    setCurrentStatus(status);
    onUpdateStatus(item.id, status);
    setActionSuccess(`Record marked as ${status}`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  return (
    <div className="p-5 max-w-lg mx-auto bg-[#F7F7F4] text-[#1E252B] space-y-6 animate-fadeIn">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E5E5DF]">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-[#6B727A] hover:text-[#1E252B] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#858D95]">{item.id}</span>
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded ${
              currentStatus === 'Resolved' || currentStatus === 'Completed'
                ? 'bg-[#3B755D]/10 text-[#3B755D]'
                : currentStatus === 'Flagged'
                ? 'bg-[#BA3D3B]/10 text-[#BA3D3B]'
                : 'bg-[#B47834]/10 text-[#B47834]'
            }`}
          >
            {currentStatus}
          </span>
        </div>
      </div>

      {/* Main Header */}
      <div>
        <span className="text-[11px] font-semibold text-[#6B727A] uppercase tracking-wider">
          {item.category} RECORD
        </span>
        <h1 className="text-xl font-semibold tracking-tight text-[#1E252B] mt-1 mb-2">
          {item.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6B727A]">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#1B3B48]" />
            {item.location}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#1B3B48]" />
            {item.date} at {item.time} IST
          </span>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-[#3B755D]/10 text-[#3B755D] border border-[#3B755D]/20 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Overview & Field Notes */}
      <section className="bg-white border border-[#E5E5DF] rounded-xl p-4 space-y-3">
        <h2 className="text-xs font-semibold text-[#1E252B] uppercase tracking-wider">
          Field Description & Notes
        </h2>
        <p className="text-xs text-[#555E68] leading-relaxed">
          {item.description || item.subtitle}
        </p>

        <div className="pt-3 border-t border-[#EFEFEA] grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[11px] text-[#6B727A] block">Logged By</span>
            <span className="font-medium text-[#1E252B] mt-0.5 block flex items-center gap-1">
              <User className="w-3 h-3 text-[#6B727A]" />
              {item.author}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-[#6B727A] block">Priority Level</span>
            <span className="font-medium text-[#1E252B] capitalize mt-0.5 block">
              {item.priority} priority
            </span>
          </div>
        </div>
      </section>

      {/* Verification Timeline / Audit Trail with Subtle Dividers */}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold text-[#1E252B] uppercase tracking-wider">
          Audit & Verification Trail
        </h2>

        <div className="bg-white border border-[#E5E5DF] rounded-xl p-4">
          <div className="space-y-4">
            <div className="flex items-start gap-3 text-xs">
              <div className="w-2 h-2 rounded-full bg-[#3B755D] mt-1.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-[#1E252B]">
                  Observation logged by officer
                </p>
                <p className="text-[11px] text-[#6B727A]">
                  Initial report filed from field handset ({item.time} IST)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs">
              <div className="w-2 h-2 rounded-full bg-[#1B3B48] mt-1.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-[#1E252B]">
                  Disaster cell triage review
                </p>
                <p className="text-[11px] text-[#6B727A]">
                  Sector 4 desk officer confirmed reading and assigned maintenance task
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs">
              <div className="w-2 h-2 rounded-full bg-[#D5D5CD] mt-1.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-[#1E252B]">
                  Next scheduled check
                </p>
                <p className="text-[11px] text-[#6B727A]">
                  Scheduled during upcoming night round (21:00 IST)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Action Buttons (Solid primary, restrained radius) */}
      <div className="pt-2 space-y-2">
        {currentStatus !== 'Resolved' ? (
          <button
            onClick={() => handleStatusChange('Resolved')}
            className="w-full py-2.5 px-4 bg-[#1B3B48] hover:bg-[#152E38] text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Mark as Resolved</span>
          </button>
        ) : (
          <button
            onClick={() => handleStatusChange('In Review')}
            className="w-full py-2.5 px-4 bg-[#EFEFEA] hover:bg-[#E5E5DF] text-[#1E252B] text-xs font-medium rounded-lg border border-[#E5E5DF] transition-colors"
          >
            Reopen for Follow-up
          </button>
        )}

        <button
          onClick={() => {
            navigator.clipboard?.writeText(
              `[Pehra ${item.id}] ${item.title} at ${item.location} - Status: ${currentStatus}`
            );
            alert('Record summary copied to clipboard for field relay.');
          }}
          className="w-full py-2 px-4 text-xs font-medium text-[#555E68] hover:text-[#1E252B] transition-colors text-center"
        >
          Share Record Summary
        </button>
      </div>
    </div>
  );
};
