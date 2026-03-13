import type { StepConfig, AssessmentData } from '$lib/engine/types';

export const TOTAL_STEPS = 11;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Demographics', shortTitle: 'Demographics', section: 'demographics' },
	{ number: 2, title: 'Presenting Complaint', shortTitle: 'Complaint', section: 'presentingComplaint' },
	{ number: 3, title: 'Psychiatric History', shortTitle: 'Psych Hx', section: 'psychiatricHistory' },
	{ number: 4, title: 'Mental Status Exam', shortTitle: 'MSE', section: 'mentalStatusExam' },
	{ number: 5, title: 'Risk Assessment', shortTitle: 'Risk', section: 'riskAssessment' },
	{ number: 6, title: 'Mood & Anxiety', shortTitle: 'Mood', section: 'moodAndAnxiety' },
	{ number: 7, title: 'Substance Use', shortTitle: 'Substance', section: 'substanceUse' },
	{ number: 8, title: 'Current Medications', shortTitle: 'Meds', section: 'currentMedications' },
	{ number: 9, title: 'Medical History', shortTitle: 'Medical', section: 'medicalHistory' },
	{ number: 10, title: 'Social History', shortTitle: 'Social', section: 'socialHistory' },
	{ number: 11, title: 'Capacity & Consent', shortTitle: 'Capacity', section: 'capacityAndConsent' }
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
