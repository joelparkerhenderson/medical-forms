import type { StepConfig, AssessmentData } from '$lib/engine/types';

export const TOTAL_STEPS = 10;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Demographics', shortTitle: 'Demographics', section: 'demographics' },
	{ number: 2, title: 'Menopause Status', shortTitle: 'Menopause', section: 'menopauseStatus' },
	{ number: 3, title: 'MRS Symptom Scale', shortTitle: 'MRS Scale', section: 'mrsSymptomScale' },
	{ number: 4, title: 'Vasomotor Symptoms', shortTitle: 'Vasomotor', section: 'vasomotorSymptoms' },
	{ number: 5, title: 'Bone Health', shortTitle: 'Bone', section: 'boneHealth' },
	{ number: 6, title: 'Cardiovascular Risk', shortTitle: 'CV Risk', section: 'cardiovascularRisk' },
	{ number: 7, title: 'Breast Health', shortTitle: 'Breast', section: 'breastHealth' },
	{ number: 8, title: 'Current Medications', shortTitle: 'Meds', section: 'currentMedications' },
	{ number: 9, title: 'Contraindications Screen', shortTitle: 'Contraindic.', section: 'contraindicationsScreen' },
	{ number: 10, title: 'Treatment Preferences', shortTitle: 'Preferences', section: 'treatmentPreferences' }
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
