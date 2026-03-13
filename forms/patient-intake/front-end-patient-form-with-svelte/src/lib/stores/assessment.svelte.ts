import type { AssessmentData, GradingResult } from '$lib/engine/types';

function createDefaultAssessment(): AssessmentData {
	return {
		personalInformation: {
			fullName: '',
			dateOfBirth: '',
			sex: '',
			addressLine1: '',
			addressLine2: '',
			city: '',
			postcode: '',
			phone: '',
			email: '',
			emergencyContactName: '',
			emergencyContactPhone: '',
			emergencyContactRelationship: ''
		},
		insuranceAndId: {
			insuranceProvider: '',
			policyNumber: '',
			nhsNumber: '',
			gpName: '',
			gpPracticeName: '',
			gpPhone: ''
		},
		reasonForVisit: {
			primaryReason: '',
			urgencyLevel: '',
			referringProvider: '',
			symptomDuration: '',
			additionalDetails: ''
		},
		medicalHistory: {
			chronicConditions: [],
			previousSurgeries: '',
			previousHospitalizations: '',
			ongoingTreatments: ''
		},
		medications: [],
		allergies: [],
		familyHistory: {
			heartDisease: '',
			heartDiseaseDetails: '',
			cancer: '',
			cancerDetails: '',
			diabetes: '',
			diabetesDetails: '',
			stroke: '',
			strokeDetails: '',
			mentalIllness: '',
			mentalIllnessDetails: '',
			geneticConditions: '',
			geneticConditionsDetails: ''
		},
		socialHistory: {
			smokingStatus: '',
			smokingPackYears: null,
			alcoholFrequency: '',
			alcoholUnitsPerWeek: null,
			drugUse: '',
			drugDetails: '',
			occupation: '',
			exerciseFrequency: '',
			dietQuality: ''
		},
		reviewOfSystems: {
			constitutional: '',
			heent: '',
			cardiovascular: '',
			respiratory: '',
			gastrointestinal: '',
			genitourinary: '',
			musculoskeletal: '',
			neurological: '',
			psychiatric: '',
			skin: ''
		},
		consentAndPreferences: {
			consentToTreatment: '',
			privacyAcknowledgement: '',
			communicationPreference: '',
			advanceDirectives: '',
			advanceDirectiveDetails: ''
		}
	};
}

class AssessmentStore {
	data = $state<AssessmentData>(createDefaultAssessment());
	result = $state<GradingResult | null>(null);
	currentStep = $state(1);

	reset() {
		this.data = createDefaultAssessment();
		this.result = null;
		this.currentStep = 1;
	}
}

export const assessment = new AssessmentStore();
