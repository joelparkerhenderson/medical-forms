import type { StepConfig } from '$lib/engine/types';

export const TOTAL_STEPS = 9;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Demographics', shortTitle: 'Demographics', section: 'demographics' },
	{ number: 2, title: 'Sleep Habits', shortTitle: 'Sleep Habits', section: 'sleepHabits' },
	{ number: 3, title: 'Sleep Latency', shortTitle: 'Latency', section: 'sleepLatency' },
	{ number: 4, title: 'Sleep Duration', shortTitle: 'Duration', section: 'sleepDuration' },
	{ number: 5, title: 'Sleep Efficiency', shortTitle: 'Efficiency', section: 'sleepEfficiency' },
	{ number: 6, title: 'Sleep Disturbances', shortTitle: 'Disturbances', section: 'sleepDisturbances' },
	{ number: 7, title: 'Daytime Dysfunction', shortTitle: 'Daytime', section: 'daytimeDysfunction' },
	{ number: 8, title: 'Sleep Medication Use', shortTitle: 'Medication', section: 'sleepMedicationUse' },
	{ number: 9, title: 'Medical & Lifestyle Factors', shortTitle: 'Lifestyle', section: 'medicalLifestyle' }
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
