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
 * DLQI score category label.
 *   0-1  = No effect on patient's life
 *   2-5  = Small effect on patient's life
 *   6-10 = Moderate effect on patient's life
 *   11-20 = Very large effect on patient's life
 *   21-30 = Extremely large effect on patient's life
 */
export function dlqiCategory(score: number): string {
	if (score <= 1) return 'No effect on life';
	if (score <= 5) return 'Small effect';
	if (score <= 10) return 'Moderate effect';
	if (score <= 20) return 'Very large effect';
	return 'Extremely large effect';
}

/** DLQI score label for display. */
export function dlqiScoreLabel(score: number): string {
	return `DLQI ${score}/30 - ${dlqiCategory(score)}`;
}

/** DLQI score colour class. */
export function dlqiScoreColor(score: number): string {
	if (score <= 1) return 'bg-green-100 text-green-800 border-green-300';
	if (score <= 5) return 'bg-blue-100 text-blue-800 border-blue-300';
	if (score <= 10) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
	if (score <= 20) return 'bg-orange-100 text-orange-800 border-orange-300';
	return 'bg-red-100 text-red-800 border-red-300';
}

/** Fitzpatrick skin type label. */
export function fitzpatrickLabel(type: string): string {
	switch (type) {
		case 'I':
			return 'Type I - Very fair, always burns, never tans';
		case 'II':
			return 'Type II - Fair, usually burns, tans minimally';
		case 'III':
			return 'Type III - Medium, sometimes burns, tans uniformly';
		case 'IV':
			return 'Type IV - Olive, rarely burns, always tans well';
		case 'V':
			return 'Type V - Brown, very rarely burns, tans very easily';
		case 'VI':
			return 'Type VI - Dark brown/black, never burns, always tans';
		default:
			return '';
	}
}

/** Get Fitzpatrick UV risk level. */
export function fitzpatrickUVRisk(type: string): string {
	switch (type) {
		case 'I':
		case 'II':
			return 'High';
		case 'III':
		case 'IV':
			return 'Moderate';
		case 'V':
		case 'VI':
			return 'Low';
		default:
			return '';
	}
}
