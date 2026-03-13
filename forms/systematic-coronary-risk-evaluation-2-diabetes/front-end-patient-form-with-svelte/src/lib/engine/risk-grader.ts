import type { AssessmentData, FiredRule, GradingResult, RiskCategory } from './types.js';
import { evaluateRules } from './risk-rules.js';
import { detectAdditionalFlags } from './flagged-issues.js';
import { isLikelyDraft } from './utils.js';

/**
 * Pure function: evaluates all risk rules against patient data.
 * Returns risk category and fired rules.
 * Risk category is the maximum among all fired rules.
 */
export function calculateRisk(data: AssessmentData): { riskCategory: RiskCategory; firedRules: FiredRule[] } {
	if (isLikelyDraft(data)) {
		return { riskCategory: 'draft', firedRules: [] };
	}

	const firedRules = evaluateRules(data);

	const riskOrder = (level: string): number => {
		switch (level) {
			case 'low':
				return 1;
			case 'medium':
				return 2;
			case 'high':
				return 3;
			default:
				return 0;
		}
	};

	let riskCategory: RiskCategory;
	if (firedRules.length === 0) {
		riskCategory = 'low';
	} else {
		const maxLevel = firedRules.reduce(
			(max, r) => (riskOrder(r.riskLevel) > riskOrder(max) ? r.riskLevel : max),
			'low'
		);
		// Map to SCORE2-Diabetes categories
		switch (maxLevel) {
			case 'high':
				riskCategory = 'veryHigh';
				break;
			case 'medium':
				riskCategory = 'high';
				break;
			default:
				riskCategory = 'moderate';
				break;
		}
	}

	return { riskCategory, firedRules };
}

/** Full grading: risk calculation + additional flags + timestamp. */
export function gradeAssessment(data: AssessmentData): GradingResult {
	const { riskCategory, firedRules } = calculateRisk(data);
	const additionalFlags = detectAdditionalFlags(data);

	return {
		riskCategory,
		firedRules,
		additionalFlags,
		timestamp: new Date().toISOString()
	};
}
