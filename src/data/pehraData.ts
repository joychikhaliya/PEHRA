// Domain models and data for Pehra Mobile Application

export interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'CHECKPOINT' | 'INCIDENT' | 'SAFETY' | 'VISITOR' | 'ROUTINE';
  status: 'Completed' | 'Pending' | 'In Review' | 'Resolved' | 'Flagged';
  time: string;
  date: string;
  author: string;
  location: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface UpcomingItem {
  id: string;
  title: string;
  location: string;
  date: string;
  time: string;
  assignedTo: string;
  type: 'Patrol Round' | 'Maintenance Review' | 'Gate Check' | 'Resident Briefing';
}

export interface Checkpoint {
  id: string;
  name: string;
  sequence: number;
  location: string;
  scheduledTime: string;
  completedTime?: string;
  status: 'completed' | 'current' | 'pending';
  notes?: string;
}

export interface PehraNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  category: 'security' | 'schedule' | 'system' | 'report';
}

export interface UserProfile {
  name: string;
  title: string;
  email: string;
  phone: string;
  badgeId: string;
  sector: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export const INITIAL_USER: UserProfile = {
  name: 'Arjun Mehta',
  title: 'Community Vigilance Officer',
  email: 'arjun.mehta@pehra.org',
  phone: '+91 98201 44521',
  badgeId: 'PH-8842',
  sector: 'Sector 4 — Bandra West (MMR)',
  emergencyContact: {
    name: 'Pooja Mehta',
    relationship: 'Spouse',
    phone: '+91 98201 44599',
  },
};

export const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'ACT-101',
    title: 'North Perimeter Gate Check-in',
    subtitle: 'NFC scan verified · 4 access logs confirmed',
    category: 'CHECKPOINT',
    status: 'Completed',
    time: '18:40',
    date: 'Today',
    author: 'Arjun Mehta',
    location: 'North Gate, Sector 4',
    description: 'Conducted standard evening perimeter sweep. Security barrier functioning normally. High-tide drain outlet clean.',
    priority: 'low',
  },
  {
    id: 'ACT-102',
    title: 'Drainage Water Accumulation Logged',
    subtitle: '12cm surface water near Station Road Culvert',
    category: 'INCIDENT',
    status: 'In Review',
    time: '17:15',
    date: 'Today',
    author: 'Kavita Roy',
    location: 'Station Road Culvert',
    description: 'Minor backflow observed due to high tide sluice gate closure. Forwarded note to MCGM Ward H-West engineering cell.',
    priority: 'medium',
  },
  {
    id: 'ACT-103',
    title: 'Flood Sensor Station #09 Calibration',
    subtitle: 'Ultrasonic telemetry aligned with datum line',
    category: 'ROUTINE',
    status: 'Resolved',
    time: '15:20',
    date: 'Today',
    author: 'Rajesh Nair',
    location: 'Mithi River Gauge #09',
    description: 'Replaced backup battery cell and verified telemetry sync interval. Readings matched manual staff gauge.',
    priority: 'low',
  },
  {
    id: 'ACT-104',
    title: 'Power Backup Circuit Inspection',
    subtitle: 'Generator 2 fuel level 94% · test ignition passed',
    category: 'SAFETY',
    status: 'Completed',
    time: '13:05',
    date: 'Today',
    author: 'Arjun Mehta',
    location: 'Substation B Basement',
    description: 'Emergency sump pumps switched to generator circuit test for 10 minutes. Operational readiness verified.',
    priority: 'low',
  },
  {
    id: 'ACT-105',
    title: 'Blocked Alleyway Drain Cleared',
    subtitle: 'Plastic obstruction removed before monsoon surge',
    category: 'INCIDENT',
    status: 'Resolved',
    time: '09:40',
    date: 'Yesterday',
    author: 'Vikram Solanki',
    location: 'Bazaar Lane 3',
    description: 'Sanitation team notified and debris disposed of. Flow restored to main stormwater conduit.',
    priority: 'medium',
  },
  {
    id: 'ACT-106',
    title: 'Emergency Evacuation Stairwell Inspection',
    subtitle: 'Clear passage confirmed on Floors 1 through 5',
    category: 'SAFETY',
    status: 'Completed',
    time: '19:10',
    date: 'Yesterday',
    author: 'Kavita Roy',
    location: 'Community Shelter Tower A',
    description: 'All fire and flood barrier doors unlocked from interior. Emergency glow signage intact.',
    priority: 'low',
  },
];

