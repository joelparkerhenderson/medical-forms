import type { SeverityLevel } from './types';

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

/** Severity level label for display. */
export function severityLabel(level: string): string {
	switch (level) {
		case 'minimal':
			return 'Minimal';
		case 'mild':
			return 'Mild';
		case 'moderate':
			return 'Moderate';
		case 'moderately-severe':
			return 'Moderately Severe';
		case 'severe':
			return 'Severe';
		default:
			return level;
	}
}

/** Severity level colour class for Tailwind. */
export function severityColor(level: string): string {
	switch (level) {
		case 'minimal':
			return 'bg-green-100 text-green-800 border-green-300';
		case 'mild':
			return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		case 'moderate':
			return 'bg-orange-100 text-orange-800 border-orange-300';
		case 'moderately-severe':
			return 'bg-red-100 text-red-800 border-red-300';
		case 'severe':
			return 'bg-red-200 text-red-900 border-red-400';
		default:
			return 'bg-gray-100 text-gray-800 border-gray-300';
	}
}

/** PHQ-9 score colour class. */
export function phq9ScoreColor(score: number): string {
	if (score <= 4) return 'bg-green-100 text-green-800 border-green-300';
	if (score <= 9) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
	if (score <= 14) return 'bg-orange-100 text-orange-800 border-orange-300';
	if (score <= 19) return 'bg-red-100 text-red-800 border-red-300';
	return 'bg-red-200 text-red-900 border-red-400';
}

/** GAD-7 score colour class. */
export function gad7ScoreColor(score: number): string {
	if (score <= 4) return 'bg-green-100 text-green-800 border-green-300';
	if (score <= 9) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
	if (score <= 14) return 'bg-orange-100 text-orange-800 border-orange-300';
	return 'bg-red-200 text-red-900 border-red-400';
}

/** Map PHQ-9 score to severity level for use in severity-based display. */
export function phq9SeverityFromScore(score: number): SeverityLevel {
	if (score <= 4) return 'minimal';
	if (score <= 9) return 'mild';
	if (score <= 14) return 'moderate';
	if (score <= 19) return 'moderately-severe';
	return 'severe';
}

/** Map GAD-7 score to severity level for use in severity-based display. */
export function gad7SeverityFromScore(score: number): SeverityLevel {
	if (score <= 4) return 'minimal';
	if (score <= 9) return 'mild';
	if (score <= 14) return 'moderate';
	return 'severe';
}
