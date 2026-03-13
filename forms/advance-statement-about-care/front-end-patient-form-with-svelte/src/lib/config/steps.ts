import type { StepConfig, StatementData } from '$lib/engine/types';

export const TOTAL_STEPS = 9;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Personal Information', shortTitle: 'Personal', section: 'personalInformation' },
	{ number: 2, title: 'Statement Context', shortTitle: 'Context', section: 'statementContext' },
	{ number: 3, title: 'Values & Beliefs', shortTitle: 'Values', section: 'valuesBeliefs' },
	{ number: 4, title: 'Care Preferences', shortTitle: 'Care', section: 'carePreferences' },
	{ number: 5, title: 'Medical Treatment Wishes', shortTitle: 'Treatment', section: 'medicalTreatmentWishes' },
	{ number: 6, title: 'Communication Preferences', shortTitle: 'Comms', section: 'communicationPreferences' },
	{ number: 7, title: 'People Important to Me', shortTitle: 'People', section: 'peopleImportantToMe' },
	{ number: 8, title: 'Practical Matters', shortTitle: 'Practical', section: 'practicalMatters' },
	{ number: 9, title: 'Signatures & Witnesses', shortTitle: 'Signatures', section: 'signaturesWitnesses' }
];

export function getVisibleSteps(_data: StatementData): StepConfig[] {
	// All steps are always visible for an advance statement
	return steps;
}

export function getNextStep(current: number, data: StatementData): number | null {
	const visible = getVisibleSteps(data);
	const idx = visible.findIndex((s) => s.number === current);
	if (idx === -1 || idx >= visible.length - 1) return null;
	return visible[idx + 1].number;
}

export function getPrevStep(current: number, data: StatementData): number | null {
	const visible = getVisibleSteps(data);
	const idx = visible.findIndex((s) => s.number === current);
	if (idx <= 0) return null;
	return visible[idx - 1].number;
}

export function isStepVisible(_stepNumber: number, _data: StatementData): boolean {
	return true;
}
