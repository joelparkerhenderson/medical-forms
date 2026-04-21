import type { ValidationRule } from './types';

/**
 * Required field validation rules for the research and planning privacy notice form.
 */
export const validationRules: ValidationRule[] = [
	// Recipient Details
	{
		id: 'REQ-RD-001',
		section: 'recipientDetails',
		field: 'organisationName',
		message: 'Organisation name is required'
	},
	{
		id: 'REQ-RD-002',
		section: 'recipientDetails',
		field: 'recipientName',
		message: 'Recipient name is required'
	},

	// Acknowledgement & Signature
	{
		id: 'REQ-AK-001',
		section: 'acknowledgementSignature',
		field: 'agreed',
		message: 'Recipient must check the acknowledgement checkbox'
	},
	{
		id: 'REQ-AK-002',
		section: 'acknowledgementSignature',
		field: 'type1OptOut',
		message: 'Recipient must select a Type 1 opt-out preference'
	},
	{
		id: 'REQ-AK-003',
		section: 'acknowledgementSignature',
		field: 'nationalDataOptOut',
		message: 'Recipient must select a National Data Opt-Out preference'
	},
	{
		id: 'REQ-AK-004',
		section: 'acknowledgementSignature',
		field: 'recipientTypedFullName',
		message: 'Recipient must type their full name'
	},
	{
		id: 'REQ-AK-005',
		section: 'acknowledgementSignature',
		field: 'recipientTypedDate',
		message: "Recipient must enter today's date"
	}
];
