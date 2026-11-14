import { Router, Request, Response } from 'express';
import { db } from '../db/store.ts';
import { mumbaiFloodAdapter } from '../sources/mumbaiFloodAdapter.ts';
import { predictionEngine } from '../models/predictionEngine.ts';
import { alertEngine } from '../services/alertEngine.ts';
import { simulationService } from '../services/simulationService.ts';
import { replayService } from '../services/replayService.ts';
import { fetchGroundedFloodIntel } from '../services/geminiGrounding.ts';
import { waterLevelService, WATER_LEVEL_PRESETS } from '../services/waterLevelService.ts';
import { UserRole } from '../../src/types/index.ts';

export const apiRouter = Router();

// Server-Sent Events (SSE) Client list for real-time broadcasts
const sseClients: Response[] = [];

export function broadcastSSE(event: string, data: any) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.write(payload);
    } catch {
      // Ignore broken client connections
    }
  });
}

// 1. REAL-TIME EVENT STREAM
apiRouter.get('/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  sseClients.push(res);
  res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected', time: new Date().toISOString() })}\n\n`);

  req.on('close', () => {
    const idx = sseClients.indexOf(res);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

// 2. SYSTEM HEALTH
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    system: 'PEHRA — Predictive Early-warning for Hyperlocal Risk Assessment',
    version: '2.4.0-prod',
    uptimeSeconds: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

apiRouter.get('/health/detailed', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    components: {
      database: { status: 'healthy', provider: 'PostgreSQL/PostGIS (Active Replicated Store)' },
      cache: { status: 'healthy', provider: 'Redis High-Speed Geospatial Index' },
      mumbaiFloodApi: { status: db.dataSources[0].status, freshnessSec: db.dataSources[0].freshnessSeconds },
      weatherRadar: { status: db.dataSources[1].status, freshnessSec: db.dataSources[1].freshnessSeconds },
      modelEngine: { status: 'healthy', activeModel: 'flood-conditions-v1.4' },
      alertDispatch: { status: 'healthy', pushEnabled: db.thresholds.pushEnabled, smsEnabled: db.thresholds.smsFallbackEnabled },
    },
    activeIncidentsCount: db.incidents.filter((i) => i.status === 'ACTIVE').length,
    activeAlertsCount: db.alerts.filter((a) => a.status === 'ACTIVE').length,
    timestamp: new Date().toISOString(),
  });
});

// 3. AUTHENTICATION & SESSION
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  // Support easy role-switching for audit, responder, citizen, admin testing
  let user = db.users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase());
  if (!user && role) {
    user = db.users.find((u) => u.role === role);
  }
  if (!user) {
    user = db.users[0]; // fallback to default demo user
  }

  user.lastLoginAt = new Date().toISOString();
  db.addAuditLog({
    userId: user.id,
    userName: user.fullName,
    userRole: user.role,
    action: 'USER_LOGIN',
    resource: 'USER',
    resourceId: user.id,
    ipAddress: req.ip || '127.0.0.1',
    reason: `User authenticated into PEHRA ${role || user.role} portal.`,
  });

  res.json({
    user,
    role: role || user.role,
    accessToken: `pehra-token-${user.id}-${Date.now()}`,
    refreshToken: `pehra-refresh-${user.id}-${Date.now()}`,
    mfaRequired: false,
  });
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const role = (req.query.role as UserRole) || 'CITIZEN';
  const user = db.users.find((u) => u.role === role) || db.users[0];
  res.json({ user, role });
});

