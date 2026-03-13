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
 * MCAS Symptom Score category label.
 *   0-10  = Minimal symptom burden
 *   11-20 = Mild symptom burden
 *   21-30 = Moderate symptom burden
 *   31-40 = Severe symptom burden
 */
export function mcasCategory(score: number): string {
	if (score <= 10) return 'Minimal';
	if (score <= 20) return 'Mild';
	if (score <= 30) return 'Moderate';
	return 'Severe';
}

/** MCAS score label for display. */
export function mcasScoreLabel(score: number): string {
	return `MCAS ${score}/40 - ${mcasCategory(score)}`;
}

/** MCAS score colour class. */
export function mcasScoreColor(score: number): string {
	if (score <= 10) return 'bg-green-100 text-green-800 border-green-300';
	if (score <= 20) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
	if (score <= 30) return 'bg-orange-100 text-orange-800 border-orange-300';
	return 'bg-red-100 text-red-800 border-red-300';
}
