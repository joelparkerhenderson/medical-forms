import type { AssessmentData, GradingResult } from '$lib/engine/types';

function createDefaultAssessment(): AssessmentData {
	return {
		demographics: {
			firstName: '',
			lastName: '',
			dateOfBirth: '',
			sex: '',
			occupation: '',
			educationLevel: ''
		},
		asrsPartA: {
			focusDifficulty: null,
			organizationDifficulty: null,
			rememberingDifficulty: null,
			avoidingTasks: null,
			fidgeting: null,
			overlyActive: null
		},
		asrsPartB: {
			carelessMistakes: null,
			attentionDifficulty: null,
			concentrationDifficulty: null,
			misplacingThings: null,
			distractedByNoise: null,
			leavingSeat: null,
			restlessness: null,
			difficultyRelaxing: null,
			talkingTooMuch: null,
			finishingSentences: null,
			difficultyWaiting: null,
			interruptingOthers: null
		},
		childhoodHistory: {
			childhoodSymptoms: '',
			childhoodSymptomsDetails: '',
			schoolPerformance: '',
			behaviouralReports: '',
			behaviouralReportsDetails: '',
			onsetBeforeAge12: ''
		},
		functionalImpact: {
			workAcademicImpact: '',
			relationshipImpact: '',
			dailyLivingImpact: '',
			financialManagementImpact: '',
			timeManagementImpact: ''
		},
		comorbidConditions: {
			anxiety: '',
			anxietyDetails: '',
			depression: '',
			depressionDetails: '',
			substanceUse: '',
			substanceUseDetails: '',
			sleepDisorders: '',
			sleepDisordersDetails: '',
			learningDisabilities: '',
			learningDisabilitiesDetails: '',
			autismSpectrum: '',
			autismSpectrumDetails: ''
		},
		medications: [],
		allergies: [],
		medicalHistory: {
			cardiovascularIssues: '',
			cardiovascularDetails: '',
			seizureHistory: '',
			seizureDetails: '',
			ticDisorder: '',
			ticDetails: '',
			thyroidDisease: '',
			thyroidDetails: '',
			headInjuries: '',
			headInjuryDetails: ''
		},
		socialSupport: {
			familyHistoryADHD: '',
			familyHistoryDetails: '',
			supportSystems: '',
			copingStrategies: '',
			previousAssessments: '',
			previousAssessmentDetails: '',
			previousDiagnosis: '',
			previousDiagnosisDetails: ''
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
