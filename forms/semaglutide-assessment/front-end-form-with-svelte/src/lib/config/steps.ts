import type { StepConfig } from '$lib/engine/types';

export const TOTAL_STEPS = 10;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Demographics', shortTitle: 'Demographics', section: 'demographics' },
	{ number: 2, title: 'Indication & Goals', shortTitle: 'Indication', section: 'indicationGoals' },
	{ number: 3, title: 'Body Composition', shortTitle: 'Body Comp', section: 'bodyComposition' },
	{ number: 4, title: 'Metabolic Profile', shortTitle: 'Metabolic', section: 'metabolicProfile' },
	{ number: 5, title: 'Cardiovascular Risk', shortTitle: 'CV Risk', section: 'cardiovascularRisk' },
	{ number: 6, title: 'Contraindications Screening', shortTitle: 'Contraindications', section: 'contraindicationsScreening' },
	{ number: 7, title: 'GI History', shortTitle: 'GI History', section: 'gastrointestinalHistory' },
	{ number: 8, title: 'Current Medications', shortTitle: 'Medications', section: 'currentMedications' },
	{ number: 9, title: 'Mental Health Screening', shortTitle: 'Mental Health', section: 'mentalHealthScreening' },
	{ number: 10, title: 'Treatment Plan', shortTitle: 'Treatment', section: 'treatmentPlan' }
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
