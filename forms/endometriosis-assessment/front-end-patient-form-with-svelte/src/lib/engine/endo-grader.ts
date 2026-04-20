import type { AssessmentData, ASRMStage, SeverityLevel, FiredRule, GradingResult } from './types';
import { endoRules } from './endo-rules';
import { detectAdditionalFlags } from './flagged-issues';
import { calculateEHP30Total } from './utils';

/**
 * Pure function: evaluates all endometriosis rules against patient data.
 * Returns ASRM stage, EHP-30 score, overall severity, and all fired rules.
 */
export function calculateEndoGrade(data: AssessmentData): GradingResult {
	const firedRules: FiredRule[] = [];

	for (const rule of endoRules) {
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
			console.warn(`Endo rule ${rule.id} evaluation failed:`, e);
		}
	}

	// Determine ASRM stage from surgical history or derive from symptom burden
	const asrmStage = deriveASRMStage(data, firedRules);

	// Calculate ASRM points approximation from fired rules
	const asrmPoints = calculateASRMPoints(firedRules, data);

	// Calculate EHP-30 total score
	const ehp30Score = calculateEHP30Total(
		data.qualityOfLife.painDomainScore,
		data.qualityOfLife.controlPowerlessnessScore,
		data.qualityOfLife.emotionalWellbeingScore,
		data.qualityOfLife.socialSupportScore,
		data.qualityOfLife.selfImageScore
	);

	// Determine overall severity
	const overallSeverity = deriveOverallSeverity(firedRules, asrmStage, ehp30Score);

	const additionalFlags = detectAdditionalFlags(data);

	return {
		asrmStage,
		asrmPoints,
		ehp30Score,
		overallSeverity,
		firedRules,
		additionalFlags,
		timestamp: new Date().toISOString()
	};
}

/** Derive ASRM Stage from surgical history or symptom burden. */
function deriveASRMStage(data: AssessmentData, firedRules: FiredRule[]): ASRMStage | null {
	// If surgically staged, use that
	const surgicalStage = data.surgicalHistory.asrmStageAtSurgery;
	if (surgicalStage === 'I') return 1;
	if (surgicalStage === 'II') return 2;
	if (surgicalStage === 'III') return 3;
	if (surgicalStage === 'IV') return 4;

	// Otherwise derive from symptom burden
	const maxGrade = firedRules.length > 0 ? Math.max(...firedRules.map((r) => r.grade)) : 0;
	const totalGrade = firedRules.reduce((sum, r) => sum + r.grade, 0);

	if (maxGrade >= 4 || totalGrade > 40) return 4;
	if (maxGrade >= 3 || totalGrade > 15) return 3;
	if (maxGrade >= 2 || totalGrade > 5) return 2;
	if (firedRules.length > 0) return 1;
	return null;
}

/** Calculate approximate ASRM points from fired rules. */
function calculateASRMPoints(firedRules: FiredRule[], data: AssessmentData): number {
	let points = 0;

	// Base points from fired rules
	for (const rule of firedRules) {
		switch (rule.grade) {
			case 1: points += 1; break;
			case 2: points += 4; break;
			case 3: points += 8; break;
			case 4: points += 16; break;
		}
	}

	// Additional points for organ involvement
	if (data.gastrointestinalSymptoms.bowelObstructionSymptoms === 'yes') points += 10;
	if (data.urinarySymptoms.urinaryObstructionSymptoms === 'yes') points += 10;
	if (data.surgicalHistory.endometriomaDrained === 'yes') points += 5;

	return points;
}

/** Derive overall severity from fired rules, ASRM stage, and EHP-30. */
function deriveOverallSeverity(
	firedRules: FiredRule[],
	asrmStage: ASRMStage | null,
	ehp30Score: number | null
): SeverityLevel {
	const maxGrade = firedRules.length > 0 ? Math.max(...firedRules.map((r) => r.grade)) : 0;

	// Critical: any grade 4, Stage IV, or bowel/urinary obstruction
	if (maxGrade >= 4 || asrmStage === 4) return 'critical';

	// Severe: any grade 3, Stage III, or EHP-30 >75
	if (maxGrade >= 3 || asrmStage === 3 || (ehp30Score !== null && ehp30Score > 75)) return 'severe';

	// Moderate: any grade 2, Stage II, or EHP-30 >50
	if (maxGrade >= 2 || asrmStage === 2 || (ehp30Score !== null && ehp30Score > 50)) return 'moderate';

	// Mild: grade 1 or no rules fired
	return 'mild';
}
