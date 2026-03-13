import type { AssessmentData, DMFTCategory, FiredRule } from './types';
import { dmftRules } from './dmft-rules';

/**
 * Pure function: evaluates all DMFT rules against patient data.
 * Returns the DMFT score, its category, and all fired rules.
 * The DMFT score is the sum of Decayed + Missing + Filled teeth.
 * Maximum possible score: 32 (all permanent teeth).
 */
export function calculateDMFT(data: AssessmentData): {
	dmftScore: number;
	dmftCategory: DMFTCategory;
	firedRules: FiredRule[];
} {
	const decayed = data.dmftAssessment.decayedTeeth ?? 0;
	const missing = data.dmftAssessment.missingTeeth ?? 0;
	const filled = data.dmftAssessment.filledTeeth ?? 0;
	const dmftScore = decayed + missing + filled;

	const dmftCategory = getDMFTCategory(dmftScore);

	const firedRules: FiredRule[] = [];

	for (const rule of dmftRules) {
		try {
			if (rule.evaluate(data)) {
				firedRules.push({
					id: rule.id,
					system: rule.system,
					description: rule.description,
					category: rule.category
				});
			}
		} catch (e) {
			// Rule evaluation failed - log for debugging but continue grading
			console.warn(`DMFT rule ${rule.id} evaluation failed:`, e);
		}
	}

	return { dmftScore, dmftCategory, firedRules };
}

/** Determine DMFT category from score. */
function getDMFTCategory(score: number): DMFTCategory {
	if (score === 0) return 'caries-free';
	if (score <= 5) return 'very-low';
	if (score <= 10) return 'low';
	if (score <= 15) return 'moderate';
	if (score <= 20) return 'high';
	return 'very-high';
}
