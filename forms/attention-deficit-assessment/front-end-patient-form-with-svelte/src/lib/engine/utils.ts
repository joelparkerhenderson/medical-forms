import type { ASRSScore, ADHDClassification, ADHDSubtype } from './types';

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

/** Sum an array of ASRS scores, treating null as 0. */
export function sumScores(scores: ASRSScore[]): number {
	return scores.reduce((sum, s) => sum + (s ?? 0), 0);
}

/** Count how many Part A items are in the "shaded" (clinically significant) range.
 *  For ASRS v1.1 Part A Screener:
 *  - Items 1-3 (inattentive): score >= 2 (Sometimes or more) is in shaded range
 *  - Items 4-6 (hyperactive): score >= 3 (Often or more) is in shaded range
 */
export function countPartAShadedItems(
	focusDifficulty: ASRSScore,
	organizationDifficulty: ASRSScore,
	rememberingDifficulty: ASRSScore,
	avoidingTasks: ASRSScore,
	fidgeting: ASRSScore,
	overlyActive: ASRSScore
): number {
	let count = 0;
	// Inattentive items (shaded threshold: >= 2)
	if ((focusDifficulty ?? 0) >= 2) count++;
	if ((organizationDifficulty ?? 0) >= 2) count++;
	if ((rememberingDifficulty ?? 0) >= 2) count++;
	// Hyperactive items (shaded threshold: >= 3)
	if ((avoidingTasks ?? 0) >= 3) count++;
	if ((fidgeting ?? 0) >= 3) count++;
	if ((overlyActive ?? 0) >= 3) count++;
	return count;
}

/** Determine ADHD classification based on ASRS total score (0-72). */
export function classifyFromTotal(total: number, partAScreenerPositive: boolean): ADHDClassification {
	if (partAScreenerPositive && total >= 46) return 'highly-likely';
	if (partAScreenerPositive && total >= 28) return 'likely';
	if (partAScreenerPositive || total >= 24) return 'possible';
	return 'unlikely';
}

/** Determine ADHD subtype based on inattentive vs hyperactive-impulsive subscores. */
export function determineSubtype(
	inattentiveSubscore: number,
	hyperactiveImpulsiveSubscore: number,
	classification: ADHDClassification
): ADHDSubtype {
	if (classification === 'unlikely') return 'unspecified';
	const inattentiveThreshold = 14; // 7 items * 2 avg
	const hyperactiveThreshold = 14; // 7 items * 2 avg (approx for 11 items at lower per-item threshold)
	const inattentiveElevated = inattentiveSubscore >= inattentiveThreshold;
	const hyperactiveElevated = hyperactiveImpulsiveSubscore >= hyperactiveThreshold;
	if (inattentiveElevated && hyperactiveElevated) return 'combined';
	if (inattentiveElevated) return 'inattentive';
	if (hyperactiveElevated) return 'hyperactive-impulsive';
	return 'unspecified';
}

/** ASRS frequency label. */
export function asrsFrequencyLabel(score: ASRSScore): string {
	switch (score) {
		case 0: return 'Never';
		case 1: return 'Rarely';
		case 2: return 'Sometimes';
		case 3: return 'Often';
		case 4: return 'Very Often';
		default: return 'Not answered';
	}
}

/** ADHD classification label. */
export function asrsClassificationLabel(classification: string): string {
	switch (classification) {
		case 'unlikely':
			return 'Unlikely ADHD';
		case 'possible':
			return 'Possible ADHD';
		case 'likely':
			return 'Likely ADHD';
		case 'highly-likely':
			return 'Highly Likely ADHD';
		default:
			return classification;
	}
}

/** ADHD classification colour class. */
export function asrsClassificationColor(classification: string): string {
	switch (classification) {
		case 'unlikely':
			return 'bg-green-100 text-green-800 border-green-300';
		case 'possible':
			return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		case 'likely':
			return 'bg-orange-100 text-orange-800 border-orange-300';
		case 'highly-likely':
			return 'bg-red-100 text-red-800 border-red-300';
		default:
			return 'bg-gray-100 text-gray-800 border-gray-300';
	}
}

/** ADHD subtype label. */
export function adhdSubtypeLabel(subtype: ADHDSubtype): string {
	switch (subtype) {
		case 'inattentive': return 'Predominantly Inattentive';
		case 'hyperactive-impulsive': return 'Predominantly Hyperactive-Impulsive';
		case 'combined': return 'Combined Presentation';
		case 'unspecified': return 'Unspecified';
		default: return subtype;
	}
}
