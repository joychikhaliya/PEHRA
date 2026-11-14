export interface FloodSafeLocation {
  id: string;
  name: string;
  area: string;
  ward: string;
  riskLevel: 'SAFE' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  waterLevelM: number;
  waterLevelStatus: 'NORMAL' | 'WARNING' | 'DANGER';
  rainfallMmHr: number;
  riverLevelM: number;
  riverDangerMarkM: number;
  elevationM: number;
  lastUpdated: string;
  isUserLocation?: boolean;
}

export interface ShelterData {
  id: string;
  name: string;
  address: string;
  ward: string;
  distanceKm: number;
  distanceMeters: number;
  walkTimeMin: number;
  totalCapacity: number;
  occupiedCapacity: number;
  availableCapacity: number;
  status: 'OPEN' | 'LIMITED' | 'FULL' | 'CLOSED';
  elevationM: number;
  amenities: string[];
  contactPhone: string;
  lat: number;
  lng: number;
}

export interface FloodAlertItem {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'WARNING' | 'WATCH' | 'INFO';
  locationName: string;
  timeAgo: string;
  timestamp: string;
  description: string;
  recommendedAction: string;
  isRead: boolean;
  affectedWards: string[];
  safeDirection: string;
}

export interface RoadSegment {
  id: string;
  name: string;
  status: 'SAFE' | 'WATERLOGGED' | 'SUBMERGED' | 'CLOSED';
  waterDepthCm: number;
  conditionNote: string;
}

export interface RouteOption {
  id: string;
  name: string;
  type: 'RECOMMENDED_HIGH_GROUND' | 'SHORTEST_CAUTION';
  targetShelterName: string;
  targetShelterId: string;
  distanceKm: number;
  walkTimeMin: number;
  elevationGainM: number;
  safetyScore: number; // 0-100
  roads: RoadSegment[];
  turns: {
    instruction: string;
    distanceM: number;
    hazardWarning?: string;
    elevation: number;
  }[];
}

export interface HourlyWeatherForecast {
  time: string;
  tempC: number;
  rainfallMm: number;
  rainProbabilityPct: number;
  windKmH: number;
  waterLevelM: number;
  floodRiskPct: number;
  condition: string;
}

export interface EmergencyGuideSection {
  id: string;
  title: string;
  category: 'BEFORE' | 'DURING' | 'AFTER';
  icon: string;
  items: string[];
  dos: string[];
  donts: string[];
}

