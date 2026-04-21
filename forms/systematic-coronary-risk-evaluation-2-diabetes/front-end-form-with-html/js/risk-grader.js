/**
 * SCORE2-Diabetes Risk Grader
 */
import { evaluateRules } from './risk-rules.js';
import { detectAdditionalFlags } from './flagged-issues.js';
import { isLikelyDraft } from './utils.js';

export function calculateRisk(data) {
    if (isLikelyDraft(data)) return { riskCategory: 'draft', firedRules: [] };

    const firedRules = evaluateRules(data);
    const riskOrder = l => ({ low: 1, medium: 2, high: 3 }[l] || 0);

    let riskCategory;
    if (firedRules.length === 0) {
        riskCategory = 'low';
    } else {
        const maxLevel = firedRules.reduce((max, r) => riskOrder(r.riskLevel) > riskOrder(max) ? r.riskLevel : max, 'low');
        riskCategory = maxLevel === 'high' ? 'veryHigh' : maxLevel === 'medium' ? 'high' : 'moderate';
    }
    return { riskCategory, firedRules };
}

export function gradeAssessment(data) {
    const { riskCategory, firedRules } = calculateRisk(data);
    const additionalFlags = detectAdditionalFlags(data);
    return { riskCategory, firedRules, additionalFlags, timestamp: new Date().toISOString() };
}
