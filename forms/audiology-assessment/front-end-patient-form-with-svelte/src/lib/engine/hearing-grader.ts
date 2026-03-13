import type { AssessmentData, HearingGrade, FiredRule } from './types';
import { hearingRules } from './hearing-rules';
import { classifyDbHL, worseGrade } from './utils';

/**
 * Pure function: evaluates all hearing rules against patient data.
 * Returns the maximum grade among all fired rules (worst finding),
 * defaulting to 'normal' for patients with no fired rules.
 *
 * The primary grading is based on the WHO Classification using
 * pure tone average (PTA) values, with additional rules for
 * speech audiometry, tinnitus, vestibular, and functional impact.
 */
export function calculateHearingGrade(data: AssessmentData): {
	hearingGrade: HearingGrade;
	firedRules: FiredRule[];
} {
	const firedRules: FiredRule[] = [];

	for (const rule of hearingRules) {
		try {
			if (rule.evaluate(data)) {
				firedRules.push({
					id: rule.id,
					system: rule.system,
					description: rule.description,
					grade: rule.grade
				});
			}
		} catch (e) {
			// Rule evaluation failed - log for debugging but continue grading
			console.warn(`Hearing rule ${rule.id} evaluation failed:`, e);
		}
	}

	// Determine grade from PTA values first (primary classification)
	const rightGrade = classifyDbHL(data.audiometricResults.pureToneAverageRight);
	const leftGrade = classifyDbHL(data.audiometricResults.pureToneAverageLeft);
	let ptaGrade = worseGrade(rightGrade, leftGrade);

	// Also consider fired rules that may elevate the grade
	const gradeOrder: Record<HearingGrade, number> = {
		normal: 0,
		mild: 1,
		moderate: 2,
		severe: 3,
		profound: 4
	};

	let hearingGrade: HearingGrade = ptaGrade;
	if (firedRules.length > 0) {
		const maxRuleGrade = firedRules.reduce<HearingGrade>((max, r) => {
			return gradeOrder[r.grade] > gradeOrder[max] ? r.grade : max;
		}, 'normal');
		hearingGrade = worseGrade(ptaGrade, maxRuleGrade);
	}

	return { hearingGrade, firedRules };
}
