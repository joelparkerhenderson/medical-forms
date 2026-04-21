import type { AssessmentData, ASAGrade, FiredRule } from './types';
import { asaRules } from './asa-rules';

/**
 * Pure function: evaluates all ASA rules against patient data.
 * Returns the maximum grade among all fired rules (worst comorbidity),
 * defaulting to ASA I for healthy patients with no fired rules.
 */
export function calculateASA(data: AssessmentData): {
	asaGrade: ASAGrade;
	firedRules: FiredRule[];
} {
	const firedRules: FiredRule[] = [];

	for (const rule of asaRules) {
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
			console.warn(`ASA rule ${rule.id} evaluation failed:`, e);
		}
	}

	const asaGrade: ASAGrade =
		firedRules.length === 0
			? 1
			: (Math.max(...firedRules.map((r) => r.grade)) as ASAGrade);

	return { asaGrade, firedRules };
}
