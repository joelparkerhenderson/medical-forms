import type { StepConfig } from '$lib/engine/types';

export const TOTAL_STEPS = 9;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Demographics', shortTitle: 'Demographics', section: 'demographics' },
	{ number: 2, title: 'Hearing History', shortTitle: 'History', section: 'hearingHistory' },
	{ number: 3, title: 'HHIE-S Questionnaire', shortTitle: 'HHIE-S', section: 'hhiesQuestionnaire' },
	{ number: 4, title: 'Communication Difficulties', shortTitle: 'Communication', section: 'communicationDifficulties' },
	{ number: 5, title: 'Current Hearing Aids', shortTitle: 'Hearing Aids', section: 'currentHearingAids' },
	{ number: 6, title: 'Ear Examination', shortTitle: 'Ear Exam', section: 'earExamination' },
	{ number: 7, title: 'Audiogram Results', shortTitle: 'Audiogram', section: 'audiogramResults' },
	{ number: 8, title: 'Lifestyle & Needs', shortTitle: 'Lifestyle', section: 'lifestyleNeeds' },
	{ number: 9, title: 'Expectations & Goals', shortTitle: 'Goals', section: 'expectationsGoals' }
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
