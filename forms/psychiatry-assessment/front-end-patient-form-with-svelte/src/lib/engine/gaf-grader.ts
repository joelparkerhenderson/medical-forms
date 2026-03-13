import type { AssessmentData, GAFScore, FiredRule } from './types';
import { gafRules } from './gaf-rules';

/**
 * Pure function: evaluates all GAF rules against patient data.
 * Starts at 100 (superior functioning) and subtracts score impacts
 * for each fired rule. The final score is clamped to 1-100.
 * A score of 100 with no fired rules indicates superior functioning.
 */
export function calculateGAF(data: AssessmentData): {
	gafScore: GAFScore;
	firedRules: FiredRule[];
} {
	const firedRules: FiredRule[] = [];

	for (const rule of gafRules) {
		try {
			if (rule.evaluate(data)) {
				firedRules.push({
					id: rule.id,
					domain: rule.domain,
					description: rule.description,
					scoreImpact: rule.scoreImpact
				});
			}
		} catch (e) {
			// Rule evaluation failed - log for debugging but continue grading
			console.warn(`GAF rule ${rule.id} evaluation failed:`, e);
		}
	}

	// Calculate GAF score: start at 100, subtract impacts, clamp to 1-100
	const totalImpact = firedRules.reduce((sum, r) => sum + r.scoreImpact, 0);
	const gafScore: GAFScore = Math.max(1, Math.min(100, 100 - totalImpact));

	return { gafScore, firedRules };
}
