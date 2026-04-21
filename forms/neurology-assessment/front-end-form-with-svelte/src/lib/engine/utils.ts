/** NIHSS severity label based on total score. */
export function nihssSeverityLabel(score: number): string {
	if (score === 0) return 'No stroke symptoms';
	if (score <= 4) return 'Minor stroke';
	if (score <= 15) return 'Moderate stroke';
	if (score <= 20) return 'Moderate to severe stroke';
	return 'Severe stroke';
}

/** NIHSS severity colour class. */
export function nihssSeverityColor(score: number): string {
	if (score === 0) return 'bg-green-100 text-green-800 border-green-300';
	if (score <= 4) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
	if (score <= 15) return 'bg-orange-100 text-orange-800 border-orange-300';
	if (score <= 20) return 'bg-red-100 text-red-800 border-red-300';
	return 'bg-red-200 text-red-900 border-red-400';
}

/** Modified Rankin Scale (mRS) label. */
export function mrsLabel(score: number | null): string {
	if (score === null) return '';
	switch (score) {
		case 0:
			return 'mRS 0 - No symptoms';
		case 1:
			return 'mRS 1 - No significant disability';
		case 2:
			return 'mRS 2 - Slight disability';
		case 3:
			return 'mRS 3 - Moderate disability';
		case 4:
			return 'mRS 4 - Moderately severe disability';
		case 5:
			return 'mRS 5 - Severe disability';
		default:
			return `mRS ${score}`;
	}
}

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
