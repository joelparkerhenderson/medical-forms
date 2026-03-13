import type { AssessmentData, GradingResult } from './types';
import { evaluateRules } from './risk-rules';
import { detectAdditionalFlags } from './flagged-issues';
import { estimateTenYearRisk, estimateThirtyYearRisk, isLikelyDraft } from './utils';

/**
 * Pure function: evaluates all PREVENT risk rules against assessment data.
 * Returns a complete GradingResult including risk category, percentages,
 * fired rules, and additional flags.
 */
export function calculateRisk(data: AssessmentData): GradingResult {
	// Draft detection
	if (isLikelyDraft(data)) {
		return {
			riskCategory: 'draft',
			tenYearRiskPercent: 0.0,
			thirtyYearRiskPercent: 0.0,
			firedRules: [],
			additionalFlags: [],
			timestamp: new Date().toISOString()
		};
	}

	// Calculate risk estimates
	const tenYear = estimateTenYearRisk(data);
	const thirtyYear = estimateThirtyYearRisk(tenYear);

	// Fire rules
	const firedRules = evaluateRules(data);

	// Detect additional flags
	const additionalFlags = detectAdditionalFlags(data);

	// Determine risk category from 10-year risk
	let category: string;
	if (tenYear < 5.0) {
		category = 'low';
	} else if (tenYear < 7.5) {
		category = 'borderline';
	} else if (tenYear < 20.0) {
		category = 'intermediate';
	} else {
		category = 'high';
	}

	return {
		riskCategory: category,
		tenYearRiskPercent: tenYear,
		thirtyYearRiskPercent: thirtyYear,
		firedRules,
		additionalFlags,
		timestamp: new Date().toISOString()
	};
}
