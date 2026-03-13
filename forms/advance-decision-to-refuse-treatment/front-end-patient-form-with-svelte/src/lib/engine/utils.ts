import type { ValidityStatus } from './types';

/** Validity status display label. */
export function validityStatusLabel(status: string): string {
	switch (status) {
		case 'draft':
			return 'Draft - In Progress';
		case 'complete':
			return 'Complete - All Sections Filled';
		case 'valid':
			return 'Valid - Legally Compliant';
		case 'invalid':
			return 'Invalid - Missing Legal Requirements';
		default:
			return status;
	}
}

/** Validity status colour class. */
export function validityStatusColor(status: string): string {
	switch (status) {
		case 'draft':
			return 'bg-gray-100 text-gray-800 border-gray-300';
		case 'complete':
			return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		case 'valid':
			return 'bg-green-100 text-green-800 border-green-300';
		case 'invalid':
			return 'bg-red-100 text-red-800 border-red-300';
		default:
			return 'bg-gray-100 text-gray-800 border-gray-300';
	}
}

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

/** Check whether any life-sustaining treatment has been refused. */
export function hasLifeSustainingRefusal(data: {
	treatmentsRefusedLifeSustaining: {
		cpr: { refused: string };
		mechanicalVentilation: { refused: string };
		artificialNutritionHydration: { refused: string };
		otherLifeSustaining: { refused: string }[];
	};
}): boolean {
	const ls = data.treatmentsRefusedLifeSustaining;
	if (ls.cpr.refused === 'yes') return true;
	if (ls.mechanicalVentilation.refused === 'yes') return true;
	if (ls.artificialNutritionHydration.refused === 'yes') return true;
	if (ls.otherLifeSustaining.some((t) => t.refused === 'yes')) return true;
	return false;
}
