import { rebaRules } from './reba-rules.js';
import { rebaRiskLevel } from './utils.js';

/**
 * Pure function: evaluates all REBA rules against assessment data.
 * The REBA score is determined by summing the scores of all fired rules,
 * clamped to the 1-15 range.
 * A score of 1 indicates negligible risk (no rules fired).
 */
export function calculateREBA(data) {
    const firedRules = [];

    for (const rule of rebaRules) {
        try {
            if (rule.evaluate(data)) {
                firedRules.push({
                    id: rule.id,
                    system: rule.system,
                    description: rule.description,
                    score: rule.score
                });
            }
        } catch (e) {
            console.warn('REBA rule ' + rule.id + ' evaluation failed:', e);
        }
    }

    const rawScore = firedRules.reduce((sum, r) => sum + r.score, 0);
    const rebaScore = firedRules.length === 0 ? 1 : Math.min(Math.max(rawScore, 1), 15);
    const riskLevel = rebaRiskLevel(rebaScore);

    return { rebaScore, riskLevel, firedRules };
}
