import type { AssessmentData } from './types';

/** Returns a human-readable label for a control level. */
export function controlLevelLabel(level: string): string {
	switch (level) {
		case 'wellControlled':
			return 'Well Controlled';
		case 'suboptimal':
			return 'Suboptimal';
		case 'poor':
			return 'Poor';
		case 'veryPoor':
			return 'Very Poor';
		case 'draft':
			return 'Draft';
		default:
			return 'Unknown';
	}
}

/** Control level colour class for Tailwind. */
export function controlLevelColor(level: string): string {
	switch (level) {
		case 'wellControlled':
			return 'bg-green-100 text-green-800 border-green-300';
		case 'suboptimal':
			return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		case 'poor':
			return 'bg-orange-100 text-orange-800 border-orange-300';
		case 'veryPoor':
			return 'bg-red-100 text-red-800 border-red-300';
		case 'draft':
			return 'bg-gray-100 text-gray-700 border-gray-300';
		default:
			return 'bg-gray-100 text-gray-700 border-gray-300';
	}
}

/** Get the HbA1c value normalised to mmol/mol. */
export function hba1cMmolMol(data: AssessmentData): number | null {
	if (data.glycaemicControl.hba1cValue === null) return null;
	if (data.glycaemicControl.hba1cUnit === 'percent') {
		return (data.glycaemicControl.hba1cValue - 2.15) * 10.929;
	}
	return data.glycaemicControl.hba1cValue;
}

/** Collect all scored items from the assessment data. */
export function collectScoredItems(data: AssessmentData): (number | null)[] {
	return [
		data.medications.medicationAdherence,
		data.selfCareLifestyle.dietAdherence,
		data.psychologicalWellbeing.diabetesDistress,
		data.psychologicalWellbeing.copingAbility,
		data.psychologicalWellbeing.fearOfHypoglycaemia,
		data.psychologicalWellbeing.depressionScreening,
		data.psychologicalWellbeing.anxietyScreening,
		data.glycaemicControl.timeInRange
	];
}

/** Count the number of active complications. */
export function countComplications(data: AssessmentData): number {
	let count = 0;
	if (
		data.complicationsScreening.retinopathyStatus !== '' &&
		data.complicationsScreening.retinopathyStatus !== 'none'
	) {
		count++;
	}
	if (data.complicationsScreening.neuropathySymptoms === 'yes') count++;
	if (data.complicationsScreening.egfr !== null && data.complicationsScreening.egfr < 60) count++;
	if (data.footAssessment.ulcerPresent === 'yes') count++;
	if (data.cardiovascularRisk.previousCvdEvent === 'yes') count++;
	if (data.footAssessment.previousAmputation === 'yes') count++;
	return count;
}

/**
 * Calculate the composite control score (0-100) based on multiple factors.
 * Uses HbA1c as the primary driver, with modifiers from complications,
 * self-care adherence, and psychological wellbeing.
 */
export function calculateCompositeScore(data: AssessmentData): number | null {
	let score = 50;
	let factors = 0;

	// HbA1c-based score (primary factor, 40% weight)
	if (data.glycaemicControl.hba1cValue !== null) {
		let hba1cMmol: number;
		if (data.glycaemicControl.hba1cUnit === 'percent') {
			hba1cMmol = (data.glycaemicControl.hba1cValue - 2.15) * 10.929;
		} else {
			hba1cMmol = data.glycaemicControl.hba1cValue;
		}

		let hba1cScore: number;
		if (hba1cMmol <= 48) hba1cScore = 100;
		else if (hba1cMmol <= 53) hba1cScore = 80;
		else if (hba1cMmol <= 64) hba1cScore = 60;
		else if (hba1cMmol <= 75) hba1cScore = 40;
		else if (hba1cMmol <= 86) hba1cScore = 20;
		else hba1cScore = 0;

		score = hba1cScore;
		factors += 4;
	}

	// Medication adherence modifier (1-5 scale)
	if (data.medications.medicationAdherence !== null) {
		const adherenceScore = ((data.medications.medicationAdherence - 1) / 4) * 100;
		score = (score * factors + adherenceScore) / (factors + 1);
		factors += 1;
	}

	// Self-care / diet adherence modifier (1-5 scale)
	if (data.selfCareLifestyle.dietAdherence !== null) {
		const dietScore = ((data.selfCareLifestyle.dietAdherence - 1) / 4) * 100;
		score = (score * factors + dietScore) / (factors + 1);
		factors += 1;
	}

	// Time in range modifier (0-100%)
	if (data.glycaemicControl.timeInRange !== null) {
		const tirScore = data.glycaemicControl.timeInRange;
		score = (score * factors + tirScore) / (factors + 1);
		factors += 1;
	}

	// Complication penalty
	const complicationCount = countComplications(data);
	if (complicationCount > 0) {
		const penalty = Math.min(complicationCount * 5, 30);
		score = Math.max(score - penalty, 0);
	}

	if (factors === 0) return null;

	return Math.round(score);
}

/** Calculate age from date of birth string. */
export function calculateAge(dob: string): number | null {
	if (!dob) return null;
	const birth = new Date(dob);
	if (isNaN(birth.getTime())) return null;
	const today = new Date();
	let age = today.getFullYear() - birth.getFullYear();
	const m = today.getMonth() - birth.getMonth();
	if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
		age--;
	}
	return age;
}
