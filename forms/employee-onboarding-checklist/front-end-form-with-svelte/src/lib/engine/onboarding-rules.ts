import type { OnboardingRule } from './types';

/**
 * Declarative onboarding compliance rules.
 * Each rule evaluates employee data and returns true if an issue is detected.
 * Grade 1 = minor, 2 = moderate, 3 = significant, 4 = critical.
 */
export const onboardingRules: OnboardingRule[] = [
	// ─── PRE-EMPLOYMENT CHECKS ──────────────────────────────────
	{
		id: 'DBS-001',
		category: 'Pre-Employment',
		description: 'DBS check not started',
		grade: 4,
		evaluate: (d) => d.preEmploymentChecks.dbsCheckStatus === 'not-started'
	},
	{
		id: 'DBS-002',
		category: 'Pre-Employment',
		description: 'DBS check applied but not yet cleared',
		grade: 2,
		evaluate: (d) =>
			d.preEmploymentChecks.dbsCheckStatus === 'applied' ||
			d.preEmploymentChecks.dbsCheckStatus === 'received'
	},
	{
		id: 'RTW-001',
		category: 'Pre-Employment',
		description: 'Right to work not verified',
		grade: 4,
		evaluate: (d) => d.preEmploymentChecks.rightToWorkVerified === 'no'
	},
	{
		id: 'REF-001',
		category: 'Pre-Employment',
		description: 'References not satisfactory',
		grade: 3,
		evaluate: (d) => d.preEmploymentChecks.referencesSatisfactory === 'no'
	},
	{
		id: 'REF-002',
		category: 'Pre-Employment',
		description: 'References incomplete',
		grade: 2,
		evaluate: (d) =>
			d.preEmploymentChecks.referencesReceived !== null &&
			d.preEmploymentChecks.referencesRequired !== null &&
			d.preEmploymentChecks.referencesReceived < d.preEmploymentChecks.referencesRequired
	},
	{
		id: 'ID-001',
		category: 'Pre-Employment',
		description: 'Identity not verified',
		grade: 3,
		evaluate: (d) => d.preEmploymentChecks.identityVerified === 'no'
	},

	// ─── OCCUPATIONAL HEALTH ────────────────────────────────────
	{
		id: 'OH-001',
		category: 'Occupational Health',
		description: 'Occupational health clearance not received',
		grade: 3,
		evaluate: (d) => d.occupationalHealth.ohClearanceReceived === 'no'
	},
	{
		id: 'OH-002',
		category: 'Occupational Health',
		description: 'Not fit to work',
		grade: 4,
		evaluate: (d) => d.occupationalHealth.fitToWork === 'no'
	},
	{
		id: 'OH-003',
		category: 'Occupational Health',
		description: 'Occupational health restrictions apply',
		grade: 2,
		evaluate: (d) => d.occupationalHealth.ohRestrictions === 'yes'
	},
	{
		id: 'OH-004',
		category: 'Occupational Health',
		description: 'Immunisation status incomplete',
		grade: 2,
		evaluate: (d) => d.occupationalHealth.immunisationStatus === 'incomplete'
	},

	// ─── MANDATORY TRAINING ─────────────────────────────────────
	{
		id: 'TR-001',
		category: 'Mandatory Training',
		description: 'Fire safety training not completed',
		grade: 3,
		evaluate: (d) => d.mandatoryTraining.fireSafetyCompleted === 'no'
	},
	{
		id: 'TR-002',
		category: 'Mandatory Training',
		description: 'Manual handling training not completed',
		grade: 2,
		evaluate: (d) => d.mandatoryTraining.manualHandlingCompleted === 'no'
	},
	{
		id: 'TR-003',
		category: 'Mandatory Training',
		description: 'Infection control training not completed',
		grade: 3,
		evaluate: (d) => d.mandatoryTraining.infectionControlCompleted === 'no'
	},
	{
		id: 'TR-004',
		category: 'Mandatory Training',
		description: 'Safeguarding adults training not completed',
		grade: 3,
		evaluate: (d) => d.mandatoryTraining.safeguardingAdultsCompleted === 'no'
	},
	{
		id: 'TR-005',
		category: 'Mandatory Training',
		description: 'Safeguarding children training not completed',
		grade: 3,
		evaluate: (d) => d.mandatoryTraining.safeguardingChildrenCompleted === 'no'
	},
	{
		id: 'TR-006',
		category: 'Mandatory Training',
		description: 'Information governance training not completed',
		grade: 3,
		evaluate: (d) => d.mandatoryTraining.informationGovernanceCompleted === 'no'
	},
	{
		id: 'TR-007',
		category: 'Mandatory Training',
		description: 'Basic life support training not completed',
		grade: 3,
		evaluate: (d) => d.mandatoryTraining.basicLifeSupportCompleted === 'no'
	},

	// ─── PROFESSIONAL REGISTRATION ──────────────────────────────
	{
		id: 'REG-001',
		category: 'Professional Registration',
		description: 'Professional registration required but not verified',
		grade: 4,
		evaluate: (d) =>
			d.professionalRegistration.registrationRequired === 'yes' &&
			d.professionalRegistration.registrationVerified === 'no'
	},
	{
		id: 'REG-002',
		category: 'Professional Registration',
		description: 'Professional registration has conditions',
		grade: 3,
		evaluate: (d) => d.professionalRegistration.registrationConditions === 'yes'
	},

	// ─── IT SYSTEMS ─────────────────────────────────────────────
	{
		id: 'IT-001',
		category: 'IT Systems',
		description: 'Clinical system access not granted',
		grade: 2,
		evaluate: (d) => d.itSystemsAccess.clinicalSystemAccess === 'no'
	},
	{
		id: 'IT-002',
		category: 'IT Systems',
		description: 'Email account not created',
		grade: 1,
		evaluate: (d) => d.itSystemsAccess.emailAccountCreated === 'no'
	},
	{
		id: 'IT-003',
		category: 'IT Systems',
		description: 'NHS smartcard not issued',
		grade: 2,
		evaluate: (d) => d.itSystemsAccess.nhsSmartcardIssued === 'no'
	},

	// ─── UNIFORM & ID ───────────────────────────────────────────
	{
		id: 'UID-001',
		category: 'Uniform & ID',
		description: 'ID badge not issued',
		grade: 2,
		evaluate: (d) => d.uniformIDBadge.idBadgeIssued === 'no'
	},
	{
		id: 'UID-002',
		category: 'Uniform & ID',
		description: 'Access card not issued',
		grade: 2,
		evaluate: (d) => d.uniformIDBadge.accessCardIssued === 'no'
	},

	// ─── INDUCTION ──────────────────────────────────────────────
	{
		id: 'IND-001',
		category: 'Induction',
		description: 'Corporate induction not completed',
		grade: 2,
		evaluate: (d) => d.inductionProgramme.corporateInductionCompleted === 'no'
	},
	{
		id: 'IND-002',
		category: 'Induction',
		description: 'Local induction not completed',
		grade: 2,
		evaluate: (d) => d.inductionProgramme.localInductionCompleted === 'no'
	},

	// ─── SIGN-OFF & COMPLIANCE ──────────────────────────────────
	{
		id: 'SO-001',
		category: 'Sign-off',
		description: 'Confidentiality agreement not signed',
		grade: 3,
		evaluate: (d) => d.signOffCompliance.confidentialityAgreementSigned === 'no'
	},
	{
		id: 'SO-002',
		category: 'Sign-off',
		description: 'GDPR training not completed',
		grade: 3,
		evaluate: (d) => d.signOffCompliance.gdprTrainingCompleted === 'no'
	},
	{
		id: 'SO-003',
		category: 'Sign-off',
		description: 'Manager sign-off not obtained',
		grade: 2,
		evaluate: (d) => d.signOffCompliance.managerSignedOff === 'no'
	}
];
