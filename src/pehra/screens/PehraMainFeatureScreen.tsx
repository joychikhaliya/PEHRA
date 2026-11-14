import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Circle,
  Clock,
  MapPin,
  FileEdit,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { Checkpoint } from '../../data/pehraData.ts';

interface PehraMainFeatureScreenProps {
  checkpoints: Checkpoint[];
  onCheckInCheckpoint: (checkpointId: string, notes: string) => void;
  onOpenCreateReport: () => void;
}

export const PehraMainFeatureScreen: React.FC<PehraMainFeatureScreenProps> = ({
  checkpoints,
  onCheckInCheckpoint,
  onOpenCreateReport,
}) => {
  const [activeCheckNote, setActiveCheckNote] = useState('');
  const [isLogging, setIsLogging] = useState(false);
  const [loggedSuccess, setLoggedSuccess] = useState<string | null>(null);

  const currentCheckpoint = checkpoints.find((cp) => cp.status === 'current');
  const completedCount = checkpoints.filter((cp) => cp.status === 'completed').length;
  const progressPercent = Math.round((completedCount / checkpoints.length) * 100);

  const handleLogCurrent = () => {
    if (!currentCheckpoint) return;
    setIsLogging(true);
    setTimeout(() => {
      onCheckInCheckpoint(currentCheckpoint.id, activeCheckNote || 'Normal conditions confirmed');
      setLoggedSuccess(`Checkpoint #${currentCheckpoint.sequence} logged successfully`);
      setIsLogging(false);
      setActiveCheckNote('');
      setTimeout(() => setLoggedSuccess(null), 3000);
    }, 300);
  };

  return (
    <div className="p-5 max-w-lg mx-auto bg-[#F7F7F4] text-[#1E252B] space-y-6 animate-fadeIn">
      {/* Page Title & Status */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-[#1E252B] uppercase tracking-wider">
            Perimeter Rounds
          </span>
          <h1 className="text-xl font-semibold tracking-tight text-[#1E252B] mt-0.5">
            Shift A · Evening Vigil
          </h1>
          <p className="text-xs text-[#6B727A] mt-0.5">
            Sector 4 Outer Wall, Sluice Gates & Low-lying Drains
          </p>
        </div>

        <button
          onClick={onOpenCreateReport}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EFEFEA] hover:bg-[#E5E5DF] text-[#1E252B] text-xs font-medium rounded-lg border border-[#E5E5DF] transition-colors"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-[#B47834]" />
          <span>Report Anomaly</span>
        </button>
      </div>

      {/* Progress Summary Section */}
      <section className="bg-white border border-[#E5E5DF] rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#6B727A]">Round Progress</span>
          <span className="font-semibold text-[#1E252B]">
            {completedCount} of {checkpoints.length} Checkpoints ({progressPercent}%)
          </span>
        </div>

        <div className="w-full h-2 bg-[#EFEFEA] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1B3B48] rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#6B727A] pt-1">
          <span>Started: 18:00 IST</span>
          <span>Target Completion: 20:30 IST</span>
        </div>
      </section>

      {/* Active Current Checkpoint Card */}
      {currentCheckpoint && (
        <section className="bg-white border border-[#1B3B48]/30 rounded-xl p-4 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#1B3B48] bg-[#1B3B48]/10 px-2 py-0.5 rounded">
              Current Target · Point #{currentCheckpoint.sequence}
            </span>
            <span className="text-xs text-[#6B727A] font-mono">
              Due: {currentCheckpoint.scheduledTime}
            </span>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[#1E252B]">
              {currentCheckpoint.name}
            </h2>
            <p className="text-xs text-[#6B727A] flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-[#1B3B48]" />
              <span>{currentCheckpoint.location}</span>
            </p>
          </div>

          <p className="text-xs text-[#555E68] bg-[#F7F7F4] p-2.5 rounded-lg border border-[#EFEFEA]">
            <strong>Instructions:</strong> {currentCheckpoint.notes}
          </p>

          {loggedSuccess && (
            <div className="text-xs text-[#3B755D] bg-[#3B755D]/10 px-3 py-2 rounded-lg border border-[#3B755D]/20">
              {loggedSuccess}
            </div>
          )}

          <div className="space-y-2 pt-1">
            <label
              htmlFor="checkpoint-note-input"
              className="block text-[11px] font-medium text-[#6B727A]"
            >
              Inspection Note / Field Observations (Optional)
            </label>
            <input
              id="checkpoint-note-input"
              type="text"
              value={activeCheckNote}
              onChange={(e) => setActiveCheckNote(e.target.value)}
              placeholder="e.g. Sluice gate locked, water level at 2.8m, no trash obstruction"
              className="w-full px-3 py-2 text-xs bg-white border border-[#D5D5CD] rounded-lg text-[#1E252B] focus:outline-none focus:border-[#1B3B48] transition-all"
            />
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={handleLogCurrent}
              disabled={isLogging}
              className="flex-1 py-2.5 px-4 bg-[#1B3B48] hover:bg-[#152E38] disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isLogging ? 'Logging Check-in...' : `Verify Checkpoint #${currentCheckpoint.sequence}`}</span>
            </button>
          </div>
        </section>
      )}

      {/* Checkpoint Sequence List with subtle dividers */}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold text-[#1E252B] uppercase tracking-wider">
          All Round Checkpoints
        </h2>

        <div className="bg-white border border-[#E5E5DF] rounded-xl overflow-hidden divide-y divide-[#EFEFEA]">
          {checkpoints.map((cp) => {
            const isCompleted = cp.status === 'completed';
            const isCurrent = cp.status === 'current';

            return (
              <div
                key={cp.id}
                className={`p-3.5 flex items-start gap-3 text-left transition-colors ${
                  isCurrent ? 'bg-[#F9FAF9]' : 'hover:bg-[#FBFBF9]'
                }`}
              >
                <div className="pt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-[#3B755D]" />
                  ) : isCurrent ? (
                    <div className="w-4 h-4 rounded-full border-2 border-[#1B3B48] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#1B3B48]" />
                    </div>
                  ) : (
                    <Circle className="w-4 h-4 text-[#C5C5BD]" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p
                      className={`text-xs font-medium truncate ${
                        isCompleted ? 'text-[#6B727A] line-through' : 'text-[#1E252B]'
                      }`}
                    >
                      {cp.sequence}. {cp.name}
                    </p>
                    <span className="text-[11px] font-mono text-[#858D95] shrink-0 ml-2">
                      {isCompleted ? cp.completedTime : cp.scheduledTime}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#6B727A] mt-0.5 truncate">
                    {cp.location}
                  </p>

                  {cp.notes && (
                    <p className="text-[11px] text-[#555E68] mt-1 bg-[#F7F7F4] p-1.5 rounded text-left">
                      {cp.notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* GPS & Sensor Health Metadata (Compact) */}
      <div className="p-3 bg-[#EFEFEA] rounded-lg border border-[#E5E5DF] flex items-center justify-between text-[11px] text-[#6B727A]">
        <span>GPS Accuracy: ±3.2m</span>
        <span>Telemetry Station: Synced</span>
        <span>Round ID: RD-904</span>
      </div>
    </div>
  );
};
