import { createDefaultAssessmentData, type AssessmentData, type GradingResult } from '$lib/engine/types.js';
import { gradeAssessment } from '$lib/engine/risk-grader.js';

class AssessmentStore {
	data = $state<AssessmentData>(createDefaultAssessmentData());
	result = $state<GradingResult | null>(null);
	currentStep = $state(1);

	readonly totalSteps = 10;

	grade() {
		this.result = gradeAssessment(this.data);
	}

	reset() {
		this.data = createDefaultAssessmentData();
		this.result = null;
		this.currentStep = 1;
	}
}

export const assessment = new AssessmentStore();
