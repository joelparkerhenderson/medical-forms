import type { StepConfig } from '$lib/engine/types';

export const TOTAL_STEPS = 10;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Demographics', shortTitle: 'Demographics', section: 'demographics' },
	{ number: 2, title: 'Pregnancy Details', shortTitle: 'Pregnancy', section: 'pregnancyDetails' },
	{ number: 3, title: 'Obstetric History', shortTitle: 'Obstetric Hx', section: 'obstetricHistory' },
	{ number: 4, title: 'Medical History', shortTitle: 'Medical Hx', section: 'medicalHistory' },
	{ number: 5, title: 'Current Symptoms', shortTitle: 'Symptoms', section: 'currentSymptoms' },
	{ number: 6, title: 'Vital Signs', shortTitle: 'Vitals', section: 'vitalSigns' },
	{ number: 7, title: 'Laboratory Results', shortTitle: 'Labs', section: 'laboratoryResults' },
	{ number: 8, title: 'Lifestyle & Nutrition', shortTitle: 'Lifestyle', section: 'lifestyleNutrition' },
	{ number: 9, title: 'Mental Health Screening', shortTitle: 'Mental Health', section: 'mentalHealthScreening' },
	{ number: 10, title: 'Birth Plan Preferences', shortTitle: 'Birth Plan', section: 'birthPlanPreferences' }
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
