import type { StepConfig } from '$lib/engine/types';

export const TOTAL_STEPS = 10;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Demographics', shortTitle: 'Demographics', section: 'demographics' },
	{ number: 2, title: 'Reproductive History', shortTitle: 'Reproductive', section: 'reproductiveHistory' },
	{ number: 3, title: 'Menstrual History', shortTitle: 'Menstrual', section: 'menstrualHistory' },
	{ number: 4, title: 'Current Contraception', shortTitle: 'Current', section: 'currentContraception' },
	{ number: 5, title: 'Medical History', shortTitle: 'Medical Hx', section: 'medicalHistory' },
	{ number: 6, title: 'Cardiovascular Risk', shortTitle: 'CV Risk', section: 'cardiovascularRisk' },
	{ number: 7, title: 'Lifestyle Factors', shortTitle: 'Lifestyle', section: 'lifestyleFactors' },
	{ number: 8, title: 'Preferences & Priorities', shortTitle: 'Preferences', section: 'preferencesPriorities' },
	{ number: 9, title: 'Breast & Cervical Screening', shortTitle: 'Screening', section: 'breastCervicalScreening' },
	{ number: 10, title: 'Family Planning Goals', shortTitle: 'Planning', section: 'familyPlanningGoals' }
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
