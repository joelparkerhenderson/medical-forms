import { intakeRules } from './intake-rules.js';

export function calculateRiskLevel(data) {
    const firedRules = [];
    for (const rule of intakeRules) {
        try {
            if (rule.evaluate(data)) {
                firedRules.push({
                    id: rule.id, category: rule.category,
                    description: rule.description, riskLevel: rule.riskLevel
                });
            }
        } catch (e) {
            console.warn('Intake rule ' + rule.id + ' evaluation failed:', e);
        }
    }
    const riskOrder = { low: 0, medium: 1, high: 2 };
    const riskLevel = firedRules.length === 0 ? 'low' :
        firedRules.reduce((max, r) => riskOrder[r.riskLevel] > riskOrder[max] ? r.riskLevel : max, 'low');
    return { riskLevel, firedRules };
}
