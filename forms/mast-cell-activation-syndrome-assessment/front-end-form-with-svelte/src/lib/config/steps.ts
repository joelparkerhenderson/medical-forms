import type { StepConfig } from '$lib/engine/types';

export const TOTAL_STEPS = 10;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Demographics', shortTitle: 'Demographics', section: 'demographics' },
	{ number: 2, title: 'Symptom Overview', shortTitle: 'Overview', section: 'symptomOverview' },
	{ number: 3, title: 'Dermatological Symptoms', shortTitle: 'Skin', section: 'dermatologicalSymptoms' },
	{ number: 4, title: 'Gastrointestinal Symptoms', shortTitle: 'GI', section: 'gastrointestinalSymptoms' },
	{ number: 5, title: 'Cardiovascular Symptoms', shortTitle: 'CV', section: 'cardiovascularSymptoms' },
	{ number: 6, title: 'Respiratory Symptoms', shortTitle: 'Resp', section: 'respiratorySymptoms' },
	{ number: 7, title: 'Neurological Symptoms', shortTitle: 'Neuro', section: 'neurologicalSymptoms' },
	{ number: 8, title: 'Triggers & Patterns', shortTitle: 'Triggers', section: 'triggersPatterns' },
	{ number: 9, title: 'Laboratory Results', shortTitle: 'Labs', section: 'laboratoryResults' },
	{ number: 10, title: 'Current Treatment', shortTitle: 'Treatment', section: 'currentTreatment' }
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
