import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Droplets,
  HeartPulse,
  BatteryCharging,
  FileText,
  Flame,
  Radio,
  Share2,
  Printer,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface ChecklistItem {
  id: string;
  name: string;
  category: 'sustenance' | 'medical' | 'power' | 'protection';
  description: string;
  essential: boolean;
  checked: boolean;
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  // Sustenance
  {
    id: 'fresh-water',
    name: 'Fresh Drinking Water',
    category: 'sustenance',
    description: 'Minimum 4-5 liters per person per day (3-day minimum reserve in clean, sealed containers).',
    essential: true,
    checked: false,
  },
  {
    id: 'non-perishable-food',
    name: 'Non-Perishable Food (3-Day Supply)',
    category: 'sustenance',
    description: 'Ready-to-eat dry rations, biscuits, chivda, energy bars, and canned foods not requiring cooking or clean water.',
    essential: true,
    checked: false,
  },
  {
    id: 'water-purification',
    name: 'Water Purification Tablets',
    category: 'sustenance',
    description: 'Chlorine dioxide or iodine tablets for sterilizing municipal or rainwater in emergencies.',
    essential: false,
    checked: false,
  },
  {
    id: 'ors-packets',
    name: 'Oral Rehydration Salts (ORS)',
    category: 'sustenance',
    description: 'Packets of WHO-formula ORS to treat dehydration and waterborne illnesses.',
    essential: false,
    checked: false,
  },

  // Medical & First Aid
  {
    id: 'first-aid-kit',
    name: 'First Aid Kit',
    category: 'medical',
    description: 'Sterile bandages, gauze pads, antiseptic betadine ointment, scissors, medical tape, and adhesive strips.',
    essential: true,
    checked: false,
  },
  {
    id: 'prescription-meds',
    name: 'Prescription Medications (7-Day Supply)',
    category: 'medical',
    description: 'Daily life-saving medications (insulin, BP tablets, cardiac pills, asthma inhalers) sealed in waterproof pouch.',
    essential: true,
    checked: false,
  },
  {
    id: 'mosquito-repellent',
    name: 'Mosquito Repellent & Antiseptic Wipes',
    category: 'medical',
    description: 'Odomos / repellent lotion to protect against dengue and malaria vectors proliferating in stagnant floodwater.',
    essential: false,
    checked: false,
  },

  // Power & Communications
  {
    id: 'power-bank',
    name: 'Power Bank (Fully Charged)',
    category: 'power',
    description: '20,000mAh portable power bank with heavy-duty cables to keep phone charged during prolonged grid blackout.',
    essential: true,
    checked: false,
  },
  {
    id: 'waterproof-flashlight',
    name: 'Waterproof Flashlight / Torch',
    category: 'power',
    description: 'High-lumen LED torch with spare sealed alkaline batteries or solar/hand-crank dynamo.',
    essential: true,
    checked: false,
  },
  {
    id: 'emergency-whistle',
    name: 'Emergency Whistle',
    category: 'power',
    description: 'High-decibel pealess whistle to alert NDRF or Fire Brigade rescue boats without exhausting your voice.',
    essential: true,
    checked: false,
  },
  {
    id: 'portable-radio',
    name: 'Battery AM/FM Radio',
    category: 'power',
    description: 'To receive All India Radio (AIR) and MCGM Disaster Management emergency broadcast bulletins when cell towers collapse.',
    essential: false,
    checked: false,
  },

  // Protection & Documents
  {
    id: 'waterproof-documents',
    name: 'Important Documents in Waterproof Pouch',
    category: 'protection',
    description: 'Aadhaar cards, PAN, ration card, property documents, medical papers, and emergency contact numbers inside zip-lock bag.',
    essential: true,
    checked: false,
  },
  {
    id: 'emergency-cash',
    name: 'Emergency Cash (Small Notes)',
    category: 'protection',
    description: '₹2,000 - ₹5,000 in ₹50/₹100/₹200 notes. ATMs and UPI POS card machines will not work in inundated sectors.',
    essential: true,
    checked: false,
  },
  {
    id: 'waterproof-boots-raincoat',
    name: 'Raincoat & Heavy Waterproof Footwear',
    category: 'protection',
    description: 'High-visibility raincoat / poncho and sturdy closed boots or gumboots to prevent leptospirosis and foot punctures.',
    essential: false,
    checked: false,
  },
  {
    id: 'mylar-blanket',
    name: 'Emergency Thermal Foil Blanket',
    category: 'protection',
    description: 'Reflective foil blanket to prevent hypothermia if soaked or trapped on rooftops during cold wet monsoon nights.',
    essential: false,
    checked: false,
  },
];

