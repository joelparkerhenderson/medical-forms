import type { ValidationRuleDefinition } from './types';

/**
 * Required field validation rules for the Medical Records Release Permission form.
 * Each rule defines a required field and its section.
 */
export const validationRules: ValidationRuleDefinition[] = [
	// Patient Information
	{
		id: 'RULE-PI-001',
		section: 'patientInformation',
		field: 'firstName',
		description: 'Patient first name is required'
	},
	{
		id: 'RULE-PI-002',
		section: 'patientInformation',
		field: 'lastName',
		description: 'Patient last name is required'
	},
	{
		id: 'RULE-PI-003',
		section: 'patientInformation',
		field: 'dateOfBirth',
		description: 'Date of birth is required'
	},
	{
		id: 'RULE-PI-004',
		section: 'patientInformation',
		field: 'address',
		description: 'Patient address is required'
	},
	{
		id: 'RULE-PI-005',
		section: 'patientInformation',
		field: 'nhsNumber',
		description: 'NHS number is required'
	},

	// Authorized Recipient
	{
		id: 'RULE-AR-001',
		section: 'authorizedRecipient',
		field: 'recipientName',
		description: 'Recipient name is required'
	},
	{
		id: 'RULE-AR-002',
		section: 'authorizedRecipient',
		field: 'recipientOrganization',
		description: 'Recipient organization is required'
	},
	{
		id: 'RULE-AR-003',
		section: 'authorizedRecipient',
		field: 'recipientAddress',
		description: 'Recipient address is required'
	},

	// Records to Release
	{
		id: 'RULE-RR-001',
		section: 'recordsToRelease',
		field: 'recordTypes',
		description: 'At least one record type must be selected'
	},

	// Purpose of Release
	{
		id: 'RULE-PR-001',
		section: 'purposeOfRelease',
		field: 'purpose',
		description: 'Purpose of release is required'
	},

	// Authorization Period
	{
		id: 'RULE-AP-001',
		section: 'authorizationPeriod',
		field: 'startDate',
		description: 'Authorization start date is required'
	},
	{
		id: 'RULE-AP-002',
		section: 'authorizationPeriod',
		field: 'endDate',
		description: 'Authorization end date is required'
	},

	// Patient Rights
	{
		id: 'RULE-PTR-001',
		section: 'patientRights',
		field: 'acknowledgedRightToRevoke',
		description: 'Patient must acknowledge right to revoke authorization'
	},
	{
		id: 'RULE-PTR-002',
		section: 'patientRights',
		field: 'acknowledgedDataProtection',
		description: 'Patient must acknowledge data protection rights'
	},

	// Signature & Consent
	{
		id: 'RULE-SC-001',
		section: 'signatureConsent',
		field: 'patientSignatureConfirmed',
		description: 'Patient signature confirmation is required'
	},
	{
		id: 'RULE-SC-002',
		section: 'signatureConsent',
		field: 'signatureDate',
		description: 'Signature date is required'
	}
];

/**
 * Record type options for the CheckboxGroup.
 */
export const recordTypeOptions = [
	{ value: 'complete-medical-record', label: 'Complete Medical Record' },
	{ value: 'lab-results', label: 'Laboratory Results' },
	{ value: 'imaging', label: 'Imaging / Radiology' },
	{ value: 'prescriptions', label: 'Prescriptions' },
	{ value: 'discharge-summaries', label: 'Discharge Summaries' },
	{ value: 'mental-health', label: 'Mental Health Records' },
	{ value: 'surgical-records', label: 'Surgical Records' },
	{ value: 'allergy-records', label: 'Allergy Records' }
];

/**
 * Purpose of release options for the RadioGroup.
 */
export const purposeOptions = [
	{ value: 'continuing-care', label: 'Continuing Care' },
	{ value: 'second-opinion', label: 'Second Opinion' },
	{ value: 'insurance', label: 'Insurance' },
	{ value: 'legal', label: 'Legal Proceedings' },
	{ value: 'personal', label: 'Personal Use' },
	{ value: 'research', label: 'Research' },
	{ value: 'employment', label: 'Employment' },
	{ value: 'other', label: 'Other' }
];