export const INITIAL_UPCOMING: UpcomingItem[] = [
  {
    id: 'UP-201',
    title: 'Night Perimeter Round (Shift B)',
    location: 'Sector 4 Outer Boundary & Sluice Gates',
    date: 'Today',
    time: '21:00',
    assignedTo: 'Arjun Mehta',
    type: 'Patrol Round',
  },
  {
    id: 'UP-202',
    title: 'Ward Disaster Committee Sync',
    location: 'Ward H-West Disaster Management Office',
    date: 'Tomorrow',
    time: '10:30',
    assignedTo: 'Lead Officers',
    type: 'Resident Briefing',
  },
  {
    id: 'UP-203',
    title: 'Backup Radio Communication Check',
    location: 'VHF Repeater Station Hilltop',
    date: 'Tomorrow',
    time: '16:00',
    assignedTo: 'Rajesh Nair',
    type: 'Maintenance Review',
  },
];

export const INITIAL_CHECKPOINTS: Checkpoint[] = [
  {
    id: 'CP-1',
    name: 'South Stormwater Sump & Pump #1',
    sequence: 1,
    location: 'Sector 4 South Boundary',
    scheduledTime: '18:00',
    completedTime: '18:04',
    status: 'completed',
    notes: 'Pump level normal. Power draw within 14.2A tolerance.',
  },
  {
    id: 'CP-2',
    name: 'Main Bazaar Culvert & Drain Screen',
    sequence: 2,
    location: 'Bazaar Road Cross-Junction',
    scheduledTime: '18:25',
    completedTime: '18:31',
    status: 'completed',
    notes: 'Trash screen cleared of debris. Water velocity 0.4 m/s.',
  },
  {
    id: 'CP-3',
    name: 'North Perimeter Gate & Access Point',
    sequence: 3,
    location: 'North Gate Road',
    scheduledTime: '18:45',
    completedTime: '18:42',
    status: 'completed',
    notes: 'Security barrier operational. 4 visitor tags verified.',
  },
  {
    id: 'CP-4',
    name: 'River Inflow Marker #04',
    sequence: 4,
    location: 'Mithi Riverbank Wall',
    scheduledTime: '19:15',
    status: 'current',
    notes: 'Water level indicator reading 2.8m (Warning mark at 3.3m).',
  },
  {
    id: 'CP-5',
    name: 'Community Relief Shelter Entrance',
    sequence: 5,
    location: 'Municipal School Ground Floor',
    scheduledTime: '19:45',
    status: 'pending',
    notes: 'Check backup battery lamps and drinking water storage tank.',
  },
  {
    id: 'CP-6',
    name: 'Substation Transformer Flood Berm',
    sequence: 6,
    location: 'Sector 4 Power Substation',
    scheduledTime: '20:15',
    status: 'pending',
    notes: 'Ensure sandbag perimeter intact against runoff.',
  },
];

export const INITIAL_NOTIFICATIONS: PehraNotification[] = [
  {
    id: 'NOTIF-1',
    title: 'High Tide Warning at 19:42 IST',
    description: 'Arabian Sea tide peaking at 4.45m. Sluice gate #3 automatic closure initiated.',
    time: '28m ago',
    read: false,
    category: 'security',
  },
  {
    id: 'NOTIF-2',
    title: 'Observation report #ACT-102 reviewed',
    description: 'Ward engineering team dispatched maintenance unit to Station Road Culvert.',
    time: '1h ago',
    read: false,
    category: 'report',
  },
  {
    id: 'NOTIF-3',
    title: 'Shift Handover Scheduled',
    description: 'Evening round roster with Vikram Solanki confirmed for 21:00.',
    time: '3h ago',
    read: true,
    category: 'schedule',
  },
  {
    id: 'NOTIF-4',
    title: 'Weekly Telemetry Audit Complete',
    description: 'All 8 environmental telemetry nodes operating with zero packet loss.',
    time: 'Yesterday',
    read: true,
    category: 'system',
  },
];