const LOCAL_STORAGE_KEY = 'pehra_survival_checklist';

interface SurvivalChecklistProps {
  onNotify?: (message: string) => void;
  compact?: boolean;
}

export const SurvivalChecklist: React.FC<SurvivalChecklistProps> = ({ compact = false }) => {
  const [items, setItems] = useState<ChecklistItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with default items in case new items were added
          return DEFAULT_CHECKLIST.map((defItem) => {
            const match = parsed.find((p: any) => p.id === defItem.id);
            return match ? { ...defItem, checked: !!match.checked } : defItem;
          });
        }
      }
    } catch (e) {
      console.warn('Failed to load survival checklist from localStorage:', e);
    }
    return DEFAULT_CHECKLIST;
  });

  const [activeCategory, setActiveCategory] = useState<'all' | 'sustenance' | 'medical' | 'power' | 'protection'>('all');
  const [showTips, setShowTips] = useState<boolean>(true);

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save survival checklist to localStorage:', e);
    }
  }, [items]);

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleMarkAll = () => {
    setItems((prev) => prev.map((item) => ({ ...item, checked: true })));
  };

  const handleReset = () => {
    if (window.confirm('Reset survival checklist to unchecked?')) {
      setItems((prev) => prev.map((item) => ({ ...item, checked: false })));
    }
  };

  // Calculations
  const totalCount = items.length;
  const checkedCount = items.filter((i) => i.checked).length;
  const progressPercent = Math.round((checkedCount / totalCount) * 100);

  const essentialItems = items.filter((i) => i.essential);
  const essentialChecked = essentialItems.filter((i) => i.checked).length;
  const essentialComplete = essentialChecked === essentialItems.length;

  const filteredItems = activeCategory === 'all'
    ? items
    : items.filter((item) => item.category === activeCategory);

  const getStatusBadge = () => {
    if (progressPercent >= 80) {
      return {
        label: 'Survival Ready',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        barColor: 'bg-emerald-500',
        desc: 'Your emergency go-bag has all critical flood survival essentials packed.',
      };
    }
    if (progressPercent >= 45) {
      return {
        label: 'Moderate Preparedness',
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        barColor: 'bg-amber-500',
        desc: 'Pack remaining essential items before nightfall or high-tide alert.',
      };
    }
    return {
      label: 'Needs Attention',
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      barColor: 'bg-rose-500',
      desc: 'Critical essentials like fresh water, power bank, and first aid are missing.',
    };
  };

  const status = getStatusBadge();

  return (
    <div className="rounded-2xl border border-[#E5EAF0] bg-white p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header & Preparedness Meter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <ShieldCheck className="h-4.5 w-4.5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Citizen Flood Survival Checklist
              </h2>
              <p className="text-xs text-slate-500">
                Essential emergency kit for family readiness during monsoon inundation & grid blackouts
              </p>
            </div>
          </div>
        </div>

        {/* Readiness Meter Card */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="text-left sm:text-right">
            <div className="flex items-center gap-2 justify-start sm:justify-end">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${status.color}`}>
                {status.label}
              </span>
              <span className="text-lg font-bold font-mono text-slate-900">
                {progressPercent}%
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              {checkedCount} of {totalCount} items packed ({essentialChecked}/{essentialItems.length} critical)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleMarkAll}
              id="mark-all-packed-btn"
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-medium hover:bg-slate-100 transition-colors"
              title="Mark all items as packed"
            >
              Pack All
            </button>
            <button
              onClick={handleReset}
              id="reset-checklist-btn"
              className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Reset checklist"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="space-y-1.5">
        <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${status.barColor}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>{status.desc}</span>
          <span className="font-mono text-emerald-600 font-semibold">
            {essentialComplete ? '✓ All Critical Items Packed' : `${essentialItems.length - essentialChecked} Critical Items Missing`}
          </span>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <button
          onClick={() => setActiveCategory('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-colors shrink-0 ${
            activeCategory === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span>All Items</span>
          <span className="text-[10px] opacity-75 font-mono">({items.length})</span>
        </button>

        <button
          onClick={() => setActiveCategory('sustenance')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-colors shrink-0 ${
            activeCategory === 'sustenance'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Droplets className="h-3.5 w-3.5" />
          <span>Water & Food</span>
          <span className="text-[10px] opacity-75 font-mono">
            ({items.filter((i) => i.category === 'sustenance' && i.checked).length}/
            {items.filter((i) => i.category === 'sustenance').length})
          </span>
        </button>

        <button
          onClick={() => setActiveCategory('medical')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-colors shrink-0 ${
            activeCategory === 'medical'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <HeartPulse className="h-3.5 w-3.5" />
          <span>Medical & First Aid</span>
          <span className="text-[10px] opacity-75 font-mono">
            ({items.filter((i) => i.category === 'medical' && i.checked).length}/
            {items.filter((i) => i.category === 'medical').length})
          </span>
        </button>

        <button
          onClick={() => setActiveCategory('power')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-colors shrink-0 ${
            activeCategory === 'power'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <BatteryCharging className="h-3.5 w-3.5" />
          <span>Power & Comms</span>
          <span className="text-[10px] opacity-75 font-mono">
            ({items.filter((i) => i.category === 'power' && i.checked).length}/
            {items.filter((i) => i.category === 'power').length})
          </span>
        </button>

        <button
          onClick={() => setActiveCategory('protection')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-colors shrink-0 ${
            activeCategory === 'protection'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Docs & Cash</span>
          <span className="text-[10px] opacity-75 font-mono">
            ({items.filter((i) => i.category === 'protection' && i.checked).length}/
            {items.filter((i) => i.category === 'protection').length})
          </span>
        </button>
      </div>

      {/* Checklist Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`group relative flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
              item.checked
                ? 'bg-emerald-50/40 border-emerald-200 hover:bg-emerald-50/70'
                : 'bg-white border-[#E5EAF0] hover:border-slate-300 hover:bg-slate-50/60'
            }`}
          >
            {/* Checkbox Icon */}
            <div className="mt-0.5 shrink-0">
              {item.checked ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 fill-emerald-100 transition-transform group-active:scale-90" />
              ) : (
                <Circle className="h-5 w-5 text-slate-300 group-hover:text-slate-400 transition-colors" />
              )}
            </div>

            {/* Item Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold leading-snug transition-colors ${
                    item.checked ? 'text-slate-700 line-through decoration-emerald-500/70' : 'text-slate-900'
                  }`}
                >
                  {item.name}
                </span>

                {item.essential && (
                  <span className="px-1.5 py-0.2 rounded-md bg-rose-50 text-rose-600 border border-rose-200 text-[9px] font-bold uppercase tracking-wider">
                    CRITICAL
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Emergency Flood Survival Rules Banner */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">🚨</span>
            <span className="text-xs font-bold text-blue-900">
              Official Flood Survival Guidelines (NDRF & BMC Disaster Cell)
            </span>
          </div>
          <button
            onClick={() => setShowTips(!showTips)}
            className="text-xs text-blue-700 hover:text-blue-900 font-medium flex items-center gap-1"
          >
            <span>{showTips ? 'Collapse' : 'Show Tips'}</span>
            {showTips ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>

        {showTips && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-blue-100 text-xs text-slate-700">
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">1.</span>
              <span>
                <strong>Never walk in moving water:</strong> 15 cm (6 inches) of rapid current will knock you down.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">2.</span>
              <span>
                <strong>Turn off main power:</strong> Switch off electric main breaker if water rises near electrical sockets.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">3.</span>
              <span>
                <strong>Boil all drinking water:</strong> Submerged municipal pipes are prone to sewage back-siphonage.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Offline Persistence Notice */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
        <span>💾 State persists offline on this device via browser storage</span>
        <span className="font-mono">BMC Disaster Helpline: 1916</span>
      </div>
    </div>
  );
};
