import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Layers,
  Building2,
  Navigation,
  AlertTriangle,
  X,
  Crosshair,
  ShieldCheck,
  Compass,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { ShelterData, FloodSafeLocation } from '../../data/floodSafeData.ts';

interface LiveFloodMapScreenProps {
  currentLocation: FloodSafeLocation;
  shelters: ShelterData[];
  onNavigateTab: (tab: string) => void;
}

export const LiveFloodMapScreen: React.FC<LiveFloodMapScreenProps> = ({
  currentLocation,
  shelters,
  onNavigateTab,
}) => {
  const [selectedLayer, setSelectedLayer] = useState<'ALL' | 'ZONES' | 'SHELTERS' | 'CLOSURES'>('ALL');
  const [selectedMarker, setSelectedMarker] = useState<any | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);

  // Markers dataset for Mumbai area
  const mapMarkers = [
    {
      id: 'mkr-user',
      type: 'USER',
      name: 'Your Current Position',
      detail: `${currentLocation.name} • Elevation ${currentLocation.elevationM}m`,
      lat: 19.0688,
      lng: 72.8795,
      status: 'Current Location',
      risk: currentLocation.riskLevel,
    },
    {
      id: 'mkr-sh-1',
      type: 'SHELTER',
      name: 'Kurla Municipal High School',
      detail: '280 beds available • 450m walk',
      lat: 19.0712,
      lng: 72.8814,
      status: 'OPEN',
    },
    {
      id: 'mkr-sh-2',
      type: 'SHELTER',
      name: 'BKC Community Relief Hall',
      detail: '510 beds available • 1.1km walk',
      lat: 19.0645,
      lng: 72.8682,
      status: 'OPEN',
    },
    {
      id: 'mkr-sh-3',
      type: 'SHELTER',
      name: 'Sion Hill Community Center',
      detail: '40 beds available • High Ground Ridge',
      lat: 19.0435,
      lng: 72.8624,
      status: 'LIMITED',
    },
    {
      id: 'mkr-close-1',
      type: 'CLOSURE',
      name: 'Milan Subway Submerged',
      detail: 'Water Depth: 1.15m • Fully Barricaded',
      lat: 19.0835,
      lng: 72.8424,
      status: 'ROAD CLOSED',
    },
    {
      id: 'mkr-close-2',
      type: 'CLOSURE',
      name: 'Andheri Subway Submerged',
      detail: 'Water Depth: 1.30m • Avoid area',
      lat: 19.1197,
      lng: 72.8468,
      status: 'ROAD CLOSED',
    },
    {
      id: 'mkr-zone-1',
      type: 'FLOOD_ZONE',
      name: 'Mithi River Lower Basin',
      detail: 'Backwater alert active due to high tide lock',
      lat: 19.0612,
      lng: 72.8724,
      status: 'WATERLOGGED',
    },
    {
      id: 'mkr-hosp-1',
      type: 'HOSPITAL',
      name: 'Bhabha Municipal Hospital',
      detail: '24/7 Emergency Casualty & Trauma',
      lat: 19.0621,
      lng: 72.8834,
      status: 'OPERATIONAL',
    },
  ];

  // Initialize interactive Leaflet map with restrained light tiles
  useEffect(() => {
    let mapInstance: any = null;

    const initMap = async () => {
      if (!mapContainerRef.current || typeof window === 'undefined') return;

      try {
        const L = (window as any).L;
        if (!L) return;

        // Clean up previous instance
        if (leafletMapRef.current) {
          leafletMapRef.current.remove();
          leafletMapRef.current = null;
        }

        // Initialize Map centered around Kurla / Central Mumbai
        mapInstance = L.map(mapContainerRef.current, {
          center: [19.0688, 72.8795],
          zoom: 14,
          zoomControl: false,
          attributionControl: false,
        });

        // Add Restrained Calm Light Tile Layer (CartoDB Positron - light, minimal, professional)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
          subdomains: 'abcd',
        }).addTo(mapInstance);

        // Add Zoom Control at top right
        L.control.zoom({ position: 'topright' }).addTo(mapInstance);

        // Draw Translucent Flood Hazard Polygon (Mithi River low basin)
        const floodPolygon = L.polygon(
          [
            [19.074, 72.875],
            [19.071, 72.882],
            [19.063, 72.879],
            [19.058, 72.871],
            [19.062, 72.867],
          ],
          {
            color: '#2E7D82',
            weight: 1.5,
            fillColor: '#DCEFF2',
            fillOpacity: 0.45,
            dashArray: '4, 4',
          }
        ).addTo(mapInstance);

        // Draw Safe Evacuation Route line (Green dashed path)
        const safeRouteLine = L.polyline(
          [
            [19.0688, 72.8795],
            [19.0695, 72.8805],
            [19.0705, 72.881],
            [19.0712, 72.8814],
          ],
          {
            color: '#4F8A68',
            weight: 4,
            opacity: 0.85,
            dashArray: '6, 6',
          }
        ).addTo(mapInstance);

        // Plot Markers
        mapMarkers.forEach((m) => {
          let markerColor = '#2E7D82';
          let iconLetter = 'S';

          if (m.type === 'USER') {
            markerColor = '#173B4D';
            iconLetter = 'YOU';
          } else if (m.type === 'CLOSURE') {
            markerColor = '#E85D5D';
            iconLetter = '✕';
          } else if (m.type === 'HOSPITAL') {
            markerColor = '#2E7D82';
            iconLetter = '+';
          } else if (m.type === 'FLOOD_ZONE') {
            markerColor = '#E85D5D';
            iconLetter = '▲';
          }

          const customIcon = L.divIcon({
            className: 'custom-map-pin',
            html: `<div style="
              background: ${markerColor};
              color: white;
              width: ${m.type === 'USER' ? '34px' : '26px'};
              height: ${m.type === 'USER' ? '34px' : '26px'};
              border-radius: 9999px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 11px;
              font-weight: 800;
              border: 2px solid white;
              box-shadow: 0 2px 6px rgba(0,0,0,0.15);
              cursor: pointer;
            ">${iconLetter}</div>`,
            iconSize: [m.type === 'USER' ? 34 : 26, m.type === 'USER' ? 34 : 26],
            iconAnchor: [m.type === 'USER' ? 17 : 13, m.type === 'USER' ? 17 : 13],
          });

          const leafletMarker = L.marker([m.lat, m.lng], { icon: customIcon }).addTo(mapInstance);
          leafletMarker.on('click', () => {
            setSelectedMarker(m);
          });
        });

        leafletMapRef.current = mapInstance;
      } catch (e) {
        console.warn('Leaflet failed to mount or not available:', e);
      }
    };

    const timeout = setTimeout(initMap, 100);
    return () => {
      clearTimeout(timeout);
      if (leafletMapRef.current) {
        try {
          leafletMapRef.current.remove();
        } catch (e) {}
        leafletMapRef.current = null;
      }
    };
  }, []);

  const handleRecenter = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.setView([19.0688, 72.8795], 15);
    }
  };

  return (
    <div className="relative h-[calc(100vh-125px)] min-h-[500px] flex flex-col bg-[#F7FAFA] overflow-hidden">
      {/* Top Filter Chips */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => setSelectedLayer('ALL')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm backdrop-blur-md transition-all whitespace-nowrap ${
            selectedLayer === 'ALL'
              ? 'bg-[#173B4D] text-white'
              : 'bg-white/95 text-[#5A7382] border border-[#E2ECEF] hover:bg-white'
          }`}
        >
          All Layers
        </button>
        <button
          onClick={() => setSelectedLayer('SHELTERS')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm backdrop-blur-md transition-all whitespace-nowrap ${
            selectedLayer === 'SHELTERS'
              ? 'bg-[#2E7D82] text-white'
              : 'bg-white/95 text-[#5A7382] border border-[#E2ECEF] hover:bg-white'
          }`}
        >
          Safe Shelters (3)
        </button>
        <button
          onClick={() => setSelectedLayer('CLOSURES')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm backdrop-blur-md transition-all whitespace-nowrap ${
            selectedLayer === 'CLOSURES'
              ? 'bg-[#E85D5D] text-white'
              : 'bg-white/95 text-[#5A7382] border border-[#E2ECEF] hover:bg-white'
          }`}
        >
          Road Closures (2)
        </button>
        <button
          onClick={() => setSelectedLayer('ZONES')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm backdrop-blur-md transition-all whitespace-nowrap ${
            selectedLayer === 'ZONES'
              ? 'bg-amber-600 text-white'
              : 'bg-white/95 text-[#5A7382] border border-[#E2ECEF] hover:bg-white'
          }`}
        >
          Flood Basin
        </button>
      </div>

      {/* Recenter Button */}
      <div className="absolute bottom-24 right-3 z-[400] flex flex-col gap-2">
        <button
          onClick={handleRecenter}
          className="h-10 w-10 rounded-xl bg-white border border-[#E2ECEF] shadow-md flex items-center justify-center text-[#173B4D] hover:bg-[#EEF7F8] transition-colors"
          title="Recenter on My Location"
        >
          <Crosshair className="h-4 w-4" />
        </button>
      </div>

      {/* Interactive Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Map Legend Overlay at Bottom */}
      {!selectedMarker && (
        <div className="absolute bottom-3 left-3 right-3 z-[400] bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-[#E2ECEF] shadow-md">
          <div className="flex items-center justify-between text-[11px] text-[#5A7382]">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#173B4D]" />
              <span className="font-semibold text-[#173B4D]">You</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#2E7D82]" />
              <span>Safe Shelter</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#E85D5D]" />
              <span>Closed Road</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-5 rounded-full bg-[#4F8A68]" />
              <span>Evac Route</span>
            </div>
          </div>
        </div>
      )}

      {/* Selected Marker Detail Card Drawer */}
      {selectedMarker && (
        <div className="absolute bottom-3 left-3 right-3 z-[450] bg-white p-4 rounded-2xl border border-[#E2ECEF] shadow-xl animate-in slide-in-from-bottom duration-150">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-[#2E7D82] uppercase tracking-wider">
                {selectedMarker.type} • {selectedMarker.status}
              </span>
              <h3 className="text-sm font-bold text-[#173B4D] mt-0.5">{selectedMarker.name}</h3>
              <p className="text-xs text-[#5A7382] mt-0.5">{selectedMarker.detail}</p>
            </div>
            <button
              onClick={() => setSelectedMarker(null)}
              className="h-7 w-7 rounded-full bg-[#F7FAFA] flex items-center justify-center text-[#5A7382] hover:text-[#173B4D]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-[#F0F4F6] flex items-center justify-end gap-2">
            {selectedMarker.type === 'SHELTER' && (
              <button
                onClick={() => onNavigateTab('routes')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#173B4D] text-white text-xs font-bold hover:bg-[#1f4a60] transition-colors"
              >
                <Navigation className="h-3.5 w-3.5" />
                <span>Navigate to Shelter</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
