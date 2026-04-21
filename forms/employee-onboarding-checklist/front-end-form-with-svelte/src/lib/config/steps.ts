import type { StepConfig, AssessmentData } from '$lib/engine/types';

export const TOTAL_STEPS = 10;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Demographics', shortTitle: 'Demographics', section: 'demographics' },
	{ number: 2, title: 'Pre-Employment Checks', shortTitle: 'Pre-Emp', section: 'preEmploymentChecks' },
	{ number: 3, title: 'Occupational Health', shortTitle: 'OH', section: 'occupationalHealth' },
	{ number: 4, title: 'Mandatory Training', shortTitle: 'Training', section: 'mandatoryTraining' },
	{ number: 5, title: 'Professional Registration', shortTitle: 'Reg', section: 'professionalRegistration' },
	{ number: 6, title: 'IT Systems & Access', shortTitle: 'IT', section: 'itSystemsAccess' },
	{ number: 7, title: 'Uniform & ID Badge', shortTitle: 'ID', section: 'uniformIDBadge' },
	{ number: 8, title: 'Induction Programme', shortTitle: 'Induction', section: 'inductionProgramme' },
	{ number: 9, title: 'Probation & Supervision', shortTitle: 'Probation', section: 'probationSupervision' },
	{ number: 10, title: 'Sign-off & Compliance', shortTitle: 'Sign-off', section: 'signOffCompliance' }
];

export function getVisibleSteps(_data: AssessmentData): StepConfig[] {
	// All steps are always visible in the onboarding checklist
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
