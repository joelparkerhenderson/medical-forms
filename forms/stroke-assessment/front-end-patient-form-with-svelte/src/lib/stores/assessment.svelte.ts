import type { AssessmentData, GradingResult } from '$lib/engine/types';

function createDefaultAssessment(): AssessmentData {
	return {
		demographics: {
			firstName: '',
			lastName: '',
			dateOfBirth: '',
			sex: ''
		},
		symptomOnset: {
			onsetTime: '',
			lastKnownWell: '',
			symptomProgression: '',
			modeOfArrival: ''
		},
		levelOfConsciousness: {
			loc: null,
			locQuestions: null,
			locCommands: null
		},
		bestGazeVisual: {
			bestGaze: null,
			visual: null
		},
		facialPalsy: {
			facialPalsy: null,
			leftArm: null,
			rightArm: null,
			leftLeg: null,
			rightLeg: null
		},
		limbAtaxiaSensory: {
			limbAtaxia: null,
			sensory: null
		},
		languageDysarthria: {
			bestLanguage: null,
			dysarthria: null
		},
		extinctionInattention: {
			extinctionInattention: null
		},
		riskFactors: {
			hypertension: '',
			diabetes: '',
			atrialFibrillation: '',
			previousStroke: '',
			smoking: '',
			hyperlipidemia: '',
			familyHistory: ''
		},
		currentMedications: {
			medications: [],
			allergies: [],
			anticoagulants: '',
			anticoagulantDetails: '',
			antiplatelets: '',
			antiplateletDetails: ''
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
