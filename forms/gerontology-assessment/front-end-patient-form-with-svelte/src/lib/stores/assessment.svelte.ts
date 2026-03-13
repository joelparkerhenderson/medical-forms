import type { AssessmentData, GradingResult } from '$lib/engine/types';

function createDefaultAssessment(): AssessmentData {
	return {
		demographics: {
			firstName: '',
			lastName: '',
			dateOfBirth: '',
			sex: '',
			weight: null,
			height: null,
			bmi: null,
			livingSituation: ''
		},
		functionalAssessment: {
			bathingADL: '',
			dressingADL: '',
			toiletingADL: '',
			transferringADL: '',
			feedingADL: '',
			cookingIADL: '',
			cleaningIADL: '',
			shoppingIADL: '',
			financesIADL: '',
			medicationManagementIADL: ''
		},
		cognitiveScreen: {
			mmseScore: null,
			mocaScore: null,
			orientationIntact: '',
			memoryImpairment: '',
			executiveFunctionImpairment: '',
			deliriumRisk: '',
			cognitiveStatus: ''
		},
		mobilityFalls: {
			gaitAssessment: '',
			balanceAssessment: '',
			fallHistory: '',
			fallsLastYear: null,
			fearOfFalling: '',
			mobilityAids: '',
			mobilityAidType: '',
			timedUpAndGo: null
		},
		nutrition: {
			weightChangeLastSixMonths: '',
			weightChangeKg: null,
			weightChangeDirection: '',
			appetite: '',
			swallowingDifficulties: '',
			dentalStatus: '',
			mnaScore: null
		},
		polypharmacyReview: {
			numberOfMedications: null,
			highRiskMedications: '',
			highRiskMedicationDetails: '',
			beersCriteriaFlags: '',
			beersCriteriaDetails: '',
			medicationAdherence: ''
		},
		medications: [],
		comorbidities: {
			cardiovascularDisease: '',
			cardiovascularDetails: '',
			diabetes: '',
			diabetesControl: '',
			renalDisease: '',
			renalDetails: '',
			respiratoryDisease: '',
			respiratoryDetails: '',
			musculoskeletalDisease: '',
			musculoskeletalDetails: '',
			visualDeficit: '',
			hearingDeficit: ''
		},
		psychosocial: {
			depressionScreen: '',
			gds15Score: null,
			socialIsolation: '',
			hasCaregiver: '',
			caregiverDetails: '',
			advanceDirectives: '',
			advanceDirectiveDetails: ''
		},
		continenceSkin: {
			urinaryIncontinence: '',
			urinaryIncontinenceFrequency: '',
			faecalIncontinence: '',
			faecalIncontinenceFrequency: '',
			bradenScale: null,
			pressureInjuryPresent: '',
			pressureInjuryStage: '',
			skinIntegrity: ''
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
