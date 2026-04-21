import type { StepConfig } from '$lib/engine/types';

export const TOTAL_STEPS = 8;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Demographics', shortTitle: 'Demographics', section: 'demographics' },
	{ number: 2, title: 'Visit Information', shortTitle: 'Visit Info', section: 'visitInformation' },
	{ number: 3, title: 'Access & Scheduling', shortTitle: 'Access', section: 'accessScheduling' },
	{ number: 4, title: 'Communication', shortTitle: 'Communication', section: 'communication' },
	{ number: 5, title: 'Staff & Professionalism', shortTitle: 'Staff', section: 'staffProfessionalism' },
	{ number: 6, title: 'Care Quality', shortTitle: 'Care', section: 'careQuality' },
	{ number: 7, title: 'Environment', shortTitle: 'Environment', section: 'environment' },
	{ number: 8, title: 'Overall Satisfaction', shortTitle: 'Overall', section: 'overallSatisfaction' }
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
