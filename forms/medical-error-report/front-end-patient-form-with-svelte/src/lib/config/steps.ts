import type { StepConfig, AssessmentData } from '$lib/engine/types';

export const TOTAL_STEPS = 10;

export const steps: StepConfig[] = [
	{ number: 1, title: 'Demographics', shortTitle: 'Demographics', section: 'demographics' },
	{ number: 2, title: 'Incident Details', shortTitle: 'Incident', section: 'incidentDetails' },
	{ number: 3, title: 'Patient Involvement', shortTitle: 'Patient', section: 'patientInvolvement' },
	{ number: 4, title: 'Error Classification', shortTitle: 'Classification', section: 'errorClassification' },
	{ number: 5, title: 'Contributing Factors', shortTitle: 'Factors', section: 'contributingFactors' },
	{ number: 6, title: 'Immediate Actions Taken', shortTitle: 'Actions', section: 'immediateActions' },
	{ number: 7, title: 'Patient Outcome', shortTitle: 'Outcome', section: 'patientOutcome' },
	{ number: 8, title: 'Root Cause Analysis', shortTitle: 'RCA', section: 'rootCauseAnalysis' },
	{ number: 9, title: 'Corrective Actions', shortTitle: 'Corrective', section: 'correctiveActions' },
	{ number: 10, title: 'Reporting & Follow-up', shortTitle: 'Reporting', section: 'reportingFollowup' }
];

export function getVisibleSteps(_data: AssessmentData): StepConfig[] {
	// All steps are always visible in the medical error report
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
