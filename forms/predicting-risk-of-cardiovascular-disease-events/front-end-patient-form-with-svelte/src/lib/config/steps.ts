import type { StepConfig } from '$lib/engine/types';

export const TOTAL_STEPS = 10;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Patient Information', key: 'patientInformation' },
	{ number: 2, title: 'Demographics', key: 'demographics' },
	{ number: 3, title: 'Blood Pressure', key: 'bloodPressure' },
	{ number: 4, title: 'Cholesterol & Lipids', key: 'cholesterolLipids' },
	{ number: 5, title: 'Metabolic Health', key: 'metabolicHealth' },
	{ number: 6, title: 'Renal Function', key: 'renalFunction' },
	{ number: 7, title: 'Smoking History', key: 'smokingHistory' },
	{ number: 8, title: 'Medical History', key: 'medicalHistory' },
	{ number: 9, title: 'Current Medications', key: 'currentMedications' },
	{ number: 10, title: 'Review & Calculate', key: 'reviewCalculate' }
];

export function getVisibleSteps(): StepConfig[] {
	return steps;
}

export function getNextStep(current: number): number | null {
	return current < TOTAL_STEPS ? current + 1 : null;
}

export function getPrevStep(current: number): number | null {
	return current > 1 ? current - 1 : null;
}
