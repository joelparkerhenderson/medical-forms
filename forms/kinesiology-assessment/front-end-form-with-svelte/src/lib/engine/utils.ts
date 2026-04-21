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
 * FMS score category label.
 *   18-21 = Excellent
 *   14-17 = Good
 *   10-13 = Fair
 *    0-9  = Poor
 */
export function fmsCategory(score: number): string {
	if (score >= 18) return 'Excellent';
	if (score >= 14) return 'Good';
	if (score >= 10) return 'Fair';
	return 'Poor';
}

/** FMS score label for display. */
export function fmsScoreLabel(score: number): string {
	return `FMS ${score}/21 - ${fmsCategory(score)}`;
}

/** FMS score colour class. */
export function fmsScoreColor(score: number): string {
	if (score >= 18) return 'bg-green-100 text-green-800 border-green-300';
	if (score >= 14) return 'bg-blue-100 text-blue-800 border-blue-300';
	if (score >= 10) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
	return 'bg-red-100 text-red-800 border-red-300';
}