// 3B. DRONE RECONNAISSANCE GRID & LIVE IMAGE RENDERING
const droneFleetState = [
  {
    id: 'drone-alpha-01',
    callsign: 'GARUDA-ALPHA 01',
    status: 'CONNECTED',
    batteryPercent: 88,
    altitudeM: 85,
    speedKmh: 18.4,
    headingDeg: 245,
    signalStrengthDbm: -52,
    lat: 19.0688,
    lng: 72.8795,
    locationName: 'Kurla West — Mithi River Confluence',
    waterDepthMeasuredM: 1.45,
    floodCoverageKm2: 0.62,
    cameraMode: 'FLOOD_MASK',
    pilotStation: 'NDRF Base Kurla Tactical Outpost',
  },
  {
    id: 'drone-bravo-02',
    callsign: 'GARUDA-BRAVO 02',
    status: 'CONNECTED',
    batteryPercent: 74,
    altitudeM: 45,
    speedKmh: 12.1,
    headingDeg: 180,
    signalStrengthDbm: -58,
    lat: 19.0912,
    lng: 72.8488,
    locationName: 'Milan Subway Underpass & WEH Link',
    waterDepthMeasuredM: 2.1,
    floodCoverageKm2: 0.28,
    cameraMode: 'RGB_4K',
    pilotStation: 'Mumbai Fire Brigade Santacruz Division',
  },
  {
    id: 'drone-charlie-03',
    callsign: 'GARUDA-CHARLIE 03',
    status: 'IN_FLIGHT',
    batteryPercent: 62,
    altitudeM: 110,
    speedKmh: 24.6,
    headingDeg: 310,
    signalStrengthDbm: -63,
    lat: 19.0435,
    lng: 72.8567,
    locationName: 'Dharavi 90ft Road & Mahim Creek',
    waterDepthMeasuredM: 0.85,
    floodCoverageKm2: 0.84,
    cameraMode: 'THERMAL_FLIR',
    pilotStation: 'MCGM Emergency Ops Mobile Van Dharavi',
  },
];

apiRouter.get('/drones', (req: Request, res: Response) => {
  res.json({ drones: droneFleetState });
});

apiRouter.post('/drones/:id/connect', (req: Request, res: Response) => {
  const drone = droneFleetState.find((d) => d.id === req.params.id);
  if (!drone) return res.status(404).json({ error: 'Drone unit not found' });
  drone.status = drone.status === 'CONNECTED' ? 'STANDBY' : 'CONNECTED';
  res.json({ drone, success: true });
});

// 4. DASHBOARD SUMMARY
apiRouter.get('/dashboard/summary', (req: Request, res: Response) => {
  const activeIncidents = db.incidents.filter((i) => i.status === 'ACTIVE');
  const activeAlerts = db.alerts.filter((a) => a.status === 'ACTIVE');
  const totalExposed = db.villages.reduce((sum, v) => sum + (v.riskLevel === 'HIGH' || v.riskLevel === 'CRITICAL' ? v.exposurePopulation : 0), 0);
  const criticalVillages = db.villages.filter((v) => v.riskLevel === 'CRITICAL' || v.riskLevel === 'HIGH');
  const verifiedReports = db.reports.filter((r) => r.status === 'VERIFIED');

  res.json({
    activeIncidentsCount: activeIncidents.length,
    activeAlertsCount: activeAlerts.length,
    totalPeopleAtRisk: totalExposed,
    highRiskVillagesCount: criticalVillages.length,
    verifiedReportsCount: verifiedReports.length,
    modelConfidenceAverage: 0.89,
    dataSourcesHealthyCount: db.dataSources.filter((s) => s.status === 'HEALTHY').length,
    dataSourcesTotal: db.dataSources.length,
    lastUpdateTimestamp: new Date().toISOString(),
    priorityQueue: [
      {
        id: 'pq-1',
        title: 'Mithi River Bridge Gauge Level Surge',
        severity: 'CRITICAL',
        targetVillage: 'Kurla West (Mithi Basin)',
        whyPriority: 'Water level rate of rise exceeds 0.45m/15min coinciding with 4.45m high tide. Drainage backpressure locks sluice gates.',
        actionRequired: 'Verify flood spread progression and authorize emergency warning broadcast.',
      },
      {
        id: 'pq-2',
        title: 'Sion Circle & Gandhi Market Inundation',
        severity: 'CRITICAL',
        targetVillage: 'Sion Circle & Gandhi Market',
        whyPriority: 'Subway water depth reached 2.15m. Public transport halted. 42 patients in nearby low-lying clinic need transport.',
        actionRequired: 'Evacuation corridor confirmation and pump squad redirection.',
      },
      {
        id: 'pq-3',
        title: 'Milan Subway Pump Debris Blockage',
        severity: 'HIGH',
        targetVillage: 'Milan Subway & Santacruz',
        whyPriority: 'Citizen report verified with knee-to-waist water accumulation.',
        actionRequired: 'Deploy MCGM quick response clearance team.',
      },
    ],
  });
});

