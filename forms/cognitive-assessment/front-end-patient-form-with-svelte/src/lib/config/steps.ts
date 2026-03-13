import type { StepConfig } from '$lib/engine/types';

export const TOTAL_STEPS = 10;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Demographics', shortTitle: 'Demographics', section: 'demographics' },
	{ number: 2, title: 'Referral Information', shortTitle: 'Referral', section: 'referralInformation' },
	{ number: 3, title: 'Orientation (Time & Place)', shortTitle: 'Orientation', section: 'orientationScores' },
	{ number: 4, title: 'Registration', shortTitle: 'Registration', section: 'registrationScores' },
	{ number: 5, title: 'Attention & Calculation', shortTitle: 'Attention', section: 'attentionScores' },
	{ number: 6, title: 'Recall', shortTitle: 'Recall', section: 'recallScores' },
	{ number: 7, title: 'Language', shortTitle: 'Language', section: 'languageScores' },
	{ number: 8, title: 'Repetition & Commands', shortTitle: 'Commands', section: 'repetitionCommands' },
	{ number: 9, title: 'Visuospatial', shortTitle: 'Visuospatial', section: 'visuospatialScores' },
	{ number: 10, title: 'Functional History', shortTitle: 'Functional', section: 'functionalHistory' }
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
