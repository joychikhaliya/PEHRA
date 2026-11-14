export interface DroneUnit {
  id: string;
  callsign: string;
  model: string;
  status: 'CONNECTED' | 'IN_FLIGHT' | 'CONNECTING' | 'STANDBY' | 'OFFLINE';
  batteryPercent: number;
  altitudeM: number;
  speedKmh: number;
  headingDeg: number;
  signalStrengthDbm: number; // e.g. -54 dBm
  lat: number;
  lng: number;
  locationName: string;
  targetSector: string;
  waterDepthMeasuredM: number;
  floodCoverageKm2: number;
  cameraMode: 'RGB_4K' | 'THERMAL_FLIR' | 'FLOOD_MASK' | 'NIGHT_VISION';
  zoomLevel: number;
  gimbalPitchDeg: number;
  pilotStation: string;
  streamUrl?: string;
  imageThumbnail: string;
  detectedHazards: {
    id: string;
    label: string;
    type: 'VICTIM' | 'VEHICLE' | 'INFRASTRUCTURE' | 'CURRENT';
    confidence: number;
    coords: { x: number; y: number; width: number; height: number }; // percentage on frame
    lat: number;
    lng: number;
    severity: 'CRITICAL' | 'HIGH' | 'MODERATE';
    actionText: string;
  }[];
}

export interface ReconSnapshot {
  id: string;
  droneId: string;
  callsign: string;
  timestamp: string;
  locationName: string;
  lat: number;
  lng: number;
  mode: string;
  waterDepthM: number;
  floodedAreaKm2: number;
  hazardsFound: number;
  imageUrl: string;
  notes: string;
}

export const DRONE_FLEET: DroneUnit[] = [
  {
    id: 'drone-alpha-01',
    callsign: 'GARUDA-ALPHA 01',
    model: 'Matrice 350 RTK (High-Capacity Weatherproof Flood Recon)',
    status: 'CONNECTED',
    batteryPercent: 88,
    altitudeM: 85,
    speedKmh: 18.4,
    headingDeg: 245,
    signalStrengthDbm: -52,
    lat: 19.0688,
    lng: 72.8795,
    locationName: 'Kurla West — Mithi River Confluence',
    targetSector: 'L Ward / Kranti Nagar Basin',
    waterDepthMeasuredM: 1.45,
    floodCoverageKm2: 0.62,
    cameraMode: 'FLOOD_MASK',
    zoomLevel: 2.5,
    gimbalPitchDeg: -60,
    pilotStation: 'NDRF Base Kurla Tactical Tent #2',
    imageThumbnail: 'aerial_flood_kurla',
    detectedHazards: [
      {
        id: 'hz-1',
        label: '3 Stranded Citizens on Reinforced Concrete Roof',
        type: 'VICTIM',
        confidence: 0.94,
        coords: { x: 38, y: 32, width: 24, height: 26 },
        lat: 19.0694,
        lng: 72.8799,
        severity: 'CRITICAL',
        actionText: 'Dispatch Zodiac Rescue Boat Alpha-3',
      },
      {
        id: 'hz-2',
        label: 'Submerged Light Commercial Vehicle (Depth 1.3m)',
        type: 'VEHICLE',
        confidence: 0.91,
        coords: { x: 68, y: 58, width: 22, height: 24 },
        lat: 19.0679,
        lng: 72.8805,
        severity: 'HIGH',
        actionText: 'Notify Traffic Police & Mark Road Submerged',
      },
    ],
  },
  {
    id: 'drone-bravo-02',
    callsign: 'GARUDA-BRAVO 02',
    model: 'Skydio X2D Autonomous Multi-Spectral Recon',
    status: 'CONNECTED',
    batteryPercent: 74,
    altitudeM: 45,
    speedKmh: 12.1,
    headingDeg: 180,
    signalStrengthDbm: -58,
    lat: 19.0912,
    lng: 72.8488,
    locationName: 'Milan Subway Underpass & WEH Link',
    targetSector: 'K-East & H-East Wards',
    waterDepthMeasuredM: 2.1,
    floodCoverageKm2: 0.28,
    cameraMode: 'RGB_4K',
    zoomLevel: 1.8,
    gimbalPitchDeg: -75,
    pilotStation: 'Mumbai Fire Brigade Santacruz Station',
    imageThumbnail: 'aerial_flood_milan_subway',
    detectedHazards: [
      {
        id: 'hz-3',
        label: 'Subway Fully Inundated (2.1m Depth) - Pumps Overwhelmed',
        type: 'INFRASTRUCTURE',
        confidence: 0.97,
        coords: { x: 42, y: 44, width: 32, height: 28 },
        lat: 19.0914,
        lng: 72.8491,
        severity: 'CRITICAL',
        actionText: 'Activate Mobile High-Discharge Sump Dewatering Unit #4',
      },
    ],
  },
  {
    id: 'drone-charlie-03',
    callsign: 'GARUDA-CHARLIE 03',
    model: 'DJI Inspire 3 (Thermal Long-Wave Infrared)',
    status: 'IN_FLIGHT',
    batteryPercent: 62,
    altitudeM: 110,
    speedKmh: 24.6,
    headingDeg: 310,
    signalStrengthDbm: -63,
    lat: 19.0435,
    lng: 72.8567,
    locationName: 'Dharavi 90ft Road & Mahim Creek Mangrove Edge',
    targetSector: 'G-North Ward Lowland',
    waterDepthMeasuredM: 0.85,
    floodCoverageKm2: 0.84,
    cameraMode: 'THERMAL_FLIR',
    zoomLevel: 1.0,
    gimbalPitchDeg: -45,
    pilotStation: 'MCGM Emergency Ops Mobile Van Dharavi',
    imageThumbnail: 'aerial_flood_dharavi',
    detectedHazards: [
      {
        id: 'hz-4',
        label: 'High Tide Tidal Ingress Backflowing into Drainage Channel',
        type: 'CURRENT',
        confidence: 0.89,
        coords: { x: 25, y: 50, width: 40, height: 30 },
        lat: 19.0441,
        lng: 72.8572,
        severity: 'HIGH',
        actionText: 'Request Cleave Bunder Sluice Flap Valve Inspection',
      },
    ],
  },
  {
    id: 'drone-delta-04',
    callsign: 'GARUDA-DELTA 04',
    model: 'Microdrones md4-1000 LiDAR & Photogrammetry',
    status: 'STANDBY',
    batteryPercent: 98,
    altitudeM: 0,
    speedKmh: 0,
    headingDeg: 0,
    signalStrengthDbm: -41,
    lat: 19.0398,
    lng: 72.8622,
    locationName: 'Sion Railway Culvert & Gandhi Market (On Pad)',
    targetSector: 'F-North Ward',
    waterDepthMeasuredM: 0.65,
    floodCoverageKm2: 0.35,
    cameraMode: 'RGB_4K',
    zoomLevel: 1.0,
    gimbalPitchDeg: 0,
    pilotStation: 'Central Railway Disaster Control Matunga',
    imageThumbnail: 'aerial_flood_sion',
    detectedHazards: [],
  },
];

