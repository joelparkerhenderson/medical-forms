// ──────────────────────────────────────────────
// ASA grading engine
// ──────────────────────────────────────────────

import { asaRules } from './asa-rules.js';

/**
 * Pure function: evaluates all ASA rules against patient data.
 * Returns the maximum grade among all fired rules (worst comorbidity),
 * defaulting to ASA I for healthy patients with no fired rules.
 */
export function calculateASA(data) {
	const firedRules = [];

	for (const rule of asaRules) {
		try {
			if (rule.evaluate(data)) {
				firedRules.push({
					id: rule.id,
					system: rule.system,
					description: rule.description,
					grade: rule.grade
				});
			}
		} catch (e) {
			console.warn(`ASA rule ${rule.id} evaluation failed:`, e);
		}
	}

	const asaGrade =
		firedRules.length === 0
			? 1
			: Math.max(...firedRules.map((r) => r.grade));

	return { asaGrade, firedRules };
}
