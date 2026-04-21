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
 * IPSS score category label.
 *   0-7   = Mild symptoms
 *   8-19  = Moderate symptoms
 *   20-35 = Severe symptoms
 */
export function ipssCategory(score: number): string {
	if (score <= 7) return 'Mild';
	if (score <= 19) return 'Moderate';
	return 'Severe';
}

/** IPSS score label for display. */
export function ipssScoreLabel(score: number): string {
	return `IPSS ${score}/35 - ${ipssCategory(score)}`;
}

/** IPSS score colour class. */
export function ipssScoreColor(score: number): string {
	if (score <= 7) return 'bg-green-100 text-green-800 border-green-300';
	if (score <= 19) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
	return 'bg-red-100 text-red-800 border-red-300';
}

/**
 * Quality of Life label.
 *   0 = Delighted
 *   1 = Pleased
 *   2 = Mostly satisfied
 *   3 = Mixed
 *   4 = Mostly dissatisfied
 *   5 = Unhappy
 *   6 = Terrible
 */
export function qolLabel(score: number): string {
	switch (score) {
		case 0: return 'Delighted';
		case 1: return 'Pleased';
		case 2: return 'Mostly satisfied';
		case 3: return 'Mixed';
		case 4: return 'Mostly dissatisfied';
		case 5: return 'Unhappy';
		case 6: return 'Terrible';
		default: return '';
	}
}
