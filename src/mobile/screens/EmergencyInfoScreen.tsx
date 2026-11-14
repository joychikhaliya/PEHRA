import React, { useState } from 'react';
import {
  LifeBuoy,
  PhoneCall,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Briefcase,
  ShieldCheck,
  Building,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { EMERGENCY_HELPLINES, GO_BAG_ITEMS } from '../../data/floodSafeData.ts';

export const EmergencyInfoScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ACTIONS' | 'CONTACTS' | 'GOBAG' | 'WARNINGS'>('ACTIONS');
  const [itemsList, setItemsList] = useState(GO_BAG_ITEMS);
  const [floodStage, setFloodStage] = useState<'BEFORE' | 'DURING' | 'AFTER'>('DURING');

  const toggleItem = (id: string) => {
    setItemsList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const checkedCount = itemsList.filter((i) => i.checked).length;

  return (
    <div className="p-4 space-y-4 max-w-xl mx-auto pb-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-[#173B4D] tracking-tight">
          Emergency Guide & Protocols
        </h1>
        <p className="text-xs text-[#5A7382]">
          Essential survival procedures, official emergency numbers, and checklist.
        </p>
      </div>

      {/* Top Segmented Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => setActiveTab('ACTIONS')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'ACTIONS'
              ? 'bg-[#173B4D] text-white shadow-sm'
              : 'bg-white border border-[#E2ECEF] text-[#5A7382] hover:bg-[#EEF7F8]'
          }`}
        >
          What To Do
        </button>

        <button
          onClick={() => setActiveTab('CONTACTS')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'CONTACTS'
              ? 'bg-[#173B4D] text-white shadow-sm'
              : 'bg-white border border-[#E2ECEF] text-[#5A7382] hover:bg-[#EEF7F8]'
          }`}
        >
          Helplines (6)
        </button>

        <button
          onClick={() => setActiveTab('GOBAG')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'GOBAG'
              ? 'bg-[#173B4D] text-white shadow-sm'
              : 'bg-white border border-[#E2ECEF] text-[#5A7382] hover:bg-[#EEF7F8]'
          }`}
        >
          Go-Bag ({checkedCount}/{itemsList.length})
        </button>

        <button
          onClick={() => setActiveTab('WARNINGS')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'WARNINGS'
              ? 'bg-[#173B4D] text-white shadow-sm'
              : 'bg-white border border-[#E2ECEF] text-[#5A7382] hover:bg-[#EEF7F8]'
          }`}
        >
          Do's & Don'ts
        </button>
      </div>

      {/* TAB 1: WHAT TO DO (Before, During, After Flood) */}
      {activeTab === 'ACTIONS' && (
        <div className="space-y-3">
          {/* Sub-toggle for Before / During / After */}
          <div className="grid grid-cols-3 gap-1 bg-[#EEF7F8] p-1 rounded-xl border border-[#DCEFF2]">
            <button
              onClick={() => setFloodStage('BEFORE')}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                floodStage === 'BEFORE' ? 'bg-white text-[#173B4D] shadow-sm' : 'text-[#5A7382]'
              }`}
            >
              Before Flood
            </button>
            <button
              onClick={() => setFloodStage('DURING')}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                floodStage === 'DURING' ? 'bg-[#E85D5D] text-white shadow-sm' : 'text-[#5A7382]'
              }`}
            >
              During Flood
            </button>
            <button
              onClick={() => setFloodStage('AFTER')}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                floodStage === 'AFTER' ? 'bg-white text-[#173B4D] shadow-sm' : 'text-[#5A7382]'
              }`}
            >
              After Flood
            </button>
          </div>

          {/* Cards for selected stage */}
          {floodStage === 'DURING' && (
            <div className="space-y-2.5">
              <div className="p-4 rounded-2xl bg-white border border-[#E2ECEF] shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#E85D5D]">
                  <AlertTriangle className="h-4 w-4" />
                  <span>1. Move to Higher Ground Immediately</span>
                </div>
                <p className="text-xs text-[#5A7382] leading-relaxed">
                  If water enters your ground floor, proceed to upper floors or designated reinforced municipal schools. Do not linger to pack heavy furniture.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E2ECEF] shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#173B4D]">
                  <ShieldCheck className="h-4 w-4 text-[#2E7D82]" />
                  <span>2. Cut Off Main Power & Gas Breakers</span>
                </div>
                <p className="text-xs text-[#5A7382] leading-relaxed">
                  Prevent electrocution and short circuits. Never touch electrical switches or appliances while standing in water or with wet feet.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E2ECEF] shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#173B4D]">
                  <XCircle className="h-4 w-4 text-[#E85D5D]" />
                  <span>3. Never Walk or Drive Through Moving Water</span>
                </div>
                <p className="text-xs text-[#5A7382] leading-relaxed">
                  Just 15 cm (6 inches) of rapid moving water can knock you off your feet. 30 cm (1 foot) can float and disable cars. Open manholes and nullahs become completely invisible under murky water.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E2ECEF] shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#173B4D]">
                  <LifeBuoy className="h-4 w-4 text-[#2E7D82]" />
                  <span>4. Signal Rescue Teams If Trapped</span>
                </div>
                <p className="text-xs text-[#5A7382] leading-relaxed">
                  Use your phone flashlight strobe, whistle, or wave a bright cloth from rooftop or window. Dial 112 or 1916 with exact floor and building details.
                </p>
              </div>
            </div>
          )}

          {floodStage === 'BEFORE' && (
            <div className="space-y-2.5">
              <div className="p-4 rounded-2xl bg-white border border-[#E2ECEF] shadow-sm space-y-2">
                <span className="text-xs font-bold text-[#173B4D]">1. Prepare Go-Bag & Documents</span>
                <p className="text-xs text-[#5A7382]">
                  Place IDs, prescription medicines, and power banks in waterproof ziplock bags.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[#E2ECEF] shadow-sm space-y-2">
                <span className="text-xs font-bold text-[#173B4D]">2. Park Vehicles on High Ground</span>
                <p className="text-xs text-[#5A7382]">
                  Move two-wheelers and cars out of basement parking to designated elevated flyover parking bays.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[#E2ECEF] shadow-sm space-y-2">
                <span className="text-xs font-bold text-[#173B4D]">3. Store 2–3 Days of Drinking Water</span>
                <p className="text-xs text-[#5A7382]">
                  Municipal tap water is often contaminated by drain overflow during deluges. Fill clean containers.
                </p>
              </div>
            </div>
          )}

          {floodStage === 'AFTER' && (
            <div className="space-y-2.5">
              <div className="p-4 rounded-2xl bg-white border border-[#E2ECEF] shadow-sm space-y-2">
                <span className="text-xs font-bold text-[#173B4D]">1. Watch Out for Submerged Electrical Hazards</span>
                <p className="text-xs text-[#5A7382]">
                  Do not restore power until inspected by a licensed electrician or utility crew.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[#E2ECEF] shadow-sm space-y-2">
                <span className="text-xs font-bold text-[#173B4D]">2. Disinfect Drinking Water</span>
                <p className="text-xs text-[#5A7382]">
                  Boil tap water vigorously for at least 3 minutes or use chlorine water-purification tablets.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EMERGENCY CONTACTS */}
      {activeTab === 'CONTACTS' && (
        <div className="space-y-2.5">
          {EMERGENCY_HELPLINES.map((hl) => (
            <div
              key={hl.number}
              className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                hl.highlight
                  ? 'bg-[#EEF7F8] border-[#DCEFF2]'
                  : 'bg-white border-[#E2ECEF]'
              }`}
            >
              <div>
                <h4 className="text-xs font-bold text-[#173B4D]">{hl.name}</h4>
                <p className="text-[11px] text-[#5A7382] mt-0.5">{hl.description}</p>
                <div className="text-base font-extrabold text-[#173B4D] font-mono mt-1">
                  {hl.number}
                </div>
              </div>

              <a
                href={`tel:${hl.number}`}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2E7D82] text-white text-xs font-bold hover:bg-[#25666a] transition-all shadow-sm shrink-0"
              >
                <PhoneCall className="h-3.5 w-3.5" />
                <span>Call Now</span>
              </a>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: GO-BAG CHECKLIST */}
      {activeTab === 'GOBAG' && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-[#EEF7F8] border border-[#DCEFF2] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-[#2E7D82]" />
              <span className="font-bold text-[#173B4D]">Evacuation Go-Bag Ready:</span>
            </div>
            <span className="font-bold text-[#2E7D82]">
              {checkedCount} of {itemsList.length} packed
            </span>
          </div>

          <div className="space-y-2">
            {itemsList.map((item) => (
              <label
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer select-none transition-all ${
                  item.checked
                    ? 'bg-[#F7FAFA] border-[#E2ECEF] text-[#8CA2AE]'
                    : 'bg-white border-[#E2ECEF] text-[#173B4D]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => {}}
                  className="h-4 w-4 mt-0.5 rounded text-[#2E7D82] focus:ring-[#2E7D82]"
                />
                <div className="text-xs">
                  <span className={item.checked ? 'line-through text-[#8CA2AE]' : 'font-medium'}>
                    {item.text}
                  </span>
                  <span className="block text-[10px] text-[#8CA2AE] mt-0.5 uppercase tracking-wider font-semibold">
                    Category: {item.category}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DO'S AND DON'TS */}
      {activeTab === 'WARNINGS' && (
        <div className="space-y-3">
          {/* DO'S */}
          <div className="p-4 rounded-2xl bg-white border border-[#E2ECEF] space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#4F8A68] uppercase tracking-wider">
              <CheckCircle2 className="h-4 w-4" />
              <span>Critical DO'S (Follow strictly)</span>
            </div>
            <ul className="space-y-2 text-xs text-[#4B6370]">
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4F8A68] shrink-0 mt-1.5" />
                <span>Follow designated elevated roads (Western Express Flyovers, Ambedkar Rd).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4F8A68] shrink-0 mt-1.5" />
                <span>Keep battery saver mode turned ON and screen brightness low.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4F8A68] shrink-0 mt-1.5" />
                <span>Listen only to official MCGM Disaster Cell alerts and verified radar feeds.</span>
              </li>
            </ul>
          </div>

          {/* DON'TS */}
          <div className="p-4 rounded-2xl bg-white border border-[#E2ECEF] space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#E85D5D] uppercase tracking-wider">
              <XCircle className="h-4 w-4" />
              <span>Critical DON'TS (Life-threatening mistakes)</span>
            </div>
            <ul className="space-y-2 text-xs text-[#4B6370]">
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E85D5D] shrink-0 mt-1.5" />
                <span>DO NOT enter subways (Milan, Andheri, Sion) when water is above pavement.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E85D5D] shrink-0 mt-1.5" />
                <span>DO NOT touch roadside electric junction boxes, street poles, or transformer fences.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E85D5D] shrink-0 mt-1.5" />
                <span>DO NOT spread unverified WhatsApp rumors regarding dam breaches.</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
