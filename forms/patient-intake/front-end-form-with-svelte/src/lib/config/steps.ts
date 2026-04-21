import type { StepConfig, AssessmentData } from '$lib/engine/types';

export const TOTAL_STEPS = 10;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Personal Information', shortTitle: 'Personal', section: 'personalInformation' },
	{ number: 2, title: 'Insurance & ID', shortTitle: 'Insurance', section: 'insuranceAndId' },
	{ number: 3, title: 'Reason for Visit', shortTitle: 'Visit', section: 'reasonForVisit' },
	{ number: 4, title: 'Medical History', shortTitle: 'History', section: 'medicalHistory' },
	{ number: 5, title: 'Current Medications', shortTitle: 'Meds', section: 'medications' },
	{ number: 6, title: 'Allergies', shortTitle: 'Allergies', section: 'allergies' },
	{ number: 7, title: 'Family History', shortTitle: 'Family', section: 'familyHistory' },
	{ number: 8, title: 'Social History', shortTitle: 'Social', section: 'socialHistory' },
	{ number: 9, title: 'Review of Systems', shortTitle: 'Systems', section: 'reviewOfSystems' },
	{ number: 10, title: 'Consent & Preferences', shortTitle: 'Consent', section: 'consentAndPreferences' }
];

export function getVisibleSteps(_data: AssessmentData): StepConfig[] {
	// All steps are always visible for patient intake
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
