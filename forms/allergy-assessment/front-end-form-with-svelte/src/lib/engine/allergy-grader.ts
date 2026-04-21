import type { AssessmentData, SeverityLevel, FiredRule } from './types';
import { allergyRules } from './allergy-rules';
import { calculateAllergyBurdenScore } from './utils';

/**
 * Pure function: evaluates all allergy severity rules against patient data.
 * Returns the maximum severity level among all fired rules,
 * defaulting to 'mild' for patients with only localised reactions or no fired rules.
 */
export function calculateAllergySeverity(data: AssessmentData): {
	severityLevel: SeverityLevel;
	firedRules: FiredRule[];
} {
	const firedRules: FiredRule[] = [];

	for (const rule of allergyRules) {
		try {
			if (rule.evaluate(data)) {
				firedRules.push({
					id: rule.id,
					category: rule.category,
					description: rule.description,
					severityLevel: rule.severityLevel
				});
			}
		} catch (e) {
			// Rule evaluation failed - log for debugging but continue grading
			console.warn(`Allergy rule ${rule.id} evaluation failed:`, e);
		}
	}

	const severityOrder: Record<string, number> = { mild: 1, moderate: 2, severe: 3 };

	const severityLevel: SeverityLevel =
		firedRules.length === 0
			? 'mild'
			: (Object.entries(severityOrder)
					.sort(([, a], [, b]) => b - a)
					.find(([level]) =>
						firedRules.some((r) => r.severityLevel === level)
					)?.[0] as SeverityLevel) ?? 'mild';

	return { severityLevel, firedRules };
}

/**
 * Calculate the allergy burden score for the assessment.
 */
export function calculateAllergyBurden(data: AssessmentData): number {
	return calculateAllergyBurdenScore(data);
}
