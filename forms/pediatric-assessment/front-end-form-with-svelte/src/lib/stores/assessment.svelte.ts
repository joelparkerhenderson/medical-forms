import type { AssessmentData, GradingResult } from '$lib/engine/types';

function createDefaultAssessment(): AssessmentData {
	return {
		demographics: {
			childFirstName: '',
			childLastName: '',
			dateOfBirth: '',
			sex: '',
			weight: null,
			height: null,
			headCircumference: null,
			parentGuardianName: '',
			parentGuardianRelationship: '',
			parentGuardianPhone: '',
			parentGuardianEmail: ''
		},
		birthHistory: {
			gestationalAge: null,
			birthWeight: null,
			deliveryType: '',
			apgarOneMinute: null,
			apgarFiveMinutes: null,
			nicuStay: '',
			nicuDuration: null,
			birthComplications: '',
			birthComplicationDetails: ''
		},
		growthNutrition: {
			weightPercentile: null,
			heightPercentile: null,
			headCircumferencePercentile: null,
			feedingType: '',
			dietaryConcerns: '',
			dietaryConcernDetails: '',
			failureToThrive: ''
		},
		developmentalMilestones: {
			grossMotor: '',
			grossMotorNotes: '',
			fineMotor: '',
			fineMotorNotes: '',
			language: '',
			languageNotes: '',
			socialEmotional: '',
			socialEmotionalNotes: '',
			cognitive: '',
			cognitiveNotes: ''
		},
		immunizationStatus: {
			upToDate: '',
			missingVaccinations: '',
			adverseReactions: '',
			adverseReactionDetails: '',
			exemptions: '',
			exemptionDetails: ''
		},
		medicalHistory: {
			chronicConditions: '',
			chronicConditionDetails: '',
			previousHospitalizations: '',
			hospitalizationDetails: '',
			previousSurgeries: '',
			surgeryDetails: '',
			recurringInfections: '',
			infectionDetails: ''
		},
		currentMedications: {
			prescriptions: [],
			otcMedications: [],
			supplements: [],
			allergies: []
		},
		familyHistory: {
			geneticConditions: '',
			geneticConditionDetails: '',
			chronicDiseases: '',
			chronicDiseaseDetails: '',
			developmentalDisorders: '',
			developmentalDisorderDetails: '',
			consanguinity: ''
		},
		socialEnvironmental: {
			homeEnvironment: '',
			schoolPerformance: '',
			behaviouralConcerns: '',
			behaviouralConcernDetails: '',
			safeguardingConcerns: '',
			safeguardingDetails: '',
			screenTimeHoursPerDay: null
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
