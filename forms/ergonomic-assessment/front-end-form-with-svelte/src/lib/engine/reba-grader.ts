import type { AssessmentData, RebaScore, FiredRule } from './types';
import { rebaRules } from './reba-rules';
import { rebaRiskLevel } from './utils';

/**
 * Pure function: evaluates all REBA rules against assessment data.
 * The REBA score is determined by summing the scores of all fired rules,
 * clamped to the 1-15 range.
 * A score of 1 indicates negligible risk (no rules fired).
 */
export function calculateREBA(data: AssessmentData): {
	rebaScore: RebaScore;
	riskLevel: string;
	firedRules: FiredRule[];
} {
	const firedRules: FiredRule[] = [];

	for (const rule of rebaRules) {
		try {
			if (rule.evaluate(data)) {
				firedRules.push({
					id: rule.id,
					system: rule.system,
					description: rule.description,
					score: rule.score
				});
			}
		} catch (e) {
			// Rule evaluation failed - log for debugging but continue grading
			console.warn(`REBA rule ${rule.id} evaluation failed:`, e);
		}
	}

	const rawScore = firedRules.reduce((sum, r) => sum + r.score, 0);
	const rebaScore: RebaScore = firedRules.length === 0 ? 1 : Math.min(Math.max(rawScore, 1), 15);
	const riskLevel = rebaRiskLevel(rebaScore);

	return { rebaScore, riskLevel, firedRules };
}
