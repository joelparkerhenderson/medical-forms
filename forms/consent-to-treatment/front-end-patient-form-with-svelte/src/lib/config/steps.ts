import type { StepConfig } from '$lib/engine/types';

export const TOTAL_STEPS = 8;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Patient Information', shortTitle: 'Patient', section: 'patientInformation' },
	{ number: 2, title: 'Procedure Details', shortTitle: 'Procedure', section: 'procedureDetails' },
	{ number: 3, title: 'Risks & Benefits', shortTitle: 'Risks', section: 'risksBenefits' },
	{ number: 4, title: 'Alternative Treatments', shortTitle: 'Alternatives', section: 'alternativeTreatments' },
	{ number: 5, title: 'Anesthesia Information', shortTitle: 'Anesthesia', section: 'anesthesiaInformation' },
	{ number: 6, title: 'Questions & Understanding', shortTitle: 'Understanding', section: 'questionsUnderstanding' },
	{ number: 7, title: 'Patient Rights', shortTitle: 'Rights', section: 'patientRights' },
	{ number: 8, title: 'Signature & Consent', shortTitle: 'Signature', section: 'signatureConsent' }
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
