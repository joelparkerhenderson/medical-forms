import type { PlasticsRule } from './types';
import { calculateAge } from './utils';

/**
 * Declarative plastic surgery grading rules.
 * Each rule evaluates patient data and returns true if the condition is present.
 * Grade 1 = mild finding, 2 = moderate, 3 = significant, 4 = severe/critical.
 */
export const plasticsRules: PlasticsRule[] = [
	// ─── ASA CLASSIFICATION ────────────────────────────────────
	{
		id: 'ASA-001',
		category: 'Anaesthetic Risk',
		description: 'ASA Class I - normal healthy patient',
		grade: 1,
		evaluate: (d) => d.anaestheticRisk.asaClass === '1'
	},
	{
		id: 'ASA-002',
		category: 'Anaesthetic Risk',
		description: 'ASA Class II - mild systemic disease',
		grade: 2,
		evaluate: (d) => d.anaestheticRisk.asaClass === '2'
	},
	{
		id: 'ASA-003',
		category: 'Anaesthetic Risk',
		description: 'ASA Class III - severe systemic disease',
		grade: 3,
		evaluate: (d) => d.anaestheticRisk.asaClass === '3'
	},
	{
		id: 'ASA-004',
		category: 'Anaesthetic Risk',
		description: 'ASA Class IV - severe systemic disease, constant threat to life',
		grade: 4,
		evaluate: (d) => d.anaestheticRisk.asaClass === '4'
	},
	{
		id: 'ASA-005',
		category: 'Anaesthetic Risk',
		description: 'ASA Class V - moribund patient',
		grade: 4,
		evaluate: (d) => d.anaestheticRisk.asaClass === '5'
	},

	// ─── WOUND CLASSIFICATION ──────────────────────────────────
	{
		id: 'WND-001',
		category: 'Wound',
		description: 'Clean wound (Class I)',
		grade: 1,
		evaluate: (d) => d.woundTissueAssessment.woundClassification === 'clean'
	},
	{
		id: 'WND-002',
		category: 'Wound',
		description: 'Clean-contaminated wound (Class II)',
		grade: 2,
		evaluate: (d) => d.woundTissueAssessment.woundClassification === 'clean-contaminated'
	},
	{
		id: 'WND-003',
		category: 'Wound',
		description: 'Contaminated wound (Class III)',
		grade: 3,
		evaluate: (d) => d.woundTissueAssessment.woundClassification === 'contaminated'
	},
	{
		id: 'WND-004',
		category: 'Wound',
		description: 'Dirty/infected wound (Class IV)',
		grade: 4,
		evaluate: (d) => d.woundTissueAssessment.woundClassification === 'dirty'
	},
	{
		id: 'WND-005',
		category: 'Wound',
		description: 'Active wound infection signs',
		grade: 3,
		evaluate: (d) => d.woundTissueAssessment.woundInfectionSigns === 'yes'
	},
	{
		id: 'WND-006',
		category: 'Wound',
		description: 'Necrotic wound bed tissue',
		grade: 3,
		evaluate: (d) => d.woundTissueAssessment.woundBedTissue === 'necrotic'
	},
	{
		id: 'WND-007',
		category: 'Wound',
		description: 'Non-viable tissue',
		grade: 4,
		evaluate: (d) => d.woundTissueAssessment.tissueViability === 'non-viable'
	},
	{
		id: 'WND-008',
		category: 'Wound',
		description: 'Compromised vascular supply',
		grade: 3,
		evaluate: (d) => d.woundTissueAssessment.vascularSupply === 'compromised'
	},
	{
		id: 'WND-009',
		category: 'Wound',
		description: 'Absent vascular supply',
		grade: 4,
		evaluate: (d) => d.woundTissueAssessment.vascularSupply === 'absent'
	},
	{
		id: 'WND-010',
		category: 'Wound',
		description: 'Purulent wound exudate',
		grade: 3,
		evaluate: (d) => d.woundTissueAssessment.woundExudate === 'purulent'
	},

	// ─── SURGICAL COMPLEXITY ───────────────────────────────────
	{
		id: 'CX-001',
		category: 'Surgical Complexity',
		description: 'Minor procedure (Complexity 1)',
		grade: 1,
		evaluate: (d) => d.procedurePlanningConsent.procedureComplexity === '1'
	},
	{
		id: 'CX-002',
		category: 'Surgical Complexity',
		description: 'Intermediate procedure (Complexity 2)',
		grade: 2,
		evaluate: (d) => d.procedurePlanningConsent.procedureComplexity === '2'
	},
	{
		id: 'CX-003',
		category: 'Surgical Complexity',
		description: 'Major procedure (Complexity 3)',
		grade: 3,
		evaluate: (d) => d.procedurePlanningConsent.procedureComplexity === '3'
	},
	{
		id: 'CX-004',
		category: 'Surgical Complexity',
		description: 'Major plus / emergency reconstruction (Complexity 4)',
		grade: 4,
		evaluate: (d) => d.procedurePlanningConsent.procedureComplexity === '4'
	},
	{
		id: 'CX-005',
		category: 'Surgical Complexity',
		description: 'Free flap reconstruction required',
		grade: 3,
		evaluate: (d) => d.procedurePlanningConsent.flapType === 'free'
	},
	{
		id: 'CX-006',
		category: 'Surgical Complexity',
		description: 'Microsurgical approach required',
		grade: 3,
		evaluate: (d) => d.procedurePlanningConsent.surgicalApproach === 'microsurgical'
	},

	// ─── COMORBIDITY ───────────────────────────────────────────
	{
		id: 'CM-001',
		category: 'Comorbidity',
		description: 'Diabetes mellitus',
		grade: 2,
		evaluate: (d) =>
			d.medicalSurgicalHistory.diabetes === 'type-1' ||
			d.medicalSurgicalHistory.diabetes === 'type-2'
	},
	{
		id: 'CM-002',
		category: 'Comorbidity',
		description: 'Uncontrolled diabetes',
		grade: 3,
		evaluate: (d) =>
			(d.medicalSurgicalHistory.diabetes === 'type-1' ||
				d.medicalSurgicalHistory.diabetes === 'type-2') &&
			d.medicalSurgicalHistory.diabetesControlled === 'no'
	},
	{
		id: 'CM-003',
		category: 'Comorbidity',
		description: 'Wound healing problems history',
		grade: 2,
		evaluate: (d) => d.medicalSurgicalHistory.woundHealingProblems === 'yes'
	},
	{
		id: 'CM-004',
		category: 'Comorbidity',
		description: 'Keloid / hypertrophic scarring tendency',
		grade: 2,
		evaluate: (d) => d.medicalSurgicalHistory.keloidScarring === 'yes'
	},
	{
		id: 'CM-005',
		category: 'Comorbidity',
		description: 'Bleeding disorder',
		grade: 3,
		evaluate: (d) => d.medicalSurgicalHistory.bleedingDisorder === 'yes'
	},
	{
		id: 'CM-006',
		category: 'Comorbidity',
		description: 'Immunosuppressed',
		grade: 3,
		evaluate: (d) => d.medicalSurgicalHistory.immunosuppressed === 'yes'
	},
	{
		id: 'CM-007',
		category: 'Comorbidity',
		description: 'Active cancer history',
		grade: 3,
		evaluate: (d) => d.medicalSurgicalHistory.cancerHistory === 'yes'
	},
	{
		id: 'CM-008',
		category: 'Comorbidity',
		description: 'Cardiac disease',
		grade: 2,
		evaluate: (d) => d.medicalSurgicalHistory.cardiacDisease === 'yes'
	},
	{
		id: 'CM-009',
		category: 'Comorbidity',
		description: 'Autoimmune disease',
		grade: 2,
		evaluate: (d) => d.medicalSurgicalHistory.autoimmuneDisease === 'yes'
	},

	// ─── CONDITION ─────────────────────────────────────────────
	{
		id: 'CD-001',
		category: 'Condition',
		description: 'Severe functional impairment',
		grade: 3,
		evaluate: (d) => d.currentCondition.functionalImpairment === 'severe'
	},
	{
		id: 'CD-002',
		category: 'Condition',
		description: 'Significant tissue loss',
		grade: 3,
		evaluate: (d) =>
			d.currentCondition.tissueLoss === 'yes' &&
			d.currentCondition.tissueLossPercentage !== null &&
			d.currentCondition.tissueLossPercentage > 20
	},
	{
		id: 'CD-003',
		category: 'Condition',
		description: 'Severe pain (NRS >= 7)',
		grade: 2,
		evaluate: (d) =>
			d.currentCondition.painLevel !== null && d.currentCondition.painLevel >= 7
	},

	// ─── REFERRAL ──────────────────────────────────────────────
	{
		id: 'RF-001',
		category: 'Referral',
		description: 'Emergency referral',
		grade: 4,
		evaluate: (d) => d.reasonForReferral.urgency === 'emergency'
	},
	{
		id: 'RF-002',
		category: 'Referral',
		description: 'Urgent referral',
		grade: 3,
		evaluate: (d) => d.reasonForReferral.urgency === 'urgent'
	},
	{
		id: 'RF-003',
		category: 'Referral',
		description: 'Trauma referral',
		grade: 3,
		evaluate: (d) => d.reasonForReferral.referralType === 'trauma'
	},
	{
		id: 'RF-004',
		category: 'Referral',
		description: 'Burn injury referral',
		grade: 3,
		evaluate: (d) => d.reasonForReferral.referralType === 'burn'
	},
	{
		id: 'RF-005',
		category: 'Referral',
		description: 'Cancer-related referral',
		grade: 3,
		evaluate: (d) => d.reasonForReferral.referralType === 'cancer'
	},

	// ─── ANAESTHETIC ───────────────────────────────────────────
	{
		id: 'AN-001',
		category: 'Anaesthetic',
		description: 'Difficult airway',
		grade: 3,
		evaluate: (d) => d.anaestheticRisk.difficultAirway === 'yes'
	},
	{
		id: 'AN-002',
		category: 'Anaesthetic',
		description: 'Previous anaesthetic complications',
		grade: 2,
		evaluate: (d) => d.anaestheticRisk.anaestheticComplications === 'yes'
	},
	{
		id: 'AN-003',
		category: 'Anaesthetic',
		description: 'Malignant hyperthermia risk',
		grade: 4,
		evaluate: (d) => d.anaestheticRisk.malignantHyperthermiaRisk === 'yes'
	},
	{
		id: 'AN-004',
		category: 'Anaesthetic',
		description: 'Obstructive sleep apnoea',
		grade: 2,
		evaluate: (d) => d.anaestheticRisk.obstructiveSleepApnoea === 'yes'
	},

	// ─── SOCIAL ────────────────────────────────────────────────
	{
		id: 'SH-001',
		category: 'Social',
		description: 'Current smoker',
		grade: 2,
		evaluate: (d) => d.anaestheticRisk.smokingStatus === 'current'
	},
	{
		id: 'SH-002',
		category: 'Social',
		description: 'Above-guidelines alcohol consumption',
		grade: 2,
		evaluate: (d) => d.anaestheticRisk.alcoholConsumption === 'above-guidelines'
	},

	// ─── DEMOGRAPHICS ──────────────────────────────────────────
	{
		id: 'AG-001',
		category: 'Demographics',
		description: 'Age > 75 years',
		grade: 2,
		evaluate: (d) => {
			const age = calculateAge(d.demographics.dateOfBirth);
			return age !== null && age > 75;
		}
	},
	{
		id: 'AG-002',
		category: 'Demographics',
		description: 'BMI >= 35 (Obese Class II+)',
		grade: 2,
		evaluate: (d) => d.demographics.bmi !== null && d.demographics.bmi >= 35
	},

	// ─── PSYCHOLOGICAL ─────────────────────────────────────────
	{
		id: 'PS-001',
		category: 'Psychological',
		description: 'Body dysmorphic concern identified',
		grade: 3,
		evaluate: (d) => d.psychologicalAssessment.bodyDysmorphicConcern === 'yes'
	},
	{
		id: 'PS-002',
		category: 'Psychological',
		description: 'Unrealistic expectations',
		grade: 3,
		evaluate: (d) => d.psychologicalAssessment.realisticExpectations === 'no'
	},
	{
		id: 'PS-003',
		category: 'Psychological',
		description: 'Severe anxiety',
		grade: 2,
		evaluate: (d) => d.psychologicalAssessment.anxietyLevel === 'severe'
	},

	// ─── VTE RISK ──────────────────────────────────────────────
	{
		id: 'VTE-001',
		category: 'VTE Risk',
		description: 'High VTE risk',
		grade: 3,
		evaluate: (d) => d.procedurePlanningConsent.vteRisk === 'high'
	}
];
