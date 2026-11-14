/**
 * Topographic and Digital Elevation Model (DEM) utilities for the
 * Mumbai Metropolitan Region (Salsette Peninsula & Harbor Basin).
 */

export interface MumbaiLandmark {
  id: string;
  name: string;
  lat: number;
  lng: number;
  elevationM: number;
  ward: string;
  terrainType: 'RIDGE' | 'HILL' | 'FLOOD_BOWL' | 'RECLAIMED_LOWLAND' | 'ESTUARY' | 'PLATEAU';
  floodVulnerability: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' | 'SAFE';
  description: string;
}

export const MUMBAI_TOPOGRAPHIC_LANDMARKS: MumbaiLandmark[] = [
  {
    id: 'kanheri-peak',
    name: 'Kanheri Peak (SGNP)',
    lat: 19.2085,
    lng: 72.9068,
    elevationM: 468,
    ward: 'R/C (Borivali East)',
    terrainType: 'PEAK' as any,
    floodVulnerability: 'SAFE',
    description: 'Highest natural basalt mountain peak in Mumbai within Sanjay Gandhi National Park.',
  },
  {
    id: 'tulsi-lake',
    name: 'Tulsi Lake Ridge',
    lat: 19.1822,
    lng: 72.9185,
    elevationM: 115,
    ward: 'S (Bhandup)',
    terrainType: 'PLATEAU',
    floodVulnerability: 'SAFE',
    description: 'Freshwater catchment basin nestled high in Salsette hills.',
  },
  {
    id: 'powai-iit-ridge',
    name: 'Powai Hill / IIT Bombay Ridge',
    lat: 19.1334,
    lng: 72.9133,
    elevationM: 85,
    ward: 'S (Powai)',
    terrainType: 'RIDGE',
    floodVulnerability: 'SAFE',
    description: 'Elevated basalt spur commanding the Powai and Vihar overflow corridors.',
  },
  {
    id: 'trombay-hill',
    name: 'Trombay Hill (BARC Ridge)',
    lat: 19.0185,
    lng: 72.9122,
    elevationM: 302,
    ward: 'M/E (Trombay)',
    terrainType: 'HILL',
    floodVulnerability: 'SAFE',
    description: 'Prominent eastern headland overlooking Thane Creek and Mumbai Harbor.',
  },
  {
    id: 'malabar-hill',
    name: 'Malabar Hill Ridge',
    lat: 18.9555,
    lng: 72.7985,
    elevationM: 55,
    ward: 'D (Grant Road / Malabar)',
    terrainType: 'RIDGE',
    floodVulnerability: 'SAFE',
    description: 'Southern basalt escarpment facing Back Bay and the Arabian Sea.',
  },
  {
    id: 'pali-hill',
    name: 'Pali Hill (Bandra West)',
    lat: 19.0664,
    lng: 72.8276,
    elevationM: 32,
    ward: 'H/W (Bandra West)',
    terrainType: 'HILL',
    floodVulnerability: 'SAFE',
    description: 'Elevated coastal ridge maintaining natural stormwater runoff down to Carter Road.',
  },
  {
    id: 'antop-hill',
    name: 'Antop Hill (Wadala Ridge)',
    lat: 19.0235,
    lng: 72.8682,
    elevationM: 54,
    ward: 'F/N (Wadala)',
    terrainType: 'HILL',
    floodVulnerability: 'SAFE',
    description: 'Natural ridge standing above the eastern railway low-elevation corridor.',
  },
  // LOW ELEVATION FLOOD BOWLS
  {
    id: 'kurla-west-basin',
    name: 'Kurla West (Mithi River Basin)',
    lat: 19.0688,
    lng: 72.8752,
    elevationM: 3.2,
    ward: 'L (Kurla)',
    terrainType: 'FLOOD_BOWL',
    floodVulnerability: 'CRITICAL',
    description: 'Depression basin adjacent to Mithi River culvert; prime inundation nexus during high tide.',
  },
  {
    id: 'sion-circle',
    name: 'Sion Circle & Gandhi Market',
    lat: 19.0392,
    lng: 72.8619,
    elevationM: 2.6,
    ward: 'F/N (Sion)',
    terrainType: 'FLOOD_BOWL',
    floodVulnerability: 'CRITICAL',
    description: 'Historic low-elevation marshland bottleneck prone to Central Railway track flooding.',
  },
  {
    id: 'hindmata-dadar',
    name: 'Hindmata Cinema / Dadar TT',
    lat: 19.0128,
    lng: 72.8428,
    elevationM: 1.9,
    ward: 'F/S (Parel)',
    terrainType: 'RECLAIMED_LOWLAND',
    floodVulnerability: 'CRITICAL',
    description: 'Reclaimed inter-island depression historically vulnerable to water accumulation.',
  },
  {
    id: 'milan-subway',
    name: 'Milan Subway (Santacruz)',
    lat: 19.0881,
    lng: 72.8423,
    elevationM: 2.1,
    ward: 'H/E (Santacruz)',
    terrainType: 'FLOOD_BOWL',
    floodVulnerability: 'HIGH',
    description: 'Sunken railway underpass connecting east and west suburbs.',
  },
  {
    id: 'bkc-creekfront',
    name: 'BKC / Vakola Nallah Confluence',
    lat: 19.0612,
    lng: 72.8645,
    elevationM: 4.1,
    ward: 'H/E (Bandra East)',
    terrainType: 'ESTUARY',
    floodVulnerability: 'HIGH',
    description: 'Financial district reclaimed from Mahim mangrove estuary; vulnerable to Mithi backflow.',
  },
  {
    id: 'mahim-bay-outfall',
    name: 'Mahim Bay Mithi Outfall',
    lat: 19.0435,
    lng: 72.8398,
    elevationM: 0.9,
    ward: 'G/N (Mahim)',
    terrainType: 'ESTUARY',
    floodVulnerability: 'HIGH',
    description: 'Tidal mouth where Mithi River discharges into the Arabian Sea. Sluice lock gate.',
  },
  {
    id: 'dharavi-transit',
    name: 'Dharavi Transit Lowlands',
    lat: 19.0418,
    lng: 72.8542,
    elevationM: 2.4,
    ward: 'G/N (Dharavi)',
    terrainType: 'RECLAIMED_LOWLAND',
    floodVulnerability: 'HIGH',
    description: 'Dense settlement constructed over former Mahim mangrove flats.',
  },
];

