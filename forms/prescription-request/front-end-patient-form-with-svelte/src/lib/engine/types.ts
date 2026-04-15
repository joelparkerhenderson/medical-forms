// ──────────────────────────────────────────────
// Core prescription request data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type PriorityLevel = 'routine' | 'urgent' | 'emergency';
export type RouteOfAdministration =
  | 'oral'
  | 'topical'
  | 'intravenous'
  | 'intramuscular'
  | 'subcutaneous'
  | 'inhaled'
  | 'rectal'
  | 'sublingual'
  | 'transdermal'
  | 'other'
  | '';

export interface PatientInformation {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  nhsNumber: string;
}

export interface ClinicianInformation {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  nhsEmployeeNumber: string;
}

export interface PrescriptionDetails {
  requestDate: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  routeOfAdministration: RouteOfAdministration;
  treatmentInstructions: string;
}

export interface SubstitutionOptions {
  allowBrandSubstitution: YesNo;
  allowGenericSubstitution: YesNo;
  allowDosageAdjustment: YesNo;
  substitutionNotes: string;
}

export interface RequestType {
  isNewPrescription: YesNo;
  isEmergency: YesNo;
  additionalNotes: string;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
  patientInformation: PatientInformation;
  clinicianInformation: ClinicianInformation;
  prescriptionDetails: PrescriptionDetails;
  substitutionOptions: SubstitutionOptions;
  requestType: RequestType;
}

// ──────────────────────────────────────────────
// Priority classification types
// ──────────────────────────────────────────────

export interface PrescriptionRule {
  id: string;
  category: string;
  description: string;
  priorityLevel: PriorityLevel;
  evaluate: (data: AssessmentData) => boolean;
}

export interface FiredRule {
  id: string;
  category: string;
  description: string;
  priorityLevel: PriorityLevel;
}

export interface AdditionalFlag {
  id: string;
  category: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
}

export interface GradingResult {
  priorityLevel: PriorityLevel;
  firedRules: FiredRule[];
  additionalFlags: AdditionalFlag[];
  timestamp: string;
}
