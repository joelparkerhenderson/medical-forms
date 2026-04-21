import type { StepConfig } from '$lib/engine/types';

export const TOTAL_STEPS = 10;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Patient Information', shortTitle: 'Patient', section: 'patientInformation' },
	{ number: 2, title: 'Diabetes History', shortTitle: 'History', section: 'diabetesHistory' },
	{ number: 3, title: 'Glycaemic Control', shortTitle: 'Glycaemic', section: 'glycaemicControl' },
	{ number: 4, title: 'Medications', shortTitle: 'Medications', section: 'medications' },
	{ number: 5, title: 'Complications Screening', shortTitle: 'Complications', section: 'complicationsScreening' },
	{ number: 6, title: 'Cardiovascular Risk', shortTitle: 'Cardiovascular', section: 'cardiovascularRisk' },
	{ number: 7, title: 'Self-Care & Lifestyle', shortTitle: 'Self-Care', section: 'selfCareLifestyle' },
	{ number: 8, title: 'Psychological Wellbeing', shortTitle: 'Psychological', section: 'psychologicalWellbeing' },
	{ number: 9, title: 'Foot Assessment', shortTitle: 'Foot', section: 'footAssessment' },
	{ number: 10, title: 'Review & Care Plan', shortTitle: 'Review', section: 'reviewCarePlan' }
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
