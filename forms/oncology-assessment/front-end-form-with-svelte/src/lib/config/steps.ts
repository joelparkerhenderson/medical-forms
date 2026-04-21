import type { StepConfig, AssessmentData } from '$lib/engine/types';

export const TOTAL_STEPS = 10;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Demographics', shortTitle: 'Demographics', section: 'demographics' },
	{ number: 2, title: 'Cancer Diagnosis', shortTitle: 'Diagnosis', section: 'cancerDiagnosis' },
	{ number: 3, title: 'Treatment History', shortTitle: 'Tx History', section: 'treatmentHistory' },
	{ number: 4, title: 'Current Treatment', shortTitle: 'Current Tx', section: 'currentTreatment' },
	{ number: 5, title: 'Symptom Assessment', shortTitle: 'Symptoms', section: 'symptomAssessment' },
	{ number: 6, title: 'Side Effects', shortTitle: 'Side Effects', section: 'sideEffects' },
	{ number: 7, title: 'Laboratory Results', shortTitle: 'Labs', section: 'laboratoryResults' },
	{ number: 8, title: 'Current Medications', shortTitle: 'Meds', section: 'currentMedications' },
	{ number: 9, title: 'Psychosocial', shortTitle: 'Psychosocial', section: 'psychosocial' },
	{
		number: 10,
		title: 'Functional & Nutritional',
		shortTitle: 'Functional',
		section: 'functionalNutritional'
	}
];

export function getVisibleSteps(_data: AssessmentData): StepConfig[] {
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
	const step = steps.find((s) => s.number === stepNumber);
	return !!step;
}
