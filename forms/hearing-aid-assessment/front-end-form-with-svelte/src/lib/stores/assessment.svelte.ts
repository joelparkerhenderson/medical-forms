import type { AssessmentData, GradingResult } from '$lib/engine/types';

function createDefaultAssessment(): AssessmentData {
	return {
		demographics: {
			firstName: '',
			lastName: '',
			dateOfBirth: '',
			sex: ''
		},
		hearingHistory: {
			onsetType: '',
			duration: '',
			affectedEar: '',
			familyHistory: '',
			noiseExposure: '',
			tinnitus: '',
			vertigo: '',
			earSurgery: '',
			ototoxicMedications: ''
		},
		hhiesQuestionnaire: {
			q1: null, q2: null, q3: null, q4: null, q5: null,
			q6: null, q7: null, q8: null, q9: null, q10: null
		},
		communicationDifficulties: {
			quietConversation: '',
			groupConversation: '',
			telephone: '',
			television: '',
			publicPlaces: '',
			workDifficulty: ''
		},
		currentHearingAids: {
			hasHearingAids: '',
			leftAidType: '',
			rightAidType: '',
			aidAge: '',
			satisfaction: '',
			dailyUseHours: null,
			difficulties: ''
		},
		earExamination: {
			leftExternalEar: '',
			rightExternalEar: '',
			leftTympanicMembrane: '',
			rightTympanicMembrane: '',
			cerumenLeft: '',
			cerumenRight: '',
			abnormalities: ''
		},
		audiogramResults: {
			leftPTA: null,
			rightPTA: null,
			leftSRT: null,
			rightSRT: null,
			leftWordRecognition: null,
			rightWordRecognition: null,
			hearingLossType: ''
		},
		lifestyleNeeds: {
			socialActivity: '',
			occupationRequirements: '',
			hobbies: '',
			technologyComfort: '',
			dexterity: '',
			visionStatus: ''
		},
		expectationsGoals: {
			primaryGoal: '',
			realisticExpectations: '',
			willingnessToWear: '',
			budgetConcerns: '',
			cosmeticConcerns: ''
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
