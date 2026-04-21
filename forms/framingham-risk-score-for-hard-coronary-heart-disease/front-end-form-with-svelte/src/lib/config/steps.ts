import type { StepConfig } from '$lib/engine/types';

export const TOTAL_STEPS = 10;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Patient Information', shortTitle: 'Patient', section: 'patientInformation' },
	{ number: 2, title: 'Demographics', shortTitle: 'Demographics', section: 'demographics' },
	{ number: 3, title: 'Smoking History', shortTitle: 'Smoking', section: 'smokingHistory' },
	{ number: 4, title: 'Blood Pressure', shortTitle: 'BP', section: 'bloodPressure' },
	{ number: 5, title: 'Cholesterol', shortTitle: 'Cholesterol', section: 'cholesterol' },
	{ number: 6, title: 'Medical History', shortTitle: 'Medical Hx', section: 'medicalHistory' },
	{ number: 7, title: 'Family History', shortTitle: 'Family Hx', section: 'familyHistory' },
	{ number: 8, title: 'Lifestyle Factors', shortTitle: 'Lifestyle', section: 'lifestyleFactors' },
	{ number: 9, title: 'Current Medications', shortTitle: 'Medications', section: 'currentMedications' },
	{ number: 10, title: 'Review & Calculate', shortTitle: 'Review', section: 'reviewCalculate' }
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
