import { Alert, AlertStage, RiskLevel } from '../../src/types/index.ts';
import { db } from '../db/store.ts';

export class AlertEngine {
  // Create an alert draft or operational alert
  public createAlert(params: {
    incidentId?: string;
    stage: AlertStage;
    villageId: string;
    title: string;
    message: string;
    riskLevel: RiskLevel;
    confidence: number;
    etaHours: number;
    shelterId?: string;
    evacuationRouteId?: string;
    checklist?: string[];
    evidence?: {
      rainfallMm: number;
      waterLevelM: number;
      tideLevelM: number;
      modelPredictionProb: number;
      verifiedReportsCount: number;
    };
    authorUserId: string;
    authorRole: string;
  }): { alert: Alert; requiresApproval: boolean } {
    const village = db.villages.find((v) => v.id === params.villageId) || db.villages[0];
    const shelter = db.shelters.find((s) => s.id === params.shelterId) || db.shelters[0];
    const route = db.routes.find((r) => r.id === params.evacuationRouteId) || db.routes[0];

    const isConfirmed = params.stage === 'CONFIRMED';
    const isAuthorityOrAdmin = ['AUTHORITY', 'ADMIN', 'SUPER_ADMIN'].includes(params.authorRole);

    // AI or automated worker cannot directly issue CONFIRMED alert
    // If CONFIRMED is requested without explicit authority approval, place in PENDING_APPROVAL
    const requiresApproval = isConfirmed && !isAuthorityOrAdmin;
    const status = requiresApproval ? 'PENDING_APPROVAL' : 'ACTIVE';

    const defaultChecklist = [
      'Move elderly, children, and persons with disabilities to safety',
      'Keep mobile phones charged and emergency contacts handy',
      'Do not attempt to cross flooded roads or enter subways',
      `Evacuate along designated route to ${shelter.name}`,
    ];

    const alert: Alert = {
      id: `alt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      incidentId: params.incidentId,
      stage: params.stage,
      status,
      title: params.title,
      message: params.message,
      riskLevel: params.riskLevel,
      confidence: params.confidence,
      villageId: village.id,
      villageName: village.name,
      shelterId: shelter.id,
      evacuationRouteId: route.id,
      etaHours: params.etaHours,
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + db.thresholds.alertExpiryHours * 3600 * 1000).toISOString(),
      approvedBy: isAuthorityOrAdmin ? params.authorUserId : undefined,
      approvedAt: isAuthorityOrAdmin ? new Date().toISOString() : undefined,
      modelVersion: 'flood-conditions-v1.4',
      checklist: params.checklist || defaultChecklist,
      evidence: params.evidence || {
        rainfallMm: 65.0,
        waterLevelM: 1.75,
        tideLevelM: 4.2,
        modelPredictionProb: 0.82,
        verifiedReportsCount: 4,
      },
      deliveryStats: {
        pushDelivered: status === 'ACTIVE' ? Math.floor(village.population * 0.4) : 0,
        smsDelivered: status === 'ACTIVE' ? Math.floor(village.population * 0.25) : 0,
        offlineRelayed: 0,
        acknowledgedCount: 0,
      },
    };

    db.alerts.unshift(alert);

    // Record audit event
    db.addAuditLog({
      userId: params.authorUserId,
      userName: params.authorRole,
      userRole: params.authorRole as any,
      action: `CREATE_ALERT_${params.stage}`,
      resource: 'ALERT',
      resourceId: alert.id,
      beforeState: null,
      afterState: { stage: alert.stage, status: alert.status, village: village.name },
      reason: `Alert created: ${alert.title} [Status: ${alert.status}]`,
    });

    return { alert, requiresApproval };
  }

  // Authority human approval for CONFIRMED alert
  public approveAlert(alertId: string, authorUserId: string, authorRole: string, reason: string): Alert {
    const alert = db.alerts.find((a) => a.id === alertId);
    if (!alert) {
      throw new Error(`Alert with id ${alertId} not found`);
    }

    if (!['AUTHORITY', 'ADMIN', 'SUPER_ADMIN'].includes(authorRole)) {
      throw new Error('Only authorized emergency personnel can approve alerts.');
    }

    const previousState = { ...alert };
    alert.status = 'ACTIVE';
    alert.approvedBy = authorUserId;
    alert.approvedAt = new Date().toISOString();

    const village = db.villages.find((v) => v.id === alert.villageId);
    if (village) {
      alert.deliveryStats.pushDelivered = Math.floor(village.population * 0.55);
      alert.deliveryStats.smsDelivered = Math.floor(village.population * 0.4);
    }

    db.addAuditLog({
      userId: authorUserId,
      userName: authorRole,
      userRole: authorRole as any,
      action: `APPROVE_ALERT_${alert.stage}`,
      resource: 'ALERT',
      resourceId: alert.id,
      beforeState: previousState,
      afterState: alert,
      reason: reason || 'Human verification confirmed emergency condition. Dispatched to public channels.',
    });

    return alert;
  }

  // Acknowledge an alert by citizen or responder
  public acknowledgeAlert(alertId: string, userId?: string, deviceId?: string): { success: boolean; acknowledgedCount: number } {
    const alert = db.alerts.find((a) => a.id === alertId);
    if (!alert) {
      throw new Error(`Alert with id ${alertId} not found`);
    }

    alert.deliveryStats.acknowledgedCount += 1;

    db.addAuditLog({
      userId: userId || 'anonymous-device',
      userName: deviceId ? `Device ${deviceId}` : 'Citizen App',
      userRole: 'CITIZEN',
      action: 'ACKNOWLEDGE_ALERT',
      resource: 'ALERT',
      resourceId: alert.id,
      reason: 'Citizen acknowledged receipt of emergency instructions and evacuation route.',
    });

    return { success: true, acknowledgedCount: alert.deliveryStats.acknowledgedCount };
  }
}

export const alertEngine = new AlertEngine();
