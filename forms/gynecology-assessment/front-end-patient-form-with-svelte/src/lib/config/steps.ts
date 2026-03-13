import type { StepConfig } from '$lib/engine/types';

export const TOTAL_STEPS = 10;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Demographics', shortTitle: 'Demographics', section: 'demographics' },
	{ number: 2, title: 'Chief Complaint', shortTitle: 'Complaint', section: 'chiefComplaint' },
	{ number: 3, title: 'Menstrual History', shortTitle: 'Menstrual', section: 'menstrualHistory' },
	{ number: 4, title: 'Gynecological Symptoms', shortTitle: 'Symptoms', section: 'gynecologicalSymptoms' },
	{ number: 5, title: 'Cervical Screening', shortTitle: 'Screening', section: 'cervicalScreening' },
	{ number: 6, title: 'Obstetric History', shortTitle: 'Obstetric', section: 'obstetricHistory' },
	{ number: 7, title: 'Sexual Health', shortTitle: 'Sexual Hx', section: 'sexualHealth' },
	{ number: 8, title: 'Medical History', shortTitle: 'Medical Hx', section: 'medicalHistory' },
	{ number: 9, title: 'Current Medications', shortTitle: 'Medications', section: 'currentMedications' },
	{ number: 10, title: 'Family History', shortTitle: 'Family Hx', section: 'familyHistory' }
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
