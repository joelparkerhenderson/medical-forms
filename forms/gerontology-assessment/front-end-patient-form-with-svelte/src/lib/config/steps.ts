import type { StepConfig, AssessmentData } from '$lib/engine/types';

export const TOTAL_STEPS = 9;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Demographics', shortTitle: 'Demographics', section: 'demographics' },
	{ number: 2, title: 'Functional Assessment', shortTitle: 'Functional', section: 'functionalAssessment' },
	{ number: 3, title: 'Cognitive Screen', shortTitle: 'Cognitive', section: 'cognitiveScreen' },
	{ number: 4, title: 'Mobility & Falls', shortTitle: 'Mobility', section: 'mobilityFalls' },
	{ number: 5, title: 'Nutrition', shortTitle: 'Nutrition', section: 'nutrition' },
	{ number: 6, title: 'Polypharmacy Review', shortTitle: 'Polypharmacy', section: 'polypharmacyReview' },
	{ number: 7, title: 'Comorbidities', shortTitle: 'Comorbid', section: 'comorbidities' },
	{ number: 8, title: 'Psychosocial', shortTitle: 'Psychosocial', section: 'psychosocial' },
	{ number: 9, title: 'Continence & Skin', shortTitle: 'Continence', section: 'continenceSkin' }
];

export function getVisibleSteps(data: AssessmentData): StepConfig[] {
	return steps.filter((s) => !s.isConditional || s.shouldShow?.(data));
}

export function getNextStep(current: number, data: AssessmentData): number | null {
	const visible = getVisibleSteps(data);
	const idx = visible.findIndex((s) => s.number === current);
	if (idx === -1 || idx >= visible.length - 1) return null;
	return visible[idx + 1].number;
}

export function getPrevStep(current: number, data: AssessmentData): number | null {
	const visible = getVisibleSteps(data);
	const idx = visible.findIndex((s) => s.number === current);
	if (idx <= 0) return null;
	return visible[idx - 1].number;
}

export function isStepVisible(stepNumber: number, data: AssessmentData): boolean {
	const step = steps.find((s) => s.number === stepNumber);
	if (!step) return false;
	if (!step.isConditional) return true;
	return step.shouldShow?.(data) ?? true;
}
