import type { StepConfig } from '$lib/engine/types';

export const TOTAL_STEPS = 10;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Demographics', shortTitle: 'Demographics', section: 'demographics' },
	{ number: 2, title: 'Symptom Onset', shortTitle: 'Onset', section: 'symptomOnset' },
	{ number: 3, title: 'Level of Consciousness', shortTitle: 'LOC', section: 'levelOfConsciousness' },
	{ number: 4, title: 'Best Gaze & Visual', shortTitle: 'Gaze/Visual', section: 'bestGazeVisual' },
	{ number: 5, title: 'Facial Palsy & Motor', shortTitle: 'Motor', section: 'facialPalsy' },
	{ number: 6, title: 'Limb Ataxia & Sensory', shortTitle: 'Ataxia/Sensory', section: 'limbAtaxiaSensory' },
	{ number: 7, title: 'Language & Dysarthria', shortTitle: 'Language', section: 'languageDysarthria' },
	{ number: 8, title: 'Extinction & Inattention', shortTitle: 'Extinction', section: 'extinctionInattention' },
	{ number: 9, title: 'Risk Factors', shortTitle: 'Risk Factors', section: 'riskFactors' },
	{ number: 10, title: 'Current Medications', shortTitle: 'Medications', section: 'currentMedications' }
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
