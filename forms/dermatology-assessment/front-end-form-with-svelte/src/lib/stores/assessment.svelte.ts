import type { AssessmentData, GradingResult } from '$lib/engine/types';

function createDefaultAssessment(): AssessmentData {
	return {
		demographics: {
			firstName: '',
			lastName: '',
			dateOfBirth: '',
			sex: '',
			skinType: ''
		},
		chiefComplaint: {
			primaryConcern: '',
			duration: '',
			location: '',
			progression: '',
			previousTreatments: ''
		},
		dlqiQuestionnaire: {
			q1: null, q2: null, q3: null, q4: null, q5: null,
			q6: null, q7: null, q8: null, q9: null, q10: null
		},
		lesionCharacteristics: {
			type: '',
			color: '',
			border: '',
			sizeMillimeters: null,
			distribution: '',
			number: '',
			surface: ''
		},
		medicalHistory: {
			previousSkinConditions: '',
			autoimmuneDiseases: '',
			autoimmuneDiseaseDetails: '',
			immunosuppression: '',
			immunosuppressionDetails: '',
			cancerHistory: '',
			cancerHistoryDetails: ''
		},
		currentMedications: {
			topicals: [],
			systemics: [],
			biologics: [],
			otcProducts: ''
		},
		allergies: {
			drugAllergies: [],
			contactAllergies: '',
			latexAllergy: ''
		},
		familyHistory: {
			psoriasis: '',
			eczema: '',
			melanoma: '',
			skinCancer: '',
			autoimmune: '',
			otherDetails: ''
		},
		socialHistory: {
			sunExposure: '',
			tanningHistory: '',
			occupation: '',
			cosmeticsUse: ''
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
