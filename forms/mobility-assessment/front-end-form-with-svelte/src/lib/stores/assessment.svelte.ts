import type { AssessmentData, GradingResult } from '$lib/engine/types';

function createDefaultAssessment(): AssessmentData {
	return {
		demographics: {
			firstName: '',
			lastName: '',
			dateOfBirth: '',
			sex: '',
			height: '',
			weight: ''
		},
		referralInfo: {
			referringProvider: '',
			referralReason: '',
			referralDate: '',
			primaryDiagnosis: '',
			secondaryDiagnoses: ''
		},
		fallHistory: {
			fallsLastYear: null,
			lastFallDate: '',
			fallCircumstances: '',
			injuriesFromFalls: '',
			fearOfFalling: '',
			fallRiskFactors: []
		},
		balanceAssessment: {
			sittingBalance: null,
			risesFromChair: null,
			attemptingToRise: null,
			immediateStandingBalance: null,
			standingBalance: null,
			nudgedBalance: null,
			eyesClosed: null,
			turning360: null,
			sittingDown: null
		},
		gaitAssessment: {
			initiationOfGait: null,
			stepLength: null,
			stepHeight: null,
			stepSymmetry: null,
			stepContinuity: null,
			path: null,
			trunk: null,
			walkingStance: null
		},
		timedUpAndGo: {
			timeSeconds: null,
			usedAssistiveDevice: '',
			deviceType: ''
		},
		rangeOfMotion: {
			hipFlexion: '',
			hipExtension: '',
			kneeFlexion: '',
			kneeExtension: '',
			ankleFlexion: '',
			ankleExtension: '',
			notes: ''
		},
		assistiveDevices: {
			currentDevices: [],
			deviceFitAdequate: '',
			deviceCondition: '',
			recommendedDevices: ''
		},
		currentMedications: {
			medications: [],
			fallRiskMedications: [],
			recentMedicationChanges: ''
		},
		functionalIndependence: {
			transfers: '',
			ambulation: '',
			stairs: '',
			bathing: '',
			dressing: '',
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
