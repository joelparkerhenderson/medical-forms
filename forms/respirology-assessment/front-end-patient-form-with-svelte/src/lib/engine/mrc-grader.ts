import type { AssessmentData, MRCGrade, FiredRule } from './types';
import { mrcRules } from './mrc-rules';

/**
 * Pure function: evaluates all MRC rules against patient data.
 * Returns the maximum grade among all fired rules (worst finding),
 * defaulting to MRC 1 for patients with no fired rules.
 */
export function calculateMRC(data: AssessmentData): {
	mrcGrade: MRCGrade;
	firedRules: FiredRule[];
} {
	const firedRules: FiredRule[] = [];

	for (const rule of mrcRules) {
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
			console.warn(`MRC rule ${rule.id} evaluation failed:`, e);
		}
	}

	const mrcGrade: MRCGrade =
		firedRules.length === 0
			? 1
			: (Math.max(...firedRules.map((r) => r.grade)) as MRCGrade);

	return { mrcGrade, firedRules };
}
