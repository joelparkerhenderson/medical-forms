// ──────────────────────────────────────────────
// Step configuration and navigation
// ──────────────────────────────────────────────

import { calculateAge } from './utils.js';

export const TOTAL_STEPS = 16;

export const steps = [
	{ number: 1, title: 'Demographics', shortTitle: 'Demographics', section: 'demographics' },
	{ number: 2, title: 'Cardiovascular', shortTitle: 'Cardio', section: 'cardiovascular' },
	{ number: 3, title: 'Respiratory', shortTitle: 'Resp', section: 'respiratory' },
	{ number: 4, title: 'Renal', shortTitle: 'Renal', section: 'renal' },
	{ number: 5, title: 'Hepatic', shortTitle: 'Hepatic', section: 'hepatic' },
	{ number: 6, title: 'Endocrine', shortTitle: 'Endocrine', section: 'endocrine' },
	{ number: 7, title: 'Neurological', shortTitle: 'Neuro', section: 'neurological' },
	{ number: 8, title: 'Haematological', shortTitle: 'Haem', section: 'haematological' },
	{ number: 9, title: 'Musculoskeletal & Airway', shortTitle: 'MSK/Airway', section: 'musculoskeletalAirway' },
	{ number: 10, title: 'Gastrointestinal', shortTitle: 'GI', section: 'gastrointestinal' },
	{ number: 11, title: 'Medications', shortTitle: 'Meds', section: 'medications' },
	{ number: 12, title: 'Allergies', shortTitle: 'Allergies', section: 'allergies' },
	{ number: 13, title: 'Previous Anaesthesia', shortTitle: 'Prev Anaes', section: 'previousAnaesthesia' },
	{ number: 14, title: 'Social History', shortTitle: 'Social', section: 'socialHistory' },
	{ number: 15, title: 'Functional Capacity', shortTitle: 'Functional', section: 'functionalCapacity' },
	{
		number: 16,
		title: 'Pregnancy',
		shortTitle: 'Pregnancy',
		section: 'pregnancy',
		isConditional: true,
		shouldShow: (data) => {
			if (data.demographics.sex !== 'female') return false;
			if (!data.demographics.dateOfBirth) return false;
			const age = calculateAge(data.demographics.dateOfBirth);
			return age !== null && age >= 12 && age <= 55;
		}
	}
];

export function getVisibleSteps(data) {
	return steps.filter((s) => !s.isConditional || (s.shouldShow && s.shouldShow(data)));
}

export function getNextStep(current, data) {
	const visible = getVisibleSteps(data);
	const idx = visible.findIndex((s) => s.number === current);
	if (idx === -1 || idx >= visible.length - 1) return null;
	return visible[idx + 1].number;
}

export function getPrevStep(current, data) {
	const visible = getVisibleSteps(data);
	const idx = visible.findIndex((s) => s.number === current);
	if (idx <= 0) return null;
	return visible[idx - 1].number;
}

export function isStepVisible(stepNumber, data) {
	const step = steps.find((s) => s.number === stepNumber);
	if (!step) return false;
	if (!step.isConditional) return true;
	return step.shouldShow ? step.shouldShow(data) : true;
}
