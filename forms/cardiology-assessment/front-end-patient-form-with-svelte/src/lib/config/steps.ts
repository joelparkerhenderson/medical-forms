import type { StepConfig, AssessmentData } from '$lib/engine/types';

export const TOTAL_STEPS = 10;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Demographics', shortTitle: 'Demographics', section: 'demographics' },
	{ number: 2, title: 'Chest Pain / Angina', shortTitle: 'Angina', section: 'chestPainAngina' },
	{ number: 3, title: 'Heart Failure Symptoms', shortTitle: 'HF', section: 'heartFailureSymptoms' },
	{ number: 4, title: 'Cardiac History', shortTitle: 'History', section: 'cardiacHistory' },
	{ number: 5, title: 'Arrhythmia & Conduction', shortTitle: 'Arrhythmia', section: 'arrhythmiaConduction' },
	{ number: 6, title: 'Risk Factors', shortTitle: 'Risk', section: 'riskFactors' },
	{ number: 7, title: 'Diagnostic Results', shortTitle: 'Diagnostics', section: 'diagnosticResults' },
	{ number: 8, title: 'Current Medications', shortTitle: 'Meds', section: 'currentMedications' },
	{ number: 9, title: 'Allergies', shortTitle: 'Allergies', section: 'allergies' },
	{ number: 10, title: 'Social & Functional', shortTitle: 'Social', section: 'socialFunctional' }
];

export function getVisibleSteps(_data: AssessmentData): StepConfig[] {
	// All steps are always visible in the cardiology assessment
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
