export interface ReplayFrame {
  timestampMinutes: number;
  timeLabel: string;
  rainfallRateMmHr: number;
  tideLevelM: number;
  waterDepthKurlaM: number;
  waterDepthSionM: number;
  activeAlertStage: 'WATCH' | 'WARNING' | 'CONFIRMED';
  alertTitle: string;
  subwayClosed: boolean;
  predictedVsObservedDiffM: number; // Model evaluation metric
  eventNote: string;
}

export interface ReplayIncident {
  id: string;
  title: string;
  date: string;
  description: string;
  totalRainfallMm: number;
  peakRainfallRateMmHr: number;
  maxTideM: number;
  durationMinutes: number;
  frames: ReplayFrame[];
}

const HISTORICAL_INCIDENTS: ReplayIncident[] = [
  {
    id: 'replay-deluge-2005',
    title: 'Historic July 26 Mumbai Deluge Event',
    date: '2005-07-26',
    description: 'Catastrophic cloudburst over Mumbai metropolitan region dumping 944 mm in 24 hours with extreme Arabian Sea high tide (4.48m).',
    totalRainfallMm: 944,
    peakRainfallRateMmHr: 120,
    maxTideM: 4.48,
    durationMinutes: 360,
    frames: [
      {
        timestampMinutes: 0,
        timeLabel: '14:00 IST',
        rainfallRateMmHr: 35,
        tideLevelM: 3.2,
        waterDepthKurlaM: 0.2,
        waterDepthSionM: 0.3,
        activeAlertStage: 'WATCH',
        alertTitle: 'Heavy precipitation advisory issued for coastal Konkan',
        subwayClosed: false,
        predictedVsObservedDiffM: 0.05,
        eventNote: 'Continuous monsoon bands coalescing over Santacruz & Kurla basin.',
      },
      {
        timestampMinutes: 60,
        timeLabel: '15:00 IST',
        rainfallRateMmHr: 82,
        tideLevelM: 3.9,
        waterDepthKurlaM: 0.75,
        waterDepthSionM: 0.85,
        activeAlertStage: 'WARNING',
        alertTitle: 'WARNING: Rapid waterlogging in low-lying railway corridors',
        subwayClosed: true,
        predictedVsObservedDiffM: 0.08,
        eventNote: 'Milan and Andheri subways closed to vehicular traffic. Central Railway tracks submerged.',
      },
      {
        timestampMinutes: 120,
        timeLabel: '16:00 IST',
        rainfallRateMmHr: 115,
        tideLevelM: 4.48,
        waterDepthKurlaM: 1.6,
        waterDepthSionM: 1.9,
        activeAlertStage: 'CONFIRMED',
        alertTitle: 'CONFIRMED EMERGENCY: Mithi River breaches banks at Kurla & BKC',
        subwayClosed: true,
        predictedVsObservedDiffM: 0.12,
        eventNote: 'High tide peak coincides with 115mm/hr torrential downpour. Drainage gates locked by sea backpressure.',
      },
      {
        timestampMinutes: 180,
        timeLabel: '17:00 IST',
        rainfallRateMmHr: 95,
        tideLevelM: 4.3,
        waterDepthKurlaM: 2.4,
        waterDepthSionM: 2.3,
        activeAlertStage: 'CONFIRMED',
        alertTitle: 'EVACUATION ACTIVE: Lowlands submerged up to 2.4 meters',
        subwayClosed: true,
        predictedVsObservedDiffM: 0.15,
        eventNote: 'NDRF and Navy rubber boats deployed across Bail Bazar, Kranti Nagar, and Sion circle.',
      },
      {
        timestampMinutes: 240,
        timeLabel: '18:00 IST',
        rainfallRateMmHr: 60,
        tideLevelM: 3.6,
        waterDepthKurlaM: 2.1,
        waterDepthSionM: 1.8,
        activeAlertStage: 'CONFIRMED',
        alertTitle: 'Search, Rescue & Relief shelter distribution in full progress',
        subwayClosed: true,
        predictedVsObservedDiffM: 0.11,
        eventNote: 'Tide receding gradually; MCGM emergency pumps actively discharging water.',
      },
      {
        timestampMinutes: 360,
        timeLabel: '20:00 IST',
        rainfallRateMmHr: 28,
        tideLevelM: 2.4,
        waterDepthKurlaM: 1.2,
        waterDepthSionM: 0.9,
        activeAlertStage: 'WARNING',
        alertTitle: 'Water levels slowly receding across Kurla and Sion',
        subwayClosed: false,
        predictedVsObservedDiffM: 0.07,
        eventNote: 'Recovery operations underway. Evacuees sheltered with hot food & medical aid.',
      },
    ],
  },
  {
    id: 'replay-monsoon-2024',
    title: 'July 2024 Monsoon Cloudburst & High Tide',
    date: '2024-07-18',
    description: 'Sudden localized cloudburst delivering 88 mm/hr across Dadar, Hindmata, and Kurla coinciding with 4.3m tide.',
    totalRainfallMm: 210,
    peakRainfallRateMmHr: 88,
    maxTideM: 4.35,
    durationMinutes: 180,
    frames: [
      {
        timestampMinutes: 0,
        timeLabel: '09:00 IST',
        rainfallRateMmHr: 20,
        tideLevelM: 2.8,
        waterDepthKurlaM: 0.1,
        waterDepthSionM: 0.15,
        activeAlertStage: 'WATCH',
        alertTitle: 'Monsoon intensity advisory',
        subwayClosed: false,
        predictedVsObservedDiffM: 0.02,
        eventNote: 'Moderate showers across island city.',
      },
      {
        timestampMinutes: 60,
        timeLabel: '10:00 IST',
        rainfallRateMmHr: 88,
        tideLevelM: 4.35,
        waterDepthKurlaM: 1.2,
        waterDepthSionM: 1.4,
        activeAlertStage: 'WARNING',
        alertTitle: 'WARNING: Cloudburst triggering rapid street inundation',
        subwayClosed: true,
        predictedVsObservedDiffM: 0.06,
        eventNote: 'Subways waterlogged. PEHRA Model A accurately forecast 85min lead time.',
      },
      {
        timestampMinutes: 120,
        timeLabel: '11:00 IST',
        rainfallRateMmHr: 45,
        tideLevelM: 3.8,
        waterDepthKurlaM: 1.4,
        waterDepthSionM: 1.6,
        activeAlertStage: 'CONFIRMED',
        alertTitle: 'CONFIRMED: Gandhi Market & Hindmata traffic diversion in effect',
        subwayClosed: true,
        predictedVsObservedDiffM: 0.08,
        eventNote: 'MCGM stormwater holding tanks activated in Pramod Mahajan Park.',
      },
      {
        timestampMinutes: 180,
        timeLabel: '12:00 IST',
        rainfallRateMmHr: 15,
        tideLevelM: 3.1,
        waterDepthKurlaM: 0.7,
        waterDepthSionM: 0.8,
        activeAlertStage: 'WATCH',
        alertTitle: 'Rain subsided; dewatering in final stages',
        subwayClosed: false,
        predictedVsObservedDiffM: 0.04,
        eventNote: 'Traffic normalized across Western Express Highway.',
      },
    ],
  },
];

export class ReplayService {
  public listReplayIncidents(): ReplayIncident[] {
    return HISTORICAL_INCIDENTS;
  }

  public getReplayIncident(id: string): ReplayIncident | undefined {
    return HISTORICAL_INCIDENTS.find((inc) => inc.id === id) || HISTORICAL_INCIDENTS[0];
  }
}

export const replayService = new ReplayService();
