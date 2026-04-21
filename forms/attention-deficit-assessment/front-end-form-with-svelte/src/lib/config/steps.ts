import type { StepConfig, AssessmentData } from '$lib/engine/types';

export const TOTAL_STEPS = 10;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Demographics', shortTitle: 'Demographics', section: 'demographics' },
	{ number: 2, title: 'ASRS Part A Screener', shortTitle: 'Part A', section: 'asrsPartA' },
	{ number: 3, title: 'ASRS Part B', shortTitle: 'Part B', section: 'asrsPartB' },
	{ number: 4, title: 'Childhood History', shortTitle: 'Childhood', section: 'childhoodHistory' },
	{ number: 5, title: 'Functional Impact', shortTitle: 'Impact', section: 'functionalImpact' },
	{ number: 6, title: 'Comorbid Conditions', shortTitle: 'Comorbid', section: 'comorbidConditions' },
	{ number: 7, title: 'Current Medications', shortTitle: 'Meds', section: 'medications' },
	{ number: 8, title: 'Allergies', shortTitle: 'Allergies', section: 'allergies' },
	{ number: 9, title: 'Medical History', shortTitle: 'Medical Hx', section: 'medicalHistory' },
	{ number: 10, title: 'Social & Support', shortTitle: 'Social', section: 'socialSupport' }
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
