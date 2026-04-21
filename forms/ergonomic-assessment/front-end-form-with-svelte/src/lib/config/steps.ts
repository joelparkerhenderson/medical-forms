import type { StepConfig, AssessmentData } from '$lib/engine/types';

export const TOTAL_STEPS = 10;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Demographics', shortTitle: 'Demographics', section: 'demographics' },
	{ number: 2, title: 'Workstation Setup', shortTitle: 'Workstation', section: 'workstationSetup' },
	{ number: 3, title: 'Posture Assessment', shortTitle: 'Posture', section: 'postureAssessment' },
	{ number: 4, title: 'Repetitive Tasks', shortTitle: 'Repetitive', section: 'repetitiveTasks' },
	{ number: 5, title: 'Manual Handling', shortTitle: 'Manual', section: 'manualHandling' },
	{ number: 6, title: 'Current Symptoms', shortTitle: 'Symptoms', section: 'currentSymptoms' },
	{ number: 7, title: 'Medical History', shortTitle: 'Medical Hx', section: 'medicalHistory' },
	{ number: 8, title: 'Current Interventions', shortTitle: 'Interventions', section: 'currentInterventions' },
	{ number: 9, title: 'Psychosocial Factors', shortTitle: 'Psychosocial', section: 'psychosocialFactors' },
	{ number: 10, title: 'Recommendations & Action Plan', shortTitle: 'Plan', section: 'recommendations' }
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
	const step = steps.find((s) => s.number === stepNumber);
	return !!step;
}
