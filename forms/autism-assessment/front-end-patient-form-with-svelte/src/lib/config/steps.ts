import type { StepConfig } from '$lib/engine/types';

export const TOTAL_STEPS = 9;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Demographics', shortTitle: 'Demographics', section: 'demographics' },
	{ number: 2, title: 'Screening Purpose', shortTitle: 'Purpose', section: 'screeningPurpose' },
	{ number: 3, title: 'AQ-10 Questionnaire', shortTitle: 'AQ-10', section: 'aq10Questionnaire' },
	{ number: 4, title: 'Social Communication', shortTitle: 'Social', section: 'socialCommunication' },
	{ number: 5, title: 'Repetitive Behaviors', shortTitle: 'Behaviors', section: 'repetitiveBehaviors' },
	{ number: 6, title: 'Sensory Profile', shortTitle: 'Sensory', section: 'sensoryProfile' },
	{ number: 7, title: 'Developmental History', shortTitle: 'Development', section: 'developmentalHistory' },
	{ number: 8, title: 'Current Support', shortTitle: 'Support', section: 'currentSupport' },
	{ number: 9, title: 'Family History', shortTitle: 'Family Hx', section: 'familyHistory' }
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
