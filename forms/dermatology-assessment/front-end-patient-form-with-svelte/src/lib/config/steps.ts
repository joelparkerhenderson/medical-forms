import type { StepConfig } from '$lib/engine/types';

export const TOTAL_STEPS = 9;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Demographics', shortTitle: 'Demographics', section: 'demographics' },
	{ number: 2, title: 'Chief Complaint', shortTitle: 'Complaint', section: 'chiefComplaint' },
	{ number: 3, title: 'DLQI Questionnaire', shortTitle: 'DLQI', section: 'dlqiQuestionnaire' },
	{ number: 4, title: 'Lesion Characteristics', shortTitle: 'Lesion', section: 'lesionCharacteristics' },
	{ number: 5, title: 'Medical History', shortTitle: 'Medical Hx', section: 'medicalHistory' },
	{ number: 6, title: 'Current Medications', shortTitle: 'Medications', section: 'currentMedications' },
	{ number: 7, title: 'Allergies', shortTitle: 'Allergies', section: 'allergies' },
	{ number: 8, title: 'Family History', shortTitle: 'Family Hx', section: 'familyHistory' },
	{ number: 9, title: 'Social History', shortTitle: 'Social Hx', section: 'socialHistory' }
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
