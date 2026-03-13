import type { StepConfig } from '$lib/engine/types';

export const TOTAL_STEPS = 10;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Patient Information', shortTitle: 'Patient', section: 'patientInformation' },
	{ number: 2, title: 'Demographics & Ethnicity', shortTitle: 'Demographics', section: 'demographicsEthnicity' },
	{ number: 3, title: 'Blood Pressure', shortTitle: 'BP', section: 'bloodPressure' },
	{ number: 4, title: 'Cholesterol', shortTitle: 'Cholesterol', section: 'cholesterol' },
	{ number: 5, title: 'Medical Conditions', shortTitle: 'Conditions', section: 'medicalConditions' },
	{ number: 6, title: 'Family History', shortTitle: 'Family', section: 'familyHistory' },
	{ number: 7, title: 'Smoking & Alcohol', shortTitle: 'Smoking', section: 'smokingAlcohol' },
	{ number: 8, title: 'Physical Activity & Diet', shortTitle: 'Activity', section: 'physicalActivityDiet' },
	{ number: 9, title: 'Body Measurements', shortTitle: 'Body', section: 'bodyMeasurements' },
	{ number: 10, title: 'Review & Calculate', shortTitle: 'Review', section: 'reviewCalculate' }
];

export function getVisibleSteps(): StepConfig[] {
	return steps;
}

export function getNextStep(current: number): number | null {
	const idx = steps.findIndex((s) => s.number === current);
	if (idx === -1 || idx >= steps.length - 1) return null;
	return steps[idx + 1].number;
}

export function getPrevStep(current: number): number | null {
	const idx = steps.findIndex((s) => s.number === current);
	if (idx <= 0) return null;
	return steps[idx - 1].number;
}
