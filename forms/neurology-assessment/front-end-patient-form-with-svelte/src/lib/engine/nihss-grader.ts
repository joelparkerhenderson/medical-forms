import type { AssessmentData, FiredRule } from './types';
import { nihssRules } from './nihss-rules';
import { nihssSeverityLabel } from './utils';

/**
 * Pure function: evaluates all NIHSS items against patient data.
 * Returns the total NIHSS score (0-42) and individual item scores.
 * NIHSS 0 = no stroke symptoms, 42 = maximum severity.
 */
export function calculateNIHSS(data: AssessmentData): {
	nihssScore: number;
	nihssSeverity: string;
	firedRules: FiredRule[];
} {
	const firedRules: FiredRule[] = [];
	let totalScore = 0;

	for (const rule of nihssRules) {
		try {
			const score = rule.evaluate(data);
			if (score > 0) {
				firedRules.push({
					id: rule.id,
					category: rule.category,
					description: rule.description,
					score
				});
			}
			totalScore += score;
		} catch (e) {
			// Rule evaluation failed - log for debugging but continue scoring
			console.warn(`NIHSS rule ${rule.id} evaluation failed:`, e);
		}
	}

	const nihssSeverity = nihssSeverityLabel(totalScore);

	return { nihssScore: totalScore, nihssSeverity, firedRules };
}
