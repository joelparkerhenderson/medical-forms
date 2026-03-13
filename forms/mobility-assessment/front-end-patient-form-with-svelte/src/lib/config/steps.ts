import type { StepConfig } from '$lib/engine/types';

export const TOTAL_STEPS = 10;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Demographics', shortTitle: 'Demographics', section: 'demographics' },
	{ number: 2, title: 'Referral Information', shortTitle: 'Referral', section: 'referralInfo' },
	{ number: 3, title: 'Fall History', shortTitle: 'Falls', section: 'fallHistory' },
	{ number: 4, title: 'Balance Assessment', shortTitle: 'Balance', section: 'balanceAssessment' },
	{ number: 5, title: 'Gait Assessment', shortTitle: 'Gait', section: 'gaitAssessment' },
	{ number: 6, title: 'Timed Up and Go', shortTitle: 'TUG', section: 'timedUpAndGo' },
	{ number: 7, title: 'Range of Motion', shortTitle: 'ROM', section: 'rangeOfMotion' },
	{ number: 8, title: 'Assistive Devices', shortTitle: 'Devices', section: 'assistiveDevices' },
	{ number: 9, title: 'Current Medications', shortTitle: 'Medications', section: 'currentMedications' },
	{ number: 10, title: 'Functional Independence', shortTitle: 'Function', section: 'functionalIndependence' }
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
