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
 * PSQI score category label.
 *   0-5   = Good sleep quality
 *   6-10  = Poor sleep quality
 *   11-15 = Sleep disorder likely
 *   16-21 = Severe sleep disturbance
 */
export function psqiCategory(score: number): string {
	if (score <= 5) return 'Good sleep quality';
	if (score <= 10) return 'Poor sleep quality';
	if (score <= 15) return 'Sleep disorder likely';
	return 'Severe sleep disturbance';
}

/** PSQI score label for display. */
export function psqiScoreLabel(score: number): string {
	return `PSQI ${score}/21 - ${psqiCategory(score)}`;
}

/** PSQI score colour class. */
export function psqiScoreColor(score: number): string {
	if (score <= 5) return 'bg-green-100 text-green-800 border-green-300';
	if (score <= 10) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
	if (score <= 15) return 'bg-orange-100 text-orange-800 border-orange-300';
	return 'bg-red-100 text-red-800 border-red-300';
}

/** Calculate sleep efficiency percentage. */
export function sleepEfficiencyCalc(hoursAsleep: number | null, hoursInBed: number | null): number | null {
	if (hoursAsleep === null || hoursInBed === null || hoursInBed <= 0) return null;
	return (hoursAsleep / hoursInBed) * 100;
}