/**
 * Continuous Digital Elevation Model (DEM) approximation for any coordinate
 * across Mumbai (18.88° - 19.35° N, 72.75° - 73.10° E).
 * Combines regional topography with realistic mountain peaks, ridges,
 * river drainage paths, and coastal tide datums.
 */
export function getMumbaiElevation(lat: number, lng: number): {
  elevationM: number;
  zoneName: string;
  terrainType: string;
  floodVulnerability: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' | 'SAFE';
  distanceToMithiKm: number;
} {
  // Gaussian peak generator helper
  const peak = (pLat: number, pLng: number, peakM: number, radiusLat: number, radiusLng: number) => {
    const dLat = (lat - pLat) / radiusLat;
    const dLng = (lng - pLng) / radiusLng;
    const distSq = dLat * dLat + dLng * dLng;
    return peakM * Math.exp(-distSq / 2);
  };

  // Base elevation from Arabian Sea coast to eastern mainland
  let elev = 1.2;

  // SGNP Kanheri Central Massif (highest range)
  elev += peak(19.208, 72.908, 460, 0.045, 0.04);
  // Tulsi-Vihar Lake Ridges
  elev += peak(19.165, 72.915, 240, 0.035, 0.035);
  // Powai Ridge
  elev += peak(19.133, 72.913, 85, 0.025, 0.025);
  // Trombay Mountain Peak
  elev += peak(19.018, 72.912, 295, 0.025, 0.02);
  // Malabar Hill southern ridge
  elev += peak(18.955, 72.798, 54, 0.02, 0.015);
  // Worli Hill
  elev += peak(19.012, 72.815, 34, 0.015, 0.012);
  // Pali Hill Bandra
  elev += peak(19.066, 72.828, 32, 0.015, 0.012);
  // Antop Hill Wadala
  elev += peak(19.023, 72.868, 52, 0.012, 0.01);
  // Gilbert Hill Andheri (Basalt monolith)
  elev += peak(19.121, 72.838, 58, 0.008, 0.008);

  // Mithi River Channel Depression (carves a deep valley from Vihar to Mahim Bay)
  // Approximate Mithi river polyline: (19.14, 72.895) -> (19.08, 72.875) -> (19.068, 72.865) -> (19.043, 72.84)
  const mithiPoints = [
    [19.145, 72.898],
    [19.115, 72.885],
    [19.085, 72.875],
    [19.068, 72.865],
    [19.045, 72.842],
  ];

  let minMithiDist = Infinity;
  for (const pt of mithiPoints) {
    const dLat = (lat - pt[0]) * 111;
    const dLng = (lng - pt[1]) * 105;
    const d = Math.sqrt(dLat * dLat + dLng * dLng);
    if (d < minMithiDist) minMithiDist = d;
  }

  // Carve river channel depression if near Mithi
  if (minMithiDist < 2.5 && lat < 19.12) {
    const carve = Math.max(0, (2.5 - minMithiDist) * 1.8);
    elev = Math.max(1.1, elev - carve);
  }

  // Western sea edge damping
  if (lng < 72.81 && lat > 18.96 && lat < 19.15) {
    elev = Math.max(0.8, Math.min(elev, 8.5));
  }

  const roundedElev = Math.round(elev * 10) / 10;

  // Determine vulnerability and terrain classification
  let vulnerability: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' | 'SAFE' = 'SAFE';
  let terrainType = 'Elevated Basalt Ridge';
  let zoneName = 'Upland Bedrock';

  if (roundedElev <= 2.5) {
    vulnerability = 'CRITICAL';
    terrainType = 'Inter-Island Reclaimed Flood Bowl';
    zoneName = 'High-Risk Critical Inundation Zone';
  } else if (roundedElev <= 4.0) {
    vulnerability = 'HIGH';
    terrainType = 'Low-Lying Estuarine Alluvium';
    zoneName = 'Lowland Stormwater Ponding Plain';
  } else if (roundedElev <= 7.0) {
    vulnerability = 'MODERATE';
    terrainType = 'Urban Marine Plain';
    zoneName = 'Moderate Slope Intermediate Zone';
  } else if (roundedElev <= 20.0) {
    vulnerability = 'LOW';
    terrainType = 'Foothill Plateau';
    zoneName = 'Low Vulnerability Upland';
  } else {
    vulnerability = 'SAFE';
    terrainType = 'Natural Basalt Ridge / Peak';
    zoneName = 'Safe Elevation Topographic High Ground';
  }

  return {
    elevationM: roundedElev,
    zoneName,
    terrainType,
    floodVulnerability: vulnerability,
    distanceToMithiKm: Math.round(minMithiDist * 10) / 10,
  };
}

