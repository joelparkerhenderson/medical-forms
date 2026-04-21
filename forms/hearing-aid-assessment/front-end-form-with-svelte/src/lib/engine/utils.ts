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
 * HHIE-S score category label.
 *   0-8   = No handicap
 *   10-22 = Mild to moderate handicap
 *   24-40 = Significant handicap
 */
export function hhiesCategory(score: number): string {
	if (score <= 8) return 'No handicap';
	if (score <= 22) return 'Mild to moderate handicap';
	return 'Significant handicap';
}

/** HHIE-S score label for display. */
export function hhiesScoreLabel(score: number): string {
	return `HHIE-S ${score}/40 - ${hhiesCategory(score)}`;
}

/** HHIE-S score colour class. */
export function hhiesScoreColor(score: number): string {
	if (score <= 8) return 'bg-green-100 text-green-800 border-green-300';
	if (score <= 22) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
	return 'bg-red-100 text-red-800 border-red-300';
}

/**
 * Hearing loss grade based on PTA (pure tone average) in dB HL.
 * Uses WHO classification:
 *   0-25  = Normal
 *   26-40 = Mild
 *   41-60 = Moderate
 *   61-80 = Severe
 *   81+   = Profound
 */
export function hearingLossGrade(pta: number | null): string {
	if (pta === null) return 'Not tested';
	if (pta <= 25) return 'Normal';
	if (pta <= 40) return 'Mild';
	if (pta <= 60) return 'Moderate';
	if (pta <= 80) return 'Severe';
	return 'Profound';
}
