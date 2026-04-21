import type { AssessmentData, CCSClass, NYHAClass, RiskLevel, FiredRule, GradingResult } from './types';
import { cardioRules } from './cardio-rules';
import { detectAdditionalFlags } from './flagged-issues';

/**
 * Pure function: evaluates all cardiology rules against patient data.
 * Returns CCS class, NYHA class, overall risk level, and all fired rules.
 */
export function calculateCardioGrade(data: AssessmentData): GradingResult {
	const firedRules: FiredRule[] = [];

	for (const rule of cardioRules) {
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
			// Rule evaluation failed - log for debugging but continue grading
			console.warn(`Cardio rule ${rule.id} evaluation failed:`, e);
		}
	}

	// Determine CCS class from patient input
	const ccsClass = deriveCCSClass(data);

	// Determine NYHA class from patient input
	const nyhaClass = deriveNYHAClass(data);

	// Determine overall risk from worst fired rule grade
	const overallRisk = deriveOverallRisk(firedRules, ccsClass, nyhaClass);

	const additionalFlags = detectAdditionalFlags(data);

	return {
		ccsClass,
		nyhaClass,
		overallRisk,
		firedRules,
		additionalFlags,
		timestamp: new Date().toISOString()
	};
}

/** Derive CCS Angina Class from patient-reported data. */
function deriveCCSClass(data: AssessmentData): CCSClass | null {
	const ccs = data.chestPainAngina.ccsClass;
	if (ccs === '1') return 1;
	if (ccs === '2') return 2;
	if (ccs === '3') return 3;
	if (ccs === '4') return 4;
	return null;
}

/** Derive NYHA Heart Failure Class from patient-reported data. */
function deriveNYHAClass(data: AssessmentData): NYHAClass | null {
	const nyha = data.heartFailureSymptoms.nyhaClass;
	if (nyha === '1') return 1;
	if (nyha === '2') return 2;
	if (nyha === '3') return 3;
	if (nyha === '4') return 4;
	return null;
}

/** Derive overall cardiovascular risk from fired rules and classifications. */
function deriveOverallRisk(
	firedRules: FiredRule[],
	ccsClass: CCSClass | null,
	nyhaClass: NYHAClass | null
): RiskLevel {
	const maxGrade =
		firedRules.length > 0 ? Math.max(...firedRules.map((r) => r.grade)) : 0;

	// Critical: any grade 4 rule, CCS IV, or NYHA IV
	if (maxGrade >= 4 || ccsClass === 4 || nyhaClass === 4) return 'critical';

	// High: any grade 3 rule, CCS III, or NYHA III
	if (maxGrade >= 3 || ccsClass === 3 || nyhaClass === 3) return 'high';

	// Moderate: any grade 2 rule, CCS II, or NYHA II
	if (maxGrade >= 2 || ccsClass === 2 || nyhaClass === 2) return 'moderate';

	// Low: grade 1 or no rules fired
	return 'low';
}
