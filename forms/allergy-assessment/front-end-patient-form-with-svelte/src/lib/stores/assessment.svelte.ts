import type { AssessmentData, GradingResult } from '$lib/engine/types';

function createDefaultAssessment(): AssessmentData {
	return {
		demographics: {
			firstName: '',
			lastName: '',
			dateOfBirth: '',
			nhsNumber: '',
			sex: '',
			weight: null,
			height: null,
			bmi: null
		},
		allergyHistory: {
			ageOfOnset: null,
			knownAllergens: '',
			familyHistoryOfAtopy: '',
			familyAtopyDetails: '',
			familyHistoryOfAllergy: '',
			familyAllergyDetails: ''
		},
		drugAllergies: {
			hasDrugAllergies: '',
			drugAllergies: [],
			crossReactivityConcerns: ''
		},
		foodAllergies: {
			hasFoodAllergies: '',
			foodAllergies: [],
			igeType: '',
			oralAllergySyndrome: '',
			dietaryRestrictions: ''
		},
		environmentalAllergies: {
			pollenAllergy: '',
			dustMiteAllergy: '',
			mouldAllergy: '',
			animalDanderAllergy: '',
			latexAllergy: '',
			insectStingAllergy: '',
			insectStingSeverity: '',
			seasonalPattern: '',
			otherEnvironmentalAllergens: ''
		},
		anaphylaxisHistory: {
			hasAnaphylaxisHistory: '',
			numberOfEpisodes: null,
			episodes: [],
			adrenalineAutoInjectorPrescribed: '',
			actionPlanInPlace: ''
		},
		testingResults: {
			skinPrickTestsDone: '',
			specificIgEDone: '',
			componentResolvedDiagnosticsDone: '',
			challengeTestsDone: '',
			patchTestsDone: '',
			testResults: []
		},
		currentManagement: {
			antihistamines: '',
			antihistamineDetails: '',
			nasalSteroids: '',
			adrenalineAutoInjector: '',
			immunotherapy: '',
			immunotherapyDetails: '',
			biologics: '',
			biologicDetails: '',
			allergenAvoidanceStrategies: '',
			otherMedications: []
		},
		comorbidities: {
			asthma: '',
			asthmaSeverity: '',
			eczema: '',
			eczemaSeverity: '',
			rhinitis: '',
			rhinitisSeverity: '',
			eosinophilicOesophagitis: '',
			mastCellDisorders: '',
			mastCellDetails: '',
			mentalHealthImpact: '',
			mentalHealthDetails: ''
		},
		impactActionPlan: {
			qualityOfLifeScore: null,
			schoolWorkImpact: '',
			schoolWorkImpactDetails: '',
			emergencyActionPlanStatus: '',
			trainingProvided: '',
			trainingDetails: '',
			followUpSchedule: ''
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
