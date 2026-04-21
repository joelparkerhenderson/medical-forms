import type { StepConfig } from '$lib/engine/types';

export const TOTAL_STEPS = 2;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Legal Requirements Privacy Notice', shortTitle: 'Notice', section: 'legalRequirementsPrivacyNotice' },
	{ number: 2, title: 'Acknowledgment & Signature', shortTitle: 'Acknowledgment', section: 'acknowledgment' }
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
