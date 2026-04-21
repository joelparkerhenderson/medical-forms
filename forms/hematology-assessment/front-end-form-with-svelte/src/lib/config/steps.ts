import type { StepConfig } from '$lib/engine/types';

export const TOTAL_STEPS = 10;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Patient Information', shortTitle: 'Patient', section: 'patientInformation' },
	{ number: 2, title: 'Blood Count Analysis', shortTitle: 'CBC', section: 'bloodCountAnalysis' },
	{ number: 3, title: 'Coagulation Studies', shortTitle: 'Coagulation', section: 'coagulationStudies' },
	{ number: 4, title: 'Peripheral Blood Film', shortTitle: 'Blood Film', section: 'peripheralBloodFilm' },
	{ number: 5, title: 'Iron Studies', shortTitle: 'Iron', section: 'ironStudies' },
	{ number: 6, title: 'Hemoglobinopathy Screening', shortTitle: 'Hemoglobin', section: 'hemoglobinopathyScreening' },
	{ number: 7, title: 'Bone Marrow Assessment', shortTitle: 'Bone Marrow', section: 'boneMarrowAssessment' },
	{ number: 8, title: 'Transfusion History', shortTitle: 'Transfusion', section: 'transfusionHistory' },
	{ number: 9, title: 'Treatment & Medications', shortTitle: 'Treatment', section: 'treatmentMedications' },
	{ number: 10, title: 'Clinical Review', shortTitle: 'Review', section: 'clinicalReview' }
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
