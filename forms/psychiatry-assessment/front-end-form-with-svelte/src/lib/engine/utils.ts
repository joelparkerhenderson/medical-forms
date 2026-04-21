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

/** GAF score label. */
export function gafScoreLabel(score: number): string {
	if (score >= 91) return 'GAF 91-100 - Superior functioning';
	if (score >= 81) return 'GAF 81-90 - Absent/minimal symptoms';
	if (score >= 71) return 'GAF 71-80 - Transient/expectable reactions';
	if (score >= 61) return 'GAF 61-70 - Mild symptoms';
	if (score >= 51) return 'GAF 51-60 - Moderate symptoms';
	if (score >= 41) return 'GAF 41-50 - Serious symptoms';
	if (score >= 31) return 'GAF 31-40 - Major impairment';
	if (score >= 21) return 'GAF 21-30 - Influenced by delusions/hallucinations';
	if (score >= 11) return 'GAF 11-20 - Some danger of hurting self/others';
	return 'GAF 1-10 - Persistent danger';
}

/** GAF score short label (bracket name only). */
export function gafBracketLabel(score: number): string {
	if (score >= 91) return 'Superior functioning';
	if (score >= 81) return 'Absent/minimal symptoms';
	if (score >= 71) return 'Transient/expectable reactions';
	if (score >= 61) return 'Mild symptoms';
	if (score >= 51) return 'Moderate symptoms';
	if (score >= 41) return 'Serious symptoms';
	if (score >= 31) return 'Major impairment';
	if (score >= 21) return 'Influenced by delusions/hallucinations';
	if (score >= 11) return 'Some danger of hurting self/others';
	return 'Persistent danger';
}

/** GAF score colour class. */
export function gafScoreColor(score: number): string {
	if (score >= 81) return 'bg-green-100 text-green-800 border-green-300';
	if (score >= 61) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
	if (score >= 41) return 'bg-orange-100 text-orange-800 border-orange-300';
	if (score >= 21) return 'bg-red-100 text-red-800 border-red-300';
	return 'bg-red-200 text-red-900 border-red-400';
}

/** Risk level label for display. */
export function riskLevelLabel(level: string): string {
	switch (level) {
		case 'none':
			return 'No risk identified';
		case 'low':
			return 'Low risk';
		case 'moderate':
			return 'Moderate risk';
		case 'high':
			return 'High risk';
		case 'imminent':
			return 'Imminent risk';
		default:
			return 'Not assessed';
	}
}

/** Risk level colour class. */
export function riskLevelColor(level: string): string {
	switch (level) {
		case 'none':
			return 'bg-green-100 text-green-800 border-green-300';
		case 'low':
			return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		case 'moderate':
			return 'bg-orange-100 text-orange-800 border-orange-300';
		case 'high':
			return 'bg-red-100 text-red-800 border-red-300';
		case 'imminent':
			return 'bg-red-200 text-red-900 border-red-400';
		default:
			return 'bg-gray-100 text-gray-800 border-gray-300';
	}
}
