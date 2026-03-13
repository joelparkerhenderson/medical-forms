import type { AssessmentData, DiseaseActivity, FiredRule } from './types';
import { das28Rules } from './das28-rules';
import { classifyDiseaseActivity } from './utils';

/**
 * Calculate the DAS28-ESR score from patient data.
 *
 * Formula: DAS28 = 0.56 * sqrt(TJC28) + 0.28 * sqrt(SJC28) + 0.70 * ln(ESR) + 0.014 * VAS
 *
 * Where:
 *   TJC28 = Tender Joint Count (0-28)
 *   SJC28 = Swollen Joint Count (0-28)
 *   ESR   = Erythrocyte Sedimentation Rate (mm/hr)
 *   VAS   = Patient Global Assessment (0-100mm)
 *
 * Returns null if any required component is missing.
 */
export function calculateDAS28(data: AssessmentData): {
	das28Score: number | null;
	diseaseActivity: DiseaseActivity | null;
	firedRules: FiredRule[];
} {
	const firedRules: FiredRule[] = [];

	// Evaluate all rules
	for (const rule of das28Rules) {
		try {
			if (rule.evaluate(data)) {
				firedRules.push({
					id: rule.id,
					category: rule.category,
					description: rule.description
				});
			}
		} catch (e) {
			console.warn(`DAS28 rule ${rule.id} evaluation failed:`, e);
		}
	}

	// Calculate DAS28 score
	const tjc = data.jointAssessment.tenderJointCount28;
	const sjc = data.jointAssessment.swollenJointCount28;
	const esr = data.laboratoryResults.esr;
	const vas = data.jointAssessment.patientGlobalVAS;

	if (tjc === null || sjc === null || esr === null || vas === null) {
		return { das28Score: null, diseaseActivity: null, firedRules };
	}

	// Ensure ESR is at least 1 to avoid ln(0)
	const esrClamped = Math.max(esr, 1);

	const das28Score =
		0.56 * Math.sqrt(tjc) +
		0.28 * Math.sqrt(sjc) +
		0.70 * Math.log(esrClamped) +
		0.014 * vas;

	// Round to 2 decimal places
	const roundedScore = Math.round(das28Score * 100) / 100;
	const diseaseActivity = classifyDiseaseActivity(roundedScore);

	return { das28Score: roundedScore, diseaseActivity, firedRules };
}
