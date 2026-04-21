import type {
	AssessmentData,
	MRSResult,
	MRSSeverity,
	MRSSubscaleResult,
	FiredRule,
	HRTRiskClassification
} from './types';
import { mrsRules } from './mrs-rules';

/**
 * Pure function: evaluates all MRS rules against patient data.
 * Returns the MRS total score, subscale scores, severity label,
 * and the list of fired rules (items that contributed to the score).
 *
 * MRS Scoring:
 *   Total 0-4: No/Minimal symptoms
 *   Total 5-8: Mild
 *   Total 9-15: Moderate
 *   Total 16-44: Severe
 *
 * Subscale ranges:
 *   Somatic (4 items, 0-4 each): 0-16
 *   Psychological (4 items, 0-4 each): 0-16
 *   Urogenital (3 items, 0-4 each): 0-12
 */
export function calculateMRS(data: AssessmentData): {
	mrsResult: MRSResult;
	firedRules: FiredRule[];
} {
	const firedRules: FiredRule[] = [];
	const subscales: MRSSubscaleResult = { somatic: 0, psychological: 0, urogenital: 0 };

	for (const rule of mrsRules) {
		try {
			const score = rule.getScore(data);
			if (score !== null && score > 0) {
				firedRules.push({
					id: rule.id,
					system: rule.system,
					description: rule.description,
					score
				});
				subscales[rule.subscale] += score;
			}
		} catch (e) {
			console.warn(`MRS rule ${rule.id} evaluation failed:`, e);
		}
	}

	const totalScore = subscales.somatic + subscales.psychological + subscales.urogenital;
	const severity = getMRSSeverity(totalScore);

	return {
		mrsResult: {
			totalScore,
			severity,
			subscales
		},
		firedRules
	};
}

/** Determine MRS severity from total score. */
export function getMRSSeverity(totalScore: number): MRSSeverity {
	if (totalScore <= 4) return 'No/Minimal';
	if (totalScore <= 8) return 'Mild';
	if (totalScore <= 15) return 'Moderate';
	return 'Severe';
}

/**
 * Classify HRT risk-benefit based on contraindications and patient history.
 *
 * Contraindicated: Any absolute contraindication present
 *   - Active/recent breast cancer history
 *   - Undiagnosed vaginal bleeding
 *   - Active cardiovascular disease (stroke, MI, VTE)
 *   - Pregnancy
 *   - Active liver disease
 *
 * Cautious: Relative contraindications or high-risk factors
 *   - VTE history
 *   - BRCA positive
 *   - >10 years post-menopause start
 *   - Family history breast/ovarian cancer
 *   - High cardiovascular risk (QRISK >10%)
 *
 * Acceptable: Some risk factors but benefits likely outweigh
 *
 * Favourable: No contraindications, symptomatic
 */
export function classifyHRTRisk(data: AssessmentData): HRTRiskClassification {
	const ci = data.contraindicationsScreen;

	// ─── Absolute contraindications → Contraindicated ────────
	if (ci.breastCancerHistory === 'yes') return 'Contraindicated';
	if (ci.undiagnosedVaginalBleeding === 'yes') return 'Contraindicated';
	if (ci.pregnancy === 'yes') return 'Contraindicated';
	if (ci.activeCardiovascularDisease === 'yes') return 'Contraindicated';
	if (ci.liverDisease === 'yes') return 'Contraindicated';

	// ─── Relative contraindications → Cautious ──────────────
	let cautionFactors = 0;

	if (ci.vteHistory === 'yes') cautionFactors++;

	if (data.breastHealth.brcaStatus === 'positive') cautionFactors++;

	if (data.breastHealth.familyHistoryBreastCancer === 'yes') cautionFactors++;
	if (data.breastHealth.familyHistoryOvarianCancer === 'yes') cautionFactors++;

	// >10 years post-menopause
	if (data.menopauseStatus.ageAtMenopause !== null && data.demographics.dateOfBirth) {
		const age = calculateAgeFromDOB(data.demographics.dateOfBirth);
		if (age !== null && data.menopauseStatus.ageAtMenopause > 0) {
			const yearsSinceMenopause = age - data.menopauseStatus.ageAtMenopause;
			if (yearsSinceMenopause > 10) cautionFactors++;
		}
	}

	// High QRISK score
	if (
		data.cardiovascularRisk.qriskScore !== null &&
		data.cardiovascularRisk.qriskScore > 10
	) {
		cautionFactors++;
	}

	if (cautionFactors >= 2) return 'Cautious';

	// ─── Some risk factors → Acceptable ─────────────────────
	if (cautionFactors === 1) return 'Acceptable';

	// ─── No risk factors → Favourable ───────────────────────
	return 'Favourable';
}

function calculateAgeFromDOB(dob: string): number | null {
	if (!dob) return null;
	const birth = new Date(dob);
	if (isNaN(birth.getTime())) return null;
	const today = new Date();
	let age = today.getFullYear() - birth.getFullYear();
	const m = today.getMonth() - birth.getMonth();
	if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
		age--;
	}
	return age;
}
