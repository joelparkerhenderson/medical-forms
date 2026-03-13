import type { StepConfig, AssessmentData } from '$lib/engine/types';

export const TOTAL_STEPS = 10;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Demographics', shortTitle: 'Demographics', section: 'demographics' },
	{ number: 2, title: 'Chief Complaint', shortTitle: 'Complaint', section: 'chiefComplaint' },
	{ number: 3, title: 'Visual Acuity', shortTitle: 'VA', section: 'visualAcuity' },
	{ number: 4, title: 'Ocular History', shortTitle: 'History', section: 'ocularHistory' },
	{ number: 5, title: 'Anterior Segment', shortTitle: 'Anterior', section: 'anteriorSegment' },
	{ number: 6, title: 'Posterior Segment', shortTitle: 'Posterior', section: 'posteriorSegment' },
	{
		number: 7,
		title: 'Visual Field & Pupils',
		shortTitle: 'VF/Pupils',
		section: 'visualFieldPupils'
	},
	{
		number: 8,
		title: 'Current Medications',
		shortTitle: 'Meds',
		section: 'currentMedications'
	},
	{
		number: 9,
		title: 'Systemic Conditions',
		shortTitle: 'Systemic',
		section: 'systemicConditions'
	},
	{
		number: 10,
		title: 'Functional Impact',
		shortTitle: 'Functional',
		section: 'functionalImpact'
	}
];

export function getVisibleSteps(_data: AssessmentData): StepConfig[] {
	// All 10 steps are always visible in the ophthalmology assessment
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
