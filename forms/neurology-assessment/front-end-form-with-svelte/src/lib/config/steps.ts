import type { StepConfig, AssessmentData } from '$lib/engine/types';

export const TOTAL_STEPS = 10;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Demographics', shortTitle: 'Demographics', section: 'demographics' },
	{ number: 2, title: 'Chief Complaint', shortTitle: 'Complaint', section: 'chiefComplaint' },
	{ number: 3, title: 'NIHSS Assessment', shortTitle: 'NIHSS', section: 'nihssAssessment' },
	{ number: 4, title: 'Headache Assessment', shortTitle: 'Headache', section: 'headacheAssessment' },
	{ number: 5, title: 'Seizure History', shortTitle: 'Seizure', section: 'seizureHistory' },
	{ number: 6, title: 'Motor & Sensory Exam', shortTitle: 'Motor/Sensory', section: 'motorSensoryExam' },
	{ number: 7, title: 'Cognitive Assessment', shortTitle: 'Cognitive', section: 'cognitiveAssessment' },
	{ number: 8, title: 'Current Medications', shortTitle: 'Medications', section: 'currentMedications' },
	{ number: 9, title: 'Diagnostic Results', shortTitle: 'Diagnostics', section: 'diagnosticResults' },
	{ number: 10, title: 'Functional & Social', shortTitle: 'Functional', section: 'functionalSocial' }
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
