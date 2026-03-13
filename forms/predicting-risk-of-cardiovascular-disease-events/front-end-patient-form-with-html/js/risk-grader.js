import { estimateTenYearRisk, estimateThirtyYearRisk, isLikelyDraft } from './utils.js';
import { allRules } from './risk-rules.js';

/**
 * Pure function: evaluates all PREVENT risk rules against assessment data.
 * Returns { riskCategory, tenYearRiskPercent, thirtyYearRiskPercent, firedRules }.
 */
export function calculateRisk(data) {
  if (isLikelyDraft(data)) {
    return { riskCategory: 'draft', tenYearRiskPercent: 0, thirtyYearRiskPercent: 0, firedRules: [] };
  }

  const tenYear = estimateTenYearRisk(data);
  const thirtyYear = estimateThirtyYearRisk(tenYear);

  const firedRules = [];
  for (const rule of allRules()) {
    if (rule.evaluate(data)) {
      firedRules.push({
        id: rule.id,
        category: rule.category,
        description: rule.description,
        riskLevel: rule.riskLevel,
      });
    }
  }

  let riskCategory;
  if (tenYear < 5) riskCategory = 'low';
  else if (tenYear < 7.5) riskCategory = 'borderline';
  else if (tenYear < 20) riskCategory = 'intermediate';
  else riskCategory = 'high';

  return { riskCategory, tenYearRiskPercent: tenYear, thirtyYearRiskPercent: thirtyYear, firedRules };
}
