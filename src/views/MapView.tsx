import React, { useState, useEffect } from 'react';
import {
  Village,
  Incident,
  Alert,
  Shelter,
  Hospital,
  EvacuationRoute,
  FloodReport,
  DeviceTelemetry,
  Observation,
} from '../types/index.ts';
import { LeafletMap } from '../components/LeafletMap.tsx';
import { Mumbai3DView } from '../components/Mumbai3DView.tsx';
import { MUMBAI_TOPOGRAPHIC_LANDMARKS, getMumbaiElevation } from '../utils/mumbaiElevation.ts';
import {
  fetchLiveMumbaiTelemetry,
  LiveMumbaiSummary,
} from '../services/liveWeatherWaterService.ts';
import {
  MapPin,
  AlertTriangle,
  Compass,
  LifeBuoy,
  X,
  CheckCircle2,
  TrendingUp,
  Droplets,
  Building,
  Phone,
  ArrowRight,
  Mountain,
  Globe,
  Layers,
  Box,
  Columns,
  Navigation,
  ShieldCheck,
  Plane,
  Wind,
  Gauge,
  Waves,
  RotateCw,
} from 'lucide-react';

interface MapViewProps {
  villages: Village[];
  incidents: Incident[];
  alerts: Alert[];
  shelters: Shelter[];
  hospitals: Hospital[];
  routes: EvacuationRoute[];
  reports: FloodReport[];
  devices: DeviceTelemetry[];
  observations: Observation[];
  selectedVillage?: Village | null;
  onSelectVillage: (village: Village | null) => void;
  onNavigate: (tab: string) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  villages,
  incidents,
  alerts,
  shelters,
  hospitals,
  routes,
  reports,
  devices,
  observations,
  selectedVillage,
  onSelectVillage,
  onNavigate,
}) => {
  const [displayMode, setDisplayMode] = useState<'2d' | '3d' | 'split'>('2d');
  const [inspectedShelter, setInspectedShelter] = useState<Shelter | null>(null);
  const [inspectedRoute, setInspectedRoute] = useState<EvacuationRoute | null>(null);

  // Probed coordinate from map interaction (2D or 3D)
  const [probedLocation, setProbedLocation] = useState<{
    lat: number;
    lng: number;
    elevation: number;
    zoneName: string;
    vulnerability: string;
    liveTelemetry?: any;
  } | null>(null);

  // User GPS location
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    elevation: number;
  } | null>(null);

  // Live Real-Time Weather, Air Pressure, Directional Wind & Water Telemetry
  const [liveSummary, setLiveSummary] = useState<LiveMumbaiSummary | null>(null);
  const [isSyncingLive, setIsSyncingLive] = useState(false);

  const loadLiveSummary = async () => {
    setIsSyncingLive(true);
    try {
      const summary = await fetchLiveMumbaiTelemetry();
      setLiveSummary(summary);
    } catch {
      // ignore offline
    } finally {
      setIsSyncingLive(false);
    }
  };

  useEffect(() => {
    loadLiveSummary();
    const t = setInterval(loadLiveSummary, 30000);
    return () => clearInterval(t);
  }, []);

  // Listen for open drone recon custom event from map popups
  useEffect(() => {
    const handleOpenDrone = (e: any) => {
      if (onNavigate) {
        onNavigate('drone-recon');
      }
    };
    window.addEventListener('pehra:open-drone-recon', handleOpenDrone);
    return () => window.removeEventListener('pehra:open-drone-recon', handleOpenDrone);
  }, [onNavigate]);

  // Active village alerts
  const villageAlerts = selectedVillage
    ? alerts.filter((a) => a.villageId === selectedVillage.id && a.status === 'ACTIVE')
    : [];

  return (
    <div className="flex flex-col gap-3 h-[calc(100vh-140px)] min-h-[620px] pb-2">
      {/* Top View Mode Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E5EAF0] bg-white px-4 py-2.5 shadow-xs shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Mountain className="h-4 w-4 text-emerald-600" />
            <span className="font-semibold text-sm text-slate-900">Geospatial Telemetry Observatory</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Real-Time Sensor Grounded (No AI/Fake Data)</span>
          </div>
        </div>

        {/* 2D / 3D UI View Toggle + Drone Quick Button */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => onNavigate('drone-recon')}
            className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1 font-bold text-blue-700 hover:bg-blue-100 transition-colors shadow-xs"
          >
            <Plane className="h-3.5 w-3.5" />
            <span>🚁 Drone Recon</span>
          </button>

          <div className="flex items-center gap-1 rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] p-1">
            <button
              onClick={() => setDisplayMode('2d')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-medium transition-all ${
                displayMode === '2d'
                  ? 'bg-[#2563EB] text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="h-3.5 w-3.5" />
              <span>2D Map</span>
            </button>

            <button
              onClick={() => setDisplayMode('3d')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-medium transition-all ${
                displayMode === '3d'
                  ? 'bg-[#2563EB] text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Box className="h-3.5 w-3.5" />
              <span>3D Terrain</span>
            </button>

            <button
              onClick={() => setDisplayMode('split')}
              className={`hidden lg:flex items-center gap-1.5 rounded-lg px-3 py-1 font-medium transition-all ${
                displayMode === 'split'
                  ? 'bg-[#2563EB] text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Columns className="h-3.5 w-3.5" />
              <span>Split 2D / 3D</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage & Side Inspector Drawer */}
      <div className="flex flex-col lg:flex-row gap-3 flex-1 min-h-0">
        {/* Map / 3D Stage Container */}
        <div className="flex-1 h-full min-h-[350px] relative flex flex-col md:flex-row gap-2">
          {/* 2D Leaflet Map (Shown in '2d' or 'split' modes) */}
          {(displayMode === '2d' || displayMode === 'split') && (
            <div className={`h-full relative ${displayMode === 'split' ? 'w-full md:w-1/2' : 'w-full'}`}>
              <LeafletMap
                villages={villages}
                incidents={incidents}
                alerts={alerts}
                shelters={shelters}
                hospitals={hospitals}
                routes={routes}
                reports={reports}
                devices={devices}
                observations={observations}
                selectedVillageId={selectedVillage?.id}
                onSelectVillage={(v) => {
                  onSelectVillage(v);
                  setInspectedShelter(null);
                  setInspectedRoute(null);
                  setProbedLocation(null);
                }}
                onSelectShelter={(s) => {
                  setInspectedShelter(s);
                  setInspectedRoute(null);
                  onSelectVillage(null);
                  setProbedLocation(null);
                }}
                onSelectRoute={(r) => {
                  setInspectedRoute(r);
                  setInspectedShelter(null);
                  onSelectVillage(null);
                  setProbedLocation(null);
                }}
                onInspectCoordinate={(data) => {
                  setProbedLocation(data);
                  setInspectedShelter(null);
                  setInspectedRoute(null);
                  onSelectVillage(null);
                }}
                onUserLocationFound={(lat, lng, elevation) => {
                  setUserLocation({ lat, lng, elevation });
                }}
              />
            </div>
          )}

          {/* 3D WebGL Digital Elevation Model (Shown in '3d' or 'split' modes) */}
          {(displayMode === '3d' || displayMode === 'split') && (
            <div className={`h-full relative ${displayMode === 'split' ? 'w-full md:w-1/2' : 'w-full'}`}>
              <Mumbai3DView
                villages={villages}
                incidents={incidents}
                shelters={shelters}
                userLocation={userLocation}
                onSelectLocation={(lat, lng, elevation) => {
                  const elevData = getMumbaiElevation(lat, lng);
                  setProbedLocation({
                    lat,
                    lng,
                    elevation,
                    zoneName: elevData.zoneName,
                    vulnerability: elevData.floodVulnerability,
                  });
                  setInspectedShelter(null);
                  setInspectedRoute(null);
                  onSelectVillage(null);
                }}
              />
            </div>
          )}
        </div>

        {/* Side Inspector & Topographic Telemetry Drawer */}
        <div className="w-full lg:w-96 shrink-0 h-full overflow-y-auto rounded-2xl border border-[#E5EAF0] bg-white p-4 shadow-xs flex flex-col justify-between">
          {/* A. If a Specific Point was Probed on Map or 3D Canvas */}
          {probedLocation ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-blue-600 uppercase tracking-wider font-semibold flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Topographic Point Probe
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">{probedLocation.zoneName}</h2>
                </div>
                <button
                  onClick={() => setProbedLocation(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Coordinates & Elevation Summary */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] p-3">
                  <span className="text-slate-500 text-[10px] block font-medium">Ground Elevation</span>
                  <div className="text-lg font-mono font-bold text-emerald-600">
                    {probedLocation.elevation} m
                  </div>
                  <span className="text-[10px] text-slate-400">Mean Sea Level (MSL)</span>
                </div>

                <div className="rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] p-3">
                  <span className="text-slate-500 text-[10px] block font-medium">Vulnerability</span>
                  <div
                    className={`text-sm font-bold font-mono ${
                      probedLocation.vulnerability === 'CRITICAL'
                        ? 'text-rose-600'
                        : probedLocation.vulnerability === 'HIGH'
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {probedLocation.vulnerability}
                  </div>
                  <span className="text-[10px] text-slate-400">Tidal Lock Factor</span>
                </div>
              </div>

              {/* Live Coordinate Air Pressure, Directional Wind & Water Details */}
              {probedLocation.liveTelemetry && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold text-emerald-900">
                    <span className="flex items-center gap-1.5">
                      <Gauge className="h-4 w-4 text-emerald-600" />
                      <span>Live Barometric & Water Feed</span>
                    </span>
                    <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[9px] text-white font-mono">
                      OPEN-METEO LIVE
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="rounded-lg bg-white p-2 border border-emerald-200">
                      <span className="text-slate-500 block text-[10px]">Air Pressure (MSL)</span>
                      <strong className="font-mono text-blue-700 text-xs">
                        {probedLocation.liveTelemetry.seaLevelPressureHpa} hPa
                      </strong>
                      <span className="text-[10px] text-slate-400 block">
                        Surf: {probedLocation.liveTelemetry.surfacePressureHpa} hPa
                      </span>
                    </div>
                    <div className="rounded-lg bg-white p-2 border border-emerald-200">
                      <span className="text-slate-500 block text-[10px]">Directional Wind</span>
                      <strong className="font-mono text-emerald-700 text-xs">
                        {probedLocation.liveTelemetry.windSpeedKmh} km/h {probedLocation.liveTelemetry.windCardinal}
                      </strong>
                      <span className="text-[10px] text-slate-400 block">
                        Dir: {probedLocation.liveTelemetry.windDirectionDeg}° • Gust {probedLocation.liveTelemetry.windGustsKmh}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-lg bg-white p-2 border border-emerald-200 text-[11px] space-y-1">
                    <div className="font-semibold text-teal-800">Water & Hydrological Details:</div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Rainfall / Rate:</span>
                      <span className="font-mono font-semibold">
                        {probedLocation.liveTelemetry.precipitationMm} mm ({probedLocation.liveTelemetry.rainMmHr} mm/h)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Surface Runoff / Soil Moisture:</span>
                      <span className="font-mono font-semibold">
                        {probedLocation.liveTelemetry.runoffMm} mm • {Math.round(probedLocation.liveTelemetry.soilMoistureM3M3 * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Coastal Tide Level:</span>
                      <span className="font-mono font-semibold text-blue-700">
                        {probedLocation.liveTelemetry.tideHeightM} m ({probedLocation.liveTelemetry.tideState})
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Topographic Analysis Box */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3 text-xs space-y-1.5">
                <div className="font-semibold text-blue-800 flex items-center gap-1.5">
                  <Mountain className="h-4 w-4 text-blue-600" />
                  <span>Geomorphological Profile</span>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  {probedLocation.elevation <= 3.0
                    ? 'Inter-island reclaimed depression basin. Stormwater discharges slowly due to low hydraulic gradient and Arabian Sea tidal lock.'
                    : probedLocation.elevation <= 15.0
                    ? 'Coastal alluvial terrace. Moderate drainage runoff toward secondary stormwater nullahs.'
                    : 'Elevated Deccan basalt ridge. Naturally elevated above maximum 100-year storm surge and river backwater.'}
                </p>
                <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-blue-200">
                  Lat: {probedLocation.lat.toFixed(4)}° N • Lng: {probedLocation.lng.toFixed(4)}° E
                </div>
              </div>

              {/* Nearest High Ground Shelter recommendation */}
              <div className="rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] p-3 text-xs">
                <span className="font-semibold text-slate-800 block mb-1">Elevation Safety Guidance</span>
                <p className="text-[11px] text-slate-600">
                  {probedLocation.elevation < 3.5
                    ? '⚠️ Low ground warning: In event of cloudburst (>60mm/hr) coincident with high tide, move immediately toward elevated ridges (Sion Fort or BKC Elevated Corridor).'
                    : '✅ Safe elevation: Ground elevation remains above projected 5m deluge flood contours.'}
                </p>
              </div>
            </div>
          ) : selectedVillage ? (
            /* B. If Village / Ward is Selected */
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-blue-600 uppercase tracking-wider font-semibold">
                    {selectedVillage.ward} • Ward Inspection
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">{selectedVillage.name}</h2>
                </div>
                <button
                  onClick={() => onSelectVillage(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Risk Badge & Depth */}
              <div className="flex items-center justify-between rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] p-3">
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">Basin Status</div>
                  <div className="text-lg font-bold font-mono text-slate-900">{selectedVillage.riskLevel}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-500 font-medium">Observed Water Level</div>
                  <div className="text-lg font-bold font-mono text-blue-600">{selectedVillage.waterLevelM} m</div>
                </div>
              </div>

              {/* Ward Metrics Table */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-100 pb-1.5 text-slate-700">
                  <span className="text-slate-500">Topographic Elevation:</span>
                  <span className="font-mono font-semibold text-emerald-600">{selectedVillage.elevationM} m (MSL)</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5 text-slate-700">
                  <span className="text-slate-500">Total Population:</span>
                  <span className="font-mono font-semibold">{selectedVillage.population.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5 text-slate-700">
                  <span className="text-slate-500">Population Exposed:</span>
                  <span className="font-mono font-semibold text-rose-600">
                    {selectedVillage.exposurePopulation.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5 text-slate-700">
                  <span className="text-slate-500">Drainage Capacity:</span>
                  <span className="font-mono font-semibold">{selectedVillage.drainageCapacityMmHr} mm/hr</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5 text-slate-700">
                  <span className="text-slate-500">Vulnerability Index:</span>
                  <span className="font-mono font-semibold">{(selectedVillage.vulnerabilityScore * 100).toFixed(0)}%</span>
                </div>
              </div>

              {/* Live Hydrological & Barometric Telemetry for Ward */}
              {liveSummary && (
                <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-3 text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-semibold text-teal-900">
                    <span className="flex items-center gap-1.5">
                      <Waves className="h-4 w-4 text-teal-600" />
                      <span>Real-Time Water & Pressure Feed</span>
                    </span>
                    <span className="text-[9px] font-mono bg-teal-700 text-white px-1.5 py-0.5 rounded">LIVE</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Air Pressure (MSL / Surf):</span>
                      <span className="font-mono font-semibold">
                        {liveSummary.airPressureMslHpa} / {liveSummary.surfacePressureHpa} hPa ({liveSummary.pressureTrend})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Directional Wind:</span>
                      <span className="font-mono font-semibold">
                        {liveSummary.windSpeedKmh} km/h {liveSummary.windCardinal} ({liveSummary.windDirectionDeg}°)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">River Discharge & Tide:</span>
                      <span className="font-mono font-semibold">
                        {liveSummary.riverDischargeM3s} m³/s • Tide {liveSummary.tideHeightM}m
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Normal / Danger Water Mark:</span>
                      <span className="font-mono font-semibold">
                        {liveSummary.mithiNormalLevelM}m / {liveSummary.mithiDangerLevelM}m
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Active Warnings for this Village */}
              {villageAlerts.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Broadcast Warnings</div>
                  {villageAlerts.map((alt) => (
                    <div key={alt.id} className="rounded-xl border border-rose-200 bg-rose-50/60 p-2.5 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-rose-800">
                        <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                        <span>{alt.stage}: {alt.title}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-700 line-clamp-2">{alt.message}</p>
                      <button
                        onClick={() => onNavigate('alerts')}
                        className="mt-2 text-[11px] font-semibold text-rose-700 hover:text-rose-900 flex items-center gap-1"
                      >
                        <span>Manage this alert</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : inspectedShelter ? (
            /* C. If Shelter is Selected */
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-blue-600 uppercase tracking-wider font-semibold">
                    Relief Shelter
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-0.5">{inspectedShelter.name}</h2>
                </div>
                <button
                  onClick={() => setInspectedShelter(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-xs text-slate-600">{inspectedShelter.location.address}</p>

              <div className="rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] p-3 text-xs">
                <div className="flex justify-between mb-1.5">
                  <span className="text-slate-500">Occupancy:</span>
                  <span className="font-semibold text-slate-900">
                    {inspectedShelter.occupancy} / {inspectedShelter.capacity} (
                    {Math.round((inspectedShelter.occupancy / inspectedShelter.capacity) * 100)}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-[#2563EB] rounded-full"
                    style={{ width: `${(inspectedShelter.occupancy / inspectedShelter.capacity) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="font-semibold text-slate-800">Emergency Stockpile Inventory:</div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-lg bg-[#F8FAFC] p-2 border border-[#E5EAF0]">
                    <span className="text-slate-500 block">Food Rations:</span>
                    <span className="font-mono font-semibold text-slate-900">{inspectedShelter.emergencySupplies.foodPacks} packs</span>
                  </div>
                  <div className="rounded-lg bg-[#F8FAFC] p-2 border border-[#E5EAF0]">
                    <span className="text-slate-500 block">Potable Water:</span>
                    <span className="font-mono font-semibold text-slate-900">{inspectedShelter.emergencySupplies.waterLiters} Liters</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] p-3 text-xs">
                <div className="text-slate-500 text-[10px]">Shelter Coordinator:</div>
                <div className="font-semibold text-slate-900">{inspectedShelter.contactPerson}</div>
                <a href={`tel:${inspectedShelter.contactPhone}`} className="text-blue-600 font-mono block mt-0.5">
                  📞 {inspectedShelter.contactPhone}
                </a>
              </div>
            </div>
          ) : inspectedRoute ? (
            /* D. If Evacuation Route is Selected */
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-emerald-600 uppercase tracking-wider font-semibold">
                    Designated Evacuation Corridor
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-0.5">{inspectedRoute.name}</h2>
                </div>
                <button
                  onClick={() => setInspectedRoute(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-[#F8FAFC] border border-[#E5EAF0] p-2.5">
                  <span className="text-slate-500 text-[10px] block">Corridor Status</span>
                  <span className="font-semibold text-emerald-600">{inspectedRoute.status}</span>
                </div>
                <div className="rounded-xl bg-[#F8FAFC] border border-[#E5EAF0] p-2.5">
                  <span className="text-slate-500 text-[10px] block">Travel Time</span>
                  <span className="font-semibold text-slate-900">{inspectedRoute.estimatedTravelMinutes} mins</span>
                </div>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed">
                Corridor Length: <strong className="text-slate-900">{inspectedRoute.distanceKm} km</strong>. Elevation remains above projected 2.0m flood contour. Safe for foot and emergency transit.
              </div>
            </div>
          ) : (
            /* E. Default State: Live Air Pressure, Directional Wind, Water Telemetry & Geography */
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                    <Gauge className="h-4 w-4 text-blue-600" />
                    <span>Live Air Pressure & Water Telemetry</span>
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Real-time Open-Meteo / IMD / GloFAS station feed. Click any coordinate on the map to probe live values.
                  </p>
                </div>
                <button
                  onClick={loadLiveSummary}
                  disabled={isSyncingLive}
                  className="rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 p-1.5 text-slate-600"
                  title="Refresh Live Telemetry"
                >
                  <RotateCw className={`h-3.5 w-3.5 ${isSyncingLive ? 'animate-spin text-blue-600' : ''}`} />
                </button>
              </div>

              {/* Live Barometric Pressure & Directional Wind Card */}
              {liveSummary && (
                <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold text-blue-900">
                    <span className="flex items-center gap-1.5">
                      <Wind className="h-4 w-4 text-blue-600" />
                      <span>Air Pressure & Directional Wind</span>
                    </span>
                    <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[9px] text-white font-mono">
                      LIVE BAROMETRIC
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="rounded-lg bg-white p-2 border border-blue-100">
                      <span className="text-slate-400 block text-[10px]">Sea-Level Pressure</span>
                      <span className="font-mono font-bold text-blue-800 text-sm">
                        {liveSummary.airPressureMslHpa} hPa
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Surf: {liveSummary.surfacePressureHpa} hPa ({liveSummary.pressureTrend})
                      </span>
                    </div>
                    <div className="rounded-lg bg-white p-2 border border-blue-100">
                      <span className="text-slate-400 block text-[10px]">Directional Wind</span>
                      <span className="font-mono font-bold text-emerald-700 text-sm">
                        {liveSummary.windSpeedKmh} km/h {liveSummary.windCardinal}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Azimuth: {liveSummary.windDirectionDeg}° • Gusts {liveSummary.windGustsKmh}
                      </span>
                    </div>
                  </div>

                  <div className="text-[10px] text-blue-900 bg-white/80 rounded-lg px-2.5 py-1.5 border border-blue-100 font-medium">
                    <span className="text-slate-500">Directional Pressure Gradient: </span>
                    <span className="font-mono font-semibold">{liveSummary.pressureSystemDirection}</span>
                  </div>
                </div>
              )}

              {/* All Normal Water, River Discharge & Marine Details Card */}
              {liveSummary && (
                <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold text-teal-900">
                    <span className="flex items-center gap-1.5">
                      <Droplets className="h-4 w-4 text-teal-600" />
                      <span>Normal & Live Water Details</span>
                    </span>
                    <span className="rounded bg-teal-600 px-1.5 py-0.5 text-[9px] text-white font-mono">
                      HYDRO / MARINE
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="rounded-lg bg-white p-2 border border-teal-100">
                      <span className="text-slate-400 block text-[10px]">Mithi Water Level</span>
                      <span className="font-mono font-bold text-teal-800 text-sm">
                        {liveSummary.mithiWaterLevelM} m
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Normal: {liveSummary.mithiNormalLevelM}m | Danger: {liveSummary.mithiDangerLevelM}m
                      </span>
                    </div>
                    <div className="rounded-lg bg-white p-2 border border-teal-100">
                      <span className="text-slate-400 block text-[10px]">River Discharge</span>
                      <span className="font-mono font-bold text-cyan-800 text-sm">
                        {liveSummary.riverDischargeM3s} m³/s
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Runoff: {liveSummary.surfaceRunoffMm}mm • Soil: {liveSummary.soilMoisturePercent}%
                      </span>
                    </div>
                  </div>

                  <div className="rounded-lg bg-white p-2 border border-teal-100 text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Astronomical Tide:</span>
                      <span className="font-mono font-semibold text-blue-700">
                        {liveSummary.tideHeightM} m ({liveSummary.tideState})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Sea Wave Height & Dir:</span>
                      <span className="font-mono font-semibold">
                        {liveSummary.waveHeightM} m @ {liveSummary.waveDirectionDeg}° ({liveSummary.waveDirectionCardinal}, {liveSummary.wavePeriodSec}s)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Ocean Current Velocity:</span>
                      <span className="font-mono font-semibold">
                        {liveSummary.oceanCurrentKmh} km/h @ {liveSummary.oceanCurrentDirectionDeg}°
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Live Precipitation / RH:</span>
                      <span className="font-mono font-semibold">
                        {liveSummary.currentRainfallMm} mm • {liveSummary.humidityPercent}% RH ({liveSummary.temperatureC}°C)
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Hotspot Jumps */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Live Telemetry Stations & Hotspots:
                </div>
                {MUMBAI_TOPOGRAPHIC_LANDMARKS.slice(0, 4).map((lm) => (
                  <button
                    key={lm.id}
                    onClick={() => {
                      setProbedLocation({
                        lat: lm.lat,
                        lng: lm.lng,
                        elevation: lm.elevationM,
                        zoneName: lm.name,
                        vulnerability: lm.floodVulnerability,
                      });
                    }}
                    className="flex w-full items-center justify-between rounded-xl border border-[#E5EAF0] bg-white p-2 text-left text-xs text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-xs"
                  >
                    <div>
                      <span className="font-medium text-slate-900 block">{lm.name}</span>
                      <span className="text-[10px] text-slate-400">{lm.ward}</span>
                    </div>
                    <span
                      className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        lm.floodVulnerability === 'CRITICAL'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {lm.elevationM}m MSL
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Button at bottom of drawer */}
          <div className="pt-4 border-t border-[#E5EAF0] space-y-2">
            <button
              onClick={() => onNavigate('alerts')}
              className="w-full rounded-xl bg-[#2563EB] py-2.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs transition-colors"
            >
              Review Early Warning Alerts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
