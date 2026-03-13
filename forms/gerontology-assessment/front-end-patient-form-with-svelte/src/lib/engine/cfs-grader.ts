import type { AssessmentData, CFSScore, FiredRule } from './types';
import { cfsRules } from './cfs-rules';

/**
 * Pure function: evaluates all CFS rules against patient data.
 * Returns the maximum score among all fired rules (worst frailty level),
 * defaulting to CFS 1 for very fit patients with no fired rules.
 */
export function calculateCFS(data: AssessmentData): {
	cfsScore: CFSScore;
	firedRules: FiredRule[];
} {
	const firedRules: FiredRule[] = [];

	for (const rule of cfsRules) {
		try {
			if (rule.evaluate(data)) {
				firedRules.push({
					id: rule.id,
					domain: rule.domain,
					description: rule.description,
					score: rule.score
				});
			}
		} catch (e) {
			// Rule evaluation failed - log for debugging but continue grading
			console.warn(`CFS rule ${rule.id} evaluation failed:`, e);
		}
	}

	const cfsScore: CFSScore =
		firedRules.length === 0
			? 1
			: (Math.max(...firedRules.map((r) => r.score)) as CFSScore);

	return { cfsScore, firedRules };
}
