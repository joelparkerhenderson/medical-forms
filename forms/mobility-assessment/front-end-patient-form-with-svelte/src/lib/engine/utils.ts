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
 * Tinetti total score category label.
 *   25-28 = Low fall risk
 *   19-24 = Moderate fall risk
 *   0-18  = High fall risk
 */
export function tinettiCategory(score: number): string {
	if (score >= 25) return 'Low fall risk';
	if (score >= 19) return 'Moderate fall risk';
	return 'High fall risk';
}

/** Tinetti score label for display. */
export function tinettiScoreLabel(score: number): string {
	return `Tinetti ${score}/28 - ${tinettiCategory(score)}`;
}

/** Tinetti score colour class. */
export function tinettiScoreColor(score: number): string {
	if (score >= 25) return 'bg-green-100 text-green-800 border-green-300';
	if (score >= 19) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
	return 'bg-red-100 text-red-800 border-red-300';
}

/**
 * TUG (Timed Up and Go) category.
 *   <10s   = Freely mobile
 *   10-14s = Mostly independent
 *   14-20s = Variable mobility
 *   >20s   = Impaired mobility
 */
export function tugCategory(timeSeconds: number | null): string {
	if (timeSeconds === null) return 'Not assessed';
	if (timeSeconds < 10) return 'Freely mobile';
	if (timeSeconds <= 14) return 'Mostly independent';
	if (timeSeconds <= 20) return 'Variable mobility';
	return 'Impaired mobility';
}

/** TUG score colour class. */
export function tugScoreColor(timeSeconds: number | null): string {
	if (timeSeconds === null) return 'bg-gray-100 text-gray-700 border-gray-300';
	if (timeSeconds < 10) return 'bg-green-100 text-green-800 border-green-300';
	if (timeSeconds <= 14) return 'bg-blue-100 text-blue-800 border-blue-300';
	if (timeSeconds <= 20) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
	return 'bg-red-100 text-red-800 border-red-300';
}
