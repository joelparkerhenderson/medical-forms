import type { StepConfig } from '$lib/engine/types';

export const TOTAL_STEPS = 10;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Demographics', shortTitle: 'Demographics', section: 'demographics' },
	{ number: 2, title: 'Chief Complaint', shortTitle: 'Complaint', section: 'chiefComplaint' },
	{ number: 3, title: 'Pain Assessment', shortTitle: 'Pain', section: 'painAssessment' },
	{ number: 4, title: 'DASH Questionnaire', shortTitle: 'DASH', section: 'dashQuestionnaire' },
	{ number: 5, title: 'Range of Motion', shortTitle: 'ROM', section: 'rangeOfMotion' },
	{ number: 6, title: 'Strength Testing', shortTitle: 'Strength', section: 'strengthTesting' },
	{ number: 7, title: 'Functional Limitations', shortTitle: 'Function', section: 'functionalLimitations' },
	{ number: 8, title: 'Imaging History', shortTitle: 'Imaging', section: 'imagingHistory' },
	{ number: 9, title: 'Current Treatment', shortTitle: 'Treatment', section: 'currentTreatment' },
	{ number: 10, title: 'Surgical History', shortTitle: 'Surgery', section: 'surgicalHistory' }
];

export function getVisibleSteps(): StepConfig[] {
	return steps;
}

export function getNextStep(current: number): number | null {
	const visible = getVisibleSteps();
	const idx = visible.findIndex((s) => s.number === current);
	if (idx === -1 || idx >= visible.length - 1) return null;
	return visible[idx + 1].number;
}

export function getPrevStep(current: number): number | null {
	const visible = getVisibleSteps();
	const idx = visible.findIndex((s) => s.number === current);
	if (idx <= 0) return null;
	return visible[idx - 1].number;
}

export function isStepVisible(stepNumber: number): boolean {
	return steps.some((s) => s.number === stepNumber);
}
