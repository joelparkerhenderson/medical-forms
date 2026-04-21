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
 * NIHSS score category label.
 *   0     = No stroke symptoms
 *   1-4   = Minor stroke
 *   5-15  = Moderate stroke
 *   16-20 = Moderate to severe stroke
 *   21-42 = Severe stroke
 */
export function nihssCategory(score: number): string {
	if (score === 0) return 'No stroke symptoms';
	if (score <= 4) return 'Minor stroke';
	if (score <= 15) return 'Moderate stroke';
	if (score <= 20) return 'Moderate to severe stroke';
	return 'Severe stroke';
}

/** NIHSS score label for display. */
export function nihssScoreLabel(score: number): string {
	return `NIHSS ${score}/42 - ${nihssCategory(score)}`;
}

/** NIHSS score colour class. */
export function nihssScoreColor(score: number): string {
	if (score === 0) return 'bg-green-100 text-green-800 border-green-300';
	if (score <= 4) return 'bg-blue-100 text-blue-800 border-blue-300';
	if (score <= 15) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
	if (score <= 20) return 'bg-orange-100 text-orange-800 border-orange-300';
	return 'bg-red-100 text-red-800 border-red-300';
}

/** Calculate time elapsed from onset. */
export function timeFromOnset(onsetTime: string): string {
	if (!onsetTime) return '';
	const onset = new Date(onsetTime);
	if (isNaN(onset.getTime())) return '';
	const now = new Date();
	const diffMs = now.getTime() - onset.getTime();
	if (diffMs < 0) return '';
	const hours = Math.floor(diffMs / (1000 * 60 * 60));
	const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
	if (hours === 0) return `${minutes}m ago`;
	return `${hours}h ${minutes}m ago`;
}
