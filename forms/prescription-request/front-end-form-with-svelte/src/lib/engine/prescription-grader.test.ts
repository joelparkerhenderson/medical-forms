import { describe, it, expect } from 'vitest';
import { calculatePriorityLevel } from './prescription-grader';
import { detectAdditionalFlags } from './flagged-issues';
import { prescriptionRules } from './prescription-rules';
import type { AssessmentData } from './types';

function createRoutineRequest(): AssessmentData {
  return {
    patientInformation: {
      firstName: 'Jane',
      lastName: 'Doe',
      phone: '07700 900000',
      email: 'jane@example.com',
      nhsNumber: '943 476 5919'
    },
    clinicianInformation: {
      firstName: 'Dr',
      lastName: 'Smith',
      phone: '020 7946 0958',
      email: 'dr.smith@nhs.net',
      nhsEmployeeNumber: 'C1234567'
    },
    prescriptionDetails: {
      requestDate: '2026-04-15',
      medicationName: 'Amoxicillin',
      dosage: '500mg',
      frequency: 'TDS',
      routeOfAdministration: 'oral',
      treatmentInstructions: 'Take with food, complete full course'
    },
    substitutionOptions: {
      allowBrandSubstitution: 'yes',
      allowGenericSubstitution: 'yes',
      allowDosageAdjustment: 'yes',
      substitutionNotes: ''
    },
    requestType: {
      isNewPrescription: 'yes',
      isEmergency: 'no',
      additionalNotes: ''
    }
  };
}

describe('Prescription Priority Classification Engine', () => {
  it('returns Routine priority for a standard prescription request', () => {
    const data = createRoutineRequest();
    const result = calculatePriorityLevel(data);
    expect(result.priorityLevel).toBe('routine');
  });

  it('returns Emergency priority when emergency flag is set', () => {
    const data = createRoutineRequest();
    data.requestType.isEmergency = 'yes';
    const result = calculatePriorityLevel(data);
    expect(result.priorityLevel).toBe('emergency');
  });

  it('returns Urgent priority when no substitutions are allowed', () => {
    const data = createRoutineRequest();
    data.substitutionOptions.allowBrandSubstitution = 'no';
    data.substitutionOptions.allowGenericSubstitution = 'no';
    const result = calculatePriorityLevel(data);
    expect(result.priorityLevel).toBe('urgent');
  });

  it('returns Urgent priority when clinician contact is missing', () => {
    const data = createRoutineRequest();
    data.clinicianInformation.phone = '';
    data.clinicianInformation.email = '';
    const result = calculatePriorityLevel(data);
    expect(result.priorityLevel).toBe('urgent');
  });

  it('returns Urgent priority when medication name is missing', () => {
    const data = createRoutineRequest();
    data.prescriptionDetails.medicationName = '';
    const result = calculatePriorityLevel(data);
    expect(result.priorityLevel).toBe('urgent');
  });

  it('detects all rule IDs are unique', () => {
    const ids = prescriptionRules.map((r) => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe('Additional Flags Detection', () => {
  it('returns no flags for a complete routine request', () => {
    const data = createRoutineRequest();
    const flags = detectAdditionalFlags(data);
    expect(flags).toHaveLength(0);
  });

  it('flags emergency with incomplete contact', () => {
    const data = createRoutineRequest();
    data.requestType.isEmergency = 'yes';
    data.patientInformation.phone = '';
    const flags = detectAdditionalFlags(data);
    expect(flags.some((f) => f.id === 'FLAG-EMERG-INCOMPLETE')).toBe(true);
  });

  it('flags no substitutions permitted', () => {
    const data = createRoutineRequest();
    data.substitutionOptions.allowBrandSubstitution = 'no';
    data.substitutionOptions.allowGenericSubstitution = 'no';
    data.substitutionOptions.allowDosageAdjustment = 'no';
    const flags = detectAdditionalFlags(data);
    expect(flags.some((f) => f.id === 'FLAG-NOSUB-001')).toBe(true);
  });

  it('flags missing medication name', () => {
    const data = createRoutineRequest();
    data.prescriptionDetails.medicationName = '';
    const flags = detectAdditionalFlags(data);
    expect(flags.some((f) => f.id === 'FLAG-MED-001')).toBe(true);
  });

  it('flags missing clinician NHS employee number', () => {
    const data = createRoutineRequest();
    data.clinicianInformation.nhsEmployeeNumber = '';
    const flags = detectAdditionalFlags(data);
    expect(flags.some((f) => f.id === 'FLAG-CLIN-001')).toBe(true);
  });

  it('flags refill without date', () => {
    const data = createRoutineRequest();
    data.requestType.isNewPrescription = 'no';
    data.prescriptionDetails.requestDate = '';
    const flags = detectAdditionalFlags(data);
    expect(flags.some((f) => f.id === 'FLAG-REFILL-001')).toBe(true);
  });

  it('sorts flags by priority (high first)', () => {
    const data = createRoutineRequest();
    data.prescriptionDetails.medicationName = '';
    data.clinicianInformation.nhsEmployeeNumber = '';
    data.prescriptionDetails.treatmentInstructions = '';
    const flags = detectAdditionalFlags(data);
    const priorities = flags.map((f) => f.priority);
    const sortedPriorities = [...priorities].sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a] - order[b];
    });
    expect(priorities).toEqual(sortedPriorities);
  });
});
