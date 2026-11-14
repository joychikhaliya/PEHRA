import React, { useState } from 'react';
import { ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { ActivityItem } from '../../data/pehraData.ts';

interface PehraCreateScreenProps {
  onBack: () => void;
  onCreateActivity: (newItem: ActivityItem) => void;
}

export const PehraCreateScreen: React.FC<PehraCreateScreenProps> = ({
  onBack,
  onCreateActivity,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ActivityItem['category']>('INCIDENT');
  const [location, setLocation] = useState('Bandra West - Sluice Point 4');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<ActivityItem['priority']>('medium');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim()) {
      setError('Please provide a concise title and specific location.');
      return;
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newActivity: ActivityItem = {
      id: `ACT-${Math.floor(100 + Math.random() * 900)}`,
      title: title.trim(),
      subtitle: description.trim() ? description.trim().slice(0, 60) + '...' : 'Field observation logged',
      category,
      status: 'In Review',
      time: timeString,
      date: 'Today',
      author: 'Arjun Mehta',
      location: location.trim(),
      description: description.trim(),
      priority,
    };

    onCreateActivity(newActivity);
  };

  return (
    <div className="p-5 max-w-lg mx-auto bg-[#F7F7F4] text-[#1E252B] space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E5E5DF]">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-[#6B727A] hover:text-[#1E252B] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Cancel</span>
        </button>
        <span className="text-xs font-semibold text-[#1E252B]">New Record</span>
      </div>

      <div>
        <h1 className="text-xl font-semibold tracking-tight text-[#1E252B]">
          Log Field Activity or Hazard
        </h1>
        <p className="text-xs text-[#6B727A] mt-0.5">
          Record observations, drainage obstructions, or completed checkpoint sweeps.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg text-xs text-[#991B1B] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form with Clean Label-above-input */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="create-title"
            className="block text-xs font-medium text-[#3A434C] mb-1.5"
          >
            Record Title
          </label>
          <input
            id="create-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Sluice Gate 3 Hydraulic Pressure Low"
            required
            className="w-full px-3 py-2.5 bg-white border border-[#D5D5CD] rounded-lg text-xs text-[#1E252B] focus:outline-none focus:border-[#1B3B48] focus:ring-1 focus:ring-[#1B3B48] transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="create-category"
              className="block text-xs font-medium text-[#3A434C] mb-1.5"
            >
              Category
            </label>
            <select
              id="create-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ActivityItem['category'])}
              className="w-full px-3 py-2 bg-white border border-[#D5D5CD] rounded-lg text-xs text-[#1E252B] focus:outline-none focus:border-[#1B3B48] transition-all"
            >
              <option value="INCIDENT">Incident / Hazard</option>
              <option value="CHECKPOINT">Checkpoint Sweep</option>
              <option value="SAFETY">Safety Inspection</option>
              <option value="ROUTINE">Routine Maintenance</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="create-priority"
              className="block text-xs font-medium text-[#3A434C] mb-1.5"
            >
              Priority
            </label>
            <select
              id="create-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as ActivityItem['priority'])}
              className="w-full px-3 py-2 bg-white border border-[#D5D5CD] rounded-lg text-xs text-[#1E252B] focus:outline-none focus:border-[#1B3B48] transition-all"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="create-location"
            className="block text-xs font-medium text-[#3A434C] mb-1.5"
          >
            Specific Location / Landmark
          </label>
          <input
            id="create-location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Near Station Road Culvert, Sector 4"
            required
            className="w-full px-3 py-2.5 bg-white border border-[#D5D5CD] rounded-lg text-xs text-[#1E252B] focus:outline-none focus:border-[#1B3B48] focus:ring-1 focus:ring-[#1B3B48] transition-all"
          />
        </div>

        <div>
          <label
            htmlFor="create-description"
            className="block text-xs font-medium text-[#3A434C] mb-1.5"
          >
            Field Notes & Observations
          </label>
          <textarea
            id="create-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Include observed water level, physical damages, barrier status, or immediate precautions taken..."
            className="w-full px-3 py-2.5 bg-white border border-[#D5D5CD] rounded-lg text-xs text-[#1E252B] focus:outline-none focus:border-[#1B3B48] focus:ring-1 focus:ring-[#1B3B48] transition-all"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-[#1B3B48] hover:bg-[#152E38] text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Submit to Vigilance Log</span>
          </button>
        </div>
      </form>
    </div>
  );
};