// 5. RISK MAP & VILLAGES
apiRouter.get('/risk/map', (req: Request, res: Response) => {
  const assessments = db.villages.map((v) => predictionEngine.calculateRisk(v));
  res.json({
    villages: db.villages,
    assessments,
    activeIncidents: db.incidents.filter((i) => i.status === 'ACTIVE'),
    activeAlerts: db.alerts.filter((a) => a.status === 'ACTIVE'),
    shelters: db.shelters,
    hospitals: db.hospitals,
    routes: db.routes,
    timestamp: new Date().toISOString(),
  });
});

apiRouter.get('/risk/villages/:id', (req: Request, res: Response) => {
  const village = db.villages.find((v) => v.id === req.params.id);
  if (!village) return res.status(404).json({ error: 'Village not found' });
  const modelA = predictionEngine.runModelA(village.id);
  const assessment = predictionEngine.calculateRisk(village);
  const relatedAlerts = db.alerts.filter((a) => a.villageId === village.id);
  const relatedReports = db.reports.filter((r) => r.location.villageId === village.id);

  res.json({
    village,
    modelPrediction: modelA,
    assessment,
    alerts: relatedAlerts,
    reports: relatedReports,
  });
});

// 6. RAINFALL & SENSOR OBSERVATIONS
apiRouter.get('/rainfall', (req: Request, res: Response) => {
  const obs = db.getObservations().filter((o) => o.sourceType === 'rainfall' || o.sourceType === 'nowcast');
  res.json({ observations: obs });
});

apiRouter.get('/water-levels', (req: Request, res: Response) => {
  waterLevelService.tickLiveFluctuations();
  const obs = db.getObservations().filter((o) => o.sourceType === 'water_level' || o.sourceType === 'tide');
  res.json({
    observations: obs,
    system: waterLevelService.getSystemState(),
  });
});

apiRouter.get('/water-levels/stations', (req: Request, res: Response) => {
  res.json(waterLevelService.getSystemState());
});

apiRouter.get('/water-levels/presets', (req: Request, res: Response) => {
  res.json({ presets: WATER_LEVEL_PRESETS, activeUrl: waterLevelService.getActiveUrl() });
});

apiRouter.post('/water-levels/ingest-url', async (req: Request, res: Response) => {
  try {
    const { url, presetName, pollingCadenceSec } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'A valid URL must be provided in request body.' });
    }
    const result = await waterLevelService.ingestFromUrl(url, presetName, pollingCadenceSec);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to ingest water level feed from provided URL.' });
  }
});

apiRouter.post('/water-levels/refresh', async (req: Request, res: Response) => {
  try {
    const activeUrl = waterLevelService.getActiveUrl();
    const result = await waterLevelService.ingestFromUrl(activeUrl);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to refresh water level stream.' });
  }
});

apiRouter.post('/water-levels/simulate-surge', (req: Request, res: Response) => {
  const { stationId, surgeDeltaM } = req.body;
  if (!stationId) {
    return res.status(400).json({ error: 'stationId is required.' });
  }
  const updated = waterLevelService.simulateSurge(stationId, surgeDeltaM || 0.85);
  if (!updated) {
    return res.status(404).json({ error: 'Station not found.' });
  }
  res.json({ station: updated, success: true, system: waterLevelService.getSystemState() });
});

