import type { AssessmentData, WHOSeverity, NCCMERPCategory, RiskLevel, FiredRule, GradingResult } from './types';
import { errorRules } from './error-rules';
import { detectAdditionalFlags } from './flagged-issues';

/**
 * Pure function: evaluates all medical error rules against report data.
 * Returns WHO severity, NCC MERP category, overall risk level, and all fired rules.
 */
export function calculateErrorGrade(data: AssessmentData): GradingResult {
	const firedRules: FiredRule[] = [];

	for (const rule of errorRules) {
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
			console.warn(`Error rule ${rule.id} evaluation failed:`, e);
		}
	}

	// Determine WHO severity from reporter input
	const whoSeverity = deriveWHOSeverity(data);

	// Determine NCC MERP category from reporter input
	const nccMerpCategory = deriveNCCMERPCategory(data);

	// Determine overall risk from worst fired rule grade and classifications
	const overallRisk = deriveOverallRisk(firedRules, whoSeverity, nccMerpCategory);

	const additionalFlags = detectAdditionalFlags(data);

	return {
		whoSeverity,
		nccMerpCategory,
		overallRisk,
		firedRules,
		additionalFlags,
		timestamp: new Date().toISOString()
	};
}

/** Derive WHO Severity from reporter-classified data. */
function deriveWHOSeverity(data: AssessmentData): WHOSeverity {
	return data.errorClassification.whoSeverity || '';
}

/** Derive NCC MERP Category from reporter-classified data. */
function deriveNCCMERPCategory(data: AssessmentData): NCCMERPCategory {
	return data.errorClassification.nccMerpCategory || '';
}

/** Derive overall risk from fired rules and classifications. */
function deriveOverallRisk(
	firedRules: FiredRule[],
	whoSeverity: WHOSeverity,
	nccMerpCategory: NCCMERPCategory
): RiskLevel {
	const maxGrade =
		firedRules.length > 0 ? Math.max(...firedRules.map((r) => r.grade)) : 0;

	// Map WHO severity to risk
	const whoRisk: Record<string, number> = {
		'near-miss': 1,
		mild: 2,
		moderate: 3,
		severe: 4,
		critical: 5
	};

	// Map NCC MERP to risk
	const merpRisk: Record<string, number> = {
		A: 1,
		B: 1,
		C: 1,
		D: 2,
		E: 3,
		F: 3,
		G: 4,
		H: 5,
		I: 5
	};

	const whoLevel = whoSeverity ? (whoRisk[whoSeverity] ?? 0) : 0;
	const merpLevel = nccMerpCategory ? (merpRisk[nccMerpCategory] ?? 0) : 0;
	const effectiveMax = Math.max(maxGrade, whoLevel, merpLevel);

	if (effectiveMax >= 5) return 'critical';
	if (effectiveMax >= 4) return 'high';
	if (effectiveMax >= 3) return 'moderate';
	return 'low';
}
