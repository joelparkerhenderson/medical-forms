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

/** REBA risk level label. */
export function rebaRiskLevel(score: number): string {
	if (score <= 1) return 'Negligible risk';
	if (score <= 3) return 'Low risk';
	if (score <= 7) return 'Medium risk';
	if (score <= 10) return 'High risk';
	return 'Very high risk';
}

/** REBA score label with risk level. */
export function rebaScoreLabel(score: number): string {
	const risk = rebaRiskLevel(score);
	return `REBA ${score} - ${risk}`;
}

/** REBA score colour class. */
export function rebaScoreColor(score: number): string {
	if (score <= 1) return 'bg-green-100 text-green-800 border-green-300';
	if (score <= 3) return 'bg-blue-100 text-blue-800 border-blue-300';
	if (score <= 7) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
	if (score <= 10) return 'bg-orange-100 text-orange-800 border-orange-300';
	return 'bg-red-100 text-red-800 border-red-300';
}

/** Action level description for a given REBA score. */
export function rebaActionLevel(score: number): string {
	if (score <= 1) return 'No action required';
	if (score <= 3) return 'Action may be necessary';
	if (score <= 7) return 'Action necessary';
	if (score <= 10) return 'Action necessary soon';
	return 'Immediate action required';
}
