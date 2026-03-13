import type { AssessmentData, GradingResult } from '$lib/engine/types';

function createDefaultAssessment(): AssessmentData {
	return {
		demographics: {
			firstName: '',
			lastName: '',
			dateOfBirth: '',
			sex: '',
			emergencyContactName: '',
			emergencyContactPhone: '',
			emergencyContactRelationship: ''
		},
		phqResponses: {
			interest: null,
			depression: null,
			sleep: null,
			energy: null,
			appetite: null,
			selfEsteem: null,
			concentration: null,
			psychomotor: null,
			suicidalThoughts: null
		},
		gadResponses: {
			nervousness: null,
			uncontrollableWorry: null,
			excessiveWorry: null,
			troubleRelaxing: null,
			restlessness: null,
			irritability: null,
			fearfulness: null
		},
		moodAffect: {
			currentMood: '',
			sleepQuality: '',
			appetiteChanges: '',
			energyLevel: '',
			concentration: ''
		},
		riskAssessment: {
			suicidalIdeation: '',
			suicidalIdeationDetails: '',
			selfHarm: '',
			selfHarmDetails: '',
			harmToOthers: '',
			harmToOthersDetails: '',
			hasSafetyPlan: '',
			safetyPlanDetails: ''
		},
		substanceUse: {
			alcoholFrequency: '',
			alcoholQuantity: '',
			bingeDrinking: '',
			drugUse: '',
			drugDetails: '',
			tobaccoUse: '',
			tobaccoDetails: ''
		},
		currentMedications: {
			psychiatricMedications: [],
			otherMedications: []
		},
		treatmentHistory: {
			previousTherapy: '',
			therapyDetails: '',
			previousHospitalizations: '',
			hospitalizationDetails: '',
			currentProviders: ''
		},
		socialFunctional: {
			employmentStatus: '',
			relationshipStatus: '',
			housingStatus: '',
			supportSystem: '',
			functionalImpairment: '',
			additionalNotes: ''
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