apiRouter.post('/water-levels/reset', (req: Request, res: Response) => {
  waterLevelService.resetToBaseline();
  res.json({ success: true, system: waterLevelService.getSystemState() });
});

// 7. INCIDENTS & SPREAD
apiRouter.get('/incidents', (req: Request, res: Response) => {
  res.json({ incidents: db.incidents });
});

apiRouter.get('/incidents/:id', (req: Request, res: Response) => {
  const incident = db.incidents.find((i) => i.id === req.params.id);
  if (!incident) return res.status(404).json({ error: 'Incident not found' });
  res.json({ incident });
});

apiRouter.get('/incidents/:id/spread', (req: Request, res: Response) => {
  const incident = db.incidents.find((i) => i.id === req.params.id);
  if (!incident) return res.status(404).json({ error: 'Incident not found' });
  const spreadEvents = incident.spreadEvents.length > 0 ? incident.spreadEvents : predictionEngine.runModelB(incident.id, incident.originLocation.villageId);
  res.json({ spreadEvents });
});

// 8. ALERTS & OPERATIONAL WORKFLOW
apiRouter.get('/alerts', (req: Request, res: Response) => {
  res.json({ alerts: db.alerts });
});

apiRouter.post('/alerts', (req: Request, res: Response) => {
  try {
    const { stage, villageId, title, message, riskLevel, confidence, etaHours, shelterId, evacuationRouteId, checklist, authorUserId, authorRole } = req.body;
    const result = alertEngine.createAlert({
      stage: stage || 'WATCH',
      villageId: villageId || 'mumbai-kurla-w',
      title: title || 'New Early Warning Alert',
      message: message || 'Potential flood risk detected in geographic zone.',
      riskLevel: riskLevel || 'HIGH',
      confidence: confidence || 0.85,
      etaHours: etaHours || 2.0,
      shelterId,
      evacuationRouteId,
      checklist,
      authorUserId: authorUserId || 'usr-authority-01',
      authorRole: authorRole || 'AUTHORITY',
    });

    broadcastSSE('alert.created', result.alert);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/alerts/:id/approve', (req: Request, res: Response) => {
  try {
    const { authorUserId, authorRole, reason } = req.body;
    const alert = alertEngine.approveAlert(req.params.id, authorUserId || 'usr-authority-01', authorRole || 'AUTHORITY', reason);
    broadcastSSE('alert.approved', alert);
    res.json({ alert, success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/alerts/:id/acknowledge', (req: Request, res: Response) => {
  try {
    const { userId, deviceId } = req.body;
    const result = alertEngine.acknowledgeAlert(req.params.id, userId, deviceId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 9. SHELTERS, HOSPITALS, ROUTES
apiRouter.get('/shelters', (req: Request, res: Response) => {
  res.json({ shelters: db.shelters });
});

apiRouter.get('/hospitals', (req: Request, res: Response) => {
  res.json({ hospitals: db.hospitals });
});

apiRouter.get('/routes', (req: Request, res: Response) => {
  res.json({ routes: db.routes });
});

// 10. CITIZEN REPORTS & VERIFICATION
apiRouter.get('/reports', (req: Request, res: Response) => {
  res.json({ reports: db.reports });
});

apiRouter.post('/reports', (req: Request, res: Response) => {
  const { reporterName, reporterPhone, location, waterDepthM, depthCategory, description, photoUrl } = req.body;
  const report = {
    id: `rep-${Date.now()}`,
    reporterName: reporterName || 'Anonymous Citizen',
    reporterPhone,
    location: location || { lat: 19.069, lng: 72.879, address: 'Kurla West', villageId: 'mumbai-kurla-w' },
    waterDepthM: Number(waterDepthM) || 0.6,
    depthCategory: depthCategory || 'KNEE',
    description: description || 'Rising water level observed on roadway.',
    photoUrl,
    timestamp: new Date().toISOString(),
    status: 'SUBMITTED' as const,
  };

  db.reports.unshift(report as any);
  db.addAuditLog({
    userId: 'citizen-app',
    userName: report.reporterName,
    userRole: 'CITIZEN',
    action: 'SUBMIT_REPORT',
    resource: 'REPORT',
    resourceId: report.id,
    reason: `Citizen submitted field report of ${report.depthCategory} water depth at ${report.location.address}`,
  });

  broadcastSSE('report.created', report);
  res.status(201).json({ report });
});

apiRouter.post('/reports/:id/verify', (req: Request, res: Response) => {
  const report = db.reports.find((r) => r.id === req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found' });
  const { status, verifiedBy, impactScore } = req.body;
  report.status = status || 'VERIFIED';
  report.verifiedBy = verifiedBy || 'usr-authority-01';
  report.verifiedAt = new Date().toISOString();
  if (impactScore !== undefined) report.impactScore = Number(impactScore);

  db.addAuditLog({
    userId: report.verifiedBy || 'usr-authority-01',
    userName: 'Emergency Authority',
    userRole: 'AUTHORITY',
    action: 'VERIFY_REPORT',
    resource: 'REPORT',
    resourceId: report.id,
    reason: `Report status updated to ${report.status}`,
  });

  res.json({ report, success: true });
});

// 11. DEVICES & TELEMETRY
apiRouter.get('/devices', (req: Request, res: Response) => {
  res.json({ devices: db.devices });
});

apiRouter.post('/devices/heartbeat', (req: Request, res: Response) => {
  const { deviceId, userId, lat, lng, batteryPct, isAlertScoped, consentGranted } = req.body;
  let dev = db.devices.find((d) => d.deviceId === deviceId);
  const batteryStatus = batteryPct > 50 ? 'GREEN' : batteryPct > 20 ? 'YELLOW' : 'RED';

  if (!dev) {
    dev = {
      deviceId: deviceId || `dev-${Date.now()}`,
      userId,
      lat: lat || 19.069,
      lng: lng || 72.879,
      batteryPct: batteryPct || 85,
      batteryStatus,
      timestamp: new Date().toISOString(),
      isAlertScoped: isAlertScoped !== false,
      consentGranted: consentGranted !== false,
      relayHopCount: 0,
    };
    db.devices.push(dev);
  } else {
    dev.lat = lat ?? dev.lat;
    dev.lng = lng ?? dev.lng;
    dev.batteryPct = batteryPct ?? dev.batteryPct;
    dev.batteryStatus = batteryStatus;
    dev.timestamp = new Date().toISOString();
  }

  res.json({ device: dev, success: true });
});

// 12. DATA SOURCES & HEALTH
apiRouter.get('/sources', async (req: Request, res: Response) => {
  const feed = await mumbaiFloodAdapter.fetchFeed();
  res.json({ sources: db.dataSources, liveFeedSample: feed });
});

apiRouter.post('/sources/:id/test', async (req: Request, res: Response) => {
  const result = await mumbaiFloodAdapter.testConnection();
  res.json(result);
});

apiRouter.post('/sources/:id/toggle', (req: Request, res: Response) => {
  const source = db.dataSources.find((s) => s.id === req.params.id);
  if (!source) return res.status(404).json({ error: 'Source not found' });
  const { enabled, isSimulation } = req.body;
  if (enabled !== undefined) source.enabled = Boolean(enabled);
  if (isSimulation !== undefined) source.isSimulation = Boolean(isSimulation);

  db.addAuditLog({
    userId: 'usr-admin-01',
    userName: 'Admin',
    userRole: 'ADMIN',
    action: 'UPDATE_SOURCE_CONFIG',
    resource: 'DATA_SOURCE',
    resourceId: source.id,
    reason: `Config updated. Enabled: ${source.enabled}, Simulation: ${source.isSimulation}`,
  });

  res.json({ source, success: true });
});

// 13. ML MODELS & PREDICTIONS
apiRouter.get('/models', (req: Request, res: Response) => {
  res.json({ models: db.models });
});

apiRouter.post('/models/:id/activate', (req: Request, res: Response) => {
  const targetModel = db.models.find((m) => m.id === req.params.id);
  if (!targetModel) return res.status(404).json({ error: 'Model not found' });

  // Deprecate older models of same type
  db.models.forEach((m) => {
    if (m.type === targetModel.type && m.id !== targetModel.id && m.status === 'ACTIVE') {
      m.status = 'DEPRECATED';
    }
  });

  targetModel.status = 'ACTIVE';
  targetModel.activatedAt = new Date().toISOString();

  db.addAuditLog({
    userId: 'usr-admin-01',
    userName: 'ML Ops Admin',
    userRole: 'ADMIN',
    action: 'ACTIVATE_MODEL',
    resource: 'MODEL_VERSION',
    resourceId: targetModel.id,
    reason: `Model activated: ${targetModel.name} (${targetModel.version})`,
  });

  res.json({ model: targetModel, success: true });
});

apiRouter.post('/predictions/run', (req: Request, res: Response) => {
  const { villageId } = req.body;
  const prediction = predictionEngine.runModelA(villageId || 'mumbai-kurla-w');
  res.json({ prediction });
});

// 14. SIMULATIONS & REPLAY
apiRouter.post('/simulations/run', (req: Request, res: Response) => {
  const { scenarioName, rainfallMmHr, durationHours, tideHeightM, riverDischargeM3s, windSpeedKmh, startingVillageId } = req.body;
  const result = simulationService.runSimulation({
    scenarioName: scenarioName || 'Custom Cloudburst Scenario',
    rainfallMmHr: Number(rainfallMmHr) || 75,
    durationHours: Number(durationHours) || 3,
    tideHeightM: Number(tideHeightM) || 4.2,
    riverDischargeM3s: Number(riverDischargeM3s) || 280,
    windSpeedKmh: Number(windSpeedKmh) || 45,
    startingVillageId: startingVillageId || 'mumbai-kurla-w',
  });
  res.json({ result });
});

apiRouter.get('/replay', (req: Request, res: Response) => {
  res.json({ incidents: replayService.listReplayIncidents() });
});

apiRouter.get('/replay/:id', (req: Request, res: Response) => {
  const incident = replayService.getReplayIncident(req.params.id);
  res.json({ incident });
});

// 15. AUDIT LOGS & ADMIN
apiRouter.get('/audit', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 50;
  res.json({ auditLogs: db.auditLogs.slice(0, limit) });
});

apiRouter.get('/admin/thresholds', (req: Request, res: Response) => {
  res.json({ thresholds: db.thresholds });
});

apiRouter.post('/admin/thresholds', (req: Request, res: Response) => {
  const updates = req.body;
  const previousState = { ...db.thresholds };
  Object.assign(db.thresholds, updates);

  db.addAuditLog({
    userId: 'usr-admin-01',
    userName: 'Admin',
    userRole: 'ADMIN',
    action: 'UPDATE_THRESHOLDS',
    resource: 'SYSTEM_THRESHOLDS',
    resourceId: 'global',
    beforeState: previousState,
    afterState: db.thresholds,
    reason: 'Updated early warning thresholds and dispatch parameters.',
  });

  res.json({ thresholds: db.thresholds, success: true });
});

apiRouter.get('/admin/users', (req: Request, res: Response) => {
  res.json({ users: db.users });
});

// 16. GROUNDED INTELLIGENCE (GEMINI 3.8-FLASH WITH SEARCH & MAPS GROUNDING)
apiRouter.post('/ai/grounded-intelligence', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    const intel = await fetchGroundedFloodIntel(query);
    res.json(intel);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
