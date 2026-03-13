import type { AssessmentData, GradingResult } from '$lib/engine/types';

function createDefaultAssessment(): AssessmentData {
	return {
		demographics: {
			firstName: '',
			lastName: '',
			dateOfBirth: '',
			sex: ''
		},
		visitInformation: {
			visitDate: '',
			department: '',
			providerName: '',
			visitType: '',
			reasonForVisit: '',
			firstVisit: ''
		},
		accessScheduling: {
			easeOfScheduling: null,
			waitForAppointment: null,
			waitInWaitingRoom: null
		},
		communication: {
			listening: null,
			explainingCondition: null,
			answeringQuestions: null,
			timeSpent: null
		},
		staffProfessionalism: {
			receptionCourtesy: null,
			nursingCourtesy: null,
			respectShown: null
		},
		careQuality: {
			involvementInDecisions: null,
			treatmentPlanExplanation: null,
			confidenceInCare: null
		},
		environment: {
			cleanliness: null,
			waitingAreaComfort: null,
			privacy: null
		},
		overallSatisfaction: {
			overallRating: null,
			likelyToRecommend: null,
			likelyToReturn: null,
			comments: ''
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
