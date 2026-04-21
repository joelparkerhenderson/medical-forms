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
 * Satisfaction score category.
 *   4.5 - 5.0 = Excellent
 *   3.5 - 4.4 = Good
 *   2.5 - 3.4 = Fair
 *   1.5 - 2.4 = Poor
 *   1.0 - 1.4 = Very Poor
 */
export function satisfactionCategory(score: number): string {
	if (score >= 4.5) return 'Excellent';
	if (score >= 3.5) return 'Good';
	if (score >= 2.5) return 'Fair';
	if (score >= 1.5) return 'Poor';
	return 'Very Poor';
}

/** Satisfaction score label for display. */
export function satisfactionScoreLabel(score: number): string {
	return `${score.toFixed(1)}/5.0 - ${satisfactionCategory(score)}`;
}

/** Satisfaction score colour class for Tailwind. */
export function satisfactionScoreColor(score: number): string {
	if (score >= 4.5) return 'bg-green-100 text-green-800 border-green-300';
	if (score >= 3.5) return 'bg-blue-100 text-blue-800 border-blue-300';
	if (score >= 2.5) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
	if (score >= 1.5) return 'bg-orange-100 text-orange-800 border-orange-300';
	return 'bg-red-100 text-red-800 border-red-300';
}