/**
 * Topographic Contour Lines across Mumbai (5m, 15m, 30m, 60m, 150m, 300m isolines).
 * Enables overlaying topographic elevation isolines directly onto map layers.
 */
export interface ContourIsoline {
  elevationM: number;
  color: string;
  weight: number;
  label: string;
  points: [number, number][];
}

export const MUMBAI_CONTOUR_ISOLINES: ContourIsoline[] = [
  // 5m Sea Inundation Critical Isoline around Mithi Basin / Kurla / Sion
  {
    elevationM: 5,
    color: '#06b6d4',
    weight: 2,
    label: '5m Flood Critical Contour',
    points: [
      [19.043, 72.840],
      [19.049, 72.848],
      [19.055, 72.859],
      [19.062, 72.871],
      [19.072, 72.880],
      [19.082, 72.878],
      [19.094, 72.872],
      [19.089, 72.860],
      [19.078, 72.852],
      [19.065, 72.845],
      [19.052, 72.838],
    ],
  },
  // 15m Foothills Contour
  {
    elevationM: 15,
    color: '#10b981',
    weight: 2,
    label: '15m Upland Margin',
    points: [
      [19.030, 72.870],
      [19.045, 72.882],
      [19.065, 72.890],
      [19.090, 72.895],
      [19.115, 72.900],
      [19.135, 72.892],
      [19.145, 72.875],
      [19.130, 72.860],
      [19.110, 72.850],
      [19.090, 72.845],
    ],
  },
  // 50m Powai / Malabar Ridge Contour
  {
    elevationM: 50,
    color: '#eab308',
    weight: 2.5,
    label: '50m Escarpment Contour',
    points: [
      [19.115, 72.905],
      [19.130, 72.920],
      [19.150, 72.925],
      [19.165, 72.915],
      [19.155, 72.898],
      [19.135, 72.895],
      [19.115, 72.905],
    ],
  },
  // 150m Salsette Mountain Core (SGNP)
  {
    elevationM: 150,
    color: '#f97316',
    weight: 2.5,
    label: '150m Montane Ridge',
    points: [
      [19.170, 72.905],
      [19.190, 72.925],
      [19.220, 72.930],
      [19.240, 72.915],
      [19.230, 72.895],
      [19.200, 72.890],
      [19.175, 72.895],
      [19.170, 72.905],
    ],
  },
  // 300m Kanheri Peak Apex
  {
    elevationM: 300,
    color: '#ef4444',
    weight: 3,
    label: '300m Kanheri Apex',
    points: [
      [19.195, 72.902],
      [19.215, 72.915],
      [19.225, 72.908],
      [19.215, 72.898],
      [19.195, 72.902],
    ],
  },
  // Trombay Hill 100m Contour
  {
    elevationM: 100,
    color: '#a855f7',
    weight: 2.5,
    label: '100m Trombay Hill',
    points: [
      [19.010, 72.905],
      [19.025, 72.918],
      [19.030, 72.912],
      [19.018, 72.902],
      [19.010, 72.905],
    ],
  },
];
