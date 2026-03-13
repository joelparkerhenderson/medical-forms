import type { StepConfig, AssessmentData } from '$lib/engine/types';

export const TOTAL_STEPS = 9;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Demographics', shortTitle: 'Demographics', section: 'demographics' },
	{ number: 2, title: 'PHQ-9 Depression Screen', shortTitle: 'PHQ-9', section: 'phqResponses' },
	{ number: 3, title: 'GAD-7 Anxiety Screen', shortTitle: 'GAD-7', section: 'gadResponses' },
	{ number: 4, title: 'Mood & Affect', shortTitle: 'Mood', section: 'moodAffect' },
	{ number: 5, title: 'Risk Assessment', shortTitle: 'Risk', section: 'riskAssessment' },
	{ number: 6, title: 'Substance Use', shortTitle: 'Substance', section: 'substanceUse' },
	{ number: 7, title: 'Current Medications', shortTitle: 'Meds', section: 'currentMedications' },
	{ number: 8, title: 'Treatment History', shortTitle: 'History', section: 'treatmentHistory' },
	{ number: 9, title: 'Social & Functional', shortTitle: 'Social', section: 'socialFunctional' }
];

export function getVisibleSteps(_data: AssessmentData): StepConfig[] {
	// All steps are always visible in the mental health assessment
	return steps;
}

export function getNextStep(current: number, data: AssessmentData): number | null {
	const visible = getVisibleSteps(data);
	const idx = visible.findIndex((s) => s.number === current);
	if (idx === -1 || idx >= visible.length - 1) return null;
	return visible[idx + 1].number;
}

export function getPrevStep(current: number, data: AssessmentData): number | null {
	const visible = getVisibleSteps(data);
	const idx = visible.findIndex((s) => s.number === current);
	if (idx <= 0) return null;
	return visible[idx - 1].number;
}

export function isStepVisible(stepNumber: number, _data: AssessmentData): boolean {
	return steps.some((s) => s.number === stepNumber);
}
