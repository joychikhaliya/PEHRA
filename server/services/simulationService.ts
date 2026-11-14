import { db } from '../db/store.ts';

export interface SimulationResult {
  scenarioName: string;
  isSimulation: true;
  label: 'SIMULATION — NOT LIVE';
  inputs: {
    rainfallMmHr: number;
    durationHours: number;
    tideHeightM: number;
    riverDischargeM3s: number;
    windSpeedKmh: number;
    startingVillageId: string;
  };
  impact: {
    totalEstimatedAffectedPeople: number;
    highRiskVillages: string[];
    criticalSubwaysFlooded: string[];
    sheltersRequired: number;
    estimatedDamageIndex: number; // 0 - 100
  };
  spreadTimeline: {
    hour: number;
    waterAccumulationMm: number;
    spreadDepthM: number;
    affectedVillages: string[];
    riskState: 'WATCH' | 'WARNING' | 'CONFIRMED';
  }[];
  generatedAt: string;
}

export class SimulationService {
  public runSimulation(params: {
    scenarioName: string;
    rainfallMmHr: number;
    durationHours: number;
    tideHeightM: number;
    riverDischargeM3s: number;
    windSpeedKmh: number;
    startingVillageId: string;
  }): SimulationResult {
    const { rainfallMmHr, durationHours, tideHeightM, startingVillageId } = params;

    const baseVillage = db.villages.find((v) => v.id === startingVillageId) || db.villages[0];
    const totalRainfall = rainfallMmHr * durationHours;

    // Estimate affected population scaling with rain intensity & tide
    const intensityMultiplier = (rainfallMmHr / 50) * (tideHeightM / 3.5);
    const affectedCount = Math.round(baseVillage.population * Math.min(1.8, 0.45 * intensityMultiplier));

    const highRiskVillages: string[] = [baseVillage.name];
    if (totalRainfall > 150) {
      db.villages.forEach((v) => {
        if (v.id !== baseVillage.id && v.elevationM <= 6.0) {
          highRiskVillages.push(v.name);
        }
      });
    }

    const subways = [];
    if (rainfallMmHr > 40) subways.push('Milan Subway (Santacruz)');
    if (rainfallMmHr > 60) subways.push('Andheri Subway');
    if (rainfallMmHr > 75) subways.push('Sion Gandhi Market Underpass', 'Dahisar Subway');

    const timeline = [];
    for (let h = 1; h <= Math.min(6, durationHours); h++) {
      const accum = Math.round(rainfallMmHr * h);
      const depth = Number((0.25 * h * (rainfallMmHr / 40) * (tideHeightM > 4.2 ? 1.3 : 1.0)).toFixed(2));
      let state: 'WATCH' | 'WARNING' | 'CONFIRMED' = 'WATCH';
      if (depth > 1.2 || accum > 150) state = 'CONFIRMED';
      else if (depth > 0.5 || accum > 70) state = 'WARNING';

      timeline.push({
        hour: h,
        waterAccumulationMm: accum,
        spreadDepthM: depth,
        affectedVillages: highRiskVillages.slice(0, Math.min(highRiskVillages.length, h + 1)),
        riskState: state,
      });
    }

    db.addAuditLog({
      userId: 'usr-admin-01',
      userName: 'Disaster Simulation Lab',
      userRole: 'ADMIN',
      action: 'RUN_SIMULATION',
      resource: 'SIMULATION',
      resourceId: `sim-${Date.now()}`,
      reason: `Executed scenario '${params.scenarioName}' (${rainfallMmHr} mm/hr, ${tideHeightM}m tide)`,
    });

    return {
      scenarioName: params.scenarioName,
      isSimulation: true,
      label: 'SIMULATION — NOT LIVE',
      inputs: params,
      impact: {
        totalEstimatedAffectedPeople: affectedCount,
        highRiskVillages,
        criticalSubwaysFlooded: subways,
        sheltersRequired: Math.ceil(affectedCount / 800),
        estimatedDamageIndex: Math.min(100, Math.round(intensityMultiplier * 35)),
      },
      spreadTimeline: timeline,
      generatedAt: new Date().toISOString(),
    };
  }
}

export const simulationService = new SimulationService();
