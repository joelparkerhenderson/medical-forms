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
 * AQ-10 score category label.
 *   0-5  = Below threshold
 *   6-10 = At or above threshold
 */
export function aq10Category(score: number): string {
	if (score <= 5) return 'Below threshold';
	return 'At or above threshold';
}

/** AQ-10 score label for display. */
export function aq10ScoreLabel(score: number): string {
	return `AQ-10 ${score}/10 - ${aq10Category(score)}`;
}

/** AQ-10 score colour class. */
export function aq10ScoreColor(score: number): string {
	if (score <= 3) return 'bg-green-100 text-green-800 border-green-300';
	if (score <= 5) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
	if (score <= 8) return 'bg-orange-100 text-orange-800 border-orange-300';
	return 'bg-red-100 text-red-800 border-red-300';
}

/** Age group label. */
export function ageGroupLabel(ageGroup: string): string {
	switch (ageGroup) {
		case 'child':
			return 'Child (under 12)';
		case 'adolescent':
			return 'Adolescent (12-17)';
		case 'adult':
			return 'Adult (18+)';
		default:
			return '';
	}
}

/** Referral source label. */
export function referralSourceLabel(source: string): string {
	switch (source) {
		case 'self':
			return 'Self-referral';
		case 'gp':
			return 'GP / Primary care';
		case 'school':
			return 'School / Education';
		case 'employer':
			return 'Employer / Occupational health';
		case 'family':
			return 'Family member';
		case 'other':
			return 'Other';
		default:
			return '';
	}
}
