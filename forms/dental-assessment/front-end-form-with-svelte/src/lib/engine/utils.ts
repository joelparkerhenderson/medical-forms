import type { DMFTCategory } from './types';

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

/** DMFT category label for display. */
export function dmftCategoryLabel(category: DMFTCategory): string {
	switch (category) {
		case 'caries-free':
			return 'Caries-Free (DMFT 0)';
		case 'very-low':
			return 'Very Low (DMFT 1-5)';
		case 'low':
			return 'Low (DMFT 6-10)';
		case 'moderate':
			return 'Moderate (DMFT 11-15)';
		case 'high':
			return 'High (DMFT 16-20)';
		case 'very-high':
			return 'Very High (DMFT 21+)';
		default:
			return `DMFT: ${category}`;
	}
}

/** DMFT score label for display. */
export function dmftScoreLabel(score: number): string {
	if (score === 0) return 'Caries-Free';
	if (score <= 5) return 'Very Low';
	if (score <= 10) return 'Low';
	if (score <= 15) return 'Moderate';
	if (score <= 20) return 'High';
	return 'Very High';
}

/** DMFT category colour class for Tailwind. */
export function dmftCategoryColor(category: DMFTCategory): string {
	switch (category) {
		case 'caries-free':
			return 'bg-green-100 text-green-800 border-green-300';
		case 'very-low':
			return 'bg-green-50 text-green-700 border-green-200';
		case 'low':
			return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		case 'moderate':
			return 'bg-orange-100 text-orange-800 border-orange-300';
		case 'high':
			return 'bg-red-100 text-red-800 border-red-300';
		case 'very-high':
			return 'bg-red-200 text-red-900 border-red-400';
		default:
			return 'bg-gray-100 text-gray-800 border-gray-300';
	}
}

/** DMFT score colour class for Tailwind (by numeric score). */
export function dmftScoreColor(score: number): string {
	if (score === 0) return 'bg-green-100 text-green-800 border-green-300';
	if (score <= 5) return 'bg-green-50 text-green-700 border-green-200';
	if (score <= 10) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
	if (score <= 15) return 'bg-orange-100 text-orange-800 border-orange-300';
	if (score <= 20) return 'bg-red-100 text-red-800 border-red-300';
	return 'bg-red-200 text-red-900 border-red-400';
}

/** Tooth number labels for the dental chart (FDI notation, permanent teeth 1-32). */
export function toothLabel(index: number): string {
	// FDI notation maps: upper right 18-11, upper left 21-28, lower left 38-31, lower right 41-48
	const fdiMap: Record<number, string> = {
		1: '18', 2: '17', 3: '16', 4: '15', 5: '14', 6: '13', 7: '12', 8: '11',
		9: '21', 10: '22', 11: '23', 12: '24', 13: '25', 14: '26', 15: '27', 16: '28',
		17: '38', 18: '37', 19: '36', 20: '35', 21: '34', 22: '33', 23: '32', 24: '31',
		25: '41', 26: '42', 27: '43', 28: '44', 29: '45', 30: '46', 31: '47', 32: '48'
	};
	return fdiMap[index] ?? `T${index}`;
}

/** Quadrant label from tooth number (1-indexed). */
export function quadrantLabel(toothIndex: number): string {
	if (toothIndex >= 1 && toothIndex <= 8) return 'Upper Right';
	if (toothIndex >= 9 && toothIndex <= 16) return 'Upper Left';
	if (toothIndex >= 17 && toothIndex <= 24) return 'Lower Left';
	if (toothIndex >= 25 && toothIndex <= 32) return 'Lower Right';
	return '';
}
