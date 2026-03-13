import type { StepConfig, AssessmentData } from '$lib/engine/types';

export const TOTAL_STEPS = 10;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Demographics', shortTitle: 'Demographics', section: 'demographics' },
	{ number: 2, title: 'Chief Complaint', shortTitle: 'Complaint', section: 'chiefComplaint' },
	{ number: 3, title: 'Upper GI Symptoms', shortTitle: 'Upper GI', section: 'upperGISymptoms' },
	{ number: 4, title: 'Lower GI Symptoms', shortTitle: 'Lower GI', section: 'lowerGISymptoms' },
	{
		number: 5,
		title: 'Abdominal Pain Assessment',
		shortTitle: 'Abd Pain',
		section: 'abdominalPainAssessment'
	},
	{ number: 6, title: 'Liver & Pancreas', shortTitle: 'Liver/Panc', section: 'liverPancreas' },
	{
		number: 7,
		title: 'Previous GI History',
		shortTitle: 'GI History',
		section: 'previousGIHistory'
	},
	{
		number: 8,
		title: 'Current Medications',
		shortTitle: 'Meds',
		section: 'currentMedications'
	},
	{
		number: 9,
		title: 'Allergies & Diet',
		shortTitle: 'Allergy/Diet',
		section: 'allergiesDiet'
	},
	{
		number: 10,
		title: 'Red Flags & Social',
		shortTitle: 'Red Flags',
		section: 'redFlagsSocial'
	}
];

export function getVisibleSteps(_data: AssessmentData): StepConfig[] {
	// All 10 steps are always visible for gastroenterology assessment
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
