import type { AssessmentData, RiskLevel, FiredRule } from './types';
import { intakeRules } from './intake-rules';

/**
 * Pure function: evaluates all intake rules against patient data.
 * Returns the maximum risk level among all fired rules (worst complexity),
 * defaulting to Low for healthy patients with no fired rules.
 */
export function calculateRiskLevel(data: AssessmentData): {
	riskLevel: RiskLevel;
	firedRules: FiredRule[];
} {
	const firedRules: FiredRule[] = [];

	for (const rule of intakeRules) {
		try {
			if (rule.evaluate(data)) {
				firedRules.push({
					id: rule.id,
					category: rule.category,
					description: rule.description,
					riskLevel: rule.riskLevel
				});
			}
		} catch (e) {
			// Rule evaluation failed - log for debugging but continue grading
			console.warn(`Intake rule ${rule.id} evaluation failed:`, e);
		}
	}

	const riskOrder: Record<RiskLevel, number> = { low: 0, medium: 1, high: 2 };

	const riskLevel: RiskLevel =
		firedRules.length === 0
			? 'low'
			: firedRules.reduce<RiskLevel>((max, r) => {
					return riskOrder[r.riskLevel] > riskOrder[max] ? r.riskLevel : max;
				}, 'low');

	return { riskLevel, firedRules };
}
