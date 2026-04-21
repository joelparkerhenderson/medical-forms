import type { StepConfig, AssessmentData } from '$lib/engine/types';

export const TOTAL_STEPS = 10;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Demographics', shortTitle: 'Demographics', section: 'demographics' },
	{ number: 2, title: 'Menstrual History', shortTitle: 'Menstrual', section: 'menstrualHistory' },
	{ number: 3, title: 'Pain Assessment', shortTitle: 'Pain', section: 'painAssessment' },
	{ number: 4, title: 'GI Symptoms', shortTitle: 'GI', section: 'gastrointestinalSymptoms' },
	{ number: 5, title: 'Urinary Symptoms', shortTitle: 'Urinary', section: 'urinarySymptoms' },
	{ number: 6, title: 'Fertility Assessment', shortTitle: 'Fertility', section: 'fertilityAssessment' },
	{ number: 7, title: 'Previous Treatments', shortTitle: 'Treatments', section: 'previousTreatments' },
	{ number: 8, title: 'Surgical History', shortTitle: 'Surgery', section: 'surgicalHistory' },
	{ number: 9, title: 'Quality of Life Impact', shortTitle: 'QoL', section: 'qualityOfLife' },
	{ number: 10, title: 'Treatment Planning', shortTitle: 'Planning', section: 'treatmentPlanning' }
];

export function getVisibleSteps(_data: AssessmentData): StepConfig[] {
	// All steps are always visible in the endometriosis assessment
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
