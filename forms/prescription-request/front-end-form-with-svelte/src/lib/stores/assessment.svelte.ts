import type { AssessmentData, GradingResult } from '$lib/engine/types';

function createDefaultAssessment(): AssessmentData {
  return {
    patientInformation: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      nhsNumber: ''
    },
    clinicianInformation: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      nhsEmployeeNumber: ''
    },
    prescriptionDetails: {
      requestDate: '',
      medicationName: '',
      dosage: '',
      frequency: '',
      routeOfAdministration: '',
      treatmentInstructions: ''
    },
    substitutionOptions: {
      allowBrandSubstitution: '',
      allowGenericSubstitution: '',
      allowDosageAdjustment: '',
      substitutionNotes: ''
    },
    requestType: {
      isNewPrescription: '',
      isEmergency: '',
      additionalNotes: ''
    }
  };
}

class AssessmentStore {
  data = $state<AssessmentData>(createDefaultAssessment());
  result = $state<GradingResult | null>(null);

  reset() {
    this.data = createDefaultAssessment();
    this.result = null;
  }
}

export const assessment = new AssessmentStore();
