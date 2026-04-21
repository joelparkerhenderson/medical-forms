import type { AssessmentData, ACTScore, ControlLevel, FiredRule } from './types';
import { actRules } from './act-rules';
import { classifyACTScore } from './utils';

/**
 * Pure function: evaluates all ACT rules against patient data.
 * Returns the total ACT score (5-25) and the individual question scores.
 * Questions that have not been answered (score 0) are excluded from the total.
 */
export function calculateACT(data: AssessmentData): {
	actScore: ACTScore;
	controlLevel: ControlLevel;
	firedRules: FiredRule[];
} {
	const firedRules: FiredRule[] = [];
	let totalScore = 0;
	let answeredCount = 0;

	for (const rule of actRules) {
		try {
			const score = rule.evaluate(data);
			if (score > 0) {
				answeredCount++;
				totalScore += score;
				firedRules.push({
					id: rule.id,
					category: rule.category,
					description: rule.description,
					score
				});
			}
		} catch (e) {
			console.warn(`ACT rule ${rule.id} evaluation failed:`, e);
		}
	}

	// If no questions answered, default to maximum score (well-controlled)
	const actScore: ACTScore = answeredCount === 0 ? 25 : totalScore;
	const controlLevel = classifyACTScore(actScore);

	return { actScore, controlLevel, firedRules };
}
