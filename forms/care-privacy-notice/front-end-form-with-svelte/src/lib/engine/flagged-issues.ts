import type { AssessmentData, AdditionalFlag } from './types';

/**
 * Detects additional flags that should be highlighted for the clinician.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// ─── Acknowledgment not given ────────────────────────────
	if (data.acknowledgmentSignature.agreed === false) {
		flags.push({
			id: 'FLAG-NOACK-001',
			category: 'Acknowledgment Not Given',
			message: 'Patient has not acknowledged the privacy notice',
			priority: 'high'
		});
	}

	// ─── Name mismatch potential ─────────────────────────────
	const name = data.acknowledgmentSignature.patientTypedFullName.trim();
	if (name.length > 0 && name.length < 3) {
		flags.push({
			id: 'FLAG-NAME-001',
			category: 'Incomplete Name',
			message: 'Patient typed name appears incomplete — please verify',
			priority: 'medium'
		});
	}

	// ─── Missing practice configuration ──────────────────────
	const pc = data.practiceConfiguration;
	const missingFields: string[] = [];
	if (!pc.practiceName.trim()) missingFields.push('practice name');
	if (!pc.dpoName.trim()) missingFields.push('DPO name');
	if (!pc.dpoContactDetails.trim()) missingFields.push('DPO contact details');

	if (missingFields.length > 0) {
		flags.push({
			id: 'FLAG-CONFIG-001',
			category: 'Incomplete Practice Configuration',
			message: `Practice configuration is missing: ${missingFields.join(', ')}`,
			priority: 'high'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
