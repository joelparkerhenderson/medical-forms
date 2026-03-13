import type { StepConfig, AssessmentData } from '$lib/engine/types';

export const TOTAL_STEPS = 10;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Personal Information', shortTitle: 'Personal', section: 'personalInformation' },
	{ number: 2, title: 'Capacity Declaration', shortTitle: 'Capacity', section: 'capacityDeclaration' },
	{ number: 3, title: 'Circumstances', shortTitle: 'Circumstances', section: 'circumstances' },
	{ number: 4, title: 'Treatments Refused - General', shortTitle: 'General Refusal', section: 'treatmentsRefusedGeneral' },
	{ number: 5, title: 'Treatments Refused - Life-Sustaining', shortTitle: 'Life-Sustaining', section: 'treatmentsRefusedLifeSustaining' },
	{ number: 6, title: 'Exceptions & Conditions', shortTitle: 'Exceptions', section: 'exceptionsConditions' },
	{ number: 7, title: 'Other Wishes', shortTitle: 'Wishes', section: 'otherWishes' },
	{ number: 8, title: 'Lasting Power of Attorney', shortTitle: 'LPA', section: 'lastingPowerOfAttorney' },
	{ number: 9, title: 'Healthcare Professional Review', shortTitle: 'HCP Review', section: 'healthcareProfessionalReview' },
	{ number: 10, title: 'Legal Signatures', shortTitle: 'Signatures', section: 'legalSignatures' }
];

export function getVisibleSteps(_data: AssessmentData): StepConfig[] {
	// All steps are always visible for ADRT
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
