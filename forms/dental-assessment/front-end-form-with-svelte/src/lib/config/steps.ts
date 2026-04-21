import type { StepConfig, AssessmentData } from '$lib/engine/types';

export const TOTAL_STEPS = 9;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Demographics', shortTitle: 'Demographics', section: 'demographics' },
	{ number: 2, title: 'Chief Complaint', shortTitle: 'Complaint', section: 'chiefComplaint' },
	{ number: 3, title: 'Dental History', shortTitle: 'Dental Hx', section: 'dentalHistory' },
	{ number: 4, title: 'DMFT Assessment', shortTitle: 'DMFT', section: 'dmftAssessment' },
	{
		number: 5,
		title: 'Periodontal Assessment',
		shortTitle: 'Perio',
		section: 'periodontalAssessment'
	},
	{
		number: 6,
		title: 'Oral Examination',
		shortTitle: 'Oral Exam',
		section: 'oralExamination'
	},
	{ number: 7, title: 'Medical History', shortTitle: 'Medical Hx', section: 'medicalHistory' },
	{
		number: 8,
		title: 'Current Medications',
		shortTitle: 'Medications',
		section: 'currentMedications'
	},
	{
		number: 9,
		title: 'Radiographic Findings',
		shortTitle: 'Radiology',
		section: 'radiographicFindings'
	}
];

export function getVisibleSteps(data: AssessmentData): StepConfig[] {
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

export function isStepVisible(stepNumber: number, data: AssessmentData): boolean {
	const step = steps.find((s) => s.number === stepNumber);
	return !!step;
}
