import type { AssessmentData, RiskLevel, FiredRule, GradingResult, AuditRiskCategory, DastRiskCategory } from './types';
import { substanceRules } from './substance-rules';
import { detectAdditionalFlags } from './flagged-issues';
import { calculateAuditScore, calculateDastScore, auditRiskCategory, dastRiskCategory } from './utils';

/**
 * Pure function: evaluates all substance abuse rules against patient data.
 * Returns AUDIT score, DAST score, overall risk level, and all fired rules.
 */
export function calculateSubstanceGrade(data: AssessmentData): GradingResult {
	const firedRules: FiredRule[] = [];

	for (const rule of substanceRules) {
		try {
			if (rule.evaluate(data)) {
				firedRules.push({
					id: rule.id,
					category: rule.category,
					description: rule.description,
					grade: rule.grade
				});
			}
		} catch (e) {
			// Rule evaluation failed - log for debugging but continue grading
			console.warn(`Substance rule ${rule.id} evaluation failed:`, e);
		}
	}

	// Calculate AUDIT score
	const auditScore = calculateAuditScore(data.alcoholUseAudit);
	const auditCategory = auditRiskCategory(auditScore);

	// Calculate DAST score
	const dastScore = calculateDastScore(data.drugUseDast);
	const dastCategory = dastRiskCategory(dastScore);

	// Determine overall risk from worst fired rule grade and scores
	const overallRisk = deriveOverallRisk(firedRules, auditScore, dastScore);

	const additionalFlags = detectAdditionalFlags(data);

	return {
		auditScore,
		auditRiskCategory: auditCategory,
		dastScore,
		dastRiskCategory: dastCategory,
		overallRisk,
		firedRules,
		additionalFlags,
		timestamp: new Date().toISOString()
	};
}

/** Derive overall substance abuse risk from fired rules and scores. */
function deriveOverallRisk(
	firedRules: FiredRule[],
	auditScore: number,
	dastScore: number
): RiskLevel {
	const maxGrade =
		firedRules.length > 0 ? Math.max(...firedRules.map((r) => r.grade)) : 0;

	// Critical: any grade 4 rule, AUDIT >= 20, or DAST >= 9
	if (maxGrade >= 4 || auditScore >= 20 || dastScore >= 9) return 'critical';

	// High: any grade 3 rule, AUDIT >= 16, or DAST >= 6
	if (maxGrade >= 3 || auditScore >= 16 || dastScore >= 6) return 'high';

	// Moderate: any grade 2 rule, AUDIT >= 8, or DAST >= 3
	if (maxGrade >= 2 || auditScore >= 8 || dastScore >= 3) return 'moderate';

	// Low: grade 1 or no rules fired
	return 'low';
}
