import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
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
import {
  getMumbaiElevation,
  MUMBAI_TOPOGRAPHIC_LANDMARKS,
  MUMBAI_CONTOUR_ISOLINES,
  MumbaiLandmark,
} from '../utils/mumbaiElevation.ts';
import { DRONE_FLEET } from '../data/droneData.ts';
import {
  fetchLiveMumbaiTelemetry,
  fetchCoordinateLiveTelemetry,
  LiveMumbaiSummary,
  LiveStationTelemetry,
} from '../services/liveWeatherWaterService.ts';
import {
  Navigation,
  Compass,
  Mountain,
  Globe,
  Layers,
  Search,
  Crosshair,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  RotateCw,
  Eye,
  Check,
  Plane,
  Wind,
  Gauge,
  Droplets,
  Waves,
} from 'lucide-react';

export type BasemapType = 'light' | 'streets' | 'topo' | 'physical' | 'dark';

interface LeafletMapProps {
  villages: Village[];
  incidents: Incident[];
  alerts: Alert[];
  shelters: Shelter[];
  hospitals: Hospital[];
  routes: EvacuationRoute[];
  reports: FloodReport[];
  devices: DeviceTelemetry[];
  observations: Observation[];
  selectedVillageId?: string;
  onSelectVillage?: (village: Village) => void;
  onSelectShelter?: (shelter: Shelter) => void;
  onSelectRoute?: (route: EvacuationRoute) => void;
  onInspectCoordinate?: (data: {
    lat: number;
    lng: number;
    elevation: number;
    zoneName: string;
    vulnerability: string;
    liveTelemetry?: any;
  }) => void;
  onUserLocationFound?: (lat: number, lng: number, elevation: number) => void;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  villages,
  incidents,
  alerts,
  shelters,
  hospitals,
  routes,
  reports,
  devices,
  observations,
  selectedVillageId,
  onSelectVillage,
  onSelectShelter,
  onSelectRoute,
  onInspectCoordinate,
  onUserLocationFound,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<{ [key: string]: L.LayerGroup }>({});
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);

  // Basemap & 3D Tilt states - default to clean light map (Apple Maps style)
  const [basemap, setBasemap] = useState<BasemapType>('light');
  const [is3DTilt, setIs3DTilt] = useState<boolean>(false);

  // Location Handling states
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
    elevation: number;
  } | null>(null);
  const [locationStatusText, setLocationStatusText] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearchDropdown, setShowSearchDropdown] = useState<boolean>(false);

  // Live Real-Time Telemetry from Open-Meteo (Weather + Marine + Flood APIs)
  const [liveTelemetry, setLiveTelemetry] = useState<LiveMumbaiSummary | null>(null);
  const [isRefreshingLive, setIsRefreshingLive] = useState<boolean>(false);

  const refreshLiveTelemetry = async () => {
    setIsRefreshingLive(true);
    try {
      const data = await fetchLiveMumbaiTelemetry();
      setLiveTelemetry(data);
    } catch (e) {
      console.warn('Live telemetry fetch error:', e);
    } finally {
      setIsRefreshingLive(false);
    }
  };

  useEffect(() => {
    refreshLiveTelemetry();
    const timer = setInterval(refreshLiveTelemetry, 30000);
    return () => clearInterval(timer);
  }, []);

  // Probed coordinate from map click
  const [probedData, setProbedData] = useState<{
    lat: number;
    lng: number;
    elevation: number;
    zoneName: string;
    vulnerability: string;
    distanceToMithiKm: number;
    liveTelemetry?: any;
  } | null>(null);

  // Layer filter state (Strictly Real-Time Data — No Fake AI Spread)
  const [activeLayers, setActiveLayers] = useState({
    airPressureWind: true,
    waterLevels: true,
    rainfall: true,
    riskZones: true,
    evacuationRoutes: true,
    shelters: true,
    hospitals: true,
    devices: true,
    citizenReports: true,
    topoContours: true,
    topoLandmarks: true,
    drones: true,
  });

  const toggleLayer = (layerKey: keyof typeof activeLayers) => {
    setActiveLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [19.076, 72.8777],
      zoom: 12,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initial tile layer (Clean Light Carto Voyager default)
    const initialTile = createTileLayer('light');
    initialTile.addTo(map);
    currentTileLayerRef.current = initialTile;

    // Initialize layer groups
    layersGroupRef.current = {
      airPressureWind: L.layerGroup().addTo(map),
      waterLevels: L.layerGroup().addTo(map),
      rainfall: L.layerGroup().addTo(map),
      riskZones: L.layerGroup().addTo(map),
      evacuationRoutes: L.layerGroup().addTo(map),
      shelters: L.layerGroup().addTo(map),
      hospitals: L.layerGroup().addTo(map),
      devices: L.layerGroup().addTo(map),
      citizenReports: L.layerGroup().addTo(map),
      topoContours: L.layerGroup().addTo(map),
      topoLandmarks: L.layerGroup().addTo(map),
      drones: L.layerGroup().addTo(map),
      userLocation: L.layerGroup().addTo(map),
      probe: L.layerGroup().addTo(map),
    };

    // Click on map to inspect real-time coordinate weather, air pressure, wind direction & water details
    map.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const elevData = getMumbaiElevation(lat, lng);

      const baseProbeInfo = {
        lat: Math.round(lat * 10000) / 10000,
        lng: Math.round(lng * 10000) / 10000,
        elevation: elevData.elevationM,
        zoneName: elevData.zoneName,
        vulnerability: elevData.floodVulnerability,
        distanceToMithiKm: elevData.distanceToMithiKm,
      };

      setProbedData(baseProbeInfo);
      if (onInspectCoordinate) onInspectCoordinate(baseProbeInfo);

      // Fetch real-time live Open-Meteo data for this exact coordinate
      let liveCoordData: any = null;
      try {
        liveCoordData = await fetchCoordinateLiveTelemetry(lat, lng);
        const enrichedProbe = { ...baseProbeInfo, liveTelemetry: liveCoordData };
        setProbedData(enrichedProbe);
        if (onInspectCoordinate) onInspectCoordinate(enrichedProbe);
      } catch {
        // fallback if offline
      }

      // Render probe marker with live air pressure, directional wind, and water details
      const probeGroup = layersGroupRef.current.probe;
      if (probeGroup) {
        probeGroup.clearLayers();

        const probeIcon = L.divIcon({
          className: 'probe-marker-icon',
          html: `<div style="background:#0284c7;color:#fff;width:30px;height:30px;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 0 14px rgba(2,132,199,0.8);font-size:14px;font-weight:bold;">
            📍
          </div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        const probeMarker = L.marker([lat, lng], { icon: probeIcon });
        probeMarker.bindPopup(`
          <div style="color:#0f172a;font-family:sans-serif;font-size:12px;min-width:240px;">
            <div style="font-weight:bold;color:#0284c7;margin-bottom:3px;display:flex;align-items:center;justify-content:space-between;">
              <span>📍 Live Coordinate Telemetry</span>
              <span style="font-size:9px;background:#dcfce7;color:#15803d;padding:1px 5px;border-radius:4px;">LIVE API</span>
            </div>
            <p style="margin:0 0 4px 0;font-size:11px;color:#64748b;">${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E • ${elevData.zoneName}</p>
            ${
              liveCoordData
                ? `
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin:5px 0;">
                  <div style="padding:4px 6px;background:#eff6ff;border-radius:5px;border:1px solid #bfdbfe;">
                    <span style="font-size:9px;color:#1d4ed8;display:block;">Air Pressure (MSL)</span>
                    <strong style="font-size:12px;color:#1e3a8a;">${liveCoordData.seaLevelPressureHpa} hPa</strong>
                    <span style="font-size:9px;color:#64748b;display:block;">Surf: ${liveCoordData.surfacePressureHpa} hPa</span>
                  </div>
                  <div style="padding:4px 6px;background:#f0fdf4;border-radius:5px;border:1px solid #bbf7d0;">
                    <span style="font-size:9px;color:#15803d;display:block;">Directional Wind</span>
                    <strong style="font-size:12px;color:#14532d;">${liveCoordData.windSpeedKmh} km/h ${liveCoordData.windCardinal}</strong>
                    <span style="font-size:9px;color:#64748b;display:block;">Dir: ${liveCoordData.windDirectionDeg}° • Gust: ${liveCoordData.windGustsKmh}</span>
                  </div>
                </div>
                <div style="padding:5px 6px;background:#ecfeff;border-radius:5px;border:1px solid #a5f3fc;margin-bottom:4px;font-size:11px;">
                  <div><strong>Water & Rain Details:</strong></div>
                  <div>Rain: <strong>${liveCoordData.precipitationMm} mm</strong> (Rate: ${liveCoordData.rainMmHr} mm/h)</div>
                  <div>Surface Runoff: <strong>${liveCoordData.runoffMm} mm</strong> • Soil Moisture: <strong>${Math.round(liveCoordData.soilMoistureM3M3 * 100)}%</strong></div>
                  <div>Coastal Tide: <strong>${liveCoordData.tideHeightM} m (${liveCoordData.tideState})</strong></div>
                  <div>Temp / Humidity: <strong>${liveCoordData.temperatureC}°C / ${liveCoordData.humidityPercent}%</strong></div>
                </div>
              `
                : ''
            }
            <p style="margin:0;font-size:11px;">Ground Elevation: <strong>${elevData.elevationM} m MSL</strong> (${elevData.terrainType})</p>
          </div>
        `).openPopup();

        probeGroup.addLayer(probeMarker);
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Tile layer generator
  function createTileLayer(type: BasemapType): L.TileLayer {
    switch (type) {
      case 'light':
      default:
        // CartoDB Voyager - Apple Maps style light basemap with soft blue water and clean roads
        return L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
          subdomains: 'abcd',
          maxZoom: 19,
        });
      case 'topo':
        // OpenTopoMap with contour lines and mountain relief
        return L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenTopoMap contributors &copy; OpenStreetMap',
          maxZoom: 17,
        });
      case 'physical':
        // ESRI World Physical Map with geomorphological relief
        return L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}',
          {
            attribution: 'Tiles &copy; Esri &mdash; Source: US National Park Service',
            maxZoom: 16,
          }
        );
      case 'streets':
        return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        });
      case 'dark':
        return L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
          subdomains: 'abcd',
          maxZoom: 19,
        });
    }
  }

  // Switch basemap on change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
    }

    const newTile = createTileLayer(basemap);
    newTile.addTo(map);
    currentTileLayerRef.current = newTile;
  }, [basemap]);

  // Handle Location Tracking / Geolocation
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocationStatusText('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationStatusText('Acquiring high-accuracy GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude, accuracy } = position.coords;
        const elevData = getMumbaiElevation(latitude, longitude);

        setUserLocation({
          lat: latitude,
          lng: longitude,
          accuracy: Math.round(accuracy),
          elevation: elevData.elevationM,
        });

        setLocationStatusText(
          `Located at ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E (Elev: ${elevData.elevationM}m MSL, ±${Math.round(accuracy)}m)`
        );

        if (onUserLocationFound) {
          onUserLocationFound(latitude, longitude, elevData.elevationM);
        }

        const map = mapInstanceRef.current;
        if (map) {
          map.flyTo([latitude, longitude], 14, { duration: 1.5 });

          // Render GPS pin and accuracy circle
          const userGroup = layersGroupRef.current.userLocation;
          if (userGroup) {
            userGroup.clearLayers();

            const accuracyCircle = L.circle([latitude, longitude], {
              radius: accuracy,
              color: '#38bdf8',
              fillColor: '#0284c7',
              fillOpacity: 0.15,
              weight: 1.5,
            });
            userGroup.addLayer(accuracyCircle);

            const userIcon = L.divIcon({
              className: 'user-gps-pulse-marker',
              html: `<div style="position:relative;width:24px;height:24px;">
                <div style="position:absolute;inset:0;border-radius:50%;background:#38bdf8;animation:ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;opacity:0.75;"></div>
                <div style="position:absolute;inset:2px;border-radius:50%;background:#0284c7;border:2.5px solid #fff;box-shadow:0 0 10px #38bdf8;"></div>
              </div>`,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            });

            const userMarker = L.marker([latitude, longitude], { icon: userIcon });
            userMarker.bindPopup(`
              <div style="color:#0f172a;font-family:sans-serif;font-size:12px;min-width:210px;">
                <h4 style="margin:0 0 4px 0;font-weight:bold;color:#0284c7;">📍 Your GPS Location</h4>
                <p style="margin:0 0 2px 0;">Ground Elevation: <strong>${elevData.elevationM} m (MSL)</strong></p>
                <p style="margin:0 0 2px 0;">Terrain: <strong>${elevData.terrainType}</strong></p>
                <p style="margin:0 0 2px 0;">GPS Precision: <strong>±${Math.round(accuracy)} meters</strong></p>
                <p style="margin:0;font-size:11px;">Flood Vulnerability: <strong style="color:${
                  elevData.floodVulnerability === 'CRITICAL' ? '#dc2626' : '#16a34a'
                };">${elevData.floodVulnerability}</strong></p>
              </div>
            `).openPopup();

            userGroup.addLayer(userMarker);
          }
        }
      },
      (error) => {
        setIsLocating(false);
        // Fallback to central Mumbai with message
        setLocationStatusText(`GPS permission or signal unavailable: ${error.message}. Fallback coordinates available.`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  // Fly to specific preset landmark
  const flyToLandmark = (lm: MumbaiLandmark) => {
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([lm.lat, lm.lng], 14, { duration: 1.5 });
      setProbedData({
        lat: lm.lat,
        lng: lm.lng,
        elevation: lm.elevationM,
        zoneName: lm.name,
        vulnerability: lm.floodVulnerability,
        distanceToMithiKm: getMumbaiElevation(lm.lat, lm.lng).distanceToMithiKm,
      });
    }
    setShowSearchDropdown(false);
  };

  // 2. Render and update map layers when data or toggles change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const groups = layersGroupRef.current;
    if (!groups.riskZones) return;

    // Clear feature layers
    groups.airPressureWind?.clearLayers();
    groups.waterLevels.clearLayers();
    groups.rainfall.clearLayers();
    groups.riskZones.clearLayers();
    groups.evacuationRoutes.clearLayers();
    groups.shelters.clearLayers();
    groups.hospitals.clearLayers();
    groups.devices.clearLayers();
    groups.citizenReports.clearLayers();
    groups.topoContours.clearLayers();
    groups.topoLandmarks.clearLayers();

    // Risk level colors
    const riskColors: Record<string, string> = {
      SAFE: '#10b981',
      LOW: '#3b82f6',
      MODERATE: '#f59e0b',
      HIGH: '#f97316',
      CRITICAL: '#ef4444',
    };

    // A. TOPOGRAPHIC CONTOUR ISOLINES
    if (activeLayers.topoContours) {
      MUMBAI_CONTOUR_ISOLINES.forEach((contour) => {
        const polyline = L.polyline(contour.points, {
          color: contour.color,
          weight: contour.weight,
          opacity: 0.8,
          dashArray: contour.elevationM <= 5 ? '4, 4' : undefined,
        });

        polyline.bindTooltip(
          `<strong>Topographic Contour: ${contour.elevationM}m</strong><br/>${contour.label}`,
          { sticky: true }
        );

        groups.topoContours.addLayer(polyline);
      });
    }

    // B. TOPOGRAPHIC LANDMARKS & BENCHMARKS
    if (activeLayers.topoLandmarks) {
      MUMBAI_TOPOGRAPHIC_LANDMARKS.forEach((lm) => {
        const isBowl = lm.terrainType === 'FLOOD_BOWL' || lm.terrainType === 'RECLAIMED_LOWLAND';
        const iconEmoji = isBowl ? '⚠️' : lm.elevationM > 200 ? '🏔️' : '⛰️';
        const badgeColor = isBowl ? '#ef4444' : lm.elevationM > 100 ? '#b45309' : '#0284c7';

        const icon = L.divIcon({
          className: 'topo-landmark-icon',
          html: `<div style="background:${badgeColor};color:#fff;font-size:11px;font-weight:bold;padding:2px 6px;border-radius:12px;border:1.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.5);display:flex;align-items:center;gap:3px;white-space:nowrap;">
            <span>${iconEmoji}</span>
            <span>${lm.name.split(' ')[0]}</span>
            <span style="background:rgba(0,0,0,0.3);padding:1px 4px;border-radius:8px;font-size:9px;font-family:monospace;">${lm.elevationM}m</span>
          </div>`,
          iconSize: [110, 24],
          iconAnchor: [55, 12],
        });

        const marker = L.marker([lm.lat, lm.lng], { icon });
        marker.bindPopup(`
          <div style="color:#0f172a;font-family:sans-serif;font-size:12px;min-width:210px;">
            <h4 style="margin:0 0 3px 0;font-weight:bold;color:${badgeColor};">${lm.name}</h4>
            <div style="margin:4px 0;padding:4px 6px;background:#f8fafc;border-radius:4px;border:1px solid #cbd5e1;">
              <span style="font-size:10px;color:#64748b;display:block;">Topographic Elevation:</span>
              <strong style="font-size:14px;color:#0f172a;">${lm.elevationM} meters (MSL)</strong>
            </div>
            <p style="margin:0 0 2px 0;">Ward: <strong>${lm.ward}</strong></p>
            <p style="margin:0 0 2px 0;">Geomorphology: <strong>${lm.terrainType}</strong></p>
            <p style="margin:0 0 4px 0;font-size:11px;color:#475569;">${lm.description}</p>
            <p style="margin:0;font-size:11px;">Flood Vulnerability: <strong style="color:${
              lm.floodVulnerability === 'CRITICAL' ? '#dc2626' : lm.floodVulnerability === 'HIGH' ? '#ea580c' : '#16a34a'
            };">${lm.floodVulnerability}</strong></p>
          </div>
        `);
        groups.topoLandmarks.addLayer(marker);
      });
    }

    // C. VILLAGES / BASIN ZONES
    if (activeLayers.riskZones) {
      villages.forEach((village) => {
        const isSelected = village.id === selectedVillageId;
        const color = riskColors[village.riskLevel] || '#94a3b8';

        const polygon = L.polygon(village.polygon, {
          color: isSelected ? '#38bdf8' : color,
          weight: isSelected ? 3 : 2,
          fillColor: color,
          fillOpacity: isSelected ? 0.45 : 0.22,
        });

        polygon.bindTooltip(
          `<strong>${village.name}</strong><br/>Elevation: ${village.elevationM}m MSL<br/>Drainage Capacity: ${village.drainageCapacityMmHr} mm/hr<br/>Population: ${village.population.toLocaleString()}`,
          { permanent: false, direction: 'center', className: 'map-custom-tooltip' }
        );

        polygon.on('click', () => {
          if (onSelectVillage) onSelectVillage(village);
        });

        groups.riskZones.addLayer(polygon);
      });
    }

    // D. REAL-TIME AIR PRESSURE & DIRECTIONAL WIND VECTORS (Open-Meteo Live)
    if (activeLayers.airPressureWind && liveTelemetry?.stations) {
      liveTelemetry.stations.forEach((st) => {
        // Calculate directional wind vector endpoint based on windDirectionDeg (meteorological FROM direction -> flow vector)
        const flowRad = (((st.windDirectionDeg + 180) % 360) * Math.PI) / 180;
        const vecLen = 0.024;
        const endLat = st.lat + Math.cos(flowRad) * vecLen;
        const endLng = st.lng + Math.sin(flowRad) * vecLen;

        const windLine = L.polyline(
          [
            [st.lat, st.lng],
            [endLat, endLng],
          ],
          {
            color: '#2563eb',
            weight: 2.5,
            opacity: 0.85,
            dashArray: '5, 5',
          }
        );
        windLine.bindTooltip(
          `<strong>Directional Wind & Air Pressure Flow</strong><br/>Station: ${st.name}<br/>Air Pressure: ${st.seaLevelPressureHpa} hPa (${st.pressureTrend})<br/>Wind: ${st.windSpeedKmh} km/h ${st.windCardinal} (${st.windDirectionDeg}°)<br/>Gusts: ${st.windGustsKmh} km/h`,
          { sticky: true }
        );
        groups.airPressureWind.addLayer(windLine);

        const trendArrow = st.pressureTrend === 'RISING' ? '▲' : st.pressureTrend === 'FALLING' ? '▼' : '●';
        const pressureIcon = L.divIcon({
          className: 'air-pressure-wind-icon',
          html: `<div style="background:rgba(30,58,138,0.94);color:#fff;font-size:10px;font-weight:bold;padding:3px 7px;border-radius:8px;border:1.5px solid #60a5fa;box-shadow:0 2px 8px rgba(37,99,235,0.45);display:flex;align-items:center;gap:5px;white-space:nowrap;">
            <span style="display:inline-block;transform:rotate(${(st.windDirectionDeg + 180) % 360}deg);font-size:12px;color:#93c5fd;">➤</span>
            <span>${st.seaLevelPressureHpa} hPa ${trendArrow}</span>
            <span style="color:#bfdbfe;">| ${st.windSpeedKmh} km/h ${st.windCardinal} (${st.windDirectionDeg}°)</span>
          </div>`,
          iconSize: [185, 24],
          iconAnchor: [92, -10],
        });

        const marker = L.marker([st.lat, st.lng], { icon: pressureIcon });
        marker.bindPopup(`
          <div style="color:#0f172a;font-family:sans-serif;font-size:12px;min-width:245px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
              <strong style="color:#1d4ed8;font-size:13px;">${st.name}</strong>
              <span style="background:#dbeafe;color:#1e40af;font-size:9px;padding:1px 5px;border-radius:4px;font-weight:bold;">LIVE BAROMETRIC</span>
            </div>
            <p style="margin:0 0 4px 0;font-size:11px;color:#64748b;">${st.ward} • Elev: ${st.elevationM}m MSL</p>
            <div style="background:#eff6ff;padding:6px;border-radius:6px;border:1px solid #bfdbfe;margin-bottom:5px;font-size:11px;">
              <div>Sea-Level Air Pressure: <strong>${st.seaLevelPressureHpa} hPa (mbar)</strong></div>
              <div>Surface Air Pressure: <strong>${st.surfacePressureHpa} hPa</strong></div>
              <div>Barometric Trend: <strong>${trendArrow} ${st.pressureTrend}</strong></div>
              <div>Pressure Gradient: <strong>${st.pressureGradientDirection}</strong></div>
            </div>
            <div style="background:#f8fafc;padding:6px;border-radius:6px;border:1px solid #e2e8f0;font-size:11px;">
              <div>Wind Speed (10m): <strong>${st.windSpeedKmh} km/h</strong></div>
              <div>Wind Direction: <strong>${st.windDirectionDeg}° (${st.windCardinal})</strong></div>
              <div>Wind Gusts: <strong>${st.windGustsKmh} km/h</strong></div>
              <div>Temp & Humidity: <strong>${st.temperatureC}°C • ${st.humidityPercent}% RH</strong></div>
            </div>
          </div>
        `);
        groups.airPressureWind.addLayer(marker);
      });
    }

    // E. REAL-TIME RAINFALL & ATMOSPHERIC PRECIPITATION GAUGES
    if (activeLayers.rainfall && liveTelemetry?.stations) {
      liveTelemetry.stations.forEach((st) => {
        const icon = L.divIcon({
          className: 'weather-gauge-icon',
          html: `<div style="background:rgba(14, 165, 233, 0.95);color:#fff;font-size:10px;font-weight:bold;padding:2px 6px;border-radius:6px;border:1px solid #fff;box-shadow:0 2px 6px rgba(14,165,233,0.45);display:flex;align-items:center;gap:4px;white-space:nowrap;">
            <span>🌧️ ${st.precipitationMm} mm | RH ${st.humidityPercent}%</span>
          </div>`,
          iconSize: [115, 22],
          iconAnchor: [57, 28],
        });

        const marker = L.marker([st.lat + 0.003, st.lng - 0.003], { icon });
        marker.bindPopup(`
          <div style="color:#0f172a;font-family:sans-serif;font-size:12px;min-width:220px;">
            <h4 style="margin:0 0 4px 0;font-weight:bold;color:#0284c7;">${st.name} — Rain & Moisture</h4>
            <p style="margin:0 0 2px 0;">Current Precipitation: <strong>${st.precipitationMm} mm</strong></p>
            <p style="margin:0 0 2px 0;">Rain Intensity: <strong>${st.rainRateMmHr} mm/hr</strong></p>
            <p style="margin:0 0 2px 0;">Surface Runoff: <strong>${st.runoffMm} mm</strong></p>
            <p style="margin:0 0 2px 0;">Soil Moisture (0-7cm): <strong>${Math.round(st.soilMoistureM3M3 * 100)}%</strong></p>
            <p style="margin:0 0 2px 0;">Relative Humidity: <strong>${st.humidityPercent}%</strong> • Cloud Cover: <strong>${st.cloudCoverPercent}%</strong></p>
            <p style="margin:0;font-size:10px;color:#64748b;">Real-Time Open-Meteo / IMD Feed</p>
          </div>
        `);
        groups.rainfall.addLayer(marker);
      });
    }

    // F. REAL-TIME WATER LEVEL, DISCHARGE, TIDE & MARINE DETAILS
    if (activeLayers.waterLevels && liveTelemetry?.stations) {
      liveTelemetry.stations.forEach((st) => {
        const isElevated = st.waterLevelM >= st.warningWaterLevelM;
        const badgeBg = isElevated ? 'rgba(220, 38, 38, 0.95)' : 'rgba(13, 148, 136, 0.95)';
        const icon = L.divIcon({
          className: 'water-gauge-icon',
          html: `<div style="background:${badgeBg};color:#fff;font-size:10px;font-weight:bold;padding:3px 7px;border-radius:6px;border:1.5px solid #fff;box-shadow:0 2px 8px rgba(13,148,136,0.45);display:flex;align-items:center;gap:4px;white-space:nowrap;">
            <span>🌊 ${st.waterLevelM}m</span>
            <span style="opacity:0.9;">| ${st.riverDischargeM3s} m³/s</span>
          </div>`,
          iconSize: [125, 24],
          iconAnchor: [62, 12],
        });

        const marker = L.marker([st.lat, st.lng], { icon });
        marker.bindPopup(`
          <div style="color:#0f172a;font-family:sans-serif;font-size:12px;min-width:250px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
              <strong style="color:#0f766e;font-size:13px;">${st.name}</strong>
              <span style="background:#ccfbf1;color:#115e59;font-size:9px;padding:1px 5px;border-radius:4px;font-weight:bold;">WATER LIVE</span>
            </div>
            <div style="background:#f0fdfa;padding:6px;border-radius:6px;border:1px solid #99f6e4;margin-bottom:5px;font-size:11px;">
              <div>Current Water Level: <strong>${st.waterLevelM} m</strong> (Normal: ${st.normalWaterLevelM}m)</div>
              <div>Warning / Danger Marks: <strong>${st.warningWaterLevelM} m / ${st.dangerWaterLevelM} m</strong></div>
              <div>River / Channel Discharge: <strong>${st.riverDischargeM3s} m³/s</strong></div>
              <div>Drainage Flow Status: <strong>${st.drainageFlowStatus.replace('_', ' ')}</strong></div>
              <div>Surface Runoff & Soil Sat: <strong>${st.runoffMm} mm • ${Math.round(st.soilMoistureM3M3 * 100)}%</strong></div>
            </div>
            <div style="background:#f8fafc;padding:6px;border-radius:6px;border:1px solid #e2e8f0;font-size:11px;">
              <div><strong>Coastal & Marine Water Details:</strong></div>
              <div>Tide Level: <strong>${st.tideHeightM} m (${st.tideState.replace('_', ' ')})</strong></div>
              <div>Sea Wave Height & Dir: <strong>${st.waveHeightM} m @ ${st.waveDirectionDeg}° (Period: ${st.wavePeriodSec}s)</strong></div>
              <div>Swell Height & Dir: <strong>${st.swellHeightM} m @ ${st.swellDirectionDeg}°</strong></div>
              <div>Ocean Current Velocity: <strong>${st.oceanCurrentSpeedKmh} km/h @ ${st.oceanCurrentDirectionDeg}°</strong></div>
            </div>
          </div>
        `);
        groups.waterLevels.addLayer(marker);
      });
    }

    // G. EVACUATION ROUTES
    if (activeLayers.evacuationRoutes) {
      routes.forEach((route) => {
        const routeColor = route.status === 'CLEAR' ? '#10b981' : route.status === 'CAUTION' ? '#f59e0b' : '#ef4444';

        const polyline = L.polyline(route.waypoints, {
          color: routeColor,
          weight: 4,
          opacity: 0.85,
          dashArray: route.status === 'CAUTION' ? '8, 8' : undefined,
        });

        polyline.bindTooltip(
          `<strong>${route.name}</strong><br/>Status: <b>${route.status}</b><br/>Travel Time: ${route.estimatedTravelMinutes} mins (${route.distanceKm} km)`,
          { sticky: true }
        );

        polyline.on('click', () => {
          if (onSelectRoute) onSelectRoute(route);
        });

        groups.evacuationRoutes.addLayer(polyline);
      });
    }

    // H. SHELTERS
    if (activeLayers.shelters) {
      shelters.forEach((shelter) => {
        const pctOccupied = Math.round((shelter.occupancy / shelter.capacity) * 100);
        const shelterIcon = L.divIcon({
          className: 'shelter-marker-icon',
          html: `<div style="background:#0284c7;color:#fff;border:2px solid #fff;font-size:12px;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.6);">
            🏕️
          </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([shelter.location.lat, shelter.location.lng], { icon: shelterIcon });
        marker.bindPopup(`
          <div style="color:#0f172a;font-family:sans-serif;font-size:12px;min-width:200px;">
            <h4 style="margin:0 0 4px 0;font-weight:bold;color:#0369a1;">${shelter.name}</h4>
            <p style="margin:0 0 3px 0;font-size:11px;color:#475569;">${shelter.location.address}</p>
            <p style="margin:0 0 2px 0;">Occupancy: <strong>${shelter.occupancy} / ${shelter.capacity} (${pctOccupied}%)</strong></p>
            <p style="margin:0;font-size:11px;">Status: <strong>${shelter.status}</strong></p>
          </div>
        `);

        marker.on('click', () => {
          if (onSelectShelter) onSelectShelter(shelter);
        });

        groups.shelters.addLayer(marker);
      });
    }

    // I. HOSPITALS
    if (activeLayers.hospitals) {
      hospitals.forEach((hosp) => {
        const icon = L.divIcon({
          className: 'hospital-marker-icon',
          html: `<div style="background:#dc2626;color:#fff;border:2px solid #fff;font-size:12px;width:30px;height:30px;border-radius:6px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.6);">
            🏥
          </div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        const marker = L.marker([hosp.location.lat, hosp.location.lng], { icon });
        marker.bindPopup(`
          <div style="color:#0f172a;font-family:sans-serif;font-size:12px;min-width:190px;">
            <h4 style="margin:0 0 4px 0;font-weight:bold;color:#b91c1c;">${hosp.name}</h4>
            <p style="margin:0 0 2px 0;">Available Emergency Beds: <strong>${hosp.availableBeds} / ${hosp.emergencyCapacity}</strong></p>
            <p style="margin:0;font-size:11px;">Emergency Contact: <strong>${hosp.contactPhone}</strong></p>
          </div>
        `);
        groups.hospitals.addLayer(marker);
      });
    }

    // J. CITIZEN REPORTS
    if (activeLayers.citizenReports) {
      reports.forEach((rep) => {
        const depthEmoji = rep.depthCategory === 'OVERHEAD' ? '🚨' : rep.depthCategory === 'WAIST' ? '⚠️' : '🌊';
        const icon = L.divIcon({
          className: 'report-marker-icon',
          html: `<div style="background:#d97706;color:#fff;border:2px solid #fff;font-size:11px;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 5px rgba(0,0,0,0.5);">
            ${depthEmoji}
          </div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([rep.location.lat, rep.location.lng], { icon });
        marker.bindPopup(`
          <div style="color:#0f172a;font-family:sans-serif;font-size:12px;min-width:210px;">
            <span style="font-weight:bold;color:#d97706;">Citizen Field Report</span>
            <p style="margin:2px 0;">Depth: <strong>${rep.waterDepthM}m (${rep.depthCategory})</strong></p>
            <p style="margin:0 0 2px 0;font-size:11px;color:#334155;">"${rep.description}"</p>
          </div>
        `);
        groups.citizenReports.addLayer(marker);
      });
    }

    // K. DEVICES
    if (activeLayers.devices) {
      devices.forEach((dev) => {
        const dotColor = dev.batteryStatus === 'GREEN' ? '#22c55e' : dev.batteryStatus === 'YELLOW' ? '#eab308' : '#ef4444';
        const icon = L.divIcon({
          className: 'device-dot-icon',
          html: `<div style="background:${dotColor};width:10px;height:10px;border-radius:50%;border:1.5px solid #fff;box-shadow:0 0 6px ${dotColor};"></div>`,
          iconSize: [10, 10],
          iconAnchor: [5, 5],
        });

        const marker = L.marker([dev.lat, dev.lng], { icon });
        groups.devices.addLayer(marker);
      });
    }

    // L. TACTICAL DRONES (AERIAL RECONNAISSANCE GRID)
    if (activeLayers.drones && groups.drones) {
      groups.drones.clearLayers();
      DRONE_FLEET.forEach((drone) => {
        const isOnline = drone.status === 'CONNECTED' || drone.status === 'IN_FLIGHT';
        const droneIcon = L.divIcon({
          className: 'drone-marker-icon',
          html: `<div style="position:relative;width:34px;height:34px;display:flex;align-items:center;justify-content:center;">
            <div style="position:absolute;inset:0;border-radius:50%;background:${isOnline ? 'rgba(56,189,248,0.35)' : 'rgba(148,163,184,0.2)'};animation:${isOnline ? 'ping 2s cubic-bezier(0,0,0.2,1) infinite' : 'none'};"></div>
            <div style="width:30px;height:30px;border-radius:50%;background:#0f172a;border:2px solid #38bdf8;box-shadow:0 0 10px rgba(56,189,248,0.7);display:flex;align-items:center;justify-content:center;font-size:14px;color:#fff;">
              🚁
            </div>
            <div style="position:absolute;bottom:-4px;right:-4px;background:#10b981;width:10px;height:10px;border-radius:50%;border:1.5px solid #fff;"></div>
          </div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        const marker = L.marker([drone.lat, drone.lng], { icon: droneIcon });
        marker.bindPopup(`
          <div style="color:#0f172a;font-family:sans-serif;font-size:12px;min-width:220px;">
            <div style="display:flex;align-items:center;justify-content:between;margin-bottom:4px;">
              <strong style="color:#0284c7;font-size:13px;">${drone.callsign}</strong>
              <span style="background:#ecfdf5;color:#047857;border:1px solid #a7f3d0;font-size:9px;padding:1px 4px;border-radius:4px;font-weight:bold;margin-left:auto;">${drone.status}</span>
            </div>
            <p style="margin:0 0 3px 0;font-size:11px;color:#475569;">${drone.locationName}</p>
            <div style="background:#f8fafc;padding:5px;border-radius:6px;border:1px solid #e2e8f0;margin:4px 0;font-size:11px;">
              <div>Altitude: <strong>${drone.altitudeM} m (AGL)</strong></div>
              <div>Water Depth Measured: <strong style="color:#0891b2;">${drone.waterDepthMeasuredM} m</strong></div>
              <div>Battery: <strong>${drone.batteryPercent}%</strong> | Speed: <strong>${drone.speedKmh} km/h</strong></div>
            </div>
            <button
              onclick="window.dispatchEvent(new CustomEvent('pehra:open-drone-recon', { detail: { droneId: '${drone.id}' } }))"
              style="width:100%;margin-top:6px;background:#2563eb;color:#fff;border:none;padding:5px 8px;border-radius:6px;font-size:11px;font-weight:bold;cursor:pointer;"
            >
              Open Live Aerial Flood Recon →
            </button>
          </div>
        `);
        groups.drones.addLayer(marker);
      });
    }
  }, [
    villages,
    incidents,
    alerts,
    shelters,
    hospitals,
    routes,
    reports,
    devices,
    observations,
    selectedVillageId,
    activeLayers,
    liveTelemetry,
  ]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-[#E5EAF0] bg-white flex flex-col shadow-xs">
      {/* Live Real-Time Air Pressure, Directional Wind & Normal Water Details Strip */}
      {liveTelemetry && (
        <div className="z-20 border-b border-[#E5EAF0] bg-slate-900 text-white px-3 py-1.5 text-[11px] flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/20 border border-emerald-400/40 px-2 py-0.5 text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              Live Open-Meteo / IMD Feed
            </span>

            {/* Air Pressure & Directional Gradient */}
            <div className="flex items-center gap-1.5 border-r border-slate-700 pr-3">
              <Gauge className="h-3.5 w-3.5 text-sky-400 shrink-0" />
              <span className="text-slate-400">Air Pressure:</span>
              <strong className="font-mono text-sky-300">
                {liveTelemetry.airPressureMslHpa} hPa (MSL)
              </strong>
              <span className="text-[10px] text-slate-400">
                (Surf: {liveTelemetry.surfacePressureHpa} hPa • {liveTelemetry.pressureTrend})
              </span>
            </div>

            {/* Directional Wind */}
            <div className="flex items-center gap-1.5 border-r border-slate-700 pr-3">
              <Wind className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span className="text-slate-400">Directional Wind:</span>
              <strong className="font-mono text-emerald-300">
                {liveTelemetry.windSpeedKmh} km/h {liveTelemetry.windCardinal} ({liveTelemetry.windDirectionDeg}°)
              </strong>
              <span className="text-[10px] text-slate-400">
                Gusts {liveTelemetry.windGustsKmh} km/h
              </span>
            </div>

            {/* Normal Water & River Details */}
            <div className="flex items-center gap-1.5 border-r border-slate-700 pr-3">
              <Droplets className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              <span className="text-slate-400">Water Level:</span>
              <strong className="font-mono text-cyan-300">
                {liveTelemetry.mithiWaterLevelM}m
              </strong>
              <span className="text-[10px] text-slate-400">
                (Norm {liveTelemetry.mithiNormalLevelM}m / Danger {liveTelemetry.mithiDangerLevelM}m • Flow {liveTelemetry.riverDischargeM3s} m³/s)
              </span>
            </div>

            {/* Tide & Sea Waves */}
            <div className="hidden xl:flex items-center gap-1.5">
              <Waves className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              <span className="text-slate-400">Tide & Sea:</span>
              <strong className="font-mono text-blue-300">
                {liveTelemetry.tideHeightM}m ({liveTelemetry.tideState})
              </strong>
              <span className="text-[10px] text-slate-400">
                • Wave {liveTelemetry.waveHeightM}m @ {liveTelemetry.waveDirectionDeg}° ({liveTelemetry.waveDirectionCardinal})
              </span>
            </div>
          </div>

          <button
            onClick={refreshLiveTelemetry}
            disabled={isRefreshingLive}
            className="flex items-center gap-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-600 px-2 py-0.5 text-[10px] font-semibold text-slate-200 transition-colors"
            title="Fetch Latest Live Atmospheric & Water Telemetry"
          >
            <RotateCw className={`h-3 w-3 ${isRefreshingLive ? 'animate-spin text-sky-400' : ''}`} />
            <span>{isRefreshingLive ? 'Syncing...' : 'Sync Live'}</span>
          </button>
        </div>
      )}

      {/* Top Map Control Bar: Basemaps & Location Search */}
      <div className="absolute top-12 left-3 z-10 flex flex-wrap items-center gap-2 max-w-[calc(100%-15rem)]">
        {/* Basemap Switcher */}
        <div className="flex items-center rounded-xl border border-[#E5EAF0] bg-white/95 p-1 backdrop-blur-md shadow-sm text-xs">
          <button
            onClick={() => setBasemap('light')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold transition-colors ${
              basemap === 'light'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Clean Light Basemap (Apple Maps style)"
          >
            <span>Light</span>
          </button>

          <button
            onClick={() => setBasemap('topo')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold transition-colors ${
              basemap === 'topo'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="OpenTopoMap with contour lines and mountain relief"
          >
            <Mountain className="h-3.5 w-3.5" />
            <span>Topo</span>
          </button>

          <button
            onClick={() => setBasemap('physical')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold transition-colors ${
              basemap === 'physical'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="ESRI Physical Relief"
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Physical</span>
          </button>

          <button
            onClick={() => setBasemap('streets')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold transition-colors ${
              basemap === 'streets'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="OpenStreetMap Street Network"
          >
            <span>Streets</span>
          </button>
        </div>

        {/* 2.5D Tilt Perspective Button */}
        <button
          onClick={() => setIs3DTilt(!is3DTilt)}
          className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold backdrop-blur-md shadow-sm transition-all ${
            is3DTilt
              ? 'bg-blue-50 text-blue-700 border-blue-300'
              : 'border-[#E5EAF0] bg-white/95 text-slate-700 hover:bg-slate-50'
          }`}
          title="Toggle 2.5D Isometric Map Tilt Perspective"
        >
          <Compass className={`h-3.5 w-3.5 ${is3DTilt ? 'rotate-45 text-blue-600' : 'text-slate-500'}`} />
          <span className="hidden sm:inline">{is3DTilt ? '2.5D Tilt Active' : '2.5D Tilt'}</span>
        </button>

        {/* GPS "Locate Me" Button */}
        <button
          onClick={handleLocateMe}
          disabled={isLocating}
          className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold backdrop-blur-md shadow-sm transition-all ${
            isLocating
              ? 'border-blue-300 bg-blue-50 text-blue-700'
              : userLocation
              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
              : 'border-[#E5EAF0] bg-white/95 text-slate-700 hover:bg-slate-50'
          }`}
          title="Detect Current GPS Location & Topographic Elevation"
        >
          <Navigation className={`h-3.5 w-3.5 ${isLocating ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
          <span>{isLocating ? 'Locating...' : userLocation ? 'GPS Locked' : 'Locate Me'}</span>
        </button>

        {/* Preset Location Quick Jumps */}
        <div className="relative">
          <button
            onClick={() => setShowSearchDropdown(!showSearchDropdown)}
            className="flex items-center gap-1.5 rounded-xl border border-[#E5EAF0] bg-white/95 px-2.5 py-1.5 text-xs font-semibold text-slate-700 backdrop-blur-md shadow-sm hover:bg-slate-50"
          >
            <Search className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden md:inline">Hotspots</span>
          </button>

          {showSearchDropdown && (
            <div className="absolute top-full left-0 mt-1.5 w-64 rounded-xl border border-[#E5EAF0] bg-white p-2 shadow-xl z-30 max-h-72 overflow-y-auto text-xs">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Mumbai Topographic Hotspots
              </div>
              {MUMBAI_TOPOGRAPHIC_LANDMARKS.map((lm) => (
                <button
                  key={lm.id}
                  onClick={() => flyToLandmark(lm)}
                  className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <span className="truncate">{lm.name}</span>
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-mono font-bold ${
                      lm.floodVulnerability === 'CRITICAL'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {lm.elevationM}m
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map Element with optional 2.5D Isometric Tilt */}
      <div
        className={`flex-1 w-full z-0 transition-transform duration-500 ease-out ${
          is3DTilt ? 'origin-bottom scale-105' : ''
        }`}
        style={
          is3DTilt
            ? {
                perspective: '1000px',
                transform: 'rotateX(24deg)',
              }
            : undefined
        }
      >
        <div ref={mapContainerRef} className="h-full w-full" />
      </div>

      {/* Layer Toggles Floating Control Panel */}
      <div className="absolute top-12 right-3 z-10 rounded-xl border border-[#E5EAF0] bg-white/95 p-3 backdrop-blur-md shadow-md text-xs text-slate-700 w-60 max-h-[82%] overflow-y-auto">
        <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-1.5 font-semibold uppercase tracking-wider text-[11px] text-blue-600">
          <span>Live Map Overlays</span>
          <span className="text-[10px] text-emerald-600 font-mono font-bold">REAL-TIME</span>
        </div>

        <div className="space-y-1.5 text-slate-600">
          {/* Live Air Pressure & Wind Vectors */}
          <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900 font-semibold text-blue-800">
            <input
              type="checkbox"
              checked={activeLayers.airPressureWind}
              onChange={() => toggleLayer('airPressureWind')}
              className="rounded border-slate-300 text-blue-600 focus:ring-0"
            />
            <span className="flex items-center gap-1.5">
              <span>🧭</span>
              <span>Air Pressure & Wind Dir</span>
            </span>
          </label>

          {/* Live Water Level & Tide Gauges */}
          <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900 font-semibold text-teal-800">
            <input
              type="checkbox"
              checked={activeLayers.waterLevels}
              onChange={() => toggleLayer('waterLevels')}
              className="rounded border-slate-300 text-teal-600 focus:ring-0"
            />
            <span className="flex items-center gap-1.5">
              <span>🌊</span>
              <span>Water Level, Flow & Tide</span>
            </span>
          </label>

          {/* Live Rainfall & Soil Moisture */}
          <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900 font-medium text-sky-800">
            <input
              type="checkbox"
              checked={activeLayers.rainfall}
              onChange={() => toggleLayer('rainfall')}
              className="rounded border-slate-300 text-sky-600 focus:ring-0"
            />
            <span className="flex items-center gap-1.5">
              <span>🌧️</span>
              <span>Rainfall & Runoff Gauges</span>
            </span>
          </label>

          {/* Topographic Contours Toggle */}
          <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900 font-medium text-emerald-700">
            <input
              type="checkbox"
              checked={activeLayers.topoContours}
              onChange={() => toggleLayer('topoContours')}
              className="rounded border-slate-300 text-emerald-600 focus:ring-0"
            />
            <span className="flex items-center gap-1.5">
              <Mountain className="h-3.5 w-3.5 text-emerald-600" />
              <span>Elevation Contours</span>
            </span>
          </label>

          {/* Topographic Landmarks */}
          <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
            <input
              type="checkbox"
              checked={activeLayers.topoLandmarks}
              onChange={() => toggleLayer('topoLandmarks')}
              className="rounded border-slate-300 text-blue-600 focus:ring-0"
            />
            <span className="flex items-center gap-1.5">
              <span>🏔️</span>
              <span>Peaks & Ridges</span>
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
            <input
              type="checkbox"
              checked={activeLayers.riskZones}
              onChange={() => toggleLayer('riskZones')}
              className="rounded border-slate-300 text-rose-600 focus:ring-0"
            />
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span>Basin Flood Zones</span>
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
            <input
              type="checkbox"
              checked={activeLayers.evacuationRoutes}
              onChange={() => toggleLayer('evacuationRoutes')}
              className="rounded border-slate-300 text-emerald-600 focus:ring-0"
            />
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Evacuation Routes</span>
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
            <input
              type="checkbox"
              checked={activeLayers.shelters}
              onChange={() => toggleLayer('shelters')}
              className="rounded border-slate-300 text-amber-600 focus:ring-0"
            />
            <span className="flex items-center gap-1.5">
              <span>🏕️</span>
              <span>Relief Shelters</span>
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
            <input
              type="checkbox"
              checked={activeLayers.hospitals}
              onChange={() => toggleLayer('hospitals')}
              className="rounded border-slate-300 text-blue-600 focus:ring-0"
            />
            <span className="flex items-center gap-1.5">
              <span>🏥</span>
              <span>Hospitals</span>
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
            <input
              type="checkbox"
              checked={activeLayers.citizenReports}
              onChange={() => toggleLayer('citizenReports')}
              className="rounded border-slate-300 text-orange-600 focus:ring-0"
            />
            <span className="flex items-center gap-1.5">
              <span>⚠️</span>
              <span>Citizen Reports</span>
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
            <input
              type="checkbox"
              checked={activeLayers.devices}
              onChange={() => toggleLayer('devices')}
              className="rounded border-slate-300 text-emerald-600 focus:ring-0"
            />
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              <span>Responders / Teams</span>
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900 font-semibold text-blue-700">
            <input
              type="checkbox"
              checked={activeLayers.drones}
              onChange={() => toggleLayer('drones')}
              className="rounded border-slate-300 text-blue-600 focus:ring-0"
            />
            <span className="flex items-center gap-1.5">
              <span>🚁</span>
              <span>Tactical Drone Grid</span>
            </span>
          </label>
        </div>
      </div>

      {/* Location Status & Elevation Notification Bar */}
      {locationStatusText && (
        <div className="absolute bottom-14 left-3 z-10 flex items-center gap-2 rounded-xl border border-blue-200 bg-white/95 px-3 py-1.5 backdrop-blur-md shadow-md text-xs text-blue-800 max-w-md">
          <Navigation className="h-3.5 w-3.5 shrink-0 text-blue-600" />
          <span className="truncate">{locationStatusText}</span>
          <button
            onClick={() => setLocationStatusText(null)}
            className="ml-auto text-slate-400 hover:text-slate-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Map Legend: Contours & Risk Scale */}
      <div className="absolute bottom-3 left-3 z-10 flex flex-wrap items-center gap-3 rounded-xl border border-[#E5EAF0] bg-white/95 px-3 py-2 backdrop-blur-md shadow-sm text-[11px] text-slate-700">
        <div>
          <span className="font-semibold text-slate-500 block mb-0.5">Topographic Contours:</span>
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span className="flex items-center gap-1">
              <span className="h-1 w-3 bg-cyan-500" /> 5m
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1 w-3 bg-emerald-500" /> 15m
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1 w-3 bg-amber-500" /> 50m
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1 w-3 bg-rose-500" /> 300m
            </span>
          </div>
        </div>

        <div className="border-l border-slate-200 pl-3">
          <span className="font-semibold text-slate-500 block mb-0.5">Risk Scale:</span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Safe
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-blue-500" /> Low
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Moderate
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-orange-500" /> High
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" /> Critical
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
