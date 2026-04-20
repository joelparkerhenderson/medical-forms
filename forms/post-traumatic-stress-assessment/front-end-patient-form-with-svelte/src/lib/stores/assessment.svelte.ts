import type { AssessmentData, GradingResult } from '$lib/engine/types';

function createDefaultAssessment(): AssessmentData {
	return {
		demographics: {
			firstName: '',
			lastName: '',
			dateOfBirth: '',
			sex: ''
		},
		traumaEvent: {
			eventDescription: '',
			eventDate: '',
			isOngoing: false
		},
		clusterBIntrusion: {
			item1RepeatedDisturbingMemories: null,
			item2RepeatedDisturbingDreams: null,
			item3FeelingReliving: null,
			item4FeelingUpsetByReminders: null,
			item5StrongPhysicalReactions: null
		},
		clusterCAvoidance: {
			item6AvoidingMemoriesThoughtsFeelings: null,
			item7AvoidingExternalReminders: null
		},
		clusterDNegativeAlterations: {
			item8TroubleRememberingImportantParts: null,
			item9StrongNegativeBeliefs: null,
			item10BlamingSelfOrOthers: null,
			item11StrongNegativeFeelings: null,
			item12LossOfInterest: null,
			item13FeelingDistantFromOthers: null,
			item14TroubleExperiencingPositiveFeelings: null
		},
		clusterEArousalReactivity: {
			item15IrritableOrAggressive: null,
			item16RecklessOrSelfDestructive: null,
			item17SuperAlertOrOnGuard: null,
			item18JumpyOrEasilyStartled: null,
			item19DifficultyConcentrating: null,
			item20TroubleSleeping: null
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
