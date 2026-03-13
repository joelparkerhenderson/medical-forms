import type { StepConfig } from '$lib/engine/types';

export const TOTAL_STEPS = 14;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Patient Demographics', shortTitle: 'Demographics', section: 'demographics' },
	{ number: 2, title: 'Next of Kin & GP', shortTitle: 'NoK/GP', section: 'nextOfKinGP' },
	{ number: 3, title: 'Arrival & Triage', shortTitle: 'Triage', section: 'arrivalTriage' },
	{ number: 4, title: 'Presenting Complaint', shortTitle: 'Complaint', section: 'presentingComplaint' },
	{ number: 5, title: 'Pain Assessment', shortTitle: 'Pain', section: 'painAssessment' },
	{ number: 6, title: 'Medical History', shortTitle: 'History', section: 'medicalHistory' },
	{ number: 7, title: 'Vital Signs', shortTitle: 'Vitals', section: 'vitalSigns' },
	{ number: 8, title: 'Primary Survey (ABCDE)', shortTitle: 'ABCDE', section: 'primarySurvey' },
	{ number: 9, title: 'Clinical Examination', shortTitle: 'Exam', section: 'clinicalExamination' },
	{ number: 10, title: 'Investigations', shortTitle: 'Invest', section: 'investigations' },
	{ number: 11, title: 'Treatment & Interventions', shortTitle: 'Treatment', section: 'treatment' },
	{ number: 12, title: 'Assessment & Plan', shortTitle: 'Plan', section: 'assessmentPlan' },
	{ number: 13, title: 'Disposition', shortTitle: 'Disposition', section: 'disposition' },
	{ number: 14, title: 'Safeguarding & Consent', shortTitle: 'Safeguard', section: 'safeguardingConsent' }
];

export function getVisibleSteps(): StepConfig[] {
	return steps;
}

export function getNextStep(current: number): number | null {
	const idx = steps.findIndex((s) => s.number === current);
	if (idx === -1 || idx >= steps.length - 1) return null;
	return steps[idx + 1].number;
}

export function getPrevStep(current: number): number | null {
	const idx = steps.findIndex((s) => s.number === current);
	if (idx <= 0) return null;
	return steps[idx - 1].number;
}
