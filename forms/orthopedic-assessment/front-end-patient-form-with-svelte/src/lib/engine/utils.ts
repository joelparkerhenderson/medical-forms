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
 * DASH score category label.
 *   0-20  = No disability
 *   21-40 = Mild disability
 *   41-60 = Moderate disability
 *   61-80 = Severe disability
 *   81-100 = Very severe disability
 */
export function dashCategory(score: number): string {
	if (score <= 20) return 'No disability';
	if (score <= 40) return 'Mild disability';
	if (score <= 60) return 'Moderate disability';
	if (score <= 80) return 'Severe disability';
	return 'Very severe disability';
}

/** DASH score label for display. */
export function dashScoreLabel(score: number): string {
	return `DASH ${score}/100 - ${dashCategory(score)}`;
}

/** DASH score colour class. */
export function dashScoreColor(score: number): string {
	if (score <= 20) return 'bg-green-100 text-green-800 border-green-300';
	if (score <= 40) return 'bg-blue-100 text-blue-800 border-blue-300';
	if (score <= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
	if (score <= 80) return 'bg-orange-100 text-orange-800 border-orange-300';
	return 'bg-red-100 text-red-800 border-red-300';
}

/** Side label for display. */
export function sideLabel(side: string): string {
	switch (side) {
		case 'left':
			return 'Left';
		case 'right':
			return 'Right';
		case 'bilateral':
			return 'Bilateral';
		default:
			return '';
	}
}

/** Onset type label for display. */
export function onsetTypeLabel(onset: string): string {
	switch (onset) {
		case 'acute':
			return 'Acute';
		case 'gradual':
			return 'Gradual';
		case 'traumatic':
			return 'Traumatic';
		case 'overuse':
			return 'Overuse';
		default:
			return '';
	}
}
