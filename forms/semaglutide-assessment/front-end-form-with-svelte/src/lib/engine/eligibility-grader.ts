import type { AssessmentData, FiredRule, EligibilityStatus } from './types';
import { absoluteContraindications, relativeContraindications, bmiThresholds } from './eligibility-rules';
import { calculateBMI, bmiCategory } from './utils';

/**
 * Pure function: evaluates eligibility for semaglutide therapy.
 * Returns eligibility status (Eligible/Conditional/Ineligible),
 * along with absolute and relative contraindications found.
 *
 * Eligibility logic:
 *   - Any absolute contraindication -> Ineligible
 *   - Any relative contraindication or borderline BMI -> Conditional
 *   - Otherwise -> Eligible
 */
export function evaluateEligibility(data: AssessmentData): {
	eligibilityStatus: EligibilityStatus;
	bmi: number | null;
	bmiCategoryLabel: string;
	absoluteContraindications: FiredRule[];
	relativeContraindications: FiredRule[];
} {
	const firedAbsolute: FiredRule[] = [];
	const firedRelative: FiredRule[] = [];

	const cs = data.contraindicationsScreening;

	// ─── Absolute contraindications ──────────────────────────
	if (cs.personalHistoryMTC === 'yes') {
		firedAbsolute.push({ ...absoluteContraindications[0] });
	}
	if (cs.familyHistoryMTC === 'yes') {
		firedAbsolute.push({ ...absoluteContraindications[1] });
	}
	if (cs.men2Syndrome === 'yes') {
		firedAbsolute.push({ ...absoluteContraindications[2] });
	}
	if (cs.pancreatitisHistory === 'yes') {
		firedAbsolute.push({ ...absoluteContraindications[3] });
	}
	if (cs.pregnancyPlanned === 'yes') {
		firedAbsolute.push({ ...absoluteContraindications[4] });
	}
	if (cs.type1Diabetes === 'yes') {
		firedAbsolute.push({ ...absoluteContraindications[5] });
	}
	if (cs.allergySemaglutide === 'yes') {
		firedAbsolute.push({ ...absoluteContraindications[6] });
	}

	// ─── Relative contraindications ─────────────────────────
	const gi = data.gastrointestinalHistory;
	if (gi.gastroparesis === 'yes') {
		firedRelative.push({ ...relativeContraindications[0] });
	}
	if (gi.gallstoneHistory === 'yes') {
		firedRelative.push({ ...relativeContraindications[1] });
	}
	if (cs.diabeticRetinopathySevere === 'yes') {
		firedRelative.push({ ...relativeContraindications[2] });
	}
	if (data.mentalHealthScreening.eatingDisorderHistory === 'yes') {
		firedRelative.push({ ...relativeContraindications[3] });
	}
	if (data.mentalHealthScreening.suicidalIdeation === 'yes') {
		firedRelative.push({ ...relativeContraindications[4] });
	}
	if (cs.breastfeeding === 'yes') {
		firedRelative.push({ ...relativeContraindications[5] });
	}
	if (cs.severeGIDisease === 'yes') {
		firedRelative.push({ ...relativeContraindications[6] });
	}

	// ─── BMI evaluation ─────────────────────────────────────
	const bmi = calculateBMI(data.bodyComposition.heightCm, data.bodyComposition.weightKg);
	const bmiCategoryLabel = bmi !== null ? bmiCategory(bmi) : '';

	// Check BMI threshold for weight management indication
	if (data.indicationGoals.primaryIndication === 'weight-management' && bmi !== null) {
		const thresholds = bmiThresholds['weight-management'];
		if (bmi < thresholds.minimumBmiWithComorbidity!) {
			firedRelative.push({
				id: 'BMI-LOW-001',
				category: 'Body Composition',
				description: `BMI ${bmi.toFixed(1)} below minimum threshold of ${thresholds.minimumBmiWithComorbidity} for weight management indication`,
				type: 'relative'
			});
		}
	}

	// ─── Determine overall eligibility ──────────────────────
	let eligibilityStatus: EligibilityStatus;
	if (firedAbsolute.length > 0) {
		eligibilityStatus = 'Ineligible';
	} else if (firedRelative.length > 0) {
		eligibilityStatus = 'Conditional';
	} else {
		eligibilityStatus = 'Eligible';
	}

	return {
		eligibilityStatus,
		bmi,
		bmiCategoryLabel,
		absoluteContraindications: firedAbsolute,
		relativeContraindications: firedRelative
	};
}
