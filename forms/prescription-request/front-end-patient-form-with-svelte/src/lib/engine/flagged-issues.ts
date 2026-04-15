import type { AssessmentData, AdditionalFlag } from './types';

/**
 * Detects additional flags for clinician review,
 * independent of priority level.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
  const flags: AdditionalFlag[] = [];

  // ─── Emergency with incomplete info ───────────────────
  if (
    data.requestType.isEmergency === 'yes' &&
    (data.clinicianInformation.phone.trim() === '' ||
      data.patientInformation.phone.trim() === '')
  ) {
    flags.push({
      id: 'FLAG-EMERG-INCOMPLETE',
      category: 'Emergency',
      message: 'Emergency request with incomplete contact details - verify urgently',
      priority: 'high'
    });
  }

  // ─── No substitutions allowed ─────────────────────────
  if (
    data.substitutionOptions.allowBrandSubstitution === 'no' &&
    data.substitutionOptions.allowGenericSubstitution === 'no' &&
    data.substitutionOptions.allowDosageAdjustment === 'no'
  ) {
    flags.push({
      id: 'FLAG-NOSUB-001',
      category: 'Substitution',
      message: 'No substitutions permitted - exact medication required',
      priority: 'high'
    });
  }

  // ─── Missing medication name ──────────────────────────
  if (data.prescriptionDetails.medicationName.trim() === '') {
    flags.push({
      id: 'FLAG-MED-001',
      category: 'Completeness',
      message: 'Medication name not provided',
      priority: 'high'
    });
  }

  // ─── Missing dosage ───────────────────────────────────
  if (data.prescriptionDetails.dosage.trim() === '') {
    flags.push({
      id: 'FLAG-DOSE-001',
      category: 'Completeness',
      message: 'Dosage not specified',
      priority: 'high'
    });
  }

  // ─── Missing clinician ID ────────────────────────────
  if (data.clinicianInformation.nhsEmployeeNumber.trim() === '') {
    flags.push({
      id: 'FLAG-CLIN-001',
      category: 'Administrative',
      message: 'Clinician NHS employee number not provided',
      priority: 'medium'
    });
  }

  // ─── Missing patient ID ──────────────────────────────
  if (data.patientInformation.nhsNumber.trim() === '') {
    flags.push({
      id: 'FLAG-PAT-001',
      category: 'Administrative',
      message: 'Patient NHS number not provided',
      priority: 'medium'
    });
  }

  // ─── Missing treatment instructions ───────────────────
  if (data.prescriptionDetails.treatmentInstructions.trim() === '') {
    flags.push({
      id: 'FLAG-INSTR-001',
      category: 'Completeness',
      message: 'Treatment instructions not provided',
      priority: 'low'
    });
  }

  // ─── Refill without date ──────────────────────────────
  if (
    data.requestType.isNewPrescription === 'no' &&
    data.prescriptionDetails.requestDate === ''
  ) {
    flags.push({
      id: 'FLAG-REFILL-001',
      category: 'Completeness',
      message: 'Refill request without a request date',
      priority: 'medium'
    });
  }

  // Sort: high > medium > low
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return flags;
}
