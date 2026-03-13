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
 * MMSE score category label.
 *   24-30 = Normal cognition
 *   18-23 = Mild cognitive impairment
 *   10-17 = Moderate cognitive impairment
 *    0-9  = Severe cognitive impairment
 */
export function mmseCategory(score: number): string {
	if (score >= 24) return 'Normal cognition';
	if (score >= 18) return 'Mild cognitive impairment';
	if (score >= 10) return 'Moderate cognitive impairment';
	return 'Severe cognitive impairment';
}

/** MMSE score label for display. */
export function mmseScoreLabel(score: number): string {
	return `MMSE ${score}/30 - ${mmseCategory(score)}`;
}

/** MMSE score colour class. */
export function mmseScoreColor(score: number): string {
	if (score >= 24) return 'bg-green-100 text-green-800 border-green-300';
	if (score >= 18) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
	if (score >= 10) return 'bg-orange-100 text-orange-800 border-orange-300';
	return 'bg-red-100 text-red-800 border-red-300';
}

/** Education level label. */
export function educationLabel(level: string): string {
	switch (level) {
		case 'none':
			return 'No formal education';
		case 'primary':
			return 'Primary school';
		case 'secondary':
			return 'Secondary school';
		case 'university':
			return 'University/College';
		case 'postgraduate':
			return 'Postgraduate';
		default:
			return '';
	}
}

/** ADL independence label. */
export function adlLabel(level: string): string {
	switch (level) {
		case 'independent':
			return 'Independent';
		case 'needs-some-help':
			return 'Needs some help';
		case 'needs-significant-help':
			return 'Needs significant help';
		case 'fully-dependent':
			return 'Fully dependent';
		default:
			return '';
	}
}
