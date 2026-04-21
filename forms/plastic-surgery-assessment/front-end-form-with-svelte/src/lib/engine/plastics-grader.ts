import type { AssessmentData, ASAClass, WoundClass, ComplexityScore, RiskLevel, FiredRule, GradingResult } from './types';
import { plasticsRules } from './plastics-rules';
import { detectAdditionalFlags } from './flagged-issues';

/**
 * Pure function: evaluates all plastic surgery rules against patient data.
 * Returns ASA class, wound class, complexity score, overall risk level, and all fired rules.
 */
export function calculatePlasticsGrade(data: AssessmentData): GradingResult {
	const firedRules: FiredRule[] = [];

	for (const rule of plasticsRules) {
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
			console.warn(`Plastics rule ${rule.id} evaluation failed:`, e);
		}
	}

	// Determine ASA class from clinician input
	const asaClass = deriveASAClass(data);

	// Determine wound class from clinician input
	const woundClass = deriveWoundClass(data);

	// Determine complexity score from clinician input
	const complexityScore = deriveComplexityScore(data);

	// Determine overall risk from worst fired rule grade and classifications
	const overallRisk = deriveOverallRisk(firedRules, asaClass, woundClass, complexityScore);

	const additionalFlags = detectAdditionalFlags(data);

	return {
		asaClass,
		woundClass,
		complexityScore,
		overallRisk,
		firedRules,
		additionalFlags,
		timestamp: new Date().toISOString()
	};
}

/** Derive ASA Physical Status Class from clinician-reported data. */
function deriveASAClass(data: AssessmentData): ASAClass | null {
	const asa = data.anaestheticRisk.asaClass;
	if (asa === '1') return 1;
	if (asa === '2') return 2;
	if (asa === '3') return 3;
	if (asa === '4') return 4;
	if (asa === '5') return 5;
	return null;
}

/** Derive Wound Classification from clinician-reported data. */
function deriveWoundClass(data: AssessmentData): WoundClass | null {
	const wc = data.woundTissueAssessment.woundClassification;
	if (wc === 'clean') return 1;
	if (wc === 'clean-contaminated') return 2;
	if (wc === 'contaminated') return 3;
	if (wc === 'dirty') return 4;
	return null;
}

/** Derive Surgical Complexity Score from clinician-reported data. */
function deriveComplexityScore(data: AssessmentData): ComplexityScore | null {
	const cx = data.procedurePlanningConsent.procedureComplexity;
	if (cx === '1') return 1;
	if (cx === '2') return 2;
	if (cx === '3') return 3;
	if (cx === '4') return 4;
	return null;
}

/** Derive overall surgical risk from fired rules and classifications. */
function deriveOverallRisk(
	firedRules: FiredRule[],
	asaClass: ASAClass | null,
	woundClass: WoundClass | null,
	complexityScore: ComplexityScore | null
): RiskLevel {
	const maxGrade =
		firedRules.length > 0 ? Math.max(...firedRules.map((r) => r.grade)) : 0;

	// Critical: any grade 4 rule, ASA IV-V, dirty wound, or complexity 4
	if (maxGrade >= 4 || (asaClass !== null && asaClass >= 4) || woundClass === 4 || complexityScore === 4) return 'critical';

	// High: any grade 3 rule, ASA III, contaminated wound, or complexity 3
	if (maxGrade >= 3 || asaClass === 3 || woundClass === 3 || complexityScore === 3) return 'high';

	// Moderate: any grade 2 rule, ASA II, clean-contaminated wound, or complexity 2
	if (maxGrade >= 2 || asaClass === 2 || woundClass === 2 || complexityScore === 2) return 'moderate';

	// Low: grade 1 or no rules fired
	return 'low';
}
