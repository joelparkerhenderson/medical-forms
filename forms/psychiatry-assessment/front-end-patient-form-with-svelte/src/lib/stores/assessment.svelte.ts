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
			legalStatus: ''
		},
		presentingComplaint: {
			chiefComplaint: '',
			onsetDate: '',
			duration: '',
			severity: '',
			precipitatingFactors: ''
		},
		psychiatricHistory: {
			previousDiagnoses: '',
			previousHospitalizations: '',
			hospitalizationDetails: '',
			previousSuicideAttempts: '',
			suicideAttemptDetails: '',
			selfHarmHistory: '',
			selfHarmDetails: ''
		},
		mentalStatusExam: {
			appearance: '',
			behaviour: '',
			speech: '',
			mood: '',
			affect: '',
			thoughtProcess: '',
			thoughtContent: '',
			perceptualDisturbances: '',
			perceptualDetails: '',
			cognitionIntact: '',
			cognitionDetails: '',
			insight: '',
			judgement: ''
		},
		riskAssessment: {
			suicidalIdeation: '',
			suicidalPlan: '',
			suicidalIntent: '',
			suicidalMeans: '',
			protectiveFactors: '',
			selfHarmCurrent: '',
			violenceRisk: '',
			safeguardingConcerns: '',
			safeguardingDetails: ''
		},
		moodAndAnxiety: {
			phq9Score: null,
			gad7Score: null,
			maniaScreen: '',
			maniaDetails: '',
			psychoticSymptoms: '',
			psychoticDetails: ''
		},
		substanceUse: {
			alcoholAuditScore: null,
			alcoholFrequency: '',
			drugUse: '',
			drugDetails: '',
			tobaccoUse: '',
			tobaccoDetails: '',
			gamblingProblem: '',
			withdrawalRisk: '',
			withdrawalDetails: ''
		},
		currentMedications: {
			medications: [],
			sideEffects: '',
			compliance: '',
			complianceDetails: ''
		},
		medicalHistory: {
			neurologicalConditions: '',
			neurologicalDetails: '',
			endocrineConditions: '',
			endocrineDetails: '',
			chronicPain: '',
			chronicPainDetails: '',
			pregnancy: '',
			pregnancyDetails: ''
		},
		socialHistory: {
			housing: '',
			housingDetails: '',
			employment: '',
			employmentDetails: '',
			relationships: '',
			legalIssues: '',
			legalDetails: '',
			financialDifficulties: '',
			supportNetwork: ''
		},
		capacityAndConsent: {
			decisionMakingCapacity: '',
			capacityDetails: '',
			advanceDirectives: '',
			advanceDirectiveDetails: '',
			powerOfAttorney: '',
			powerOfAttorneyDetails: '',
			treatmentPreferences: ''
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
