import type { PrescriptionRule } from './types';

/**
 * Declarative priority classification rules for prescription requests.
 * Priority is determined by the highest-level rule that fires.
 * Routine is the default when no rules fire.
 */
export const prescriptionRules: PrescriptionRule[] = [
  // ─── EMERGENCY ────────────────────────────────────────
  {
    id: 'RX-EM-001',
    category: 'Emergency',
    description: 'Emergency prescription request',
    priorityLevel: 'emergency',
    evaluate: (d) => d.requestType.isEmergency === 'yes'
  },

  // ─── SUBSTITUTION RESTRICTIONS ────────────────────────
  {
    id: 'RX-SUB-001',
    category: 'Substitution',
    description: 'No brand substitution allowed',
    priorityLevel: 'urgent',
    evaluate: (d) => d.substitutionOptions.allowBrandSubstitution === 'no'
  },
  {
    id: 'RX-SUB-002',
    category: 'Substitution',
    description: 'No generic substitution allowed',
    priorityLevel: 'urgent',
    evaluate: (d) => d.substitutionOptions.allowGenericSubstitution === 'no'
  },
  {
    id: 'RX-SUB-003',
    category: 'Substitution',
    description: 'No dosage adjustment allowed',
    priorityLevel: 'urgent',
    evaluate: (d) => d.substitutionOptions.allowDosageAdjustment === 'no'
  },

  // ─── COMPLETENESS ────────────────────────────────────
  {
    id: 'RX-CMP-001',
    category: 'Completeness',
    description: 'Clinician contact information missing',
    priorityLevel: 'urgent',
    evaluate: (d) =>
      d.clinicianInformation.phone.trim() === '' &&
      d.clinicianInformation.email.trim() === ''
  },
  {
    id: 'RX-CMP-002',
    category: 'Completeness',
    description: 'Patient contact information missing',
    priorityLevel: 'urgent',
    evaluate: (d) =>
      d.patientInformation.phone.trim() === '' &&
      d.patientInformation.email.trim() === ''
  },
  {
    id: 'RX-CMP-003',
    category: 'Completeness',
    description: 'Medication name not provided',
    priorityLevel: 'urgent',
    evaluate: (d) => d.prescriptionDetails.medicationName.trim() === ''
  },
  {
    id: 'RX-CMP-004',
    category: 'Completeness',
    description: 'Dosage not specified',
    priorityLevel: 'urgent',
    evaluate: (d) => d.prescriptionDetails.dosage.trim() === ''
  },

  // ─── REQUEST TYPE ─────────────────────────────────────
  {
    id: 'RX-NEW-001',
    category: 'Request Type',
    description: 'New prescription (not a refill)',
    priorityLevel: 'routine',
    evaluate: (d) => d.requestType.isNewPrescription === 'yes'
  }
];