export interface NotificationItem {
  id: string;
  type: 'ALERT' | 'EVACUATION' | 'WEATHER' | 'SHELTER';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export const FLOODSAFE_LOCATIONS: FloodSafeLocation[] = [
  {
    id: 'loc-kurla',
    name: 'Kurla West (Mithi River Basin)',
    area: 'L Ward • Central Mumbai',
    ward: 'L Ward',
    riskLevel: 'MODERATE',
    waterLevelM: 0.38,
    waterLevelStatus: 'WARNING',
    rainfallMmHr: 38.5,
    riverLevelM: 2.85,
    riverDangerMarkM: 3.50,
    elevationM: 3.2,
    lastUpdated: '2 mins ago',
    isUserLocation: true,
  },
  {
    id: 'loc-sion',
    name: 'Sion Gandhi Market & Nullah',
    area: 'F-North Ward • Sion',
    ward: 'F-North Ward',
    riskLevel: 'HIGH',
    waterLevelM: 0.65,
    waterLevelStatus: 'DANGER',
    rainfallMmHr: 52.0,
    riverLevelM: 3.20,
    riverDangerMarkM: 3.50,
    elevationM: 2.4,
    lastUpdated: 'Just now',
  },
  {
    id: 'loc-milan',
    name: 'Milan Subway & S.V. Road',
    area: 'K-West Ward • Santacruz',
    ward: 'K-West Ward',
    riskLevel: 'CRITICAL',
    waterLevelM: 1.15,
    waterLevelStatus: 'DANGER',
    rainfallMmHr: 64.0,
    riverLevelM: 3.45,
    riverDangerMarkM: 3.50,
    elevationM: 1.8,
    lastUpdated: '1 min ago',
  },
  {
    id: 'loc-bkc',
    name: 'BKC Financial Complex',
    area: 'H-East Ward • Bandra East',
    ward: 'H-East Ward',
    riskLevel: 'LOW',
    waterLevelM: 0.12,
    waterLevelStatus: 'NORMAL',
    rainfallMmHr: 18.0,
    riverLevelM: 2.10,
    riverDangerMarkM: 3.50,
    elevationM: 7.5,
    lastUpdated: '5 mins ago',
  },
  {
    id: 'loc-dadar',
    name: 'Dadar TT Circle & Hindmata',
    area: 'F-South Ward • Dadar East',
    ward: 'F-South Ward',
    riskLevel: 'HIGH',
    waterLevelM: 0.58,
    waterLevelStatus: 'DANGER',
    rainfallMmHr: 46.0,
    riverLevelM: 2.95,
    riverDangerMarkM: 3.50,
    elevationM: 2.8,
    lastUpdated: '3 mins ago',
  },
  {
    id: 'loc-andheri',
    name: 'Andheri Subway',
    area: 'K-East Ward • Andheri',
    ward: 'K-East Ward',
    riskLevel: 'CRITICAL',
    waterLevelM: 1.30,
    waterLevelStatus: 'DANGER',
    rainfallMmHr: 68.0,
    riverLevelM: 3.60,
    riverDangerMarkM: 3.50,
    elevationM: 1.5,
    lastUpdated: '1 min ago',
  },
];

export const SHELTERS_DATA: ShelterData[] = [
  {
    id: 'sh-01',
    name: 'Kurla Municipal High School',
    address: 'Near Belgrami Road, Kurla West',
    ward: 'L Ward',
    distanceKm: 0.45,
    distanceMeters: 450,
    walkTimeMin: 7,
    totalCapacity: 450,
    occupiedCapacity: 170,
    availableCapacity: 280,
    status: 'OPEN',
    elevationM: 8.5,
    amenities: ['Emergency Meals', 'First Aid Station', 'Backup Generator', 'Drinking Water', 'Safe Dry Floor'],
    contactPhone: '+91 22 2650 4912',
    lat: 19.0712,
    lng: 72.8814,
  },
  {
    id: 'sh-02',
    name: 'BKC Elevated Community Hall',
    address: 'Block G, Near MTNL Building, BKC',
    ward: 'H-East Ward',
    distanceKm: 1.1,
    distanceMeters: 1100,
    walkTimeMin: 15,
    totalCapacity: 800,
    occupiedCapacity: 290,
    availableCapacity: 510,
    status: 'OPEN',
    elevationM: 11.2,
    amenities: ['Doctor on Site', 'Hot Meals', 'Device Charging', 'Clean Restrooms', 'Baby Care Facility'],
    contactPhone: '+91 22 2659 8800',
    lat: 19.0645,
    lng: 72.8682,
  },
  {
    id: 'sh-03',
    name: 'Sion Hill Community Center',
    address: 'Sion Fort Ridge Road, Sion West',
    ward: 'F-North Ward',
    distanceKm: 1.8,
    distanceMeters: 1800,
    walkTimeMin: 24,
    totalCapacity: 350,
    occupiedCapacity: 310,
    availableCapacity: 40,
    status: 'LIMITED',
    elevationM: 19.4,
    amenities: ['High-Ground Shelter', 'Dry Rations', 'Paramedic Unit', 'Helipad Access'],
    contactPhone: '+91 22 2407 1916',
    lat: 19.0435,
    lng: 72.8624,
  },
  {
    id: 'sh-04',
    name: 'Bandra Reclamation Relief Depot',
    address: 'KC Marg, Bandra West',
    ward: 'H-West Ward',
    distanceKm: 3.4,
    distanceMeters: 3400,
    walkTimeMin: 45,
    totalCapacity: 600,
    occupiedCapacity: 150,
    availableCapacity: 450,
    status: 'OPEN',
    elevationM: 9.8,
    amenities: ['Full Kitchen', 'NDRF Coordination Desk', 'Ambulance On Standby', 'Satellite Wifi'],
    contactPhone: '+91 22 2642 3311',
    lat: 19.0512,
    lng: 72.8345,
  },
  {
    id: 'sh-05',
    name: 'Chunabhatti Municipal School',
    address: 'Swadeshi Mills Compound, Chunabhatti',
    ward: 'L Ward',
    distanceKm: 2.1,
    distanceMeters: 2100,
    walkTimeMin: 28,
    totalCapacity: 300,
    occupiedCapacity: 300,
    availableCapacity: 0,
    status: 'FULL',
    elevationM: 6.2,
    amenities: ['Drinking Water', 'Shelter Beds'],
    contactPhone: '+91 22 2405 6672',
    lat: 19.0552,
    lng: 72.8765,
  },
];

export const FLOOD_ALERTS: FloodAlertItem[] = [
  {
    id: 'alt-01',
    title: 'High Tide & River Backflow Alert',
    severity: 'WARNING',
    locationName: 'Kurla West, Kalina & LBS Marg',
    timeAgo: '12m ago',
    timestamp: '14:32 PM',
    description: 'Arabian Sea high tide (4.45m) peaking at 15:15 PM will cause tidal lock in Mithi River, causing backwater flooding in low-lying sections of LBS Marg and Kranti Nagar.',
    recommendedAction: 'Move ground-floor items to first floor. Do not park vehicles in underground basements or near nullah edges.',
    isRead: false,
    affectedWards: ['L Ward', 'H-East Ward'],
    safeDirection: 'Evacuate north-east toward CST Road or Kurla High School.',
  },
  {
    id: 'alt-02',
    title: 'Subway Submersion & Complete Closure',
    severity: 'CRITICAL',
    locationName: 'Milan Subway & Andheri Subway',
    timeAgo: '28m ago',
    timestamp: '14:16 PM',
    description: 'Water depth has reached 1.15m inside Milan Subway and 1.30m in Andheri Subway. Automatic barricades deployed. Traffic diverted to SV Road flyover.',
    recommendedAction: 'Avoid subways under all circumstances. Use Western Express Highway elevated flyovers only.',
    isRead: false,
    affectedWards: ['K-West Ward', 'K-East Ward'],
    safeDirection: 'Use elevated flyovers only. Stay on main arterial bridges.',
  },
  {
    id: 'alt-03',
    title: 'Rainfall Nowcast: Heavy Band Approaching',
    severity: 'WATCH',
    locationName: 'Greater Mumbai Coastal & Eastern Suburbs',
    timeAgo: '45m ago',
    timestamp: '13:59 PM',
    description: 'Doppler Weather Radar indicates intense convective cloud cluster moving eastward with projected rain intensity of 45-60 mm/hr over the next 90 minutes.',
    recommendedAction: 'Stay indoors if in a safe masonry building. Keep emergency lamps and power banks charged.',
    isRead: true,
    affectedWards: ['All MMR Suburbs'],
    safeDirection: 'Remain sheltered above ground level.',
  },
  {
    id: 'alt-04',
    title: 'Sion Gandhi Market Waterlogging Active',
    severity: 'WARNING',
    locationName: 'Sion Gandhi Market & Flank Road',
    timeAgo: '1h 10m ago',
    timestamp: '13:34 PM',
    description: 'Water level reached 0.65m. Municipal de-watering pumps operating at 100% capacity. Best buses diverted via Ambedkar Road.',
    recommendedAction: 'Pedestrians advised not to wade across road due to submerged open storm drains.',
    isRead: true,
    affectedWards: ['F-North Ward'],
    safeDirection: 'Take Ambedkar Road or Sion Flyover elevated ramp.',
  },
];

export const SAFE_ROUTES: RouteOption[] = [
  {
    id: 'rt-01',
    name: 'Elevated High-Ground Route (Safest)',
    type: 'RECOMMENDED_HIGH_GROUND',
    targetShelterName: 'Kurla Municipal High School',
    targetShelterId: 'sh-01',
    distanceKm: 0.55,
    walkTimeMin: 8,
    elevationGainM: 5.3,
    safetyScore: 94,
    roads: [
      { id: 'rd-1', name: 'Belgrami Link Road', status: 'SAFE', waterDepthCm: 5, conditionNote: 'Dry elevated walkway' },
      { id: 'rd-2', name: 'Municipal School Elevated Approach', status: 'SAFE', waterDepthCm: 0, conditionNote: 'Concrete ramp, zero waterlogging' },
    ],
    turns: [
      { instruction: 'Head East on Belgrami Link Road toward Market Junction', distanceM: 180, elevation: 3.5 },
      { instruction: 'Turn left onto Elevated Municipal School Approach ramp', distanceM: 220, elevation: 6.8 },
      { instruction: 'Arrive at Kurla Municipal High School Main Gate (Check-in desk on 1st floor)', distanceM: 150, elevation: 8.5 },
    ],
  },
  {
    id: 'rt-02',
    name: 'Direct Low-Level Path (Caution: Shallow Water)',
    type: 'SHORTEST_CAUTION',
    targetShelterName: 'Kurla Municipal High School',
    targetShelterId: 'sh-01',
    distanceKm: 0.42,
    walkTimeMin: 7,
    elevationGainM: 2.1,
    safetyScore: 68,
    roads: [
      { id: 'rd-3', name: 'Kranti Nagar Lane 2', status: 'WATERLOGGED', waterDepthCm: 22, conditionNote: 'Ankle-to-calf water near corner drain' },
      { id: 'rd-4', name: 'School Back Gate', status: 'SAFE', waterDepthCm: 8, conditionNote: 'Passable on foot' },
    ],
    turns: [
      { instruction: 'Head Northeast on Kranti Nagar Lane', distanceM: 140, hazardWarning: 'Avoid open gutter on left side (marked with warning flags)', elevation: 2.8 },
      { instruction: 'Wade carefully across 20m shallow water patch', distanceM: 120, hazardWarning: 'Water depth approx 20cm', elevation: 3.1 },
      { instruction: 'Ascend steps to School Back Gate', distanceM: 160, elevation: 7.2 },
    ],
  },
];

export const HOURLY_WEATHER_DATA: HourlyWeatherForecast[] = [
  { time: '14:00', tempC: 28, rainfallMm: 38.5, rainProbabilityPct: 95, windKmH: 26, waterLevelM: 0.38, floodRiskPct: 62, condition: 'Heavy Rain' },
  { time: '15:00', tempC: 27, rainfallMm: 52.0, rainProbabilityPct: 98, windKmH: 34, waterLevelM: 0.58, floodRiskPct: 78, condition: 'Cloudburst Peak & High Tide' },
  { time: '16:00', tempC: 27, rainfallMm: 44.0, rainProbabilityPct: 90, windKmH: 30, waterLevelM: 0.52, floodRiskPct: 72, condition: 'Heavy Downpour' },
  { time: '17:00', tempC: 28, rainfallMm: 28.0, rainProbabilityPct: 80, windKmH: 22, waterLevelM: 0.40, floodRiskPct: 55, condition: 'Moderate Rain' },
  { time: '18:00', tempC: 28, rainfallMm: 16.5, rainProbabilityPct: 65, windKmH: 18, waterLevelM: 0.32, floodRiskPct: 40, condition: 'Intermittent Showers' },
  { time: '19:00', tempC: 27, rainfallMm: 10.0, rainProbabilityPct: 50, windKmH: 15, waterLevelM: 0.25, floodRiskPct: 28, condition: 'Light Rain' },
  { time: '20:00', tempC: 27, rainfallMm: 8.5, rainProbabilityPct: 40, windKmH: 14, waterLevelM: 0.20, floodRiskPct: 20, condition: 'Scattered Drizzle' },
  { time: '21:00', tempC: 26, rainfallMm: 6.0, rainProbabilityPct: 35, windKmH: 12, waterLevelM: 0.18, floodRiskPct: 15, condition: 'Cloudy' },
];

export const GO_BAG_ITEMS = [
  { id: 'gb-1', text: 'Important documents in waterproof pouch (Aadhaar, IDs, Insurance)', checked: true, category: 'Documents' },
  { id: 'gb-2', text: 'Prescription medications (min 7-day supply) & basic first aid', checked: true, category: 'Medical' },
  { id: 'gb-3', text: 'Fully charged power bank, phone charging cables & waterproof bag', checked: true, category: 'Electronics' },
  { id: 'gb-4', text: 'Flashlight / emergency torch with spare batteries', checked: true, category: 'Tools' },
  { id: 'gb-5', text: 'Bottled drinking water (2L per person) & energy bars / dry snacks', checked: false, category: 'Food & Water' },
  { id: 'gb-6', text: 'Whistle to signal emergency rescue responders', checked: false, category: 'Safety' },
  { id: 'gb-7', text: 'Spare dry clothing, light raincoat & sturdy waterproof shoes', checked: false, category: 'Clothing' },
  { id: 'gb-8', text: 'Cash in small currency notes (ATMs and card machines may fail)', checked: false, category: 'Cash' },
];

export const EMERGENCY_HELPLINES = [
  { name: 'National Emergency Response', number: '112', description: 'Police, Fire, Disaster Rescue', highlight: true },
  { name: 'MCGM Disaster Management Cell', number: '1916', description: 'Greater Mumbai Control Room & Waterlogging', highlight: true },
  { name: 'Ambulance / Emergency Medical', number: '108', description: 'Government Free Emergency Ambulance', highlight: false },
  { name: 'Mumbai Traffic Police Helpline', number: '103', description: 'Live Road Closures & Diversions', highlight: false },
  { name: 'NDRF Control Room (Maharashtra)', number: '022-22027990', description: 'National Disaster Response Force Dispatch', highlight: false },
  { name: 'Mithi River Early-Warning Desk', number: '022-26504900', description: 'Hydrology Monitoring Station', highlight: false },
];

export const NOTIFICATIONS_DATA: NotificationItem[] = [
  {
    id: 'nt-01',
    type: 'ALERT',
    title: 'High Tide Warning for 15:15 PM',
    message: 'Arabian Sea high tide of 4.45m approaching. Mithi River gates are monitored. Stay clear of riverbanks.',
    time: '8m ago',
    isRead: false,
    priority: 'HIGH',
  },
  {
    id: 'nt-02',
    type: 'EVACUATION',
    title: 'Kurla High School Shelter has 280 beds available',
    message: 'Food and medical support ready at Kurla Municipal High School. 7 min walk via Belgrami Link Road.',
    time: '24m ago',
    isRead: false,
    priority: 'MEDIUM',
  },
  {
    id: 'nt-03',
    type: 'WEATHER',
    title: 'Intense rain band detected over Suburbs',
    message: 'Rainfall expected to increase to 50 mm/hr. Ground water depth rising by ~4 cm per 15 minutes.',
    time: '42m ago',
    isRead: true,
    priority: 'MEDIUM',
  },
  {
    id: 'nt-04',
    type: 'SHELTER',
    title: 'BKC Community Hall opened for residents',
    message: 'New high-ground relief center opened in G-Block BKC with standby medical team.',
    time: '1h 15m ago',
    isRead: true,
    priority: 'LOW',
  },
];
