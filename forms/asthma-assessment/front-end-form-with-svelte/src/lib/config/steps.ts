import type { StepConfig, AssessmentData } from '$lib/engine/types';

export const TOTAL_STEPS = 9;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Demographics', shortTitle: 'Demographics', section: 'demographics' },
	{ number: 2, title: 'Symptom Frequency', shortTitle: 'Symptoms', section: 'symptomFrequency' },
	{ number: 3, title: 'Lung Function', shortTitle: 'Lung Fn', section: 'lungFunction' },
	{ number: 4, title: 'Triggers', shortTitle: 'Triggers', section: 'triggers' },
	{ number: 5, title: 'Current Medications', shortTitle: 'Meds', section: 'currentMedications' },
	{ number: 6, title: 'Allergies', shortTitle: 'Allergies', section: 'allergies' },
	{ number: 7, title: 'Exacerbation History', shortTitle: 'Exacerbations', section: 'exacerbationHistory' },
	{ number: 8, title: 'Comorbidities', shortTitle: 'Comorbid', section: 'comorbidities' },
	{ number: 9, title: 'Social History', shortTitle: 'Social', section: 'socialHistory' }
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
