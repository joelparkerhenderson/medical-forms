import type { ValidationRule } from './types';

/**
 * Required field validation rules for the legal requirements privacy notice form.
 */
export const validationRules: ValidationRule[] = [
	{
		id: 'REQ-AK-001',
		section: 'acknowledgment',
		field: 'agreed',
		message: 'Patient must check the acknowledgment checkbox'
	},
	{
		id: 'REQ-AK-002',
		section: 'acknowledgment',
		field: 'patientTypedFullName',
		message: 'Patient must type their full name'
	},
	{
		id: 'REQ-AK-003',
		section: 'acknowledgment',
		field: 'patientTypedDate',
		message: "Patient must enter today's date"
	}
];
