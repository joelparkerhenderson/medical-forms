import type { AssessmentData, FiredRule } from './types';
import { evaluateRules } from './risk-rules';
import { estimateTenYearRisk, calculateHeartAge } from './risk-calculator';
import { isLikelyDraft } from './utils';

export interface RiskResult {
	riskCategory: string;
	tenYearRiskPercent: number;
	heartAge: number | null;
	firedRules: FiredRule[];
}

export function calculateRisk(data: AssessmentData): RiskResult {
	if (isLikelyDraft(data)) {
		return { riskCategory: 'draft', tenYearRiskPercent: 0, heartAge: null, firedRules: [] };
	}

	const tenYearRisk = estimateTenYearRisk(data);
	const heartAge = calculateHeartAge(data, tenYearRisk);
	const firedRules = evaluateRules(data, tenYearRisk, heartAge);

	let category: string;
	if (tenYearRisk >= 20) {
		category = 'high';
	} else if (tenYearRisk >= 10) {
		category = 'moderate';
	} else {
		category = 'low';
	}

	return { riskCategory: category, tenYearRiskPercent: tenYearRisk, heartAge, firedRules };
}
