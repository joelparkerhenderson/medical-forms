import type { StepConfig, AssessmentData } from '$lib/engine/types';

export const TOTAL_STEPS = 10;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Demographics', shortTitle: 'Demographics', section: 'demographics' },
	{ number: 2, title: 'Chief Complaint', shortTitle: 'Complaint', section: 'chiefComplaint' },
	{ number: 3, title: 'Dyspnoea Assessment', shortTitle: 'Dyspnoea', section: 'dyspnoeaAssessment' },
	{ number: 4, title: 'Cough Assessment', shortTitle: 'Cough', section: 'coughAssessment' },
	{ number: 5, title: 'Respiratory History', shortTitle: 'Resp Hx', section: 'respiratoryHistory' },
	{ number: 6, title: 'Pulmonary Function', shortTitle: 'PFTs', section: 'pulmonaryFunction' },
	{ number: 7, title: 'Current Medications', shortTitle: 'Meds', section: 'currentMedications' },
	{ number: 8, title: 'Allergies', shortTitle: 'Allergies', section: 'allergies' },
	{ number: 9, title: 'Smoking & Exposures', shortTitle: 'Exposures', section: 'smokingExposures' },
	{ number: 10, title: 'Sleep & Functional', shortTitle: 'Sleep', section: 'sleepFunctional' }
];

export function getVisibleSteps(_data: AssessmentData): StepConfig[] {
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
