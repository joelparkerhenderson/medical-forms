import type { AssessmentData, GradingResult } from '$lib/engine/types';

function createDefaultPatternScore() {
	return {
		score: null as (0 | 1 | 2 | 3 | null),
		painDuringMovement: false,
		leftScore: null as (0 | 1 | 2 | 3 | null),
		rightScore: null as (0 | 1 | 2 | 3 | null),
		asymmetryNotes: ''
	};
}

function createDefaultAssessment(): AssessmentData {
	return {
		demographics: {
			firstName: '',
			lastName: '',
			dateOfBirth: '',
			sex: ''
		},
		referralInfo: {
			referringProvider: '',
			referralReason: '',
			referralDate: '',
			sportOrActivity: ''
		},
		movementHistory: {
			injuryHistory: '',
			activityLevel: '',
			sportParticipation: '',
			currentPain: '',
			currentPainDetails: '',
			previousTreatments: ''
		},
		fmsPatterns: {
			deepSquat: createDefaultPatternScore(),
			hurdleStep: createDefaultPatternScore(),
			inLineLunge: createDefaultPatternScore(),
			shoulderMobility: createDefaultPatternScore(),
			activeStraightLegRaise: createDefaultPatternScore(),
			trunkStabilityPushUp: createDefaultPatternScore(),
			rotaryStability: createDefaultPatternScore(),
			clearingTests: {
				shoulderClearing: '',
				shoulderClearingPain: false,
				trunkFlexionClearing: '',
				trunkFlexionClearingPain: false,
				trunkExtensionClearing: '',
				trunkExtensionClearingPain: false
			}
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
