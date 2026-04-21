/**
 * Creates a default empty assessment data object.
 * Matches the TypeScript AssessmentData interface exactly.
 */
export function createDefaultAssessment() {
  return {
    patientInformation: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      sex: '',
      address: '',
      phone: '',
      email: '',
      nhsNumber: '',
      gpName: '',
      gpPractice: ''
    },
    authorizedRecipient: {
      recipientName: '',
      recipientOrganization: '',
      recipientAddress: '',
      recipientPhone: '',
      recipientEmail: '',
      recipientRole: ''
    },
    recordsToRelease: {
      recordTypes: [],
      specificDateRange: '',
      dateFrom: '',
      dateTo: '',
      specificRecordDetails: ''
    },
    purposeOfRelease: {
      purpose: '',
      otherDetails: ''
    },
    authorizationPeriod: {
      startDate: '',
      endDate: '',
      singleUse: ''
    },
    restrictionsLimitations: {
      excludeHIV: '',
      excludeSubstanceAbuse: '',
      excludeMentalHealth: '',
      excludeGeneticInfo: '',
      excludeSTI: '',
      additionalRestrictions: ''
    },
    patientRights: {
      acknowledgedRightToRevoke: '',
      acknowledgedNoChargeForAccess: '',
      acknowledgedDataProtection: ''
    },
    signatureConsent: {
      patientSignatureConfirmed: '',
      signatureDate: '',
      witnessName: '',
      witnessSignatureConfirmed: '',
      witnessDate: '',
      parentGuardianName: ''
    }
  };
}
