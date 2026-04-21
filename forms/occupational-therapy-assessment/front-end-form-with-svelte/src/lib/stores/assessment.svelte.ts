import type { AssessmentData, GradingResult } from '$lib/engine/types';

function createDefaultAssessment(): AssessmentData {
	return {
		demographics: {
			firstName: '',
			lastName: '',
			dateOfBirth: '',
			sex: ''
		},
		referralInfo: {
			referralSource: '',
			referralReason: '',
			referringClinician: '',
			referralDate: '',
			primaryDiagnosis: ''
		},
		selfCareActivities: {
			personalCare: { difficulty: '', details: '' },
			functionalMobility: { difficulty: '', details: '' },
			communityManagement: { difficulty: '', details: '' }
		},
		productivityActivities: {
			paidWork: { difficulty: '', details: '' },
			householdManagement: { difficulty: '', details: '' },
			education: { difficulty: '', details: '' }
		},
		leisureActivities: {
			quietRecreation: { difficulty: '', details: '' },
			activeRecreation: { difficulty: '', details: '' },
			socialParticipation: { difficulty: '', details: '' }
		},
		performanceRatings: {
			activity1: { name: '', importance: null, performanceScore: null },
			activity2: { name: '', importance: null, performanceScore: null },
			activity3: { name: '', importance: null, performanceScore: null },
			activity4: { name: '', importance: null, performanceScore: null },
			activity5: { name: '', importance: null, performanceScore: null }
		},
		satisfactionRatings: {
			activity1: { name: '', satisfactionScore: null },
			activity2: { name: '', satisfactionScore: null },
			activity3: { name: '', satisfactionScore: null },
			activity4: { name: '', satisfactionScore: null },
			activity5: { name: '', satisfactionScore: null }
		},
		environmentalFactors: {
			homeEnvironment: '',
			workEnvironment: '',
			communityAccess: '',
			assistiveDevices: '',
			socialSupport: ''
		},
		physicalCognitiveStatus: {
			upperExtremity: '',
			lowerExtremity: '',
			coordination: '',
			cognition: '',
			vision: '',
			fatigue: '',
			pain: ''
		},
		goalsPriorities: {
			shortTermGoals: '',
			longTermGoals: '',
			priorityAreas: '',
			dischargeGoals: ''
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
