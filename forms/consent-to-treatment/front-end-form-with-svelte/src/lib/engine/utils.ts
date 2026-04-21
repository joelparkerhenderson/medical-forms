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

/** Calculate completeness percentage. */
export function completenessPercent(completed: number, total: number): number {
	if (total === 0) return 100;
	return Math.round((completed / total) * 100);
}

/** Get validation status label from completeness percentage. */
export function validationStatus(completeness: number): 'Complete' | 'Incomplete' {
	return completeness === 100 ? 'Complete' : 'Incomplete';
}

/** Get colour class for completeness display. */
export function completenessColor(completeness: number): string {
	if (completeness === 100) return 'bg-green-100 text-green-800 border-green-300';
	if (completeness >= 75) return 'bg-blue-100 text-blue-800 border-blue-300';
	if (completeness >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
	if (completeness >= 25) return 'bg-orange-100 text-orange-800 border-orange-300';
	return 'bg-red-100 text-red-800 border-red-300';
}

/** Completeness label for display. */
export function completenessLabel(completeness: number): string {
	return `${completeness}% Complete`;
}
