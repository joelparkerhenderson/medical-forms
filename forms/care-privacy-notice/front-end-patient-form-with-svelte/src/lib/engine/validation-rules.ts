import type { ValidationRule } from './types';

/**
 * Required field validation rules for the care privacy notice form.
 */
export const validationRules: ValidationRule[] = [
	// Practice Configuration
	{
		id: 'REQ-PC-001',
		section: 'practiceConfiguration',
		field: 'practiceName',
		message: 'Practice name is required'
	},
	{
		id: 'REQ-PC-002',
		section: 'practiceConfiguration',
		field: 'practiceAddress',
		message: 'Practice address is required'
	},
	{
		id: 'REQ-PC-003',
		section: 'practiceConfiguration',
		field: 'dpoName',
		message: 'Data Protection Officer name is required'
	},
	{
		id: 'REQ-PC-004',
		section: 'practiceConfiguration',
		field: 'dpoContactDetails',
		message: 'Data Protection Officer contact details are required'
	},

	// Acknowledgment & Signature
	{
		id: 'REQ-AK-001',
		section: 'acknowledgmentSignature',
		field: 'agreed',
		message: 'Patient must check the acknowledgment checkbox'
	},
	{
		id: 'REQ-AK-002',
		section: 'acknowledgmentSignature',
		field: 'patientTypedFullName',
		message: 'Patient must type their full name'
	},
	{
		id: 'REQ-AK-003',
		section: 'acknowledgmentSignature',
		field: 'patientTypedDate',
		message: 'Patient must enter today\'s date'
	}
];
