import type { StepConfig } from '$lib/engine/types';

export const TOTAL_STEPS = 10;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Demographics', shortTitle: 'Demographics', section: 'demographics' },
	{ number: 2, title: 'Referral Information', shortTitle: 'Referral', section: 'referralInfo' },
	{ number: 3, title: 'Movement History', shortTitle: 'History', section: 'movementHistory' },
	{ number: 4, title: 'Deep Squat', shortTitle: 'Squat', section: 'fmsPatterns' },
	{ number: 5, title: 'Hurdle Step', shortTitle: 'Hurdle', section: 'fmsPatterns' },
	{ number: 6, title: 'In-Line Lunge', shortTitle: 'Lunge', section: 'fmsPatterns' },
	{ number: 7, title: 'Shoulder Mobility', shortTitle: 'Shoulder', section: 'fmsPatterns' },
	{ number: 8, title: 'Active Straight Leg Raise', shortTitle: 'Leg Raise', section: 'fmsPatterns' },
	{ number: 9, title: 'Trunk Stability Push-Up', shortTitle: 'Push-Up', section: 'fmsPatterns' },
	{ number: 10, title: 'Rotary Stability', shortTitle: 'Rotary', section: 'fmsPatterns' }
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
