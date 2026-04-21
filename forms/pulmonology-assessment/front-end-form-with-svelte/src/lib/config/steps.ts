import type { StepConfig, AssessmentData } from '$lib/engine/types';

export const TOTAL_STEPS = 10;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Demographics', shortTitle: 'Demographics', section: 'demographics' },
	{ number: 2, title: 'Chief Complaint', shortTitle: 'Complaint', section: 'chiefComplaint' },
	{ number: 3, title: 'Spirometry Results', shortTitle: 'Spirometry', section: 'spirometry' },
	{ number: 4, title: 'Symptom Assessment', shortTitle: 'Symptoms', section: 'symptomAssessment' },
	{
		number: 5,
		title: 'Exacerbation History',
		shortTitle: 'Exacerbations',
		section: 'exacerbationHistory'
	},
	{
		number: 6,
		title: 'Current Medications',
		shortTitle: 'Medications',
		section: 'currentMedications'
	},
	{ number: 7, title: 'Allergies', shortTitle: 'Allergies', section: 'allergies' },
	{ number: 8, title: 'Comorbidities', shortTitle: 'Comorbid', section: 'comorbidities' },
	{
		number: 9,
		title: 'Smoking & Exposures',
		shortTitle: 'Smoking',
		section: 'smokingExposures'
	},
	{
		number: 10,
		title: 'Functional Status',
		shortTitle: 'Functional',
		section: 'functionalStatus'
	}
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
