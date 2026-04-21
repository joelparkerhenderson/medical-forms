import type { AssessmentData, SeverityLevel, FiredRule } from './types';
import { giRules } from './gi-rules';
import { severityLevelFromScore } from './utils';

/**
 * Pure function: evaluates all GI scoring rules against patient data.
 * Returns a composite severity score by summing all fired rule points,
 * and the corresponding severity level.
 */
export function calculateGISeverity(data: AssessmentData): {
	severityScore: number;
	severityLevel: SeverityLevel;
	firedRules: FiredRule[];
} {
	const firedRules: FiredRule[] = [];

	for (const rule of giRules) {
		try {
			if (rule.evaluate(data)) {
				firedRules.push({
					id: rule.id,
					category: rule.category,
					description: rule.description,
					points: rule.points
				});
			}
		} catch (e) {
			// Rule evaluation failed - log for debugging but continue scoring
			console.warn(`GI rule ${rule.id} evaluation failed:`, e);
		}
	}

	const severityScore = firedRules.reduce((sum, r) => sum + r.points, 0);
	const severityLevel = severityLevelFromScore(severityScore);

	return { severityScore, severityLevel, firedRules };
}
