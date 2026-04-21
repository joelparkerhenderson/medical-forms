import type { RiskLevel } from './types';

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

/**
 * Risk score category.
 *   0-2   = Low risk
 *   3-5   = Moderate risk
 *   6-9   = High risk
 *   10+   = Very high risk
 */
export function riskCategory(score: number): RiskLevel {
	if (score <= 2) return 'low';
	if (score <= 5) return 'moderate';
	if (score <= 9) return 'high';
	return 'very-high';
}

/** Risk level display label. */
export function riskLevelLabel(level: RiskLevel): string {
	switch (level) {
		case 'low':
			return 'Low Risk';
		case 'moderate':
			return 'Moderate Risk';
		case 'high':
			return 'High Risk';
		case 'very-high':
			return 'Very High Risk';
	}
}

/** Risk score label for display. */
export function riskScoreLabel(score: number): string {
	const level = riskCategory(score);
	return `Risk Score ${score} - ${riskLevelLabel(level)}`;
}

/** Risk score colour class. */
export function riskScoreColor(score: number): string {
	const level = riskCategory(score);
	switch (level) {
		case 'low':
			return 'bg-green-100 text-green-800 border-green-300';
		case 'moderate':
			return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		case 'high':
			return 'bg-orange-100 text-orange-800 border-orange-300';
		case 'very-high':
			return 'bg-red-100 text-red-800 border-red-300';
	}
}

/** Risk level colour class. */
export function riskLevelColor(level: string): string {
	switch (level) {
		case 'low':
			return 'bg-green-100 text-green-800 border-green-300';
		case 'moderate':
			return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		case 'high':
			return 'bg-orange-100 text-orange-800 border-orange-300';
		case 'very-high':
			return 'bg-red-100 text-red-800 border-red-300';
		default:
			return 'bg-gray-100 text-gray-700 border-gray-300';
	}
}

/** Gestational weeks label. */
export function gestationalWeeksLabel(weeks: number | null): string {
	if (weeks === null) return 'N/A';
	if (weeks < 14) return `${weeks} weeks (1st trimester)`;
	if (weeks < 28) return `${weeks} weeks (2nd trimester)`;
	return `${weeks} weeks (3rd trimester)`;
}
