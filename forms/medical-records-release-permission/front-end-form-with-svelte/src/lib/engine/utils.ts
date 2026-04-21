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
 * Calculate completeness percentage.
 */
export function completenessPercent(completed: number, total: number): number {
	if (total === 0) return 100;
	return Math.round((completed / total) * 100);
}

/**
 * Validation status label based on issue count.
 */
export function validationStatus(issueCount: number): string {
	if (issueCount === 0) return 'Valid';
	if (issueCount <= 3) return 'Minor Issues';
	return 'Needs Attention';
}

/**
 * Completeness status colour class.
 */
export function completenessColor(score: number): string {
	if (score === 100) return 'bg-green-100 text-green-800 border-green-300';
	if (score >= 75) return 'bg-blue-100 text-blue-800 border-blue-300';
	if (score >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
	return 'bg-red-100 text-red-800 border-red-300';
}

/**
 * Completeness score label for display.
 */
export function completenessLabel(score: number): string {
	if (score === 100) return `${score}% Complete`;
	if (score >= 75) return `${score}% Nearly Complete`;
	if (score >= 50) return `${score}% Partially Complete`;
	return `${score}% Incomplete`;
}

/**
 * Format a date string for display.
 */
export function formatDate(dateStr: string): string {
	if (!dateStr) return 'N/A';
	const d = new Date(dateStr);
	if (isNaN(d.getTime())) return dateStr;
	return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * Format an NHS number for display (XXX XXX XXXX).
 */
export function formatNhsNumber(nhs: string): string {
	const digits = nhs.replace(/\s/g, '');
	if (digits.length !== 10) return nhs;
	return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}
