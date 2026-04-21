import type { AssessmentData, GradingResult } from '$lib/engine/types';

function createDefaultAssessment(): AssessmentData {
	return {
		demographics: {
			firstName: '',
			lastName: '',
			dateOfBirth: '',
			sex: '',
			ageGroup: ''
		},
		screeningPurpose: {
			referralSource: '',
			referralSourceOther: '',
			reasonForScreening: '',
			previousAssessments: '',
			previousAssessmentDetails: ''
		},
		aq10Questionnaire: {
			q1: null, q2: null, q3: null, q4: null, q5: null,
			q6: null, q7: null, q8: null, q9: null, q10: null
		},
		socialCommunication: {
			eyeContact: '',
			socialReciprocity: '',
			conversationSkills: '',
			friendshipPatterns: '',
			socialDifficultiesDetails: ''
		},
		repetitiveBehaviors: {
			routineAdherence: '',
			specialInterests: '',
			repetitiveMovements: '',
			repetitiveMovementsDetails: '',
			resistanceToChange: ''
		},
		sensoryProfile: {
			visualSensitivity: '',
			auditorySensitivity: '',
			tactileSensitivity: '',
			olfactorySensitivity: '',
			gustatorySensitivity: '',
			sensorySeekingBehaviors: ''
		},
		developmentalHistory: {
			languageMilestones: '',
			motorMilestones: '',
			earlySocialBehavior: '',
			developmentalConcerns: ''
		},
		currentSupport: {
			currentAccommodations: '',
			currentTherapies: [],
			educationalSupport: '',
			medications: []
		},
		familyHistory: {
			autismFamily: '',
			autismFamilyDetails: '',
			adhdFamily: '',
			adhdFamilyDetails: '',
			learningDisabilities: '',
			learningDisabilitiesDetails: '',
			mentalHealthFamily: '',
			mentalHealthFamilyDetails: ''
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