export const INITIAL_SNAPSHOTS: ReconSnapshot[] = [
  {
    id: 'snap-001',
    droneId: 'drone-alpha-01',
    callsign: 'GARUDA-ALPHA 01',
    timestamp: '10:48 AM IST',
    locationName: 'Mithi River S-Bend at Kranti Nagar',
    lat: 19.0691,
    lng: 72.8797,
    mode: 'FLOOD_MASK',
    waterDepthM: 1.45,
    floodedAreaKm2: 0.62,
    hazardsFound: 2,
    imageUrl: 'aerial_kurla_inundation',
    notes: 'Severe sheet flow across informal settlement access roads. Water within 25cm of residential plinths.',
  },
  {
    id: 'snap-002',
    droneId: 'drone-bravo-02',
    callsign: 'GARUDA-BRAVO 02',
    timestamp: '10:42 AM IST',
    locationName: 'Milan Subway Western Express Entrance',
    lat: 19.0913,
    lng: 72.8489,
    mode: 'RGB_4K',
    waterDepthM: 2.1,
    floodedAreaKm2: 0.28,
    hazardsFound: 1,
    imageUrl: 'aerial_milan_subway_full',
    notes: 'Subway road barricaded by traffic wardens. 2 sump pumps active but discharge outlet backlogged.',
  },
  {
    id: 'snap-003',
    droneId: 'drone-charlie-03',
    callsign: 'GARUDA-CHARLIE 03',
    timestamp: '10:35 AM IST',
    locationName: 'Dharavi Kala Qila Creek Nullah',
    lat: 19.0438,
    lng: 72.8569,
    mode: 'THERMAL_FLIR',
    waterDepthM: 0.85,
    floodedAreaKm2: 0.84,
    hazardsFound: 1,
    imageUrl: 'aerial_dharavi_thermal',
    notes: 'Thermal camera distinguishes 22°C sea tidal surge from 28°C urban runoff. Tidal backflow slowing drainage.',
  },
];
