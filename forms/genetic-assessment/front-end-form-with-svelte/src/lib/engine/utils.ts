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
 *   0-2  = Low Risk
 *   3-5  = Moderate Risk
 *   6+   = High Risk
 */
export function riskCategory(score: number): RiskLevel {
	if (score <= 2) return 'Low';
	if (score <= 5) return 'Moderate';
	return 'High';
}

/** Risk level label for display. */
export function riskLabel(score: number): string {
	const level = riskCategory(score);
	return `Risk Score ${score} - ${level} Risk`;
}

/** Risk level colour class. */
export function riskColor(score: number): string {
	if (score <= 2) return 'bg-green-100 text-green-800 border-green-300';
	if (score <= 5) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
	return 'bg-red-100 text-red-800 border-red-300';
}
