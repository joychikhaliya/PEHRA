import { UserRole } from '../types/index.ts';

export interface RoleDetail {
  role: UserRole;
  title: string;
  shortLabel: string;
  badge: string;
  department: string;
  clearanceLevel: string;
  clearanceTier: number; // 0, 1, 2
  colorScheme: {
    bg: string;
    border: string;
    text: string;
    badgeBg: string;
    accent: string;
  };
  loginMethod: {
    type: 'CITIZEN_AUTH' | 'RESCUER_AUTH' | 'SUPERADMIN_AUTH';
    name: string;
    description: string;
    fields: {
      id: string;
      label: string;
      placeholder: string;
      defaultValue: string;
      type: string;
    }[];
  };
  demoUser: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    designation: string;
    station?: string;
    ward?: string;
    badgeNumber?: string;
  };
  overview: string;
  portalTab: string; // The dedicated view tab id
  portalName: string;
  permissions: {
    category: string;
    allowed: boolean;
    label: string;
  }[];
}

export const ROLES_CONFIG: Record<string, RoleDetail> = {
  CITIZEN: {
    role: 'CITIZEN',
    title: 'Citizen Portal',
    shortLabel: 'Citizen',
    badge: 'RESIDENT SAFETY ACCESS',
    department: 'Civil Community & Ward Residents',
    clearanceLevel: 'Resident Access (Tier 0)',
    clearanceTier: 0,
    colorScheme: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      accent: 'emerald',
    },
    loginMethod: {
      type: 'CITIZEN_AUTH',
      name: 'Mobile Phone OTP & Residential Ward',
      description: 'Quick citizen login via 4-digit SMS/WhatsApp verification code, or instant guest resident access.',
      fields: [
        {
          id: 'phone',
          label: 'Mobile / WhatsApp Number',
          placeholder: '+91 98920 44556',
          defaultValue: '+91 98920 44556',
          type: 'tel',
        },
        {
          id: 'otp',
          label: '4-Digit Verification Code',
          placeholder: '8492',
          defaultValue: '8492',
          type: 'text',
        },
        {
          id: 'ward',
          label: 'Primary Residential Ward / Locality',
          placeholder: 'Kurla West (L Ward)',
          defaultValue: 'Kurla West (L Ward)',
          type: 'select',
        },
      ],
    },
    demoUser: {
      id: 'usr-citizen-01',
      name: 'Aarav Sharma',
      email: 'aarav.sharma@mumbai.in',
      phone: '+91 98920 44556',
      designation: 'Resident & Community Volunteer',
      ward: 'Kurla West (L Ward)',
    },
    overview: 'Personalized neighborhood safety, real-time river level status, survival emergency checklist, open relief shelters, and SOS report flooding.',
    portalTab: 'citizen-portal',
    portalName: 'Citizen Safety & SOS Portal',
    permissions: [
      { category: 'Risk & Telemetry', allowed: true, label: 'View Real-time Sensor Grid & River Levels' },
      { category: 'Survival Kit', allowed: true, label: 'Access & Save Flood Survival Checklist' },
      { category: 'Crowd Reporting', allowed: true, label: 'Submit Geotagged Field Flood Photo/Report' },
      { category: 'Shelters & Routes', allowed: true, label: 'View Open Shelters & Safe Evacuation Paths' },
      { category: 'SOS Beacon', allowed: true, label: 'Trigger Personal Emergency SOS Beacon' },
      { category: 'Drone Reconnaissance', allowed: false, label: 'Command Tactical UAV Drone Surveillance' },
      { category: 'Tactical Dispatch', allowed: false, label: 'Dispatch Zodiac Rescue Boats & Fire Units' },
      { category: 'Warning Sirens', allowed: false, label: 'Authorize City-Wide Red Alert Broadcast' },
    ],
  },

  RESPONDER: {
    role: 'RESPONDER',
    title: 'Rescuer Portal',
    shortLabel: 'Rescuer',
    badge: 'TACTICAL FIRST RESPONDER',
    department: 'NDRF 5th Bn / Mumbai Fire Brigade Rescue Taskforce',
    clearanceLevel: 'Field Tactical Operations (Tier 1)',
    clearanceTier: 1,
    colorScheme: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      accent: 'blue',
    },
    loginMethod: {
      type: 'RESCUER_AUTH',
      name: 'Service Badge ID & Tactical VHF Radio Passcode',
      description: 'Official emergency personnel authentication for NDRF battalions, Mumbai Fire Brigade, and Police rescue units.',
      fields: [
        {
          id: 'badgeId',
          label: 'Service Force Badge ID',
          placeholder: 'NDRF-05-8842',
          defaultValue: 'NDRF-05-8842',
          type: 'text',
        },
        {
          id: 'passcode',
          label: 'Tactical Duty Code / Radio PIN',
          placeholder: 'VHF-TAC-99',
          defaultValue: 'VHF-TAC-99',
          type: 'password',
        },
        {
          id: 'station',
          label: 'Assigned Tactical Rescue Post',
          placeholder: 'NDRF Station Kurla Mithi Outpost',
          defaultValue: 'NDRF Station Kurla Mithi Outpost',
          type: 'select',
        },
      ],
    },
    demoUser: {
      id: 'usr-responder-01',
      name: 'Commander Amit Shinde',
      email: 'ndrf.mumbai@ndrf.gov.in',
      phone: '+91 98190 77665',
      designation: 'Tactical Rescue Commander, 5th Battalion',
      station: 'Kurla Mithi River Outpost',
      badgeNumber: 'NDRF-05-8842',
    },
    overview: 'Field operations dashboard for stranded victim rescue dispatches, live drone aerial flood reconnaissance, incident verification, and hospital trauma bed tracking.',
    portalTab: 'responder-portal',
    portalName: 'Rescuer Tactical Operations Hub',
    permissions: [
      { category: 'Risk & Telemetry', allowed: true, label: 'View Real-time Sensor Grid & Hydrograph' },
      { category: 'Crowd Reporting', allowed: true, label: 'Verify & Triage Citizen Incident Reports' },
      { category: 'Drone Reconnaissance', allowed: true, label: 'Connect to Live Tactical Drone Video & Snap Recon Photos' },
      { category: 'Tactical Dispatch', allowed: true, label: 'Deploy Inflatable Rescue Boats & Dewatering Pumps' },
      { category: 'Shelters & Routes', allowed: true, label: 'Track Hospital Trauma Beds & Medical Supply' },
      { category: 'Warning Sirens', allowed: false, label: 'Proclaim State-Level Section 144 Orders' },
    ],
  },

  SUPER_ADMIN: {
    role: 'SUPER_ADMIN',
    title: 'Super Admin Portal',
    shortLabel: 'Super Admin',
    badge: 'APEX EXECUTIVE CLEARANCE',
    department: 'State Disaster Management Authority (SDMA) & Mantralaya Crisis War Room',
    clearanceLevel: 'Apex State Crisis Command (Tier 2)',
    clearanceTier: 2,
    colorScheme: {
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      text: 'text-rose-800',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
      accent: 'rose',
    },
    loginMethod: {
      type: 'SUPERADMIN_AUTH',
      name: 'State Crisis Protocol ID & Cryptographic Key',
      description: 'Highest executive clearance reserved for the State Relief Commissioner, Chief Disaster Secretary, and Municipal Apex Control.',
      fields: [
        {
          id: 'stateAuthId',
          label: 'Executive Government Clearance ID',
          placeholder: 'sec.relief@maharashtra.gov.in',
          defaultValue: 'sec.relief@maharashtra.gov.in',
          type: 'email',
        },
        {
          id: 'crisisKey',
          label: 'State Disaster Protocol Key',
          placeholder: 'MAHA-CRISIS-SEC-01',
          defaultValue: 'MAHA-CRISIS-SEC-01',
          type: 'password',
        },
        {
          id: 'jurisdiction',
          label: 'Apex Command Jurisdiction',
          placeholder: 'Maharashtra State Crisis War Room (Mantralaya)',
          defaultValue: 'Maharashtra State Crisis War Room (Mantralaya)',
          type: 'select',
        },
      ],
    },
    demoUser: {
      id: 'usr-superadmin-01',
      name: 'Chief Sec. Sunita Rao (IAS)',
      email: 'superadmin@pehra.gov.in',
      phone: '+91 98200 99887',
      designation: 'State Relief Commissioner & Additional Chief Secretary',
      badgeNumber: 'SDMA-MAHA-001',
    },
    overview: 'Inter-district emergency coordination across MMR, armed forces airlift authorization, multi-drone fleet monitoring, floodgate actuation, and municipal red alert sirens.',
    portalTab: 'super-admin-portal',
    portalName: 'SDMA State Crisis War Room',
    permissions: [
      { category: 'Risk & Telemetry', allowed: true, label: 'State-Wide Inter-District Hydro-Grid Access' },
      { category: 'Crowd Reporting', allowed: true, label: 'Access Unfiltered State Intelligence Reports' },
      { category: 'Drone Reconnaissance', allowed: true, label: 'Full City-Wide Drone Fleet Management & Live Ingress' },
      { category: 'Tactical Dispatch', allowed: true, label: 'Request Indian Navy & Air Force Sorties' },
      { category: 'Warning Sirens', allowed: true, label: 'Broadcast Red Warning Sirens & Evacuation Mandates' },
      { category: 'Equipment Actuation', allowed: true, label: 'Command Sluice Floodgates & Arabian Sea Outfalls' },
    ],
  },
};

