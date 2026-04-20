import type { AssessmentData, MECCategory, MethodMEC, RiskLevel, FiredRule, GradingResult } from './types';
import { mecRules } from './mec-rules';
import { detectAdditionalFlags } from './flagged-issues';

/**
 * Pure function: evaluates all UK MEC rules against patient data.
 * Returns per-method MEC categories, overall risk level, and all fired rules.
 */
export function calculateMECGrade(data: AssessmentData): GradingResult {
	const firedRules: FiredRule[] = [];

	for (const rule of mecRules) {
		try {
			if (rule.evaluate(data)) {
				firedRules.push({
					id: rule.id,
					category: rule.category,
					description: rule.description,
					mecCategory: rule.mecCategory,
					affectedMethods: rule.affectedMethods
				});
			}
		} catch (e) {
			// Rule evaluation failed - log for debugging but continue grading
			console.warn(`MEC rule ${rule.id} evaluation failed:`, e);
		}
	}

	// Determine per-method MEC categories (worst category wins)
	const methodMEC = deriveMethodMEC(firedRules);

	// Determine overall risk from worst MEC category
	const overallRisk = deriveOverallRisk(methodMEC);

	const additionalFlags = detectAdditionalFlags(data);

	return {
		methodMEC,
		overallRisk,
		firedRules,
		additionalFlags,
		timestamp: new Date().toISOString()
	};
}

/** Derive per-method MEC categories from fired rules. */
function deriveMethodMEC(firedRules: FiredRule[]): MethodMEC {
	const methods: (keyof MethodMEC)[] = ['coc', 'pop', 'implant', 'injection', 'iud', 'ius'];
	const result: MethodMEC = {
		coc: 1,
		pop: 1,
		implant: 1,
		injection: 1,
		iud: 1,
		ius: 1
	};

	for (const rule of firedRules) {
		for (const method of methods) {
			if (rule.affectedMethods.includes(method)) {
				const current = result[method];
				if (rule.mecCategory > current) {
					result[method] = rule.mecCategory as MECCategory;
				}
			}
		}
	}

	return result;
}

/** Derive overall risk from worst MEC category across all methods. */
function deriveOverallRisk(methodMEC: MethodMEC): RiskLevel {
	const worstMEC = Math.max(
		methodMEC.coc,
		methodMEC.pop,
		methodMEC.implant,
		methodMEC.injection,
		methodMEC.iud,
		methodMEC.ius
	);

	if (worstMEC >= 4) return 'critical';
	if (worstMEC >= 3) return 'high';
	if (worstMEC >= 2) return 'moderate';
	return 'low';
}
