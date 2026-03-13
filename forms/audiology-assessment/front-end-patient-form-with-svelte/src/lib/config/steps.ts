import type { StepConfig, AssessmentData } from '$lib/engine/types';

export const TOTAL_STEPS = 9;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Demographics', shortTitle: 'Demographics', section: 'demographics' },
	{ number: 2, title: 'Chief Complaint', shortTitle: 'Complaint', section: 'chiefComplaint' },
	{ number: 3, title: 'Hearing History', shortTitle: 'History', section: 'hearingHistory' },
	{ number: 4, title: 'Audiometric Results', shortTitle: 'Audiometry', section: 'audiometricResults' },
	{ number: 5, title: 'Tinnitus Assessment', shortTitle: 'Tinnitus', section: 'tinnitusAssessment' },
	{ number: 6, title: 'Vestibular Symptoms', shortTitle: 'Vestibular', section: 'vestibularSymptoms' },
	{ number: 7, title: 'Otoscopic Findings', shortTitle: 'Otoscopy', section: 'otoscopicFindings' },
	{ number: 8, title: 'Medical History', shortTitle: 'Medical', section: 'medicalHistory' },
	{
		number: 9,
		title: 'Functional & Communication',
		shortTitle: 'Functional',
		section: 'functionalCommunication'
	}
];

export function getVisibleSteps(data: AssessmentData): StepConfig[] {
	return steps.filter((s) => !s.isConditional || s.shouldShow?.(data));
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

export function isStepVisible(stepNumber: number, data: AssessmentData): boolean {
	const step = steps.find((s) => s.number === stepNumber);
	if (!step) return false;
	if (!step.isConditional) return true;
	return step.shouldShow?.(data) ?? true;
}
