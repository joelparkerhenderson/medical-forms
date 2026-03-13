import type { StepConfig } from '$lib/engine/types';

export const TOTAL_STEPS = 10;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Patient Information', shortTitle: 'Patient', section: 'patientInformation' },
	{ number: 2, title: 'Immunization History', shortTitle: 'History', section: 'immunizationHistory' },
	{ number: 3, title: 'Childhood Vaccinations', shortTitle: 'Childhood', section: 'childhoodVaccinations' },
	{ number: 4, title: 'Adult Vaccinations', shortTitle: 'Adult', section: 'adultVaccinations' },
	{ number: 5, title: 'Travel Vaccinations', shortTitle: 'Travel', section: 'travelVaccinations' },
	{ number: 6, title: 'Occupational Vaccinations', shortTitle: 'Occupational', section: 'occupationalVaccinations' },
	{ number: 7, title: 'Contraindications & Allergies', shortTitle: 'Allergies', section: 'contraindicationsAllergies' },
	{ number: 8, title: 'Consent & Information', shortTitle: 'Consent', section: 'consentInformation' },
	{ number: 9, title: 'Administration Record', shortTitle: 'Admin', section: 'administrationRecord' },
	{ number: 10, title: 'Clinical Review', shortTitle: 'Review', section: 'clinicalReview' }
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
