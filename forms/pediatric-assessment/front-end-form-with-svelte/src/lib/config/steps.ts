import type { StepConfig, AssessmentData } from '$lib/engine/types';

export const TOTAL_STEPS = 9;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Demographics', shortTitle: 'Demographics', section: 'demographics' },
	{ number: 2, title: 'Birth History', shortTitle: 'Birth', section: 'birthHistory' },
	{ number: 3, title: 'Growth & Nutrition', shortTitle: 'Growth', section: 'growthNutrition' },
	{
		number: 4,
		title: 'Developmental Milestones',
		shortTitle: 'Dev Milestones',
		section: 'developmentalMilestones'
	},
	{
		number: 5,
		title: 'Immunization Status',
		shortTitle: 'Immunization',
		section: 'immunizationStatus'
	},
	{ number: 6, title: 'Medical History', shortTitle: 'Medical Hx', section: 'medicalHistory' },
	{
		number: 7,
		title: 'Current Medications',
		shortTitle: 'Medications',
		section: 'currentMedications'
	},
	{ number: 8, title: 'Family History', shortTitle: 'Family Hx', section: 'familyHistory' },
	{
		number: 9,
		title: 'Social & Environmental',
		shortTitle: 'Social/Env',
		section: 'socialEnvironmental'
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
