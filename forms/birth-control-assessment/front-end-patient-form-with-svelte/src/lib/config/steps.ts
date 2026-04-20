import type { StepConfig, AssessmentData } from '$lib/engine/types';

export const TOTAL_STEPS = 10;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Demographics', shortTitle: 'Demographics', section: 'demographics' },
	{ number: 2, title: 'Menstrual History', shortTitle: 'Menstrual', section: 'menstrualHistory' },
	{ number: 3, title: 'Contraceptive History', shortTitle: 'Contraceptive', section: 'contraceptiveHistory' },
	{ number: 4, title: 'Medical History', shortTitle: 'Medical', section: 'medicalHistory' },
	{ number: 5, title: 'Cardiovascular Risk', shortTitle: 'CV Risk', section: 'cardiovascularRisk' },
	{ number: 6, title: 'Thromboembolism Risk', shortTitle: 'VTE Risk', section: 'thromboembolismRisk' },
	{ number: 7, title: 'Current Medications', shortTitle: 'Meds', section: 'currentMedications' },
	{ number: 8, title: 'Lifestyle Assessment', shortTitle: 'Lifestyle', section: 'lifestyleAssessment' },
	{ number: 9, title: 'Contraceptive Preferences', shortTitle: 'Preferences', section: 'contraceptivePreferences' },
	{ number: 10, title: 'Clinical Recommendation', shortTitle: 'Recommendation', section: 'clinicalRecommendation' }
];

export function getVisibleSteps(_data: AssessmentData): StepConfig[] {
	// All steps are always visible in the birth control assessment
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
