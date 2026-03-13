import { calculateFraminghamRisk, isLikelyDraft } from './utils.js';
import { allRules } from './risk-rules.js';

export function calculateRisk(data) {
  if (isLikelyDraft(data)) return { riskCategory: 'draft', tenYearRiskPercent: 0, firedRules: [] };

  const rawRisk = calculateFraminghamRisk(data);
  const tenYearRiskPercent = Math.round(rawRisk * 10) / 10;

  const firedRules = [];
  for (const rule of allRules()) {
    if (rule.evaluate(data, tenYearRiskPercent)) {
      firedRules.push({ id: rule.id, category: rule.category, description: rule.description, riskLevel: rule.riskLevel });
    }
  }

  let riskCategory;
  if (tenYearRiskPercent < 10) riskCategory = 'low';
  else if (tenYearRiskPercent < 20) riskCategory = 'intermediate';
  else riskCategory = 'high';

  return { riskCategory, tenYearRiskPercent, firedRules };
}
