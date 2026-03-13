/**
 * Creates a default empty assessment data object.
 * Matches the TypeScript AssessmentData interface exactly.
 */
export function createDefaultAssessment() {
  return {
    patientInformation: {
      fullName: '',
      dateOfBirth: '',
      nhsNumber: '',
      address: '',
      postcode: '',
      telephone: '',
      email: '',
      gpName: '',
      gpPractice: ''
    },
    demographicsEthnicity: {
      age: null,
      sex: '',
      ethnicity: '',
      townsendDeprivation: null
    },
    bloodPressure: {
      systolicBP: null,
      systolicBPSD: null,
      diastolicBP: null,
      onBPTreatment: '',
      numberOfBPMedications: null
    },
    cholesterol: {
      totalCholesterol: null,
      hdlCholesterol: null,
      totalHDLRatio: null,
      onStatin: ''
    },
    medicalConditions: {
      hasDiabetes: '',
      hasAtrialFibrillation: '',
      hasRheumatoidArthritis: '',
      hasChronicKidneyDisease: '',
      hasMigraine: '',
      hasSevereMentalIllness: '',
      hasErectileDysfunction: '',
      onAtypicalAntipsychotic: '',
      onCorticosteroids: ''
    },
    familyHistory: {
      familyCVDUnder60: '',
      familyCVDRelationship: '',
      familyDiabetesHistory: ''
    },
    smokingAlcohol: {
      smokingStatus: '',
      cigarettesPerDay: null,
      yearsSinceQuit: null,
      alcoholUnitsPerWeek: null,
      alcoholFrequency: ''
    },
    physicalActivityDiet: {
      physicalActivityMinutesPerWeek: null,
      activityIntensity: '',
      fruitVegPortionsPerDay: null,
      dietQuality: '',
      saltIntake: ''
    },
    bodyMeasurements: {
      heightCm: null,
      weightKg: null,
      bmi: null,
      waistCircumferenceCm: null
    },
    reviewCalculate: {
      clinicianName: '',
      reviewDate: '',
      clinicalNotes: '',
      auditScore: null
    }
  };
}
