import type { ValidationRule } from './types';

/**
 * Required field validation rules for the consent form.
 * Each rule identifies a required field and the error message
 * to display if the field is empty or unanswered.
 */
export const validationRules: ValidationRule[] = [
	// Patient Information
	{
		id: 'REQ-PI-001',
		section: 'patientInformation',
		field: 'firstName',
		message: 'Patient first name is required'
	},
	{
		id: 'REQ-PI-002',
		section: 'patientInformation',
		field: 'lastName',
		message: 'Patient last name is required'
	},
	{
		id: 'REQ-PI-003',
		section: 'patientInformation',
		field: 'dob',
		message: 'Date of birth is required'
	},
	{
		id: 'REQ-PI-004',
		section: 'patientInformation',
		field: 'sex',
		message: 'Sex is required'
	},
	{
		id: 'REQ-PI-005',
		section: 'patientInformation',
		field: 'nhsNumber',
		message: 'NHS number is required'
	},
	{
		id: 'REQ-PI-006',
		section: 'patientInformation',
		field: 'address',
		message: 'Address is required'
	},
	{
		id: 'REQ-PI-007',
		section: 'patientInformation',
		field: 'phone',
		message: 'Phone number is required'
	},
	{
		id: 'REQ-PI-008',
		section: 'patientInformation',
		field: 'emergencyContact',
		message: 'Emergency contact name is required'
	},
	{
		id: 'REQ-PI-009',
		section: 'patientInformation',
		field: 'emergencyContactPhone',
		message: 'Emergency contact phone is required'
	},

	// Procedure Details
	{
		id: 'REQ-PD-001',
		section: 'procedureDetails',
		field: 'procedureName',
		message: 'Procedure name is required'
	},
	{
		id: 'REQ-PD-002',
		section: 'procedureDetails',
		field: 'procedureDescription',
		message: 'Procedure description is required'
	},
	{
		id: 'REQ-PD-003',
		section: 'procedureDetails',
		field: 'treatingClinician',
		message: 'Treating clinician is required'
	},
	{
		id: 'REQ-PD-004',
		section: 'procedureDetails',
		field: 'department',
		message: 'Department is required'
	},
	{
		id: 'REQ-PD-005',
		section: 'procedureDetails',
		field: 'scheduledDate',
		message: 'Scheduled date is required'
	},
	{
		id: 'REQ-PD-006',
		section: 'procedureDetails',
		field: 'admissionRequired',
		message: 'Admission required must be answered'
	},

	// Risks & Benefits
	{
		id: 'REQ-RB-001',
		section: 'risksBenefits',
		field: 'commonRisks',
		message: 'Common risks must be documented'
	},
	{
		id: 'REQ-RB-002',
		section: 'risksBenefits',
		field: 'seriousRisks',
		message: 'Serious risks must be documented'
	},
	{
		id: 'REQ-RB-003',
		section: 'risksBenefits',
		field: 'expectedBenefits',
		message: 'Expected benefits must be documented'
	},

	// Alternative Treatments
	{
		id: 'REQ-AT-001',
		section: 'alternativeTreatments',
		field: 'alternativeOptions',
		message: 'Alternative treatment options must be documented'
	},
	{
		id: 'REQ-AT-002',
		section: 'alternativeTreatments',
		field: 'noTreatmentConsequences',
		message: 'Consequences of no treatment must be documented'
	},

	// Anesthesia Information
	{
		id: 'REQ-AI-001',
		section: 'anesthesiaInformation',
		field: 'anesthesiaType',
		message: 'Anesthesia type is required'
	},
	{
		id: 'REQ-AI-002',
		section: 'anesthesiaInformation',
		field: 'previousAnesthesiaProblems',
		message: 'Previous anesthesia problems must be answered'
	},

	// Questions & Understanding
	{
		id: 'REQ-QU-001',
		section: 'questionsUnderstanding',
		field: 'understandsProcedure',
		message: 'Patient must confirm understanding of procedure'
	},
	{
		id: 'REQ-QU-002',
		section: 'questionsUnderstanding',
		field: 'understandsRisks',
		message: 'Patient must confirm understanding of risks'
	},
	{
		id: 'REQ-QU-003',
		section: 'questionsUnderstanding',
		field: 'understandsAlternatives',
		message: 'Patient must confirm understanding of alternatives'
	},
	{
		id: 'REQ-QU-004',
		section: 'questionsUnderstanding',
		field: 'understandsRecovery',
		message: 'Patient must confirm understanding of recovery'
	},

	// Patient Rights
	{
		id: 'REQ-PR-001',
		section: 'patientRights',
		field: 'rightToWithdraw',
		message: 'Right to withdraw must be acknowledged'
	},
	{
		id: 'REQ-PR-002',
		section: 'patientRights',
		field: 'rightToSecondOpinion',
		message: 'Right to second opinion must be acknowledged'
	},
	{
		id: 'REQ-PR-003',
		section: 'patientRights',
		field: 'informedVoluntarily',
		message: 'Voluntary informed consent must be confirmed'
	},
	{
		id: 'REQ-PR-004',
		section: 'patientRights',
		field: 'noGuaranteeAcknowledged',
		message: 'No guarantee acknowledgement is required'
	},

	// Signature & Consent
	{
		id: 'REQ-SC-001',
		section: 'signatureConsent',
		field: 'patientConsent',
		message: 'Patient consent is required'
	},
	{
		id: 'REQ-SC-002',
		section: 'signatureConsent',
		field: 'signatureDate',
		message: 'Signature date is required'
	},
	{
		id: 'REQ-SC-003',
		section: 'signatureConsent',
		field: 'witnessName',
		message: 'Witness name is required'
	},
	{
		id: 'REQ-SC-004',
		section: 'signatureConsent',
		field: 'witnessRole',
		message: 'Witness role is required'
	},
	{
		id: 'REQ-SC-005',
		section: 'signatureConsent',
		field: 'clinicianName',
		message: 'Clinician name is required'
	},
	{
		id: 'REQ-SC-006',
		section: 'signatureConsent',
		field: 'clinicianRole',
		message: 'Clinician role is required'
	}
];
