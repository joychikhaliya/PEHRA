import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  AlertTriangle,
  ArrowRight,
  Droplets,
  CloudRain,
  Activity,
  ShieldCheck,
  Radio,
  MapPin,
  Flame,
  LifeBuoy,
  Building2,
  Users,
  Compass,
  Layers,
  Plus,
  Minus,
  Crosshair,
  TrendingUp,
  Clock,
  CheckCircle2,
  HelpCircle,
  Truck,
  BatteryCharging,
  Satellite,
  Database,
  ExternalLink,
  ChevronRight,
  Info,
  Wind,
  Waves,
  Gauge,
  Navigation,
  Battery,
  BatteryLow,
  BatteryWarning,
  ArrowUpRight,
  Eye,
  Sliders,
} from 'lucide-react';
import { Village, Incident, Alert, Shelter, Hospital, DataSource, FloodReport } from '../types/index.ts';
import { Language, TRANSLATIONS } from '../utils/i18n.ts';
import { useBatteryStatus } from '../hooks/useBatteryStatus.ts';

interface PehraModernDashboardProps {
  villages: Village[];
  incidents: Incident[];
  alerts: Alert[];
  shelters: Shelter[];
  hospitals: Hospital[];
  sources: DataSource[];
  reports: FloodReport[];
  language?: Language;
  onNavigate: (tab: string) => void;
  onSelectIncident?: (incident: Incident) => void;
  onSelectAlert?: (alert: Alert) => void;
  onOpenReportModal?: () => void;
}

