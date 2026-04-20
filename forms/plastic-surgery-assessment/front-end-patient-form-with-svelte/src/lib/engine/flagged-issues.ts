import type { AssessmentData, AdditionalFlag } from './types';

/**
 * Detects additional flags that should be highlighted for the plastic surgeon,
 * independent of ASA/wound/complexity classification. These are safety-critical alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// ─── Emergency referral (HIGH) ─────────────────────────────
	if (data.reasonForReferral.urgency === 'emergency') {
		flags.push({
			id: 'FLAG-EMERG-001',
			category: 'Referral',
			message: 'Emergency referral - URGENT SURGICAL EVALUATION REQUIRED',
			priority: 'high'
		});
	}

	// ─── Body dysmorphic concern (HIGH) ────────────────────────
	if (data.psychologicalAssessment.bodyDysmorphicConcern === 'yes') {
		flags.push({
			id: 'FLAG-BDD-001',
			category: 'Psychological',
			message: `Body dysmorphic concern identified: ${data.psychologicalAssessment.bodyDysmorphicDetails || 'details not specified'} - psychological assessment recommended before proceeding`,
			priority: 'high'
		});
	}

	// ─── Unrealistic expectations (HIGH) ───────────────────────
	if (data.psychologicalAssessment.realisticExpectations === 'no') {
		flags.push({
			id: 'FLAG-EXPECT-001',
			category: 'Psychological',
			message: 'Patient has unrealistic expectations - further counselling required before consent',
			priority: 'high'
		});
	}

	// ─── Difficult airway (HIGH) ──────────────────────────────
	if (data.anaestheticRisk.difficultAirway === 'yes') {
		flags.push({
			id: 'FLAG-AIRWAY-001',
			category: 'Anaesthetic',
			message: `Difficult airway: ${data.anaestheticRisk.difficultAirwayDetails || 'details not specified'} - anaesthetic team alert required`,
			priority: 'high'
		});
	}

	// ─── Malignant hyperthermia risk (HIGH) ────────────────────
	if (data.anaestheticRisk.malignantHyperthermiaRisk === 'yes') {
		flags.push({
			id: 'FLAG-MH-001',
			category: 'Anaesthetic',
			message: 'Malignant hyperthermia risk - trigger-free anaesthetic required',
			priority: 'high'
		});
	}

	// ─── ASA IV-V (HIGH) ──────────────────────────────────────
	if (data.anaestheticRisk.asaClass === '4' || data.anaestheticRisk.asaClass === '5') {
		flags.push({
			id: 'FLAG-ASA-001',
			category: 'Anaesthetic',
			message: `ASA Class ${data.anaestheticRisk.asaClass} - high anaesthetic risk, senior anaesthetic review required`,
			priority: 'high'
		});
	}

	// ─── Dirty/infected wound (HIGH) ──────────────────────────
	if (data.woundTissueAssessment.woundClassification === 'dirty') {
		flags.push({
			id: 'FLAG-WOUND-001',
			category: 'Wound',
			message: 'Dirty/infected wound - antibiotic therapy and wound preparation required',
			priority: 'high'
		});
	}

	// ─── Active wound infection (HIGH) ────────────────────────
	if (data.woundTissueAssessment.woundInfectionSigns === 'yes') {
		flags.push({
			id: 'FLAG-INFECT-001',
			category: 'Wound',
			message: `Active wound infection: ${data.woundTissueAssessment.woundInfectionDetails || 'details not specified'} - treat infection before elective surgery`,
			priority: 'high'
		});
	}

	// ─── Non-viable tissue (HIGH) ─────────────────────────────
	if (data.woundTissueAssessment.tissueViability === 'non-viable') {
		flags.push({
			id: 'FLAG-TISSUE-001',
			category: 'Wound',
			message: 'Non-viable tissue present - debridement required',
			priority: 'high'
		});
	}

	// ─── Absent vascular supply (HIGH) ────────────────────────
	if (data.woundTissueAssessment.vascularSupply === 'absent') {
		flags.push({
			id: 'FLAG-VASC-001',
			category: 'Wound',
			message: 'Absent vascular supply - vascular surgery consultation required',
			priority: 'high'
		});
	}

	// ─── Bleeding disorder (HIGH) ─────────────────────────────
	if (data.medicalSurgicalHistory.bleedingDisorder === 'yes') {
		flags.push({
			id: 'FLAG-BLEED-001',
			category: 'Comorbidity',
			message: `Bleeding disorder: ${data.medicalSurgicalHistory.bleedingDisorderDetails || 'details not specified'} - haematology liaison required`,
			priority: 'high'
		});
	}

	// ─── Anticoagulant use (MEDIUM) ───────────────────────────
	if (data.medicationsAllergies.onAnticoagulants === 'yes') {
		flags.push({
			id: 'FLAG-ANTICOAG-001',
			category: 'Medications',
			message: `On anticoagulants: ${data.medicationsAllergies.anticoagulantDetails || 'type not specified'} - perioperative bridging plan required`,
			priority: 'medium'
		});
	}

	// ─── Immunosuppressed (MEDIUM) ────────────────────────────
	if (data.medicalSurgicalHistory.immunosuppressed === 'yes') {
		flags.push({
			id: 'FLAG-IMMUNO-001',
			category: 'Comorbidity',
			message: `Immunosuppressed: ${data.medicalSurgicalHistory.immunosuppressedDetails || 'details not specified'} - infection risk assessment`,
			priority: 'medium'
		});
	}

	// ─── Latex allergy (MEDIUM) ───────────────────────────────
	if (data.medicationsAllergies.latexAllergy === 'yes') {
		flags.push({
			id: 'FLAG-LATEX-001',
			category: 'Allergy',
			message: 'Latex allergy - latex-free environment required',
			priority: 'medium'
		});
	}

	// ─── Drug allergy with anaphylaxis (HIGH) ─────────────────
	for (const [i, allergy] of data.medicationsAllergies.allergies.entries()) {
		if (allergy.severity === 'anaphylaxis') {
			flags.push({
				id: `FLAG-ALLERGY-ANAPH-${i}`,
				category: 'Allergy',
				message: `ANAPHYLAXIS history: ${allergy.allergen}`,
				priority: 'high'
			});
		}
	}

	// ─── Any drug allergies documented (MEDIUM) ───────────────
	if (data.medicationsAllergies.allergies.length > 0) {
		flags.push({
			id: 'FLAG-ALLERGY-001',
			category: 'Allergy',
			message: `${data.medicationsAllergies.allergies.length} drug allergy/allergies documented`,
			priority: 'medium'
		});
	}

	// ─── Current smoker (MEDIUM) ──────────────────────────────
	if (data.anaestheticRisk.smokingStatus === 'current') {
		flags.push({
			id: 'FLAG-SMOKE-001',
			category: 'Social',
			message: 'Current smoker - counsel on smoking cessation (wound healing impairment)',
			priority: 'medium'
		});
	}

	// ─── Uncontrolled diabetes (MEDIUM) ───────────────────────
	if (
		(data.medicalSurgicalHistory.diabetes === 'type-1' || data.medicalSurgicalHistory.diabetes === 'type-2') &&
		data.medicalSurgicalHistory.diabetesControlled === 'no'
	) {
		flags.push({
			id: 'FLAG-DM-001',
			category: 'Comorbidity',
			message: 'Uncontrolled diabetes - optimise glycaemic control before elective surgery',
			priority: 'medium'
		});
	}

	// ─── Keloid/hypertrophic scarring (MEDIUM) ────────────────
	if (data.medicalSurgicalHistory.keloidScarring === 'yes') {
		flags.push({
			id: 'FLAG-SCAR-001',
			category: 'Comorbidity',
			message: 'Keloid/hypertrophic scarring tendency - discuss with patient and plan scar management',
			priority: 'medium'
		});
	}

	// ─── Psychological referral needed (MEDIUM) ───────────────
	if (data.psychologicalAssessment.psychologicalReferralNeeded === 'yes') {
		flags.push({
			id: 'FLAG-PSYCH-001',
			category: 'Psychological',
			message: 'Psychological referral recommended before proceeding',
			priority: 'medium'
		});
	}

	// ─── High VTE risk (MEDIUM) ───────────────────────────────
	if (data.procedurePlanningConsent.vteRisk === 'high') {
		flags.push({
			id: 'FLAG-VTE-001',
			category: 'VTE Risk',
			message: 'High VTE risk - ensure thromboprophylaxis plan in place',
			priority: 'medium'
		});
	}

	// ─── Consent not yet obtained (MEDIUM) ────────────────────
	if (data.procedurePlanningConsent.consentFormSigned === 'no') {
		flags.push({
			id: 'FLAG-CONSENT-001',
			category: 'Consent',
			message: 'Consent form not yet signed',
			priority: 'medium'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
