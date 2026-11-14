import {
  Village,
  Incident,
  Alert,
  Shelter,
  Hospital,
  EvacuationRoute,
  FloodReport,
  DeviceTelemetry,
  DataSource,
  ModelVersion,
  AuditLog,
  SystemThresholds,
  User,
  Observation,
  WaterLevelStation,
  WaterLevelSystemResponse,
} from '../types/index.ts';

const BASE_URL = '/api/v1';

export const api = {
  // System Health
  getHealth: async () => {
    const res = await fetch(`${BASE_URL}/health/detailed`);
    return res.json();
  },

  // Auth
  login: async (role?: string) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    return res.json();
  },

  getCurrentUser: async (role: string = 'AUTHORITY') => {
    const res = await fetch(`${BASE_URL}/auth/me?role=${role}`);
    return res.json();
  },

  // Dashboard
  getDashboardSummary: async () => {
    const res = await fetch(`${BASE_URL}/dashboard/summary`);
    return res.json();
  },

  // Risk Map
  getRiskMapData: async () => {
    const res = await fetch(`${BASE_URL}/risk/map`);
    return res.json();
  },

  getVillageDetails: async (id: string) => {
    const res = await fetch(`${BASE_URL}/risk/villages/${id}`);
    return res.json();
  },

  // Environmental observations
  getRainfall: async () => {
    const res = await fetch(`${BASE_URL}/rainfall`);
    return res.json();
  },

  getWaterLevels: async () => {
    const res = await fetch(`${BASE_URL}/water-levels`);
    return res.json();
  },

  getWaterLevelStations: async (): Promise<WaterLevelSystemResponse> => {
    const res = await fetch(`${BASE_URL}/water-levels/stations`);
    return res.json();
  },

  getWaterLevelPresets: async () => {
    const res = await fetch(`${BASE_URL}/water-levels/presets`);
    return res.json();
  },

  ingestWaterLevelUrl: async (
    url: string,
    presetName?: string,
    pollingCadenceSec?: number
  ): Promise<WaterLevelSystemResponse> => {
    const res = await fetch(`${BASE_URL}/water-levels/ingest-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, presetName, pollingCadenceSec }),
    });
    return res.json();
  },

  refreshWaterLevelStream: async (): Promise<WaterLevelSystemResponse> => {
    const res = await fetch(`${BASE_URL}/water-levels/refresh`, {
      method: 'POST',
    });
    return res.json();
  },

  simulateWaterSurge: async (stationId: string, surgeDeltaM?: number) => {
    const res = await fetch(`${BASE_URL}/water-levels/simulate-surge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stationId, surgeDeltaM }),
    });
    return res.json();
  },

  resetWaterLevels: async () => {
    const res = await fetch(`${BASE_URL}/water-levels/reset`, {
      method: 'POST',
    });
    return res.json();
  },

  // Incidents
  getIncidents: async () => {
    const res = await fetch(`${BASE_URL}/incidents`);
    return res.json();
  },

  getIncidentDetails: async (id: string) => {
    const res = await fetch(`${BASE_URL}/incidents/${id}`);
    return res.json();
  },

  getIncidentSpread: async (id: string) => {
    const res = await fetch(`${BASE_URL}/incidents/${id}/spread`);
    return res.json();
  },

  // Alerts
  getAlerts: async () => {
    const res = await fetch(`${BASE_URL}/alerts`);
    return res.json();
  },

  createAlert: async (data: any) => {
    const res = await fetch(`${BASE_URL}/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  approveAlert: async (alertId: string, data: { authorUserId: string; authorRole: string; reason: string }) => {
    const res = await fetch(`${BASE_URL}/alerts/${alertId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  acknowledgeAlert: async (alertId: string, deviceId?: string) => {
    const res = await fetch(`${BASE_URL}/alerts/${alertId}/acknowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId }),
    });
    return res.json();
  },

  // Shelters & Routes
  getShelters: async () => {
    const res = await fetch(`${BASE_URL}/shelters`);
    return res.json();
  },

  getHospitals: async () => {
    const res = await fetch(`${BASE_URL}/hospitals`);
    return res.json();
  },

  getRoutes: async () => {
    const res = await fetch(`${BASE_URL}/routes`);
    return res.json();
  },

  // Citizen Reports
  getReports: async () => {
    const res = await fetch(`${BASE_URL}/reports`);
    return res.json();
  },

  submitReport: async (reportData: any) => {
    const res = await fetch(`${BASE_URL}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData),
    });
    return res.json();
  },

  verifyReport: async (reportId: string, verificationData: any) => {
    const res = await fetch(`${BASE_URL}/reports/${reportId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(verificationData),
    });
    return res.json();
  },

  // Telemetry
  getDevices: async () => {
    const res = await fetch(`${BASE_URL}/devices`);
    return res.json();
  },

  sendHeartbeat: async (data: any) => {
    const res = await fetch(`${BASE_URL}/devices/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Data Sources
  getSources: async () => {
    const res = await fetch(`${BASE_URL}/sources`);
    return res.json();
  },

  testSource: async (sourceId: string) => {
    const res = await fetch(`${BASE_URL}/sources/${sourceId}/test`, {
      method: 'POST',
    });
    return res.json();
  },

  toggleSource: async (sourceId: string, config: { enabled?: boolean; isSimulation?: boolean }) => {
    const res = await fetch(`${BASE_URL}/sources/${sourceId}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    return res.json();
  },

  // ML Models
  getModels: async () => {
    const res = await fetch(`${BASE_URL}/models`);
    return res.json();
  },

  activateModel: async (modelId: string) => {
    const res = await fetch(`${BASE_URL}/models/${modelId}/activate`, {
      method: 'POST',
    });
    return res.json();
  },

  // Simulation & Replay
  runSimulation: async (params: any) => {
    const res = await fetch(`${BASE_URL}/simulations/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },

  getReplayIncidents: async () => {
    const res = await fetch(`${BASE_URL}/replay`);
    return res.json();
  },

  getReplayIncident: async (id: string) => {
    const res = await fetch(`${BASE_URL}/replay/${id}`);
    return res.json();
  },

  // Audit Logs & Thresholds
  getAuditLogs: async () => {
    const res = await fetch(`${BASE_URL}/audit`);
    return res.json();
  },

  getThresholds: async () => {
    const res = await fetch(`${BASE_URL}/admin/thresholds`);
    return res.json();
  },

  updateThresholds: async (thresholds: Partial<SystemThresholds>) => {
    const res = await fetch(`${BASE_URL}/admin/thresholds`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(thresholds),
    });
    return res.json();
  },

  getUsers: async () => {
    const res = await fetch(`${BASE_URL}/admin/users`);
    return res.json();
  },

  // Grounded Intelligence
  getGroundedIntel: async (query?: string) => {
    const res = await fetch(`${BASE_URL}/ai/grounded-intelligence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    return res.json();
  },
};