export const PehraModernDashboard: React.FC<PehraModernDashboardProps> = ({
  villages,
  incidents,
  alerts,
  shelters,
  hospitals,
  sources,
  reports,
  language = 'en',
  onNavigate,
  onSelectIncident,
  onSelectAlert,
  onOpenReportModal,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const battery = useBatteryStatus();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [spreadStep, setSpreadStep] = useState<number>(0); // 0: Now, 1: 30m, 2: 1h, 3: 2h, 4: 3h
  const [selectedMapLayer, setSelectedMapLayer] = useState<string>('all');
  const [showLayerMenu, setShowLayerMenu] = useState<boolean>(false);
  const [showBatteryPopover, setShowBatteryPopover] = useState<boolean>(false);

  // Live real-time environmental telemetry state
  const [liveWind, setLiveWind] = useState({
    speed: 42.4, // km/h
    gusts: 64, // km/h
    direction: 245, // WSW
    directionLabel: 'WSW',
    pressure: 996, // hPa
    surgeTidePush: '+0.35m',
    status: 'Monsoon Force 6 Gale',
  });

  const [liveWaterApproaching, setLiveWaterApproaching] = useState({
    velocity: 1.82, // m/s downstream surge velocity
    highTideHeight: 4.45, // meters
    highTideTime: '21:30 IST',
    highTideEtaMinutes: 42,
    upstreamDischargeRate: 168, // m³/s from Vihar & Powai lakes
    hotspots: [
      { name: 'Kurla East (S.G. Barve Marg)', etaMinutes: 32, rate: '+4.2 cm/h', risk: 'Critical', depth: '0.85m' },
      { name: 'Sion Railway Culvert', etaMinutes: 45, rate: '+3.8 cm/h', risk: 'High', depth: '0.62m' },
      { name: 'Milan Subway (Santacruz)', etaMinutes: 18, rate: '+5.1 cm/h', risk: 'Submerged', depth: '1.20m' },
      { name: 'Hindmata Junction (Dadar)', etaMinutes: 52, rate: '+2.9 cm/h', risk: 'Moderate', depth: '0.45m' },
    ],
  });

  const [liveFloodArea, setLiveFloodArea] = useState({
    activeSubmergedKm2: 6.4,
    threatenedKm2: 10.2,
    expansionNextHourKm2: 3.8,
    affectedWardsCount: 5,
    submergedWards: [
      { ward: 'Ward L', area: 'Kurla East', submergedKm2: 1.8, depthM: 0.85, status: 'Severe Ingress' },
      { ward: 'Ward G-North', area: 'Dharavi / Mithi Basin', submergedKm2: 1.5, depthM: 0.70, status: 'Critical' },
      { ward: 'Ward F-North', area: 'Sion & Chunabhatti', submergedKm2: 1.2, depthM: 0.62, status: 'High' },
      { ward: 'Ward K-East', area: 'Milan Subway & Vakola', submergedKm2: 0.9, depthM: 1.20, status: 'Submerged' },
      { ward: 'Ward H-East', area: 'BKC Lowlands', submergedKm2: 1.0, depthM: 0.40, status: 'Watch' },
    ],
  });

  // Live real-time sensor fluctuation ticker
  useEffect(() => {
    const timer = setInterval(() => {
      // Gentle realistic sensor noise to reflect live streaming telemetry
      setLiveWind((prev) => {
        const delta = (Math.random() - 0.5) * 0.8;
        const newSpeed = Math.round((prev.speed + delta) * 10) / 10;
        return {
          ...prev,
          speed: Math.max(38, Math.min(48, newSpeed)),
        };
      });

      setLiveWaterApproaching((prev) => {
        const deltaVel = (Math.random() - 0.5) * 0.04;
        const newVel = Math.round((prev.velocity + deltaVel) * 100) / 100;
        return {
          ...prev,
          velocity: Math.max(1.6, Math.min(2.1, newVel)),
        };
      });
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  // Leaflet map container ref
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const filterOptions = [
    { id: 'all', label: t.filterAllAreas },
    { id: 'risk', label: t.filterRisk },
    { id: 'rainfall', label: t.filterRainfall },
    { id: 'water', label: t.filterWaterLevel },
    { id: 'incidents', label: t.filterIncidents },
  ];

  const spreadTimeline = [
    { step: 0, label: 'Now', time: '20:48', riskKm2: '4.2 km²' },
    { step: 1, label: '30m', time: '21:18', riskKm2: '7.8 km²' },
    { step: 2, label: '1h', time: '21:48', riskKm2: '12.4 km²' },
    { step: 3, label: '2h', time: '22:48', riskKm2: '18.6 km²' },
    { step: 4, label: '3h', time: '23:48', riskKm2: '24.1 km²' },
  ];

  // Initialize interactive Leaflet map with clean light CartoDB style
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [19.076, 72.8777], // Mumbai Center / Kurla - BKC
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
      });

      // CartoDB Positron Light Basemap
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const group = markersGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // 1. Live Flood Area: Mithi River & Kurla Corridor Inundation Polygon
    const mithiFloodCoords: [number, number][] = [
      [19.088, 72.865],
      [19.082, 72.872],
      [19.075, 72.878],
      [19.068, 72.882],
      [19.062, 72.875],
      [19.069, 72.868],
      [19.078, 72.861],
    ];

    const showFloodAreaLayer = selectedMapLayer === 'all' || selectedMapLayer === 'flood_area' || selectedMapLayer === 'risk';
    const showWaterApproachingLayer = selectedMapLayer === 'all' || selectedMapLayer === 'water_approaching' || selectedMapLayer === 'water';
    const showWindLayer = selectedMapLayer === 'all' || selectedMapLayer === 'wind';

    if (showFloodAreaLayer) {
      // Dynamic polygon opacity & color based on spread step
      const floodPolygon = L.polygon(mithiFloodCoords, {
        color: '#18B7A0',
        fillColor: '#35C9D0',
        fillOpacity: 0.32 + spreadStep * 0.06,
        weight: 2.5,
        dashArray: spreadStep > 1 ? '4, 4' : undefined,
      }).addTo(group);

      floodPolygon.bindPopup(`
        <div class="p-2 text-xs font-sans">
          <div class="flex items-center gap-1.5 font-bold text-[#17242A] text-sm">
            <span class="h-2 w-2 rounded-full bg-[#18B7A0]"></span>
            <span>Mithi River Basin Basin (6.4 km² Submerged)</span>
          </div>
          <p class="text-[#6B7C83] mt-0.5">Average Inundation Depth: 0.85m • Severe Water Ingress</p>
          <div class="mt-1.5 flex items-center justify-between text-[11px]">
            <span class="font-bold text-[#E65A68]">Status: Active Submergence</span>
            <span class="text-[#18B7A0] font-mono font-semibold">Rising +4.2 cm/hr</span>
          </div>
        </div>
      `);

      // Secondary flood area: Dharavi Basin
      const dharaviCoords: [number, number][] = [
        [19.055, 72.855],
        [19.048, 72.862],
        [19.040, 72.858],
        [19.044, 72.848],
      ];
      const dharaviPolygon = L.polygon(dharaviCoords, {
        color: '#5B9CF6',
        fillColor: '#5B9CF6',
        fillOpacity: 0.28,
        weight: 2,
      }).addTo(group);

      dharaviPolygon.bindPopup(`
        <div class="p-2 text-xs font-sans">
          <strong class="text-[#17242A]">Dharavi / Mithi Lowland (1.5 km²)</strong>
          <p class="text-[#6B7C83] mt-0.5">Water Depth: 0.70m • Inundation expanding</p>
        </div>
      `);

      // Milan Subway Critical Submerged Pin
      const milanMarker = L.circleMarker([19.088, 72.844], {
        radius: 8,
        color: '#E65A68',
        fillColor: '#E65A68',
        fillOpacity: 0.9,
        weight: 2.5,
      }).addTo(group);

      milanMarker.bindPopup(`
        <div class="p-2 text-xs font-sans">
          <strong class="text-[#E65A68] font-bold">Milan Subway (Santacruz)</strong>
          <p class="text-[#17242A] mt-0.5">Water Depth: 1.20m • Submerged & Impassable</p>
          <span class="text-[10px] text-rose-600 font-semibold">Vehicular Traffic Barricaded</span>
        </div>
      `);
    }

    // 2. Approaching Water Inflow Surge Vectors (Upstream discharge -> Channel -> Coast)
    if (showWaterApproachingLayer) {
      const surgeCoords: [number, number][] = [
        [19.125, 72.905], // Vihar / Powai catchments
        [19.102, 72.888], // Saki Naka junction
        [19.082, 72.872], // Kurla North
        [19.075, 72.878], // Kurla East S.G. Barve
        [19.058, 72.852], // Mahim Bay estuary
      ];

      const surgeLine = L.polyline(surgeCoords, {
        color: '#35C9D0',
        weight: 4.5,
        opacity: 0.85,
        dashArray: '8, 6',
      }).addTo(group);

      surgeLine.bindPopup(`
        <div class="p-2 text-xs font-sans">
          <div class="flex items-center gap-1.5 font-bold text-[#18B7A0]">
            <span>⚡ Approaching Water Surge Path</span>
          </div>
          <p class="text-[#17242A] mt-1 font-medium">Velocity: 1.8 m/s downstream inflow</p>
          <p class="text-[#6B7C83] text-[11px]">Upstream Lake Discharge: 168 m³/s</p>
          <p class="text-[#F28B55] text-[11px] font-semibold mt-0.5">High Tide Confluence: 4.45m arriving in 42 min</p>
        </div>
      `);

      // Coastal High Tide Inflow Marker at Mahim Bay mouth
      const tideMarker = L.circleMarker([19.045, 72.836], {
        radius: 8,
        color: '#18B7A0',
        fillColor: '#DDF8F6',
        fillOpacity: 1,
        weight: 3,
      }).addTo(group);

      tideMarker.bindPopup(`
        <div class="p-2 text-xs font-sans">
          <strong class="text-[#18B7A0] font-bold">Mahim Bay High Tide Gateway</strong>
          <p class="text-[#17242A] mt-0.5">Astronomical Surge: 4.45m @ 21:30 IST</p>
          <span class="text-[10px] text-[#6B7C83]">Creates +0.35m backwater lock at Mithi River</span>
        </div>
      `);
    }

    // 3. Live Wind Vector Streamlines from Arabian Sea (WSW 245°)
    if (showWindLayer) {
      const windStream1: [number, number][] = [
        [19.018, 72.802],
        [19.058, 72.845],
      ];
      const windStream2: [number, number][] = [
        [19.052, 72.812],
        [19.095, 72.858],
      ];

      L.polyline(windStream1, {
        color: '#6D8CFF',
        weight: 3,
        opacity: 0.75,
        dashArray: '5, 8',
      }).addTo(group);

      const windMarker = L.polyline(windStream2, {
        color: '#6D8CFF',
        weight: 3,
        opacity: 0.75,
        dashArray: '5, 8',
      }).addTo(group);

      windMarker.bindPopup(`
        <div class="p-2 text-xs font-sans">
          <strong class="text-[#6D8CFF] font-bold">Live Wind Stream: 42 km/h WSW</strong>
          <p class="text-[#17242A] mt-0.5">Direction: 245° (Arabian Sea Onshore)</p>
          <p class="text-[#6B7C83] text-[11px]">Gusts to 64 km/h • Pressure 996 hPa</p>
        </div>
      `);
    }

    // 4. Add Kurla East Priority Pin
    const kurlaMarker = L.circleMarker([19.0657, 72.8794], {
      radius: 9,
      color: '#F28B55',
      fillColor: '#F28B55',
      fillOpacity: 0.9,
      weight: 3,
    }).addTo(group);

    kurlaMarker.bindPopup(`
      <div class="p-2 text-xs font-sans">
        <strong class="text-[#F28B55] font-bold">Kurla East Priority Incident</strong>
        <p class="text-[#17242A] mt-0.5">High Flood Risk • Ingress in 32 min</p>
        <span class="text-[10px] text-[#6B7C83]">Population: 18,200 • Water Approaching at 1.8 m/s</span>
      </div>
    `);

    // 5. Add Shelters
    const shelterMarker = L.circleMarker([19.071, 72.885], {
      radius: 6,
      color: '#20B486',
      fillColor: '#FFFFFF',
      fillOpacity: 1,
      weight: 2.5,
    }).addTo(group);

    shelterMarker.bindPopup(`
      <div class="p-2 text-xs font-sans">
        <strong class="text-[#20B486]">Kurla Community Shelter</strong>
        <p class="text-[#6B7C83] mt-0.5">Capacity: 420 / 600 (180 Avail)</p>
      </div>
    `);

    // 6. Add Municipal Hospital
    const hospitalMarker = L.circleMarker([19.079, 72.862], {
      radius: 6,
      color: '#6D8CFF',
      fillColor: '#FFFFFF',
      fillOpacity: 1,
      weight: 2.5,
    }).addTo(group);

    hospitalMarker.bindPopup(`
      <div class="p-2 text-xs font-sans">
        <strong class="text-[#6D8CFF]">Municipal Hospital</strong>
        <p class="text-[#6B7C83] mt-0.5">Emergency: Available • 3 Ambulances</p>
      </div>
    `);

    // Invalidate size after container mount
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [spreadStep, selectedMapLayer]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleLocate = () => {
    mapInstanceRef.current?.setView([19.076, 72.8777], 13);
  };

  return (
    <div className="space-y-5">
      {/* 1. GREETING & OPERATIONAL HEADER (Section 8) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider uppercase text-[#18B7A0] bg-[#DDF8F6] px-2.5 py-0.5 rounded-full border border-[#35C9D0]/30">
              {t.greetingAuthority}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#17242A] mt-1">
            {t.mumbaiIntelligence}
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7C83] mt-0.5">
            {t.intelligenceSubtitle}
          </p>
        </div>

        {/* Live Status and Front-Page Battery Percentage Shower */}
        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          {/* Front Page Battery Percentage Shower */}
          <div className="relative">
            <button
              onClick={() => setShowBatteryPopover(!showBatteryPopover)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 shadow-xs transition-all ${
                battery.isCritical
                  ? 'border-rose-300 bg-rose-50 text-rose-800'
                  : battery.isLowBattery
                  ? 'border-amber-300 bg-amber-50 text-amber-800'
                  : 'border-[#E2EAED] bg-white text-[#17242A] hover:bg-slate-50'
              }`}
              title="Device Battery Percentage • Click to inspect and simulate field power levels"
            >
              {battery.isCharging ? (
                <BatteryCharging className="h-4 w-4 text-[#18B7A0] animate-pulse" />
              ) : battery.isCritical ? (
                <BatteryWarning className="h-4 w-4 text-rose-600 animate-bounce" />
              ) : battery.isLowBattery ? (
                <BatteryLow className="h-4 w-4 text-amber-600" />
              ) : (
                <Battery className="h-4 w-4 text-[#18B7A0]" />
              )}
              <span className="text-xs font-mono font-extrabold">{battery.level}%</span>
              <span className="text-[10px] text-[#6B7C83] font-medium hidden sm:inline">
                {battery.isCharging ? 'Charging' : battery.isCritical ? 'Critical' : battery.isLowBattery ? 'Low' : 'Field OK'}
              </span>
            </button>

            {/* Quick Test Popover if clicked */}
            {showBatteryPopover && (
              <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl border border-[#E2EAED] bg-white p-3.5 shadow-xl z-50 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 font-bold text-[#17242A]">
                    <Battery className="h-3.5 w-3.5 text-[#18B7A0]" />
                    <span>{t.batteryTitle}</span>
                  </div>
                  <span className="font-mono font-extrabold text-[#18B7A0] text-sm">{battery.level}%</span>
                </div>
                <div className="mt-2 text-[11px] text-[#6B7C83] leading-relaxed">
                  {battery.isCritical
                    ? 'Critical battery: offline SMS fallbacks primed.'
                    : battery.isLowBattery
                    ? 'Low power: telemetry poll rate throttled to 60s.'
                    : 'Battery optimal: continuous high-frequency telemetry streaming active.'}
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-100">
                  <div className="text-[10px] font-bold text-[#6B7C83] uppercase mb-1">Simulate Battery:</div>
                  <div className="grid grid-cols-4 gap-1 text-center font-mono text-[10px] font-bold">
                    <button
                      onClick={() => { battery.setSimulatedLevel(8); setShowBatteryPopover(false); }}
                      className="py-1 rounded bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                    >
                      8%
                    </button>
                    <button
                      onClick={() => { battery.setSimulatedLevel(14); setShowBatteryPopover(false); }}
                      className="py-1 rounded bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                    >
                      14%
                    </button>
                    <button
                      onClick={() => { battery.setSimulatedLevel(82); setShowBatteryPopover(false); }}
                      className="py-1 rounded bg-[#DDF8F6] text-[#18B7A0] border border-[#35C9D0]/30 hover:bg-[#cbf5f0]"
                    >
                      82%
                    </button>
                    <button
                      onClick={() => { battery.setSimulatedLevel(null); setShowBatteryPopover(false); }}
                      className="py-1 rounded bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200"
                    >
                      Live
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Live Status indicator */}
          <div className="flex items-center gap-2 rounded-full border border-[#E2EAED] bg-white px-3.5 py-1.5 shadow-xs">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#18B7A0] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#18B7A0]" />
            </span>
            <span className="text-xs font-bold text-[#17242A] tracking-wider">{t.liveStatus}</span>
            <span className="text-xs text-[#6B7C83] font-mono border-l border-[#E2EAED] pl-2">
              20:48 IST
            </span>
          </div>
        </div>
      </div>

      {/* 2. TOP FILTER PILLS (Section 9) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {filterOptions.map((f) => {
          const isSelected = activeFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all shrink-0 select-none ${
                isSelected
                  ? 'bg-[#18B7A0] text-white shadow-xs'
                  : 'bg-[#EEF6F7] text-[#6B7C83] hover:bg-[#E2EAED] hover:text-[#17242A]'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* 3. EMERGENCY ALERT FLOATING CARD (Section 26 - Warning Banner) */}
      <div className="relative overflow-hidden rounded-[20px] border border-[#F28B55]/40 bg-gradient-to-r from-amber-50/90 via-orange-50/70 to-white p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F28B55] text-white shrink-0 mt-0.5 shadow-xs">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs uppercase tracking-wider text-[#F28B55]">
                  ⚠ {t.floodWarning}
                </span>
                <span className="text-[11px] font-semibold text-[#17242A] bg-white px-2 py-0.5 rounded-full border border-[#E2EAED]">
                  Kurla East
                </span>
              </div>
              <p className="text-xs text-[#17242A] font-medium mt-1">
                Expected impact in <span className="font-bold">90 min</span> • Monitored population:{' '}
                <span className="font-bold">18,200</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('evacuation')}
            className="self-start sm:self-auto rounded-xl bg-[#F28B55] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#e07b46] transition-colors shrink-0"
          >
            {t.evacuationRoute} →
          </button>
        </div>
      </div>

      {/* 4. MAIN HERO CARD (Section 10) */}
      <div className="relative overflow-hidden rounded-[24px] border border-[#E2EAED] bg-white p-6 shadow-xs">
        {/* Subtle abstract water / radar ambient gradient */}
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-gradient-to-bl from-[#18B7A0]/10 via-[#35C9D0]/10 to-transparent blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-[#DDF8F6]/40 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2EAED] pb-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#17242A]">
                {t.situationTitle}
              </h2>
              <p className="text-xs text-[#6B7C83] mt-0.5">{t.situationSubtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6B7C83]">{t.currentRisk}:</span>
              <span className="rounded-full bg-[#E8B84A]/15 border border-[#E8B84A]/40 px-3 py-1 text-xs font-bold text-[#b4861b] tracking-wider uppercase">
                MODERATE
              </span>
            </div>
          </div>

          {/* 4 Metric Columns */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-5">
            <div className="rounded-2xl bg-[#F5F8FA] p-4 border border-[#E2EAED]/70">
              <span className="text-[11px] font-semibold text-[#6B7C83] uppercase tracking-wider block">
                {t.currentRisk}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-[#E8B84A]">MODERATE</span>
              </div>
              <span className="text-[11px] text-[#6B7C83] mt-1 block">
                Peak expected in 2.5 hrs
              </span>
            </div>

            <div className="rounded-2xl bg-[#F5F8FA] p-4 border border-[#E2EAED]/70">
              <span className="text-[11px] font-semibold text-[#6B7C83] uppercase tracking-wider block">
                {t.areasMonitored}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-[#17242A]">124</span>
                <span className="text-xs text-[#18B7A0] font-semibold">Zones Active</span>
              </div>
              <span className="text-[11px] text-[#6B7C83] mt-1 block">Greater Mumbai MMR</span>
            </div>

            <div className="rounded-2xl bg-[#F5F8FA] p-4 border border-[#E2EAED]/70">
              <span className="text-[11px] font-semibold text-[#6B7C83] uppercase tracking-wider block">
                {t.activeIncidents}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-[#F28B55]">06</span>
                <span className="text-xs text-slate-500 font-normal">2 High Priority</span>
              </div>
              <span className="text-[11px] text-[#6B7C83] mt-1 block">Response teams deployed</span>
            </div>

            <div className="rounded-2xl bg-[#F5F8FA] p-4 border border-[#E2EAED]/70">
              <span className="text-[11px] font-semibold text-[#6B7C83] uppercase tracking-wider block">
                {t.populationAffected}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-[#17242A]">42,850</span>
              </div>
              <span className="text-[11px] text-[#6B7C83] mt-1 block">Under tactical watch</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4.5. LIVE SENSOR TELEMETRY STREAM RIBBON (Wind • Water Approaching • Flood Area • Battery) */}
      <div className="rounded-2xl border border-[#35C9D0]/30 bg-gradient-to-r from-[#DDF8F6]/80 via-white to-[#F5F8FA] p-3 shadow-xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-[#17242A] shrink-0">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#18B7A0] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#18B7A0]" />
            </span>
            <span className="uppercase tracking-wider text-[11px] text-[#18B7A0]">Hyperlocal Live Streams:</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 flex-1">
            {/* Live Wind Pill */}
            <div className="flex items-center gap-2 rounded-xl bg-white/90 border border-[#E2EAED] px-3 py-1.5 shadow-xs">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
                <Wind className="h-3.5 w-3.5 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-[#6B7C83] font-medium leading-none truncate">{t.liveWindTitle}</div>
                <div className="text-xs font-bold text-[#17242A] font-mono mt-0.5">
                  {liveWind.speed} <span className="text-[10px] font-sans font-normal text-slate-500">km/h</span>{' '}
                  <span className="text-[10px] text-blue-600 font-semibold">{liveWind.directionLabel}</span>
                </div>
              </div>
            </div>

            {/* Water Approaching Surge Pill */}
            <div className="flex items-center gap-2 rounded-xl bg-white/90 border border-[#E2EAED] px-3 py-1.5 shadow-xs">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-50 text-[#18B7A0] shrink-0">
                <Waves className="h-3.5 w-3.5 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-[#6B7C83] font-medium leading-none truncate">{t.waterApproachingTitle}</div>
                <div className="text-xs font-bold text-[#17242A] font-mono mt-0.5">
                  {liveWaterApproaching.velocity} <span className="text-[10px] font-sans font-normal text-slate-500">m/s</span>{' '}
                  <span className="text-[10px] text-[#F28B55] font-semibold">Tide -{liveWaterApproaching.highTideEtaMinutes}m</span>
                </div>
              </div>
            </div>

            {/* Flood Area Inundated Pill */}
            <div className="flex items-center gap-2 rounded-xl bg-white/90 border border-[#E2EAED] px-3 py-1.5 shadow-xs">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                <Layers className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-[#6B7C83] font-medium leading-none truncate">{t.floodAreaTitle}</div>
                <div className="text-xs font-bold text-[#17242A] font-mono mt-0.5">
                  {liveFloodArea.activeSubmergedKm2} <span className="text-[10px] font-sans font-normal text-slate-500">km²</span>{' '}
                  <span className="text-[10px] text-rose-600 font-semibold">(5 Wards)</span>
                </div>
              </div>
            </div>

            {/* Field Battery Shower Pill */}
            <div className="flex items-center gap-2 rounded-xl bg-white/90 border border-[#E2EAED] px-3 py-1.5 shadow-xs">
              <div className={`flex h-6 w-6 items-center justify-center rounded-lg shrink-0 ${
                battery.isCritical
                  ? 'bg-rose-50 text-rose-600'
                  : battery.isLowBattery
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-teal-50 text-[#18B7A0]'
              }`}>
                {battery.isCharging ? (
                  <BatteryCharging className="h-3.5 w-3.5 animate-pulse" />
                ) : (
                  <Battery className="h-3.5 w-3.5" />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-[#6B7C83] font-medium leading-none truncate">{t.batteryTitle}</div>
                <div className="text-xs font-bold text-[#17242A] font-mono mt-0.5">
                  {battery.level}%{' '}
                  <span className="text-[10px] font-sans font-normal text-slate-500">
                    {battery.isCharging ? 'Charging' : battery.isLowBattery ? 'Low' : 'Ready'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. 2-COLUMN MAIN CONTENT & RIGHT PANELS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* LEFT 2 COLS: Map, Rainfall, Water Level, Flood Spread */}
        <div className="xl:col-span-2 space-y-5">
          {/* LIVE FLOOD MAP CARD (Sections 11-13) */}
          <div className="relative overflow-hidden rounded-[24px] border border-[#E2EAED] bg-white shadow-xs">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E2EAED] bg-white">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#DDF8F6] text-[#18B7A0]">
                  <Compass className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#17242A]">{t.liveFloodMap}</h3>
                  <p className="text-[11px] text-[#6B7C83]">Mithi River & Central Suburbs Basin</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('map')}
                  className="rounded-xl border border-[#E2EAED] bg-[#EEF6F7] px-2.5 py-1 text-xs font-semibold text-[#18B7A0] hover:bg-[#DDF8F6] transition-colors"
                >
                  Expand GIS Fullscreen →
                </button>
              </div>
            </div>

            {/* Map Canvas Container */}
            <div className="relative h-[380px] w-full bg-[#F5F8FA]">
              <div ref={mapContainerRef} className="h-full w-full" />

              {/* Floating Layer Selection Card on Map (Section 13) */}
              <div className="absolute top-3 left-3 z-[400] rounded-2xl border border-white/80 bg-white/90 p-2 shadow-md backdrop-blur-md">
                <div className="flex items-center justify-between gap-2 px-1 pb-1 text-[11px] font-bold text-[#17242A]">
                  <span className="flex items-center gap-1">
                    <Layers className="h-3 w-3 text-[#18B7A0]" /> Layers
                  </span>
                </div>
                <div className="flex flex-col gap-1 pt-1 text-xs">
                  {[
                    { id: 'all', label: 'All Tactical Overlays' },
                    { id: 'flood_area', label: '🌊 Flood Area (6.4 km²)' },
                    { id: 'water_approaching', label: '⚡ Water Inflow Surge' },
                    { id: 'wind', label: '💨 Wind Vectors (42 km/h)' },
                    { id: 'risk', label: 'Risk Zones' },
                    { id: 'rainfall', label: 'Rainfall Radar' },
                  ].map((layer) => (
                    <button
                      key={layer.id}
                      onClick={() => setSelectedMapLayer(layer.id)}
                      className={`flex items-center justify-between rounded-lg px-2.5 py-1 text-left text-[11px] font-medium transition-colors ${
                        selectedMapLayer === layer.id
                          ? 'bg-[#18B7A0] text-white font-semibold'
                          : 'text-[#6B7C83] hover:bg-slate-100 hover:text-[#17242A]'
                      }`}
                    >
                      <span>{layer.label}</span>
                      {selectedMapLayer === layer.id && (
                        <CheckCircle2 className="h-3 w-3 text-white ml-1.5" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Floating Zoom & Locate Controls (Section 13) */}
              <div className="absolute bottom-4 right-4 z-[400] flex flex-col rounded-2xl border border-white/80 bg-white/90 shadow-md backdrop-blur-md overflow-hidden">
                <button
                  onClick={handleZoomIn}
                  className="p-2 text-slate-700 hover:bg-slate-100 transition-colors border-b border-slate-100"
                  title="Zoom in"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={handleZoomOut}
                  className="p-2 text-slate-700 hover:bg-slate-100 transition-colors border-b border-slate-100"
                  title="Zoom out"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={handleLocate}
                  className="p-2 text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Center Kurla East"
                >
                  <Crosshair className="h-3.5 w-3.5 text-[#18B7A0]" />
                </button>
              </div>

              {/* Subtle Map Legend Pill */}
              <div className="absolute bottom-4 left-4 z-[400] flex items-center gap-3 rounded-full border border-white/80 bg-white/90 px-3 py-1 text-[11px] shadow-sm backdrop-blur-md flex-wrap">
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-[#18B7A0]" />
                  <span className="text-[#6B7C83]">6.4 km² Flood Area</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-[#35C9D0]" />
                  <span className="text-[#6B7C83]">Water Inflow</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-[#6D8CFF]" />
                  <span className="text-[#6B7C83]">Wind 42 km/h</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-[#F28B55]" />
                  <span className="text-[#6B7C83]">Kurla Risk</span>
                </div>
              </div>
            </div>
          </div>

          {/* LIVE TELEMETRY TRIO: LIVE WIND • WATER APPROACHING • LIVE FLOOD AREA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. LIVE WIND DYNAMICS CARD */}
            <div className="rounded-[24px] border border-[#E2EAED] bg-white p-5 shadow-xs flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-blue-50/60 blur-xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Wind className="h-4 w-4 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#17242A] block leading-tight">{t.liveWindTitle}</span>
                      <span className="text-[10px] text-[#6B7C83]">Arabian Sea Inflow</span>
                    </div>
                  </div>
                  <span className="rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 text-[10px] font-bold border border-blue-200">
                    Live Stream
                  </span>
                </div>

                {/* Big Wind Metric & Compass Graphic */}
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold text-[#17242A] font-mono tracking-tight">
                        {liveWind.speed}
                      </span>
                      <span className="text-xs font-semibold text-[#6B7C83]">km/h</span>
                    </div>
                    <div className="text-xs font-bold text-blue-700 mt-0.5 flex items-center gap-1">
                      <span>{liveWind.directionLabel} (245°)</span>
                      <span className="text-[10px] font-normal text-slate-500">• Gale Force 6</span>
                    </div>
                  </div>

                  {/* SVG Compass Dial */}
                  <div className="relative h-14 w-14 rounded-full border border-blue-200 bg-blue-50/50 flex items-center justify-center shrink-0">
                    <div className="absolute top-1 text-[8px] font-bold text-slate-400">N</div>
                    <div className="absolute bottom-1 text-[8px] font-bold text-slate-400">S</div>
                    <div className="absolute left-1 text-[8px] font-bold text-slate-400">W</div>
                    <div className="absolute right-1 text-[8px] font-bold text-slate-400">E</div>
                    {/* Rotated Compass Needle pointing 245 deg (WSW) */}
                    <div
                      className="h-9 w-9 flex items-center justify-center transition-transform duration-700"
                      style={{ transform: `rotate(${liveWind.direction}deg)` }}
                    >
                      <Navigation className="h-5 w-5 text-blue-600 fill-blue-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Wind Detail Metrics */}
              <div className="mt-4 pt-3 border-t border-[#E2EAED]/70 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#6B7C83]">{t.windGustLabel}</span>
                  <span className="font-mono font-bold text-[#17242A]">{liveWind.gusts} km/h</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#6B7C83]">Barometric Pressure</span>
                  <span className="font-mono font-bold text-[#17242A]">{liveWind.pressure} hPa</span>
                </div>
                <div className="rounded-xl bg-[#F5F8FA] p-2 border border-[#E2EAED]/60 text-[10px] text-[#6B7C83] leading-tight">
                  <strong className="text-blue-700 font-semibold block mb-0.5">Surge Piling Effect:</strong>
                  Wind vector pushing +0.35m tide into Mahim Bay, retarding Mithi River natural drainage.
                </div>
              </div>
            </div>

            {/* 2. WATER APPROACHING & SURGE INFLOW CARD */}
            <div className="rounded-[24px] border border-[#E2EAED] bg-white p-5 shadow-xs flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-cyan-50/60 blur-xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-50 text-[#18B7A0]">
                      <Waves className="h-4 w-4 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#17242A] block leading-tight">{t.waterApproachingTitle}</span>
                      <span className="text-[10px] text-[#6B7C83]">Catchment & Tidal Surge</span>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#DDF8F6] text-[#18B7A0] px-2 py-0.5 text-[10px] font-bold border border-[#35C9D0]/30">
                    Active Surge
                  </span>
                </div>

                {/* Big Velocity & Tidal Inflow */}
                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold text-[#17242A] font-mono tracking-tight">
                        {liveWaterApproaching.velocity}
                      </span>
                      <span className="text-xs font-semibold text-[#6B7C83]">m/s</span>
                    </div>
                    <div className="text-xs font-bold text-[#18B7A0] mt-0.5">
                      Downstream Surge Velocity
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      High Tide in {liveWaterApproaching.highTideEtaMinutes}m
                    </span>
                    <div className="text-[10px] text-[#6B7C83] mt-1 font-mono">4.45m @ 21:30 IST</div>
                  </div>
                </div>
              </div>

              {/* Water Ingress Matrix to Low-Lying Sectors */}
              <div className="mt-3 pt-2.5 border-t border-[#E2EAED]/70 space-y-1.5 text-xs">
                <div className="text-[10px] font-bold text-[#6B7C83] uppercase tracking-wider flex items-center justify-between">
                  <span>{t.timeToIngressLabel}:</span>
                  <span>Inflow Rate</span>
                </div>
                {liveWaterApproaching.hotspots.slice(0, 3).map((spot, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px] py-0.5 border-b border-slate-50 last:border-0">
                    <div className="flex items-center gap-1.5 truncate pr-1">
                      <span className={`h-1.5 w-1.5 rounded-full ${spot.risk === 'Critical' ? 'bg-rose-600' : 'bg-amber-500'}`} />
                      <span className="text-[#17242A] font-medium truncate">{spot.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 font-mono text-[10px]">
                      <span className="font-bold text-[#F28B55]">{spot.etaMinutes}m</span>
                      <span className="text-[#18B7A0]">{spot.rate}</span>
                    </div>
                  </div>
                ))}
                <div className="text-[10px] text-[#6B7C83] pt-1">
                  Upstream Discharge: <strong className="text-[#17242A] font-mono">168 m³/s</strong> (Vihar & Powai Overflow)
                </div>
              </div>
            </div>

            {/* 3. LIVE FLOOD INUNDATION AREA CARD */}
            <div className="rounded-[24px] border border-[#E2EAED] bg-white p-5 shadow-xs flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-emerald-50/60 blur-xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <Layers className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#17242A] block leading-tight">{t.floodAreaTitle}</span>
                      <span className="text-[10px] text-[#6B7C83]">Greater Mumbai MMR</span>
                    </div>
                  </div>
                  <span className="rounded-full bg-rose-50 text-rose-700 px-2 py-0.5 text-[10px] font-bold border border-rose-200">
                    5 Wards Inundated
                  </span>
                </div>

                {/* Big Inundated Area Metric */}
                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold text-[#17242A] font-mono tracking-tight">
                        {liveFloodArea.activeSubmergedKm2}
                      </span>
                      <span className="text-xs font-semibold text-[#6B7C83]">km²</span>
                    </div>
                    <div className="text-xs font-bold text-emerald-700 mt-0.5">
                      {t.submergedAreaLabel}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      +{liveFloodArea.expansionNextHourKm2} km² in 60m
                    </span>
                    <div className="text-[10px] text-[#6B7C83] mt-1 font-mono">10.2 km² Threat</div>
                  </div>
                </div>
              </div>

              {/* Submerged Ward Breakdown */}
              <div className="mt-3 pt-2.5 border-t border-[#E2EAED]/70 space-y-1.5 text-xs">
                <div className="text-[10px] font-bold text-[#6B7C83] uppercase tracking-wider flex items-center justify-between">
                  <span>Submerged Sector:</span>
                  <span>Depth</span>
                </div>
                {liveFloodArea.submergedWards.slice(0, 3).map((w, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] py-0.5 border-b border-slate-50 last:border-0">
                    <div className="flex items-center gap-1.5 truncate pr-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[#17242A] font-medium truncate">{w.area}</span>
                      <span className="text-[9px] text-[#6B7C83] font-mono">({w.submergedKm2} km²)</span>
                    </div>
                    <span className="font-mono font-bold text-rose-600 text-[10px]">{w.depthM}m</span>
                  </div>
                ))}
                {/* Area ratio progress bar */}
                <div className="pt-1.5">
                  <div className="flex items-center justify-between text-[9px] text-[#6B7C83] mb-1">
                    <span>Inundation Ratio</span>
                    <span className="font-mono text-[#17242A]">6.4 / 24.1 km² Basin</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500"
                      style={{ width: `${(6.4 / 24.1) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TWO METRIC CARDS ROW: RAINFALL (Section 14) + WATER LEVEL (Section 15) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* RAINFALL CARD */}
            <div className="rounded-[24px] border border-[#E2EAED] bg-white p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CloudRain className="h-4 w-4 text-[#18B7A0]" />
                    <span className="text-xs font-bold text-[#17242A]">{t.rainfallTitle}</span>
                  </div>
                  <span className="text-[11px] font-medium text-[#6B7C83]">{t.rainfallSubtitle}</span>
                </div>

                <div className="flex items-baseline gap-2 mt-3">
                  <span className="text-3xl font-extrabold text-[#17242A]">86 mm</span>
                  <span className="text-xs font-semibold text-[#F28B55] bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                    Heavy Intensity
                  </span>
                </div>
              </div>

              {/* Small SVG Rainfall trend chart over last 6h + dotted forecast line */}
              <div className="mt-4 pt-3 border-t border-[#E2EAED]/60">
                <div className="flex items-center justify-between text-[10px] text-[#6B7C83] mb-1">
                  <span>Trend (Last 6h)</span>
                  <span className="text-[#18B7A0] font-semibold">Forecast: 98 mm</span>
                </div>
                <div className="h-16 w-full relative">
                  <svg className="h-full w-full overflow-visible" viewBox="0 0 240 60">
                    <defs>
                      <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#18B7A0" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#18B7A0" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Shaded Area under actuals */}
                    <path
                      d="M 0 50 Q 40 42, 80 32 T 160 14 L 160 60 L 0 60 Z"
                      fill="url(#rainGrad)"
                    />
                    {/* Actual Trend Line */}
                    <path
                      d="M 0 50 Q 40 42, 80 32 T 160 14"
                      fill="none"
                      stroke="#18B7A0"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    {/* Dotted Forecast Line */}
                    <path
                      d="M 160 14 Q 200 8, 240 4"
                      fill="none"
                      stroke="#35C9D0"
                      strokeWidth="2"
                      strokeDasharray="4, 3"
                      strokeLinecap="round"
                    />
                    {/* Current point */}
                    <circle cx="160" cy="14" r="3.5" fill="#18B7A0" stroke="#FFFFFF" strokeWidth="2" />
                    {/* Forecast end point */}
                    <circle cx="240" cy="4" r="2.5" fill="#35C9D0" />
                  </svg>
                </div>
                <div className="flex justify-between text-[10px] text-[#6B7C83] mt-1 font-mono">
                  <span>15:00</span>
                  <span>17:00</span>
                  <span>19:00</span>
                  <span className="font-bold text-[#18B7A0]">Now</span>
                  <span className="text-[#35C9D0]">22:00 (FCST)</span>
                </div>
              </div>
            </div>

            {/* WATER LEVEL CARD (Section 15) */}
            <div className="rounded-[24px] border border-[#E2EAED] bg-white p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-[#18B7A0]" />
                    <span className="text-xs font-bold text-[#17242A]">{t.waterLevelTitle}</span>
                  </div>
                  <span className="rounded-full bg-[#DDF8F6] text-[#18B7A0] px-2 py-0.5 text-[10px] font-bold tracking-wider border border-[#35C9D0]/30">
                    ▲ {t.waterLevelStatus}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mt-3">
                  <span className="text-3xl font-extrabold text-[#17242A]">3.8 m</span>
                  <span className="text-xs text-[#6B7C83]">Gauge: Mithi River Bridge</span>
                </div>
                <span className="text-[11px] text-[#6B7C83] block mt-0.5">{t.updatedAgo}</span>
              </div>

              {/* Water Level line gauge */}
              <div className="mt-4 pt-3 border-t border-[#E2EAED]/60">
                <div className="flex items-center justify-between text-[10px] text-[#6B7C83] mb-1">
                  <span>Danger Mark: 4.2m</span>
                  <span className="font-bold text-[#E8B84A]">0.4m to Warning</span>
                </div>
                <div className="relative h-2 w-full rounded-full bg-[#EEF6F7] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#20B486] via-[#E8B84A] to-[#F28B55]"
                    style={{ width: `${(3.8 / 4.5) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-[#6B7C83] mt-1.5 font-mono">
                  <span>0m Baseline</span>
                  <span>2.5m Warning</span>
                  <span className="font-bold text-[#E65A68]">4.2m Danger</span>
                </div>
              </div>
            </div>
          </div>

          {/* FLOOD SPREAD CARD (Section 19) & PROGRESSION FLOW (Section 28) */}
          <div className="rounded-[24px] border border-[#E2EAED] bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#DDF8F6] text-[#18B7A0]">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#17242A]">{t.floodSpread}</h3>
                  <p className="text-[11px] text-[#6B7C83]">
                    Hydrodynamic Inundation Horizon (Now → 3h)
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('incidents')}
                className="text-xs font-semibold text-[#18B7A0] hover:underline"
              >
                {t.openSpreadMap}
              </button>
            </div>

            {/* Interactive Timeline Stepper (Now ─── 30m ─── 1h ─── 2h ─── 3h) */}
            <div className="pt-2">
              <div className="flex items-center justify-between relative mb-2">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#EEF6F7] -translate-y-1/2 z-0" />
                {spreadTimeline.map((item, idx) => {
                  const isActive = spreadStep === item.step;
                  const isPassed = spreadStep >= item.step;
                  return (
                    <button
                      key={item.step}
                      onClick={() => setSpreadStep(item.step)}
                      className="relative z-10 flex flex-col items-center group focus:outline-none"
                    >
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-[#18B7A0] text-white ring-4 ring-[#DDF8F6] shadow-xs scale-110'
                            : isPassed
                            ? 'bg-[#35C9D0] text-white'
                            : 'bg-white border-2 border-[#E2EAED] text-[#6B7C83] group-hover:border-[#18B7A0]'
                        }`}
                      >
                        {item.step === 0 ? '●' : `+${item.label}`}
                      </div>
                      <span
                        className={`text-[11px] mt-1 font-semibold ${
                          isActive ? 'text-[#18B7A0]' : 'text-[#6B7C83]'
                        }`}
                      >
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Simulation status summary bar */}
              <div className="rounded-xl bg-[#F5F8FA] border border-[#E2EAED] p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span className="text-[#6B7C83]">Projected Inundation at +{spreadTimeline[spreadStep].label}:</span>{' '}
                  <span className="font-bold text-[#17242A]">
                    {spreadTimeline[spreadStep].riskKm2}
                  </span>
                </div>
                <div className="text-[11px] text-[#6B7C83]">
                  Affected Ward: <span className="font-semibold text-[#17242A]">L-Ward (Kurla) & H-East</span>
                </div>
              </div>
            </div>

            {/* FLOOD ORIGIN VISUALIZATION (Section 28) */}
            <div className="pt-2 border-t border-[#E2EAED]/60">
              <span className="text-[11px] font-bold text-[#6B7C83] uppercase tracking-wider block mb-2">
                Flood Origin Pipeline
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="rounded-xl border border-[#E2EAED] bg-white p-2.5">
                  <span className="text-[10px] text-[#6B7C83] block">1. Origin Point</span>
                  <span className="font-semibold text-[#17242A] block mt-0.5">Vihar Lake Overflow</span>
                  <span className="text-[10px] text-[#18B7A0]">Discharge rate 140 m³/s</span>
                </div>
                <div className="rounded-xl border border-[#E2EAED] bg-white p-2.5">
                  <span className="text-[10px] text-[#6B7C83] block">2. Spread Channel</span>
                  <span className="font-semibold text-[#17242A] block mt-0.5">Mithi River Corridor</span>
                  <span className="text-[10px] text-[#F28B55]">High Tide Resistance at Mahim</span>
                </div>
                <div className="rounded-xl border border-[#E2EAED] bg-white p-2.5">
                  <span className="text-[10px] text-[#6B7C83] block">3. Potential Impact</span>
                  <span className="font-semibold text-[#17242A] block mt-0.5">Kurla East & Sion</span>
                  <span className="text-[10px] text-[#E65A68]">18,200 Citizens Alerted</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COL (1 COL): Risk Donut, Active Incidents, Alerts, Prediction, Sources */}
        <div className="space-y-5">
          {/* RISK DISTRIBUTION CARD (Section 16 - Donut Visualization) */}
          <div className="rounded-[24px] border border-[#E2EAED] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2EAED]">
              <h3 className="text-sm font-bold text-[#17242A]">{t.riskDistribution}</h3>
              <span className="text-xs font-semibold text-[#6B7C83]">124 Areas</span>
            </div>

            <div className="flex items-center justify-between gap-4 pt-4">
              {/* Donut Chart SVG */}
              <div className="relative h-28 w-28 shrink-0">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                  {/* Total 124 units. Circumference = 2 * PI * 38 ≈ 238.76 */}
                  {/* 1. Safe (62 / 124 = 50%) -> 119.38 */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#20B486"
                    strokeWidth="12"
                    strokeDasharray="119.38 238.76"
                    strokeDashoffset="0"
                  />
                  {/* 2. Low (31 / 124 = 25%) -> 59.69 */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#5B9CF6"
                    strokeWidth="12"
                    strokeDasharray="59.69 238.76"
                    strokeDashoffset="-119.38"
                  />
                  {/* 3. Moderate (18 / 124 = 14.5%) -> 34.6 */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#E8B84A"
                    strokeWidth="12"
                    strokeDasharray="34.6 238.76"
                    strokeDashoffset="-179.07"
                  />
                  {/* 4. High (10 / 124 = 8%) -> 19.2 */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#F28B55"
                    strokeWidth="12"
                    strokeDasharray="19.2 238.76"
                    strokeDashoffset="-213.67"
                  />
                  {/* 5. Critical (3 / 124 = 2.4%) -> 5.8 */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#E65A68"
                    strokeWidth="12"
                    strokeDasharray="5.8 238.76"
                    strokeDashoffset="-232.87"
                  />
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-base font-extrabold text-[#17242A] leading-none">124</span>
                  <span className="text-[9px] text-[#6B7C83]">Areas</span>
                </div>
              </div>

              {/* Segment legend list */}
              <div className="flex-1 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#20B486]" />
                    <span className="text-[#6B7C83]">Safe</span>
                  </div>
                  <span className="font-semibold text-[#17242A]">62</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#5B9CF6]" />
                    <span className="text-[#6B7C83]">Low</span>
                  </div>
                  <span className="font-semibold text-[#17242A]">31</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#E8B84A]" />
                    <span className="text-[#6B7C83]">Moderate</span>
                  </div>
                  <span className="font-semibold text-[#17242A]">18</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#F28B55]" />
                    <span className="text-[#6B7C83]">High</span>
                  </div>
                  <span className="font-semibold text-[#17242A]">10</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#E65A68]" />
                    <span className="text-[#6B7C83]">Critical</span>
                  </div>
                  <span className="font-bold text-[#E65A68]">3</span>
                </div>
              </div>
            </div>
          </div>

          {/* ACTIVE INCIDENTS & ALERT STATUS (Sections 17 & 18) */}
          <div className="grid grid-cols-2 gap-3">
            {/* ACTIVE INCIDENTS */}
            <div className="rounded-[20px] border border-[#E2EAED] bg-white p-4 shadow-xs">
              <span className="text-[11px] font-bold text-[#6B7C83] uppercase tracking-wider block">
                {t.activeIncidents}
              </span>
              <span className="text-2xl font-extrabold text-[#17242A] block mt-1">06</span>
              <div className="space-y-1 mt-2 text-[10px] text-[#6B7C83]">
                <div className="flex items-center gap-1 text-[#E65A68] font-medium">
                  <span>●</span> 2 Critical
                </div>
                <div className="flex items-center gap-1 text-[#F28B55] font-medium">
                  <span>●</span> 2 High
                </div>
                <div className="flex items-center gap-1 text-[#E8B84A] font-medium">
                  <span>●</span> 2 Moderate
                </div>
              </div>
              <button
                onClick={() => onNavigate('incidents')}
                className="mt-3 text-[11px] font-semibold text-[#18B7A0] hover:underline block"
              >
                View All →
              </button>
            </div>

            {/* ALERT STATUS */}
            <div className="rounded-[20px] border border-[#E2EAED] bg-white p-4 shadow-xs">
              <span className="text-[11px] font-bold text-[#6B7C83] uppercase tracking-wider block">
                {t.alertStatus}
              </span>
              <span className="text-2xl font-extrabold text-[#18B7A0] block mt-1">03</span>
              <div className="space-y-1 mt-2 text-[10px] text-[#6B7C83]">
                <div className="flex justify-between">
                  <span>WATCH:</span>
                  <span className="font-semibold text-[#17242A]">12</span>
                </div>
                <div className="flex justify-between">
                  <span>WARNING:</span>
                  <span className="font-semibold text-[#F28B55]">01</span>
                </div>
                <div className="flex justify-between text-[#E65A68] font-bold">
                  <span>CONFIRMED:</span>
                  <span>00</span>
                </div>
              </div>
              <button
                onClick={() => onNavigate('alerts')}
                className="mt-3 text-[11px] font-semibold text-[#18B7A0] hover:underline block"
              >
                Alerts Center →
              </button>
            </div>
          </div>

          {/* PRIORITY INCIDENT CARD (Section 20) */}
          <div className="rounded-[24px] border border-[#F28B55]/30 bg-gradient-to-br from-white via-[#F5F8FA] to-orange-50/20 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#F28B55]">
                {t.priorityIncident}
              </span>
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-800">
                HIGH RISK
              </span>
            </div>
            <h4 className="text-base font-bold text-[#17242A] mt-1.5">Kurla East</h4>
            <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-[#E2EAED] text-xs">
              <div>
                <span className="text-[10px] text-[#6B7C83] block">ETA</span>
                <span className="font-bold text-[#17242A]">90 min</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6B7C83] block">Population</span>
                <span className="font-bold text-[#17242A]">18,200</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6B7C83] block">Confidence</span>
                <span className="font-bold text-[#18B7A0]">84%</span>
              </div>
            </div>
            <button
              onClick={() => onNavigate('incidents')}
              className="mt-4 w-full rounded-xl bg-white border border-[#E2EAED] py-2 text-xs font-semibold text-[#17242A] hover:bg-slate-50 transition-colors shadow-xs"
            >
              {t.viewIncident}
            </button>
          </div>

          {/* PEHRA PREDICTION CARD (Section 27) */}
          <div className="rounded-[24px] border border-[#E2EAED] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="flex h-2 w-2 rounded-full bg-[#18B7A0]" />
                <h4 className="text-xs font-bold text-[#17242A]">{t.pehraPrediction}</h4>
              </div>
              <span className="text-[10px] font-bold text-[#F28B55] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                HIGH FLOOD RISK
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-3">
              <div>
                <span className="text-xs text-[#6B7C83]">Model Confidence:</span>
                <span className="ml-1 text-sm font-bold text-[#18B7A0]">82%</span>
              </div>
              <span className="text-xs text-[#6B7C83]">
                Impact: <strong className="text-[#17242A]">2–4 hours</strong>
              </span>
            </div>

            <div className="mt-3 space-y-1 text-xs text-[#6B7C83] border-t border-[#E2EAED] pt-2.5">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#18B7A0]" />
                <span>Heavy localized cloudburst rainfall (86 mm)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#18B7A0]" />
                <span>Rising water level in Mithi River Basin</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#18B7A0]" />
                <span>Saturated upstream catchments (Vihar/Powai)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#18B7A0]" />
                <span>Low-lying topography along railway culverts</span>
              </div>
            </div>

            <div className="mt-3 pt-2 text-[10px] text-[#6B7C83] border-t border-[#E2EAED] italic">
              AI prediction — not authority confirmed
            </div>
          </div>

          {/* RECENT ALERTS PANEL (Section 25) */}
          <div className="rounded-[24px] border border-[#E2EAED] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#E2EAED]">
              <h4 className="text-xs font-bold text-[#17242A]">{t.recentAlerts}</h4>
              <button
                onClick={() => onNavigate('alerts')}
                className="text-[11px] font-semibold text-[#18B7A0] hover:underline"
              >
                View all
              </button>
            </div>

            <div className="space-y-2.5 pt-3">
              <div className="rounded-xl border border-[#E2EAED] bg-[#F5F8FA] p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#F28B55] flex items-center gap-1">
                    ⚠ Flood Warning
                  </span>
                  <span className="text-[10px] text-[#6B7C83]">8 min ago</span>
                </div>
                <p className="text-[#17242A] font-medium mt-1">Kurla East Sector 4</p>
              </div>

              <div className="rounded-xl border border-[#E2EAED] bg-[#F5F8FA] p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#17242A]">Rainfall Threshold Exceeded</span>
                  <span className="text-[10px] text-[#6B7C83]">14 min ago</span>
                </div>
                <p className="text-[#6B7C83] mt-0.5">Andheri Subway Station</p>
              </div>

              <div className="rounded-xl border border-[#E2EAED] bg-[#F5F8FA] p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#17242A]">Water Level Rising</span>
                  <span className="text-[10px] text-[#6B7C83]">21 min ago</span>
                </div>
                <p className="text-[#6B7C83] mt-0.5">Mithi River Sensor Bridge</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. BOTTOM ROW: SHELTER, HOSPITAL, RESPONSE TEAMS, DATA SOURCES (Sections 21-24) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* SHELTER CARD (Section 21) */}
        <div className="rounded-[22px] border border-[#E2EAED] bg-white p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#6B7C83] uppercase tracking-wider">
                {t.nearbyShelters}
              </span>
              <span className="rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 border border-emerald-200">
                OPEN
              </span>
            </div>
            <h5 className="text-sm font-bold text-[#17242A] mt-2">Kurla Community Shelter</h5>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-extrabold text-[#17242A]">420 / 600</span>
              <span className="text-xs text-[#6B7C83]">Capacity</span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-[#EEF6F7] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#20B486]"
                style={{ width: `${(420 / 600) * 100}%` }}
              />
            </div>
            <span className="text-[11px] text-[#20B486] font-semibold mt-1 block">
              180 Beds Available
            </span>
          </div>
          <button
            onClick={() => onNavigate('evacuation')}
            className="mt-3 text-xs font-semibold text-[#18B7A0] hover:underline text-left"
          >
            {t.viewShelters}
          </button>
        </div>

        {/* HOSPITAL CARD (Section 22) */}
        <div className="rounded-[22px] border border-[#E2EAED] bg-white p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#6B7C83] uppercase tracking-wider">
                {t.emergencyCapacity}
              </span>
              <span className="rounded-full bg-blue-50 text-blue-800 text-[10px] font-bold px-2 py-0.5 border border-blue-200">
                ACTIVE
              </span>
            </div>
            <h5 className="text-sm font-bold text-[#17242A] mt-2">Municipal Hospital</h5>
            <div className="mt-2 space-y-1 text-xs text-[#6B7C83]">
              <div className="flex justify-between">
                <span>Emergency Ward:</span>
                <span className="font-semibold text-emerald-600">Available</span>
              </div>
              <div className="flex justify-between">
                <span>Distance:</span>
                <span className="font-semibold text-[#17242A]">2.4 km</span>
              </div>
              <div className="flex justify-between">
                <span>Ambulances:</span>
                <span className="font-semibold text-[#18B7A0]">3 Available</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('responder-portal')}
            className="mt-3 text-xs font-semibold text-[#18B7A0] hover:underline text-left"
          >
            Hospital Directory →
          </button>
        </div>

        {/* RESPONSE TEAM CARD (Section 23) */}
        <div className="rounded-[22px] border border-[#E2EAED] bg-white p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#6B7C83] uppercase tracking-wider">
                {t.responseTeams}
              </span>
              <span className="rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 border border-amber-200">
                EN ROUTE
              </span>
            </div>
            <h5 className="text-sm font-bold text-[#17242A] mt-2">Team Alpha (NDRF)</h5>
            <div className="mt-2 space-y-1 text-xs text-[#6B7C83]">
              <div className="flex justify-between">
                <span>Assignment:</span>
                <span className="font-semibold text-[#17242A]">Kurla East</span>
              </div>
              <div className="flex justify-between">
                <span>Last GPS Ping:</span>
                <span className="font-mono text-[#17242A]">2 min ago</span>
              </div>
              <div className="flex justify-between">
                <span>Field Telemetry:</span>
                <span className="font-semibold text-emerald-600">Battery 78%</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('responder-portal')}
            className="mt-3 text-xs font-semibold text-[#18B7A0] hover:underline text-left"
          >
            Dispatch Tactical Ops →
          </button>
        </div>

        {/* DATA SOURCE CARD (Section 24) */}
        <div className="rounded-[22px] border border-[#E2EAED] bg-white p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#6B7C83] uppercase tracking-wider">
                {t.liveDataSources}
              </span>
              <span className="text-[10px] font-bold text-[#18B7A0]">6 Feeds</span>
            </div>
            <div className="mt-2 space-y-1.5 text-[11px]">
              {[
                { name: 'Weather Radar', status: 'LIVE', color: 'text-[#20B486]' },
                { name: 'Rainfall Sensors', status: 'LIVE', color: 'text-[#20B486]' },
                { name: 'Water Level Gauges', status: 'LIVE', color: 'text-[#20B486]' },
                { name: 'Satellite Uplink', status: 'DELAYED', color: 'text-[#E8B84A]' },
                { name: 'Mumbai Flood Network', status: 'LIVE', color: 'text-[#20B486]' },
                { name: 'Citizen Reports', status: 'LIVE', color: 'text-[#20B486]' },
              ].map((src, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[#6B7C83]">{src.name}</span>
                  <span className={`font-mono font-bold text-[10px] ${src.color}`}>
                    ● {src.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => onNavigate('water-levels')}
            className="mt-3 text-xs font-semibold text-[#18B7A0] hover:underline text-left"
          >
            Hydrological Station Telemetry →
          </button>
        </div>
      </div>

      {/* 7. CITIZEN AREA CARD (Section 29-30) */}
      <div className="rounded-[24px] border border-[#E2EAED] bg-gradient-to-r from-[#EEF6F7] via-white to-[#F5F8FA] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#18B7A0] text-white shadow-xs shrink-0">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6B7C83] font-medium">{t.citizenView}:</span>
              <span className="font-bold text-sm text-[#17242A]">Kurla East (Sector 4)</span>
              <span className="rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 border border-emerald-200">
                {t.lowFloodRisk}
              </span>
            </div>
            <p className="text-xs text-[#6B7C83] mt-0.5">{t.conditionsStable}</p>
            <div className="flex items-center gap-3 mt-1 text-[11px] text-[#6B7C83]">
              <span>Rainfall: <strong className="text-[#17242A]">12 mm</strong></span>
              <span>•</span>
              <span>Water Level: <strong className="text-[#17242A]">Normal</strong></span>
              <span>•</span>
              <span>Forecast: <strong className="text-[#17242A]">Moderate</strong></span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('survival-checklist')}
            className="rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors shadow-xs flex items-center gap-1.5"
          >
            <span>📋 Survival Checklist</span>
          </button>
          <button
            onClick={() => onNavigate('map')}
            className="rounded-xl bg-white border border-[#E2EAED] px-4 py-2 text-xs font-semibold text-[#17242A] hover:bg-slate-50 transition-colors shadow-xs"
          >
            {t.viewLiveMap}
          </button>
          <button
            onClick={onOpenReportModal}
            className="rounded-xl bg-[#18B7A0] px-4 py-2 text-xs font-semibold text-white hover:bg-[#15a28e] transition-colors shadow-xs"
          >
            + {t.reportFlooding}
          </button>
        </div>
      </div>
    </div>
  );
};
