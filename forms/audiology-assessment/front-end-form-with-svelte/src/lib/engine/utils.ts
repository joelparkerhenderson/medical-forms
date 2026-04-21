import type { HearingGrade } from './types';

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

/** Classify dB HL value into WHO hearing loss grade. */
export function classifyDbHL(dbHL: number | null): HearingGrade {
	if (dbHL === null) return 'normal';
	if (dbHL <= 25) return 'normal';
	if (dbHL <= 40) return 'mild';
	if (dbHL <= 60) return 'moderate';
	if (dbHL <= 80) return 'severe';
	return 'profound';
}

/** Get the worse (higher severity) of two hearing grades. */
export function worseGrade(a: HearingGrade, b: HearingGrade): HearingGrade {
	const order: Record<HearingGrade, number> = {
		normal: 0,
		mild: 1,
		moderate: 2,
		severe: 3,
		profound: 4
	};
	return order[a] >= order[b] ? a : b;
}

/** Compare two hearing grades numerically. Returns negative if a < b, 0 if equal, positive if a > b. */
export function compareGrades(a: HearingGrade, b: HearingGrade): number {
	const order: Record<HearingGrade, number> = {
		normal: 0,
		mild: 1,
		moderate: 2,
		severe: 3,
		profound: 4
	};
	return order[a] - order[b];
}

/** Hearing grade label for display. */
export function hearingGradeLabel(grade: string): string {
	switch (grade) {
		case 'normal':
			return 'Normal Hearing (<=25 dB HL)';
		case 'mild':
			return 'Mild Hearing Loss (26-40 dB HL)';
		case 'moderate':
			return 'Moderate Hearing Loss (41-60 dB HL)';
		case 'severe':
			return 'Severe Hearing Loss (61-80 dB HL)';
		case 'profound':
			return 'Profound Hearing Loss (>80 dB HL)';
		default:
			return `${grade}`;
	}
}

/** Hearing grade colour class. */
export function hearingGradeColor(grade: string): string {
	switch (grade) {
		case 'normal':
			return 'bg-green-100 text-green-800 border-green-300';
		case 'mild':
			return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		case 'moderate':
			return 'bg-orange-100 text-orange-800 border-orange-300';
		case 'severe':
			return 'bg-red-100 text-red-800 border-red-300';
		case 'profound':
			return 'bg-red-200 text-red-900 border-red-400';
		default:
			return 'bg-gray-100 text-gray-800 border-gray-300';
	}
}

/** Affected ear label for display. */
export function affectedEarLabel(ear: string): string {
	switch (ear) {
		case 'left':
			return 'Left';
		case 'right':
			return 'Right';
		case 'both':
			return 'Both';
		default:
			return 'N/A';
	}
}

/** Hearing loss type label for display. */
export function hearingLossTypeLabel(type: string): string {
	switch (type) {
		case 'conductive':
			return 'Conductive';
		case 'sensorineural':
			return 'Sensorineural';
		case 'mixed':
			return 'Mixed';
		default:
			return 'N/A';
	}
}
