import type { UKMECCategory } from './types';

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
 * UKMEC category label.
 *   1 = No restriction (method can be used in any circumstances)
 *   2 = Advantages outweigh risks (method can generally be used)
 *   3 = Risks outweigh advantages (method not usually recommended)
 *   4 = Unacceptable health risk (method should not be used)
 */
export function ukmecCategory(category: UKMECCategory): string {
	switch (category) {
		case 1:
			return 'No restriction';
		case 2:
			return 'Advantages outweigh risks';
		case 3:
			return 'Risks outweigh advantages';
		case 4:
			return 'Unacceptable health risk';
	}
}

/** UKMEC category label for display. */
export function ukmecLabel(category: UKMECCategory): string {
	return `UKMEC ${category} - ${ukmecCategory(category)}`;
}

/** UKMEC category colour class. */
export function ukmecColor(category: UKMECCategory): string {
	switch (category) {
		case 1:
			return 'bg-green-100 text-green-800 border-green-300';
		case 2:
			return 'bg-blue-100 text-blue-800 border-blue-300';
		case 3:
			return 'bg-orange-100 text-orange-800 border-orange-300';
		case 4:
			return 'bg-red-100 text-red-800 border-red-300';
	}
}

/** Calculate BMI from weight (kg) and height (m). */
export function bmiCalculation(weightKg: number, heightM: number): number | null {
	if (!weightKg || !heightM || heightM <= 0) return null;
	return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}
