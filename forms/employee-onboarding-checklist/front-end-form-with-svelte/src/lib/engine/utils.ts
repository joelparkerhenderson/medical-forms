import type { CompletionStatus, RiskLevel } from './types';

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

/** Completion status label. */
export function completionStatusLabel(status: CompletionStatus): string {
	switch (status) {
		case 'not-started':
			return 'Not Started';
		case 'in-progress':
			return 'In Progress';
		case 'mostly-complete':
			return 'Mostly Complete';
		case 'complete':
			return 'Complete';
	}
}

/** Derive completion status from percentage. */
export function deriveCompletionStatus(percentage: number): CompletionStatus {
	if (percentage <= 0) return 'not-started';
	if (percentage < 50) return 'in-progress';
	if (percentage < 90) return 'mostly-complete';
	return 'complete';
}

/** Overall risk level label. */
export function riskLevelLabel(risk: RiskLevel): string {
	switch (risk) {
		case 'low':
			return 'Low Risk';
		case 'moderate':
			return 'Moderate Risk';
		case 'high':
			return 'High Risk';
		case 'critical':
			return 'Critical Risk';
	}
}

/** Risk level colour class. */
export function riskLevelColor(risk: RiskLevel): string {
	switch (risk) {
		case 'low':
			return 'bg-green-100 text-green-800 border-green-300';
		case 'moderate':
			return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		case 'high':
			return 'bg-orange-100 text-orange-800 border-orange-300';
		case 'critical':
			return 'bg-red-100 text-red-800 border-red-300';
	}
}

/** Completion status colour class. */
export function completionStatusColor(status: CompletionStatus): string {
	switch (status) {
		case 'not-started':
			return 'bg-gray-100 text-gray-800 border-gray-300';
		case 'in-progress':
			return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		case 'mostly-complete':
			return 'bg-blue-100 text-blue-800 border-blue-300';
		case 'complete':
			return 'bg-green-100 text-green-800 border-green-300';
	}
}

/** Grade label for fired rules (used by Badge component). */
export function gradeLabel(grade: number): string {
	switch (grade) {
		case 1:
			return 'Minor';
		case 2:
			return 'Moderate';
		case 3:
			return 'Significant';
		case 4:
			return 'Critical';
		default:
			return `Grade ${grade}`;
	}
}

/** Grade colour class (used by Badge component). */
export function gradeColor(grade: number): string {
	switch (grade) {
		case 1:
			return 'bg-green-100 text-green-800 border-green-300';
		case 2:
			return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		case 3:
			return 'bg-orange-100 text-orange-800 border-orange-300';
		case 4:
			return 'bg-red-100 text-red-800 border-red-300';
		default:
			return 'bg-gray-100 text-gray-800 border-gray-300';
	}
}

/** Format date string for display. */
export function formatDate(dateStr: string): string {
	if (!dateStr) return 'N/A';
	const d = new Date(dateStr);
	if (isNaN(d.getTime())) return dateStr;
	return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Check if a date is in the past. */
export function isDatePast(dateStr: string): boolean {
	if (!dateStr) return false;
	const d = new Date(dateStr);
	if (isNaN(d.getTime())) return false;
	return d < new Date();
}
