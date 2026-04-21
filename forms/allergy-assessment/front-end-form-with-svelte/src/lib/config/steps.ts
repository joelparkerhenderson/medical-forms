import type { StepConfig, AssessmentData } from '$lib/engine/types';

export const TOTAL_STEPS = 10;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Demographics', shortTitle: 'Demographics', section: 'demographics' },
	{ number: 2, title: 'Allergy History', shortTitle: 'History', section: 'allergyHistory' },
	{ number: 3, title: 'Drug Allergies', shortTitle: 'Drug', section: 'drugAllergies' },
	{ number: 4, title: 'Food Allergies', shortTitle: 'Food', section: 'foodAllergies' },
	{ number: 5, title: 'Environmental Allergies', shortTitle: 'Environ', section: 'environmentalAllergies' },
	{ number: 6, title: 'Anaphylaxis History', shortTitle: 'Anaphylaxis', section: 'anaphylaxisHistory' },
	{ number: 7, title: 'Testing Results', shortTitle: 'Testing', section: 'testingResults' },
	{ number: 8, title: 'Current Management', shortTitle: 'Management', section: 'currentManagement' },
	{ number: 9, title: 'Comorbidities', shortTitle: 'Comorbid', section: 'comorbidities' },
	{ number: 10, title: 'Impact & Action Plan', shortTitle: 'Impact', section: 'impactActionPlan' }
];

export function getVisibleSteps(_data: AssessmentData): StepConfig[] {
	return steps;
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

export function isStepVisible(stepNumber: number, _data: AssessmentData): boolean {
	return steps.some((s) => s.number === stepNumber);
}
