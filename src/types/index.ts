export type UserRole = 'CITIZEN' | 'RESPONDER' | 'AUTHORITY' | 'ADMIN' | 'SUPER_ADMIN';

export type RiskLevel = 'SAFE' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type AlertStage = 'WATCH' | 'WARNING' | 'CONFIRMED';

export type AlertStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export type IncidentStatus = 'MONITORING' | 'ACTIVE' | 'ESCALATED' | 'CONTAINED' | 'RESOLVED' | 'ARCHIVED';

export type SourceHealthStatus = 'HEALTHY' | 'DEGRADED' | 'STALE' | 'FAILED';

export type ReportStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';

export type ShelterStatus = 'OPEN' | 'LIMITED' | 'FULL' | 'CLOSED';

export type HospitalStatus = 'OPEN' | 'LIMITED' | 'OVERLOADED' | 'CLOSED';

export type ModelStatus = 'TRAINING' | 'VALIDATING' | 'VALIDATED' | 'ACTIVE' | 'DEPRECATED' | 'FAILED';

export interface User {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  role: UserRole;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  homeLocation?: {
    lat: number;
    lng: number;
    address: string;
    villageId?: string;
  };
  mfaEnabled: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface Village {
  id: string;
  name: string;
  ward: string;
  population: number;
  areaKm2: number;
  elevationM: number;
  center: { lat: number; lng: number };
  polygon: [number, number][]; // coordinates [lat, lng]
  riskLevel: RiskLevel;
  waterLevelM: number;
  drainageCapacityMmHr: number;
  vulnerabilityScore: number; // 0 to 1
  exposurePopulation: number;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'mumbai_flood' | 'weather' | 'water_level' | 'satellite' | 'tide' | 'crowd';
  status: SourceHealthStatus;
  endpointUrl: string;
  lastUpdate: string;
  freshnessSeconds: number;
  updateFrequencySec: number;
  qualityScore: number;
  isSimulation: boolean;
  enabled: boolean;
  lastSuccessfulFetch?: string;
  errorMessage?: string;
}

export interface Observation {
  id: string;
  sourceId: string;
  sourceType: 'rainfall' | 'water_level' | 'nowcast' | 'flood_model' | 'reported_flood' | 'tide';
  location: { lat: number; lng: number; name?: string };
  value: number;
  unit: string;
  observedAt: string;
  fetchedAt: string;
  quality: 'GOOD' | 'FAIR' | 'STALE' | 'SUSPECT';
  freshnessSeconds: number;
  rawReference?: string;
}

export interface WaterLevelHistoryPoint {
  time: string;
  level: number;
  tideLevel?: number;
}

export interface WaterLevelStation {
  id: string;
  name: string;
  waterway: string;
  ward: string;
  lat: number;
  lng: number;
  elevationM: number;
  currentLevelM: number;
  previousLevelM: number;
  warningLevelM: number;
  dangerLevelM: number;
  highestFloodLevelM: number;
  rateOfRiseMPerHr: number;
  trend: 'RISING' | 'STABLE' | 'FALLING';
  status: 'NORMAL' | 'WARNING' | 'DANGER' | 'CRITICAL';
  dischargeM3s?: number;
  flowVelocityMs?: number;
  quality: 'GOOD' | 'FAIR' | 'STALE' | 'SUSPECT';
  lastUpdated: string;
  freshnessSeconds: number;
  history: WaterLevelHistoryPoint[];
  sourceUrl: string;
  sensorModel: string;
}

export interface WaterLevelSystemResponse {
  activeUrl: string;
  presetName?: string;
  status: 'CONNECTED' | 'DEGRADED' | 'FALLBACK_SIMULATION' | 'CONNECTING' | 'ERROR';
  latencyMs: number;
  lastFetchedAt: string;
  autoRefresh: boolean;
  pollingCadenceSec: number;
  totalStations: number;
  stationsInDanger: number;
  stationsInWarning: number;
  averageLevelM: number;
  maxLevelM: number;
  stations: WaterLevelStation[];
  diagnostics: {
    protocol: string;
    httpStatus: number;
    rawPayloadType: string;
    isFallback: boolean;
    message: string;
  };
}

export interface PredictionModelA {
  basinId: string;
  villageId: string;
  floodProbability: number; // 0.00 - 1.00
  timeToImpactHours: number;
  confidence: number;
  modelVersion: string;
  algorithm: 'RuleBasedModel' | 'GradientBoostingModel' | 'XGBoostBaseline';
  contributingFeatures: {
    rainfallRateMmHr: number;
    cumulative3HrMm: number;
    riverLevelM: number;
    tideLevelM: number;
    soilSaturation: number;
    drainageStressPct: number;
  };
  explanation: string[];
}

export interface FloodSpreadEvent {
  id: string;
  incidentId: string;
  cellId: string;
  cellName: string;
  etaHours: number;
  depthM: number;
  confidence: number;
  source: 'PREDICTED' | 'OBSERVED' | 'CONFIRMED_REPORT' | 'SENSOR' | 'AUTHORITY';
  polygon: [number, number][];
  timestamp: string;
}

export interface RiskAssessment {
  id: string;
  villageId: string;
  hazardScore: number; // 0-1
  exposureScore: number; // 0-1
  vulnerabilityScore: number; // 0-1
  confidenceAdjustment: number; // 0-1
  compositeRisk: number; // 0-1
  riskLevel: RiskLevel;
  modelVersion: string;
  calculatedAt: string;
}

export interface Incident {
  id: string;
  title: string;
  incidentType: 'FLOOD' | 'FLASH_FLOOD' | 'RIVER_BREACH' | 'URBAN_WATERLOGGING' | 'TIDAL_SURGE';
  status: IncidentStatus;
  originLocation: { lat: number; lng: number; villageId: string; name: string };
  originTimestamp: string;
  severity: RiskLevel;
  confidence: number;
  startedAt: string;
  endedAt?: string;
  estimatedAffectedPeople: number;
  spreadEvents: FloodSpreadEvent[];
  assignedTeams: string[];
  timeline: {
    id: string;
    timestamp: string;
    title: string;
    description: string;
    source: string;
    type: 'ALERT' | 'SENSOR' | 'DISPATCH' | 'REPORT' | 'CONTAINMENT';
  }[];
}

export interface Alert {
  id: string;
  incidentId?: string;
  stage: AlertStage;
  status: AlertStatus;
  title: string;
  message: string;
  riskLevel: RiskLevel;
  confidence: number;
  villageId: string;
  villageName: string;
  floodZoneGeojson?: any;
  evacuationRouteId?: string;
  shelterId?: string;
  etaHours: number;
  issuedAt: string;
  expiresAt: string;
  approvedBy?: string;
  approvedAt?: string;
  modelVersion: string;
  checklist: string[];
  evidence: {
    rainfallMm: number;
    waterLevelM: number;
    tideLevelM: number;
    modelPredictionProb: number;
    verifiedReportsCount: number;
  };
  deliveryStats: {
    pushDelivered: number;
    smsDelivered: number;
    offlineRelayed: number;
    acknowledgedCount: number;
  };
}

export interface EvacuationRoute {
  id: string;
  name: string;
  villageId: string;
  destinationShelterId: string;
  status: 'CLEAR' | 'CAUTION' | 'FLOODED' | 'CLOSED';
  distanceKm: number;
  estimatedTravelMinutes: number;
  riskScore: number; // 0 to 1
  waypoints: [number, number][]; // [lat, lng]
  alternativeRouteWaypoints?: [number, number][];
  floodArrivalTimeHours?: number;
  safetyCheckPassed: boolean;
}

export interface Shelter {
  id: string;
  name: string;
  location: { lat: number; lng: number; address: string };
  capacity: number;
  occupancy: number;
  status: ShelterStatus;
  contactPhone: string;
  contactPerson: string;
  facilities: string[];
  accessibility: boolean;
  medicalSupport: boolean;
  emergencySupplies: {
    foodPacks: number;
    waterLiters: number;
    firstAidKits: number;
    blankets: number;
  };
}

export interface Hospital {
  id: string;
  name: string;
  location: { lat: number; lng: number; address: string };
  emergencyCapacity: number;
  availableBeds: number;
  ambulanceAvailable: number;
  status: HospitalStatus;
  contactPhone: string;
  bloodBank: boolean;
  traumaCenter: boolean;
}

export interface FloodReport {
  id: string;
  reporterUserId?: string;
  reporterName: string;
  reporterPhone?: string;
  location: { lat: number; lng: number; address: string; villageId?: string };
  waterDepthM: number;
  depthCategory: 'ANKLE' | 'KNEE' | 'WAIST' | 'OVERHEAD';
  description: string;
  timestamp: string;
  photoUrl?: string;
  status: ReportStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  impactScore?: number;
}

export interface DeviceTelemetry {
  deviceId: string;
  userId?: string;
  lat: number;
  lng: number;
  batteryPct: number;
  batteryStatus: 'GREEN' | 'YELLOW' | 'RED' | 'OFFLINE';
  timestamp: string;
  isAlertScoped: boolean;
  consentGranted: boolean;
  relayHopCount: number;
}

export interface ModelVersion {
  id: string;
  name: string;
  version: string;
  type: 'MODEL_A_CONDITIONS' | 'MODEL_B_SPREAD';
  algorithm: string;
  status: ModelStatus;
  metrics: {
    precision: number;
    recall: number;
    f1Score: number;
    iou?: number;
    arrivalLeadTimeHours?: number;
  };
  createdAt: string;
  activatedAt?: string;
  createdBy: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  resource: string;
  resourceId: string;
  timestamp: string;
  ipAddress?: string;
  beforeState?: any;
  afterState?: any;
  reason: string;
}

export interface SystemThresholds {
  watchRiskThreshold: number; // e.g. 0.45
  warningRiskThreshold: number; // e.g. 0.70
  confirmedApprovalRequired: boolean; // true
  confidenceMinThreshold: number; // e.g. 0.60
  alertCooldownMinutes: number; // e.g. 30
  alertHysteresisPct: number; // e.g. 10%
  alertExpiryHours: number; // e.g. 6
  smsFallbackEnabled: boolean;
  pushEnabled: boolean;
  offlineRelayTtlHops: number; // e.g. 3
}

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  rainfallMmHr: number;
  durationHours: number;
  tideHeightM: number;
  riverDischargeM3s: number;
  windSpeedKmh: number;
  startingVillageId: string;
}
