import type { StepConfig } from '$lib/engine/types';

export const TOTAL_STEPS = 10;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Demographics', shortTitle: 'Demographics', section: 'demographics' },
	{ number: 2, title: 'Referral Information', shortTitle: 'Referral', section: 'referralInfo' },
	{ number: 3, title: 'Self-Care Activities', shortTitle: 'Self-Care', section: 'selfCareActivities' },
	{ number: 4, title: 'Productivity Activities', shortTitle: 'Productivity', section: 'productivityActivities' },
	{ number: 5, title: 'Leisure Activities', shortTitle: 'Leisure', section: 'leisureActivities' },
	{ number: 6, title: 'Performance Ratings', shortTitle: 'Performance', section: 'performanceRatings' },
	{ number: 7, title: 'Satisfaction Ratings', shortTitle: 'Satisfaction', section: 'satisfactionRatings' },
	{ number: 8, title: 'Environmental Factors', shortTitle: 'Environment', section: 'environmentalFactors' },
	{ number: 9, title: 'Physical & Cognitive Status', shortTitle: 'Physical/Cognitive', section: 'physicalCognitiveStatus' },
	{ number: 10, title: 'Goals & Priorities', shortTitle: 'Goals', section: 'goalsPriorities' }
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
