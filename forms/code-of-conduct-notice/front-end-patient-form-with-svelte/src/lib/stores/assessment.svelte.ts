import type { AssessmentData, GradingResult } from '$lib/engine/types';

function createDefaultAssessment(): AssessmentData {
	return {
		recipientDetails: {
			organisationName: '',
			recipientName: '',
			recipientRole: '',
			recipientEmployeeId: ''
		},
		acknowledgementSignature: {
			agreed: false,
			recipientTypedFullName: '',
			recipientTypedDate: ''
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
