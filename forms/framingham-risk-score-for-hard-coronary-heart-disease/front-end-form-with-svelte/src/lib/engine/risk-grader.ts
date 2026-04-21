import type { AssessmentData, FiredRule, RiskLevel } from './types';
import { allRules } from './risk-rules';
import { calculateFraminghamRisk, isLikelyDraft } from './utils';

/**
 * Pure function: evaluates all risk rules against assessment data.
 * Returns the risk level, 10-year risk percentage, and fired rules.
 * If age and sex are missing, returns "draft" status.
 */
export function calculateRisk(data: AssessmentData): {
	riskCategory: RiskLevel;
	tenYearRiskPercent: number;
	firedRules: FiredRule[];
} {
	// Check if draft (age and sex missing)
	if (isLikelyDraft(data)) {
		return { riskCategory: 'draft', tenYearRiskPercent: 0, firedRules: [] };
	}

	// Calculate 10-year risk using Framingham Cox regression
	const rawRisk = calculateFraminghamRisk(data);

	// Round to 1 decimal place
	const tenYearRiskPercent = Math.round(rawRisk * 10) / 10;

	// Fire rules
	const firedRules: FiredRule[] = [];
	for (const rule of allRules()) {
		if (rule.evaluate(data, tenYearRiskPercent)) {
			firedRules.push({
				id: rule.id,
				category: rule.category,
				description: rule.description,
				riskLevel: rule.riskLevel
			});
		}
	}

	// Determine risk category from 10-year risk
	let riskCategory: RiskLevel;
	if (tenYearRiskPercent < 10.0) {
		riskCategory = 'low';
	} else if (tenYearRiskPercent < 20.0) {
		riskCategory = 'intermediate';
	} else {
		riskCategory = 'high';
	}

	return { riskCategory, tenYearRiskPercent, firedRules };
}
