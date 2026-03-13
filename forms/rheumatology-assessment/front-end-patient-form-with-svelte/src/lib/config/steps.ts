import type { StepConfig, AssessmentData } from '$lib/engine/types';

export const TOTAL_STEPS = 10;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Demographics', shortTitle: 'Demographics', section: 'demographics' },
	{ number: 2, title: 'Chief Complaint', shortTitle: 'Complaint', section: 'chiefComplaint' },
	{ number: 3, title: 'Joint Assessment', shortTitle: 'Joints', section: 'jointAssessment' },
	{ number: 4, title: 'Disease History', shortTitle: 'History', section: 'diseaseHistory' },
	{
		number: 5,
		title: 'Extra-articular Features',
		shortTitle: 'Extra-articular',
		section: 'extraArticularFeatures'
	},
	{
		number: 6,
		title: 'Laboratory Results',
		shortTitle: 'Labs',
		section: 'laboratoryResults'
	},
	{
		number: 7,
		title: 'Current Medications',
		shortTitle: 'Medications',
		section: 'currentMedications'
	},
	{ number: 8, title: 'Allergies', shortTitle: 'Allergies', section: 'allergies' },
	{
		number: 9,
		title: 'Functional Assessment',
		shortTitle: 'Functional',
		section: 'functionalAssessment'
	},
	{
		number: 10,
		title: 'Comorbidities & Social',
		shortTitle: 'Comorbidities',
		section: 'comorbiditiesSocial'
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
