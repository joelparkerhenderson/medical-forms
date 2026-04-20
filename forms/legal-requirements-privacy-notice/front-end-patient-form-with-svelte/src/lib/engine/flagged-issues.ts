import type { AssessmentData, AdditionalFlag } from './types';

/**
 * Detects additional flags that should be highlighted for the information-governance officer.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	if (data.acknowledgment.agreed === false) {
		flags.push({
			id: 'FLAG-NOACK-001',
			category: 'Acknowledgment Not Given',
			message: 'Patient has not acknowledged the legal requirements privacy notice',
			priority: 'high'
		});
	}

	const name = data.acknowledgment.patientTypedFullName.trim();
	if (name.length > 0 && name.length < 3) {
		flags.push({
			id: 'FLAG-NAME-001',
			category: 'Incomplete Name',
			message: 'Patient typed name appears incomplete — please verify',
			priority: 'medium'
		});
	}

	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