export const PERMISSION_MATRIX_ROWS = [
  {
    capability: 'Hyperlocal Risk & Telemetry Monitoring',
    description: 'View real-time rainfall, river cross-sections, and flood-prone polygons',
    CITIZEN: true,
    RESPONDER: true,
    AUTHORITY: true,
    ADMIN: true,
    SUPER_ADMIN: true,
  },
  {
    capability: 'Submit Geotagged Field Hazard Photo',
    description: 'Report local waterlogging with GPS coordinates and depth category',
    CITIZEN: true,
    RESPONDER: true,
    AUTHORITY: true,
    ADMIN: true,
    SUPER_ADMIN: true,
  },
  {
    capability: 'Survival Emergency Checklist',
    description: 'Access, pack, and persist survival go-bag essentials offline',
    CITIZEN: true,
    RESPONDER: true,
    AUTHORITY: true,
    ADMIN: true,
    SUPER_ADMIN: true,
  },
  {
    capability: 'Verify & Triage Crowd Incident Reports',
    description: 'Confirm citizen reports to update system ground-truth verification scores',
    CITIZEN: false,
    RESPONDER: true,
    AUTHORITY: true,
    ADMIN: true,
    SUPER_ADMIN: true,
  },
  {
    capability: 'Live Tactical Drone Reconnaissance',
    description: 'Control drone pan/tilt/zoom and capture orthomosaic flood frames',
    CITIZEN: false,
    RESPONDER: true,
    AUTHORITY: true,
    ADMIN: true,
    SUPER_ADMIN: true,
  },
  {
    capability: 'Acknowledge Emergency Rescue Dispatch',
    description: 'Dispatch boats, triage stranded citizens, and update field situation',
    CITIZEN: false,
    RESPONDER: true,
    AUTHORITY: true,
    ADMIN: true,
    SUPER_ADMIN: true,
  },
  {
    capability: 'Issue Staged Warning & Red Alerts',
    description: 'Broadcast multi-channel SMS/Push sirens across municipal wards',
    CITIZEN: false,
    RESPONDER: false,
    AUTHORITY: true,
    ADMIN: false,
    SUPER_ADMIN: true,
  },
  {
    capability: 'Mithi River Sluice Gate Actuation',
    description: 'Command Mahim Causeway, Cleave Bunder and Love Grove outfall pumps',
    CITIZEN: false,
    RESPONDER: false,
    AUTHORITY: true,
    ADMIN: true,
    SUPER_ADMIN: true,
  },
];
