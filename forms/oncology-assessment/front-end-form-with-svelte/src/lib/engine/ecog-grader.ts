import type { AssessmentData, ECOGGrade, FiredRule } from './types';
import { ecogRules } from './ecog-rules';

/**
 * Pure function: evaluates all ECOG rules against patient data.
 * Returns the maximum grade among all fired rules (worst impairment),
 * defaulting to ECOG 0 for fully active patients with no fired rules.
 */
export function calculateECOG(data: AssessmentData): {
	ecogGrade: ECOGGrade;
	firedRules: FiredRule[];
} {
	const firedRules: FiredRule[] = [];

	for (const rule of ecogRules) {
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
			console.warn(`ECOG rule ${rule.id} evaluation failed:`, e);
		}
	}

	const ecogGrade: ECOGGrade =
		firedRules.length === 0
			? 0
			: (Math.max(...firedRules.map((r) => r.grade)) as ECOGGrade);

	return { ecogGrade, firedRules };
}
