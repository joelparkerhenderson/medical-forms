export interface AssessmentRow {
  id: string;
  date: string;
  patient: string;
  nhs: string;
  procedure: string;
  urgency: 'elective' | 'urgent' | 'emergency' | 'immediate';
  asa: 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';
  composite: 'low' | 'moderate' | 'high' | 'critical';
  rcri: number;
  stopbang: number;
  cfs: number | null;
  flags: string[];
  clinician: string;
}

export const SAMPLE_ASSESSMENTS: AssessmentRow[] = [
  {
    id: 'A001',
    date: '2026-04-20',
    patient: 'Alice Smith',
    nhs: '123 456 7890',
    procedure: 'Right hip arthroplasty',
    urgency: 'elective',
    asa: 'III',
    composite: 'high',
    rcri: 2,
    stopbang: 4,
    cfs: 5,
    flags: ['difficult-airway', 'severe-cardiac'],
    clinician: 'Dr B Adams',
  },
  {
    id: 'A002',
    date: '2026-04-20',
    patient: 'Bob Jones',
    nhs: '234 567 8901',
    procedure: 'Laparoscopic cholecystectomy',
    urgency: 'elective',
    asa: 'II',
    composite: 'moderate',
    rcri: 0,
    stopbang: 3,
    cfs: 3,
    flags: [],
    clinician: 'Dr C Patel',
  },
  {
    id: 'A003',
    date: '2026-04-21',
    patient: 'Carol Lee',
    nhs: '345 678 9012',
    procedure: 'Dynamic hip screw',
    urgency: 'emergency',
    asa: 'IV',
    composite: 'critical',
    rcri: 3,
    stopbang: 5,
    cfs: 7,
    flags: ['severe-frailty', 'severe-cardiac', 'fasting-violation'],
    clinician: 'Dr D Williams',
  },
  {
    id: 'A004',
    date: '2026-04-21',
    patient: 'David Brown',
    nhs: '456 789 0123',
    procedure: 'Inguinal hernia repair',
    urgency: 'elective',
    asa: 'I',
    composite: 'low',
    rcri: 0,
    stopbang: 1,
    cfs: null,
    flags: [],
    clinician: 'Dr E Khan',
  },
];
