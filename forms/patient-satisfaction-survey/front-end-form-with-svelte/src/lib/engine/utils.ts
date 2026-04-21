import type { SatisfactionCategory } from './types';

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
 * Normalize an array of Likert scores (1-5) to a 0-100 scale.
 * Ignores null values. Returns null if no valid scores.
 */
export function normalizeLikertScores(scores: (number | null)[]): number | null {
	const valid = scores.filter((s): s is number => s !== null && s >= 1 && s <= 5);
	if (valid.length === 0) return null;
	const sum = valid.reduce((a, b) => a + b, 0);
	const maxPossible = valid.length * 5;
	return Math.round((sum / maxPossible) * 100 * 10) / 10;
}

/** Get satisfaction category from normalized score. */
export function categorizeScore(score: number): SatisfactionCategory {
	if (score >= 85) return 'excellent';
	if (score >= 70) return 'good';
	if (score >= 50) return 'satisfactory';
	if (score >= 25) return 'poor';
	return 'very-poor';
}

/** Satisfaction category label. */
export function satisfactionCategoryLabel(category: SatisfactionCategory): string {
	switch (category) {
		case 'excellent':
			return 'Excellent';
		case 'good':
			return 'Good';
		case 'satisfactory':
			return 'Satisfactory';
		case 'poor':
			return 'Poor';
		case 'very-poor':
			return 'Very Poor';
	}
}

/** Satisfaction category colour class. */
export function satisfactionCategoryColor(category: SatisfactionCategory): string {
	switch (category) {
		case 'excellent':
			return 'bg-green-100 text-green-800 border-green-300';
		case 'good':
			return 'bg-blue-100 text-blue-800 border-blue-300';
		case 'satisfactory':
			return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		case 'poor':
			return 'bg-orange-100 text-orange-800 border-orange-300';
		case 'very-poor':
			return 'bg-red-100 text-red-800 border-red-300';
	}
}

/** Score colour class based on normalized score. */
export function scoreColor(score: number | null): string {
	if (score === null) return 'bg-gray-100 text-gray-800 border-gray-300';
	if (score >= 85) return 'bg-green-100 text-green-800 border-green-300';
	if (score >= 70) return 'bg-blue-100 text-blue-800 border-blue-300';
	if (score >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
	if (score >= 25) return 'bg-orange-100 text-orange-800 border-orange-300';
	return 'bg-red-100 text-red-800 border-red-300';
}

/** Severity label for grading badge. */
export function severityLabel(severity: number): string {
	switch (severity) {
		case 1:
			return 'Minor';
		case 2:
			return 'Moderate';
		case 3:
			return 'Significant';
		case 4:
			return 'Critical';
		default:
			return `Level ${severity}`;
	}
}

/** Severity colour class for grading badge. */
export function severityColor(severity: number): string {
	switch (severity) {
		case 1:
			return 'bg-green-100 text-green-800 border-green-300';
		case 2:
			return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		case 3:
			return 'bg-orange-100 text-orange-800 border-orange-300';
		case 4:
			return 'bg-red-100 text-red-800 border-red-300';
		default:
			return 'bg-gray-100 text-gray-800 border-gray-300';
	}
}

/** Likert score label. */
export function likertLabel(score: number | null): string {
	if (score === null) return 'Not Rated';
	switch (score) {
		case 1:
			return 'Very Dissatisfied';
		case 2:
			return 'Dissatisfied';
		case 3:
			return 'Neutral';
		case 4:
			return 'Satisfied';
		case 5:
			return 'Very Satisfied';
		default:
			return `${score}/5`;
	}
}
