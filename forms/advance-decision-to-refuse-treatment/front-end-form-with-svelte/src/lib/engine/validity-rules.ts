import type { ValidityRule } from './types';
import { hasLifeSustainingRefusal } from './utils';

/**
 * Declarative validity rules for Advance Decision to Refuse Treatment (ADRT).
 *
 * Under the UK Mental Capacity Act 2005:
 * - An ADRT refusing life-sustaining treatment MUST be in writing, signed, and witnessed.
 * - It MUST include a written statement that the decision applies "even if life is at risk".
 * - Without these, the ADRT is not legally valid for life-sustaining treatments.
 */
export const validityRules: ValidityRule[] = [
	// ─── CRITICAL: Life-sustaining treatment legal requirements ───
	{
		id: 'VR-001',
		category: 'Life-Sustaining Treatment',
		description: 'Life-sustaining refusal requires "even if life is at risk" statement for CPR',
		severity: 'critical',
		evaluate: (d) =>
			d.treatmentsRefusedLifeSustaining.cpr.refused === 'yes' &&
			d.treatmentsRefusedLifeSustaining.cpr.evenIfLifeAtRisk !== 'yes'
	},
	{
		id: 'VR-002',
		category: 'Life-Sustaining Treatment',
		description: 'Life-sustaining refusal requires "even if life is at risk" statement for mechanical ventilation',
		severity: 'critical',
		evaluate: (d) =>
			d.treatmentsRefusedLifeSustaining.mechanicalVentilation.refused === 'yes' &&
			d.treatmentsRefusedLifeSustaining.mechanicalVentilation.evenIfLifeAtRisk !== 'yes'
	},
	{
		id: 'VR-003',
		category: 'Life-Sustaining Treatment',
		description: 'Life-sustaining refusal requires "even if life is at risk" statement for artificial nutrition/hydration',
		severity: 'critical',
		evaluate: (d) =>
			d.treatmentsRefusedLifeSustaining.artificialNutritionHydration.refused === 'yes' &&
			d.treatmentsRefusedLifeSustaining.artificialNutritionHydration.evenIfLifeAtRisk !== 'yes'
	},
	{
		id: 'VR-004',
		category: 'Life-Sustaining Treatment',
		description: 'Life-sustaining refusal requires written statement that decision applies even if life is at risk',
		severity: 'critical',
		evaluate: (d) =>
			hasLifeSustainingRefusal(d) &&
			d.legalSignatures.lifeSustainingWrittenStatement !== 'yes'
	},
	{
		id: 'VR-005',
		category: 'Life-Sustaining Treatment',
		description: 'Life-sustaining refusal requires patient signature on life-sustaining section',
		severity: 'critical',
		evaluate: (d) =>
			hasLifeSustainingRefusal(d) &&
			d.legalSignatures.lifeSustainingSignature !== 'yes'
	},
	{
		id: 'VR-006',
		category: 'Life-Sustaining Treatment',
		description: 'Life-sustaining refusal requires witness signature on life-sustaining section',
		severity: 'critical',
		evaluate: (d) =>
			hasLifeSustainingRefusal(d) &&
			d.legalSignatures.lifeSustainingWitnessSignature !== 'yes'
	},

	// ─── REQUIRED: General legal requirements ────────────────────
	{
		id: 'VR-007',
		category: 'Signature',
		description: 'Patient signature is required',
		severity: 'required',
		evaluate: (d) => d.legalSignatures.patientSignature !== 'yes'
	},
	{
		id: 'VR-008',
		category: 'Signature',
		description: 'Patient statement of understanding is required',
		severity: 'required',
		evaluate: (d) => d.legalSignatures.patientStatementOfUnderstanding !== 'yes'
	},
	{
		id: 'VR-009',
		category: 'Signature',
		description: 'Witness signature is required',
		severity: 'required',
		evaluate: (d) => d.legalSignatures.witnessSignature !== 'yes'
	},
	{
		id: 'VR-010',
		category: 'Signature',
		description: 'Witness name is required',
		severity: 'required',
		evaluate: (d) => d.legalSignatures.witnessName.trim() === ''
	},
	{
		id: 'VR-011',
		category: 'Capacity',
		description: 'Mental capacity confirmation is required',
		severity: 'required',
		evaluate: (d) => d.capacityDeclaration.confirmsCapacity !== 'yes'
	},
	{
		id: 'VR-012',
		category: 'Capacity',
		description: 'Understanding of consequences is required',
		severity: 'required',
		evaluate: (d) => d.capacityDeclaration.understandsConsequences !== 'yes'
	},
	{
		id: 'VR-013',
		category: 'Capacity',
		description: 'Confirmation of no undue influence is required',
		severity: 'required',
		evaluate: (d) => d.capacityDeclaration.noUndueInfluence !== 'yes'
	},
	{
		id: 'VR-014',
		category: 'Personal Information',
		description: 'Full legal name is required',
		severity: 'required',
		evaluate: (d) => d.personalInformation.fullLegalName.trim() === ''
	},
	{
		id: 'VR-015',
		category: 'Personal Information',
		description: 'Date of birth is required',
		severity: 'required',
		evaluate: (d) => d.personalInformation.dateOfBirth === ''
	},
	{
		id: 'VR-016',
		category: 'Treatments',
		description: 'At least one treatment refusal must be specified',
		severity: 'required',
		evaluate: (d) => {
			const g = d.treatmentsRefusedGeneral;
			const ls = d.treatmentsRefusedLifeSustaining;
			const hasGeneralRefusal =
				g.antibiotics.refused === 'yes' ||
				g.bloodTransfusion.refused === 'yes' ||
				g.ivFluids.refused === 'yes' ||
				g.tubeFeeding.refused === 'yes' ||
				g.dialysis.refused === 'yes' ||
				g.ventilation.refused === 'yes' ||
				g.otherTreatments.some((t) => t.refused === 'yes');
			return !hasGeneralRefusal && !hasLifeSustainingRefusal(d);
		}
	},
	{
		id: 'VR-017',
		category: 'Circumstances',
		description: 'Specific circumstances for ADRT application must be described',
		severity: 'required',
		evaluate: (d) => d.circumstances.specificCircumstances.trim() === ''
	},

	// ─── RECOMMENDED: Best practice ──────────────────────────────
	{
		id: 'VR-018',
		category: 'Healthcare Professional',
		description: 'Healthcare professional review is recommended',
		severity: 'recommended',
		evaluate: (d) => d.healthcareProfessionalReview.reviewedByClinicianName.trim() === ''
	},
	{
		id: 'VR-019',
		category: 'Healthcare Professional',
		description: 'Review date should be recorded',
		severity: 'recommended',
		evaluate: (d) => d.healthcareProfessionalReview.reviewDate === ''
	},
	{
		id: 'VR-020',
		category: 'Personal Information',
		description: 'NHS number should be recorded for identification',
		severity: 'recommended',
		evaluate: (d) => d.personalInformation.nhsNumber.trim() === ''
	},
	{
		id: 'VR-021',
		category: 'Personal Information',
		description: 'GP details should be recorded',
		severity: 'recommended',
		evaluate: (d) => d.personalInformation.gpName.trim() === ''
	},
	{
		id: 'VR-022',
		category: 'LPA',
		description: 'LPA status should be declared',
		severity: 'recommended',
		evaluate: (d) => d.lastingPowerOfAttorney.hasLPA === ''
	}
];
