/** Calculate age in months from date of birth string. */
export function calculateAgeMonths(dob: string): number | null {
	if (!dob) return null;
	const birth = new Date(dob);
	if (isNaN(birth.getTime())) return null;
	const today = new Date();
	const months =
		(today.getFullYear() - birth.getFullYear()) * 12 +
		(today.getMonth() - birth.getMonth());
	if (today.getDate() < birth.getDate()) {
		return months - 1;
	}
	return months;
}

/** Calculate age in years from date of birth string. */
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

/** Format age for display: months if < 24 months, otherwise years. */
export function formatAge(dob: string): string {
	const months = calculateAgeMonths(dob);
	if (months === null) return '';
	if (months < 24) return `${months} months`;
	const years = Math.floor(months / 12);
	return `${years} years`;
}

/** Developmental screen overall result label. */
export function devScreenLabel(result: string): string {
	switch (result) {
		case 'normal':
			return 'Normal Development';
		case 'developmental-concern':
			return 'Developmental Concern';
		case 'developmental-delay':
			return 'Developmental Delay';
		default:
			return result;
	}
}

/** Developmental screen overall result colour class. */
export function devScreenColor(result: string): string {
	switch (result) {
		case 'normal':
			return 'bg-green-100 text-green-800 border-green-300';
		case 'developmental-concern':
			return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		case 'developmental-delay':
			return 'bg-red-100 text-red-800 border-red-300';
		default:
			return 'bg-gray-100 text-gray-800 border-gray-300';
	}
}

/** Domain result label. */
export function domainResultLabel(result: string): string {
	switch (result) {
		case 'pass':
			return 'Pass';
		case 'concern':
			return 'Concern';
		case 'fail':
			return 'Fail';
		default:
			return 'Not Assessed';
	}
}

/** Domain result colour class. */
export function domainResultColor(result: string): string {
	switch (result) {
		case 'pass':
			return 'bg-green-100 text-green-800 border-green-300';
		case 'concern':
			return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		case 'fail':
			return 'bg-red-100 text-red-800 border-red-300';
		default:
			return 'bg-gray-100 text-gray-800 border-gray-300';
	}
}

/** Growth percentile category label. */
export function percentileCategory(percentile: number | null): string {
	if (percentile === null) return '';
	if (percentile < 3) return 'Below 3rd (Severely Low)';
	if (percentile < 10) return 'Below 10th (Low)';
	if (percentile < 25) return 'Below 25th';
	if (percentile <= 75) return 'Normal Range';
	if (percentile <= 90) return 'Above 75th';
	if (percentile <= 97) return 'Above 90th (High)';
	return 'Above 97th (Severely High)';
}

/** Gestational age category label. */
export function gestationalAgeCategory(weeks: number | null): string {
	if (weeks === null) return '';
	if (weeks < 28) return 'Extremely Preterm';
	if (weeks < 32) return 'Very Preterm';
	if (weeks < 37) return 'Preterm';
	if (weeks <= 41) return 'Term';
	return 'Post-term';
}
