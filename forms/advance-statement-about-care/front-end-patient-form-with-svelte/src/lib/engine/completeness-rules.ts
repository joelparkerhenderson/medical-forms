import type { CompletenessRule } from './types';

/**
 * Declarative completeness rules for the advance statement.
 * Each rule evaluates whether a specific section or field has been completed.
 * Required rules affect whether the statement can reach "complete" status.
 */
export const completenessRules: CompletenessRule[] = [
	// ─── PERSONAL INFORMATION ─────────────────────────────────
	{
		id: 'PI-001',
		section: 'Personal Information',
		description: 'Full name provided',
		required: true,
		evaluate: (d) =>
			d.personalInformation.firstName.trim() !== '' &&
			d.personalInformation.lastName.trim() !== ''
	},
	{
		id: 'PI-002',
		section: 'Personal Information',
		description: 'Date of birth provided',
		required: true,
		evaluate: (d) => d.personalInformation.dateOfBirth.trim() !== ''
	},
	{
		id: 'PI-003',
		section: 'Personal Information',
		description: 'NHS number provided',
		required: false,
		evaluate: (d) => d.personalInformation.nhsNumber.trim() !== ''
	},
	{
		id: 'PI-004',
		section: 'Personal Information',
		description: 'Address provided',
		required: true,
		evaluate: (d) => d.personalInformation.address.trim() !== ''
	},
	{
		id: 'PI-005',
		section: 'Personal Information',
		description: 'GP details provided',
		required: false,
		evaluate: (d) =>
			d.personalInformation.gpName.trim() !== '' &&
			d.personalInformation.gpPractice.trim() !== ''
	},

	// ─── STATEMENT CONTEXT ────────────────────────────────────
	{
		id: 'SC-001',
		section: 'Statement Context',
		description: 'Reason for making statement provided',
		required: true,
		evaluate: (d) => d.statementContext.reasonForStatement.trim() !== ''
	},
	{
		id: 'SC-002',
		section: 'Statement Context',
		description: 'When statement should apply specified',
		required: true,
		evaluate: (d) => d.statementContext.whenStatementShouldApply.trim() !== ''
	},
	{
		id: 'SC-003',
		section: 'Statement Context',
		description: 'Current diagnosis documented',
		required: false,
		evaluate: (d) => d.statementContext.currentDiagnosis.trim() !== ''
	},

	// ─── VALUES & BELIEFS ─────────────────────────────────────
	{
		id: 'VB-001',
		section: 'Values & Beliefs',
		description: 'Quality of life priorities described',
		required: true,
		evaluate: (d) => d.valuesBeliefs.qualityOfLifePriorities.trim() !== ''
	},
	{
		id: 'VB-002',
		section: 'Values & Beliefs',
		description: 'What makes life meaningful described',
		required: false,
		evaluate: (d) => d.valuesBeliefs.whatMakesLifeMeaningful.trim() !== ''
	},
	{
		id: 'VB-003',
		section: 'Values & Beliefs',
		description: 'Religious or spiritual beliefs documented',
		required: false,
		evaluate: (d) =>
			d.valuesBeliefs.religiousBeliefs.trim() !== '' ||
			d.valuesBeliefs.spiritualBeliefs.trim() !== ''
	},

	// ─── CARE PREFERENCES ─────────────────────────────────────
	{
		id: 'CP-001',
		section: 'Care Preferences',
		description: 'Preferred place of care specified',
		required: true,
		evaluate: (d) => d.carePreferences.preferredPlaceOfCare !== ''
	},
	{
		id: 'CP-002',
		section: 'Care Preferences',
		description: 'Preferred place of death specified',
		required: false,
		evaluate: (d) => d.carePreferences.preferredPlaceOfDeath !== ''
	},
	{
		id: 'CP-003',
		section: 'Care Preferences',
		description: 'Personal comfort preferences described',
		required: false,
		evaluate: (d) => d.carePreferences.personalComfortPreferences.trim() !== ''
	},

	// ─── MEDICAL TREATMENT WISHES ─────────────────────────────
	{
		id: 'MT-001',
		section: 'Medical Treatment Wishes',
		description: 'Pain management preferences stated',
		required: true,
		evaluate: (d) => d.medicalTreatmentWishes.painManagementPreferences.trim() !== ''
	},
	{
		id: 'MT-002',
		section: 'Medical Treatment Wishes',
		description: 'Resuscitation wishes stated',
		required: true,
		evaluate: (d) => d.medicalTreatmentWishes.resuscitationWishes.trim() !== ''
	},
	{
		id: 'MT-003',
		section: 'Medical Treatment Wishes',
		description: 'Nutrition/hydration wishes stated',
		required: false,
		evaluate: (d) => d.medicalTreatmentWishes.nutritionHydrationWishes.trim() !== ''
	},
	{
		id: 'MT-004',
		section: 'Medical Treatment Wishes',
		description: 'Ventilation wishes stated',
		required: false,
		evaluate: (d) => d.medicalTreatmentWishes.ventilationWishes.trim() !== ''
	},
	{
		id: 'MT-005',
		section: 'Medical Treatment Wishes',
		description: 'Antibiotics wishes stated',
		required: false,
		evaluate: (d) => d.medicalTreatmentWishes.antibioticsWishes.trim() !== ''
	},

	// ─── COMMUNICATION PREFERENCES ────────────────────────────
	{
		id: 'CM-001',
		section: 'Communication Preferences',
		description: 'How to be addressed specified',
		required: false,
		evaluate: (d) => d.communicationPreferences.howToBeAddressed.trim() !== ''
	},
	{
		id: 'CM-002',
		section: 'Communication Preferences',
		description: 'Preferred language specified',
		required: false,
		evaluate: (d) => d.communicationPreferences.preferredLanguage.trim() !== ''
	},

	// ─── PEOPLE IMPORTANT TO ME ───────────────────────────────
	{
		id: 'PP-001',
		section: 'People Important to Me',
		description: 'At least one important person listed',
		required: true,
		evaluate: (d) =>
			d.peopleImportantToMe.people.length > 0 &&
			d.peopleImportantToMe.people.some((p) => p.name.trim() !== '')
	},
	{
		id: 'PP-002',
		section: 'People Important to Me',
		description: 'Emergency contact has telephone number',
		required: true,
		evaluate: (d) =>
			d.peopleImportantToMe.people.some(
				(p) => p.name.trim() !== '' && p.telephone.trim() !== ''
			)
	},

	// ─── PRACTICAL MATTERS ────────────────────────────────────
	{
		id: 'PM-001',
		section: 'Practical Matters',
		description: 'Financial arrangements documented',
		required: false,
		evaluate: (d) => d.practicalMatters.financialArrangements.trim() !== ''
	},
	{
		id: 'PM-002',
		section: 'Practical Matters',
		description: 'Power of attorney details documented',
		required: false,
		evaluate: (d) => d.practicalMatters.powerOfAttorneyDetails.trim() !== ''
	},

	// ─── SIGNATURES & WITNESSES ───────────────────────────────
	{
		id: 'SW-001',
		section: 'Signatures & Witnesses',
		description: 'Patient has signed',
		required: true,
		evaluate: (d) => d.signaturesWitnesses.patientSignature.trim() !== ''
	},
	{
		id: 'SW-002',
		section: 'Signatures & Witnesses',
		description: 'Patient signature dated',
		required: true,
		evaluate: (d) => d.signaturesWitnesses.patientSignatureDate.trim() !== ''
	},
	{
		id: 'SW-003',
		section: 'Signatures & Witnesses',
		description: 'Witness details provided',
		required: false,
		evaluate: (d) =>
			d.signaturesWitnesses.witnessName.trim() !== '' &&
			d.signaturesWitnesses.witnessSignature.trim() !== ''
	},
	{
		id: 'SW-004',
		section: 'Signatures & Witnesses',
		description: 'Review date set',
		required: false,
		evaluate: (d) => d.signaturesWitnesses.reviewDate.trim() !== ''
	},
	{
		id: 'SW-005',
		section: 'Signatures & Witnesses',
		description: 'Healthcare professional acknowledged',
		required: false,
		evaluate: (d) =>
			d.signaturesWitnesses.healthcareProfessionalName.trim() !== '' &&
			d.signaturesWitnesses.healthcareProfessionalSignature.trim() !== ''
	}
];
