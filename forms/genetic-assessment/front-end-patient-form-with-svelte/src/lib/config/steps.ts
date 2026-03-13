import type { StepConfig } from '$lib/engine/types';

export const TOTAL_STEPS = 10;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Demographics', shortTitle: 'Demographics', section: 'demographics' },
	{ number: 2, title: 'Referral Information', shortTitle: 'Referral', section: 'referralInformation' },
	{ number: 3, title: 'Personal Medical History', shortTitle: 'Medical Hx', section: 'personalMedicalHistory' },
	{ number: 4, title: 'Cancer History', shortTitle: 'Cancer Hx', section: 'cancerHistory' },
	{ number: 5, title: 'Family Pedigree', shortTitle: 'Family', section: 'familyPedigree' },
	{ number: 6, title: 'Cardiovascular Genetics', shortTitle: 'Cardio', section: 'cardiovascularGenetics' },
	{ number: 7, title: 'Neurogenetics', shortTitle: 'Neuro', section: 'neurogenetics' },
	{ number: 8, title: 'Reproductive Genetics', shortTitle: 'Repro', section: 'reproductiveGenetics' },
	{ number: 9, title: 'Ethnic Background & Consanguinity', shortTitle: 'Ethnicity', section: 'ethnicBackground' },
	{ number: 10, title: 'Genetic Testing History', shortTitle: 'Testing Hx', section: 'geneticTestingHistory' }
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
