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
 * COPM performance/satisfaction category label.
 *   < 5  = Significant issues
 *   5-7  = Moderate concerns
 *   > 7  = Good performance / satisfaction
 */
export function copmPerformanceCategory(score: number): string {
	if (score < 5) return 'Significant issues';
	if (score <= 7) return 'Moderate concerns';
	return 'Good performance';
}

/** COPM score label for display. */
export function copmScoreLabel(score: number, type: 'Performance' | 'Satisfaction'): string {
	return `COPM ${type} ${score}/10 - ${copmPerformanceCategory(score)}`;
}

/** COPM score colour class. */
export function copmScoreColor(score: number): string {
	if (score > 7) return 'bg-green-100 text-green-800 border-green-300';
	if (score >= 5) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
	return 'bg-red-100 text-red-800 border-red-300';
}

/** Difficulty level label. */
export function difficultyLabel(difficulty: string): string {
	switch (difficulty) {
		case 'none':
			return 'No difficulty';
		case 'some':
			return 'Some difficulty';
		case 'significant':
			return 'Significant difficulty';
		case 'unable':
			return 'Unable to perform';
		default:
			return '';
	}
}

/** Difficulty level colour class. */
export function difficultyColor(difficulty: string): string {
	switch (difficulty) {
		case 'none':
			return 'bg-green-100 text-green-800';
		case 'some':
			return 'bg-yellow-100 text-yellow-800';
		case 'significant':
			return 'bg-orange-100 text-orange-800';
		case 'unable':
			return 'bg-red-100 text-red-800';
		default:
			return 'bg-gray-100 text-gray-800';
	}
}
