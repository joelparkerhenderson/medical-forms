import type { AssessmentData, AdditionalFlag } from './types';

/**
 * Detects additional flags that should be highlighted for the gynaecologist,
 * independent of ASRM staging. These are safety-critical alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// ─── Bowel obstruction (HIGH) ───────────────────────────────
	if (data.gastrointestinalSymptoms.bowelObstructionSymptoms === 'yes') {
		flags.push({
			id: 'FLAG-BOWEL-001',
			category: 'Gastrointestinal',
			message: 'Bowel obstruction symptoms reported - URGENT SURGICAL REVIEW REQUIRED',
			priority: 'high'
		});
	}

	// ─── Urinary obstruction (HIGH) ─────────────────────────────
	if (data.urinarySymptoms.urinaryObstructionSymptoms === 'yes') {
		flags.push({
			id: 'FLAG-URIN-001',
			category: 'Urinary',
			message: 'Urinary obstruction symptoms reported - URGENT UROLOGY/GYNAE REVIEW',
			priority: 'high'
		});
	}

	// ─── Severe pelvic pain (HIGH) ──────────────────────────────
	if (
		data.painAssessment.hasPelvicPain === 'yes' &&
		data.painAssessment.pelvicPainSeverity !== null &&
		data.painAssessment.pelvicPainSeverity >= 8
	) {
		flags.push({
			id: 'FLAG-PAIN-001',
			category: 'Pain',
			message: `Severe pelvic pain (VAS ${data.painAssessment.pelvicPainSeverity}/10) - pain management review recommended`,
			priority: 'high'
		});
	}

	// ─── Constant pain (HIGH) ───────────────────────────────────
	if (
		data.painAssessment.hasPelvicPain === 'yes' &&
		data.painAssessment.pelvicPainTiming === 'constant'
	) {
		flags.push({
			id: 'FLAG-PAIN-002',
			category: 'Pain',
			message: 'Constant (non-cyclical) pelvic pain - consider chronic pain management',
			priority: 'high'
		});
	}

	// ─── Infertility (HIGH) ─────────────────────────────────────
	if (
		data.fertilityAssessment.tryingToConceive === 'yes' &&
		data.fertilityAssessment.durationTryingMonths !== null &&
		data.fertilityAssessment.durationTryingMonths > 12
	) {
		flags.push({
			id: 'FLAG-FERT-001',
			category: 'Fertility',
			message: `Infertility (${data.fertilityAssessment.durationTryingMonths} months) - fertility clinic referral recommended`,
			priority: 'high'
		});
	}

	// ─── Low AMH (HIGH) ─────────────────────────────────────────
	if (
		data.fertilityAssessment.amhLevel !== null &&
		data.fertilityAssessment.amhLevel < 5.4
	) {
		flags.push({
			id: 'FLAG-FERT-002',
			category: 'Fertility',
			message: `Low AMH (${data.fertilityAssessment.amhLevel} pmol/L) - diminished ovarian reserve`,
			priority: 'high'
		});
	}

	// ─── Current opioid use (HIGH) ──────────────────────────────
	if (data.previousTreatments.opioidsCurrent === 'yes') {
		flags.push({
			id: 'FLAG-TX-001',
			category: 'Treatment',
			message: 'Current opioid use for endometriosis pain - opioid review recommended',
			priority: 'high'
		});
	}

	// ─── Unable to work (HIGH) ──────────────────────────────────
	if (data.qualityOfLife.workImpact === 'unable-to-work') {
		flags.push({
			id: 'FLAG-QOL-001',
			category: 'Quality of Life',
			message: 'Patient unable to work due to endometriosis - MDT review recommended',
			priority: 'high'
		});
	}

	// ─── Cyclical rectal bleeding (MEDIUM) ──────────────────────
	if (
		data.gastrointestinalSymptoms.rectalBleeding === 'yes' &&
		data.gastrointestinalSymptoms.rectalBleedingCyclical === 'yes'
	) {
		flags.push({
			id: 'FLAG-BOWEL-002',
			category: 'Gastrointestinal',
			message: 'Cyclical rectal bleeding - bowel endometriosis suspected, consider MRI',
			priority: 'medium'
		});
	}

	// ─── Cyclical haematuria (MEDIUM) ───────────────────────────
	if (
		data.urinarySymptoms.haematuria === 'yes' &&
		data.urinarySymptoms.haematuriaCyclical === 'yes'
	) {
		flags.push({
			id: 'FLAG-URIN-002',
			category: 'Urinary',
			message: 'Cyclical haematuria - bladder endometriosis suspected, consider cystoscopy',
			priority: 'medium'
		});
	}

	// ─── Deep dyspareunia (MEDIUM) ──────────────────────────────
	if (
		data.painAssessment.dyspareunia === 'deep' ||
		data.painAssessment.dyspareunia === 'both'
	) {
		flags.push({
			id: 'FLAG-PAIN-003',
			category: 'Pain',
			message: 'Deep dyspareunia reported - consider pouch of Douglas / uterosacral ligament involvement',
			priority: 'medium'
		});
	}

	// ─── Ectopic pregnancy history (MEDIUM) ─────────────────────
	if (
		data.fertilityAssessment.ectopicPregnancies !== null &&
		data.fertilityAssessment.ectopicPregnancies > 0
	) {
		flags.push({
			id: 'FLAG-FERT-003',
			category: 'Fertility',
			message: `History of ectopic pregnancy (${data.fertilityAssessment.ectopicPregnancies}) - tubal assessment recommended`,
			priority: 'medium'
		});
	}

	// ─── Previous bowel surgery (MEDIUM) ────────────────────────
	if (data.surgicalHistory.bowelSurgery === 'yes') {
		flags.push({
			id: 'FLAG-SURG-001',
			category: 'Surgical',
			message: 'Previous bowel surgery for endometriosis - colorectal MDT if repeat surgery planned',
			priority: 'medium'
		});
	}

	// ─── Multiple laparoscopies (MEDIUM) ────────────────────────
	if (
		data.surgicalHistory.numberOfLaparoscopies !== null &&
		data.surgicalHistory.numberOfLaparoscopies >= 3
	) {
		flags.push({
			id: 'FLAG-SURG-002',
			category: 'Surgical',
			message: `Multiple previous laparoscopies (${data.surgicalHistory.numberOfLaparoscopies}) - consider tertiary referral`,
			priority: 'medium'
		});
	}

	// ─── Severe mental health impact (MEDIUM) ───────────────────
	if (data.qualityOfLife.mentalHealthImpact === 'severe') {
		flags.push({
			id: 'FLAG-QOL-002',
			category: 'Quality of Life',
			message: 'Severe mental health impact - psychology/counselling referral recommended',
			priority: 'medium'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
