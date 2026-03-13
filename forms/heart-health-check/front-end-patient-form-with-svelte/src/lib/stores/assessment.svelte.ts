import type { AssessmentData, GradingResult } from '$lib/engine/types';
import { createDefaultAssessmentData } from '$lib/engine/utils';

class AssessmentStore {
	data = $state<AssessmentData>(createDefaultAssessmentData());
	result = $state<GradingResult | null>(null);
	currentStep = $state(1);

	reset() {
		this.data = createDefaultAssessmentData();
		this.result = null;
		this.currentStep = 1;
	}
}

export const assessment = new AssessmentStore();
