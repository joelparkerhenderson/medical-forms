import type { VAGrade } from './types';

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

/** Visual Acuity grade label. */
export function vaGradeLabel(grade: VAGrade): string {
	switch (grade) {
		case 'normal':
			return 'Normal - 6/6 (20/20) or better';
		case 'mild':
			return 'Mild Impairment - 6/12 (20/40)';
		case 'moderate':
			return 'Moderate Impairment - 6/18 to 6/60';
		case 'severe':
			return 'Severe Impairment - 6/60 to 3/60';
		case 'blindness':
			return 'Blindness - Worse than 3/60';
		default:
			return `VA Grade: ${grade}`;
	}
}

/** Visual Acuity grade colour class. */
export function vaGradeColor(grade: VAGrade): string {
	switch (grade) {
		case 'normal':
			return 'bg-green-100 text-green-800 border-green-300';
		case 'mild':
			return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		case 'moderate':
			return 'bg-orange-100 text-orange-800 border-orange-300';
		case 'severe':
			return 'bg-red-100 text-red-800 border-red-300';
		case 'blindness':
			return 'bg-red-200 text-red-900 border-red-400';
		default:
			return 'bg-gray-100 text-gray-800 border-gray-300';
	}
}

/**
 * Convert a Snellen fraction string (e.g. '6/6', '6/12', '6/60') to a
 * decimal acuity value. Returns null if the string cannot be parsed.
 */
export function snellenToDecimal(snellen: string): number | null {
	if (!snellen) return null;
	const cleaned = snellen.trim().replace(/\s+/g, '');
	const parts = cleaned.split('/');
	if (parts.length !== 2) return null;
	const numerator = parseFloat(parts[0]);
	const denominator = parseFloat(parts[1]);
	if (isNaN(numerator) || isNaN(denominator) || denominator === 0) return null;
	return numerator / denominator;
}

/**
 * Convert a 20-foot Snellen value to a 6-metre Snellen value.
 * E.g. '20/20' -> '6/6', '20/40' -> '6/12'.
 */
export function snellen20To6(snellen20: string): string {
	if (!snellen20) return '';
	const parts = snellen20.trim().split('/');
	if (parts.length !== 2) return snellen20;
	const numerator = parseFloat(parts[0]);
	const denominator = parseFloat(parts[1]);
	if (isNaN(numerator) || isNaN(denominator)) return snellen20;
	const num6 = Math.round((numerator / 20) * 6);
	const denom6 = Math.round((denominator / 20) * 6);
	return `${num6}/${denom6}`;
}

/**
 * Get the VA grade from a Snellen 6-metre fraction.
 * Uses best corrected VA for grading.
 */
export function snellenToVAGrade(snellen: string): VAGrade | null {
	const decimal = snellenToDecimal(snellen);
	if (decimal === null) return null;
	if (decimal >= 0.95) return 'normal'; // 6/6 or better
	if (decimal >= 0.45) return 'mild'; // 6/12 (0.5) range
	if (decimal >= 0.095) return 'moderate'; // 6/18 (0.33) to 6/60 (0.1)
	if (decimal >= 0.045) return 'severe'; // 6/60 to 3/60 (0.05)
	return 'blindness'; // worse than 3/60
}

/** IOP status label based on mmHg value. */
export function iopStatusLabel(iop: number | null): string {
	if (iop === null) return 'Not measured';
	if (iop <= 21) return 'Normal';
	if (iop <= 30) return 'Raised';
	return 'Significantly raised';
}

/** IOP status colour class. */
export function iopStatusColor(iop: number | null): string {
	if (iop === null) return 'text-gray-500';
	if (iop <= 21) return 'text-green-700';
	if (iop <= 30) return 'text-yellow-700';
	return 'text-red-700';
}
