import type { AssessmentData, AdditionalFlag } from './types';

/**
 * Detects additional flags that should be highlighted for review,
 * independent of completeness score. These are safety-critical or
 * process-significant alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// ─── Incomplete required acknowledgements ────────────────
	if (data.patientRights.acknowledgedRightToRevoke !== 'yes') {
		flags.push({
			id: 'FLAG-RIGHTS-001',
			category: 'Missing Acknowledgement',
			message: 'Patient has not acknowledged their right to revoke authorization',
			priority: 'high'
		});
	}

	if (data.patientRights.acknowledgedDataProtection !== 'yes') {
		flags.push({
			id: 'FLAG-RIGHTS-002',
			category: 'Missing Acknowledgement',
			message: 'Patient has not acknowledged data protection rights',
			priority: 'high'
		});
	}

	// ─── Missing signature ───────────────────────────────────
	if (data.signatureConsent.patientSignatureConfirmed !== 'yes') {
		flags.push({
			id: 'FLAG-SIG-001',
			category: 'Missing Signature',
			message: 'Patient signature has not been confirmed - form is not legally binding',
			priority: 'high'
		});
	}

	// ─── Expired authorization ───────────────────────────────
	if (data.authorizationPeriod.endDate) {
		const endDate = new Date(data.authorizationPeriod.endDate);
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		if (endDate < today) {
			flags.push({
				id: 'FLAG-EXPIRED-001',
				category: 'Expired Authorization',
				message: `Authorization end date (${data.authorizationPeriod.endDate}) has passed - form may no longer be valid`,
				priority: 'high'
			});
		}
	}

	// ─── Sensitive records without explicit consent ──────────
	const sensitiveTypes = ['mental-health'];
	const requestedSensitive = data.recordsToRelease.recordTypes.filter(
		(t) => sensitiveTypes.includes(t)
	);

	if (requestedSensitive.length > 0 && data.restrictionsLimitations.excludeMentalHealth !== 'no') {
		flags.push({
			id: 'FLAG-SENSITIVE-001',
			category: 'Sensitive Records',
			message: 'Mental health records are requested but exclusion status has not been explicitly set to "No" - confirm patient consent for sensitive data release',
			priority: 'high'
		});
	}

	// ─── HIV/STI records flagged ─────────────────────────────
	if (data.restrictionsLimitations.excludeHIV === 'no') {
		flags.push({
			id: 'FLAG-SENSITIVE-002',
			category: 'Sensitive Records',
			message: 'HIV-related records will be included in the release - ensure explicit patient consent under applicable law',
			priority: 'medium'
		});
	}

	if (data.restrictionsLimitations.excludeSTI === 'no') {
		flags.push({
			id: 'FLAG-SENSITIVE-003',
			category: 'Sensitive Records',
			message: 'STI-related records will be included in the release - ensure explicit patient consent under applicable law',
			priority: 'medium'
		});
	}

	// ─── Genetic information release ─────────────────────────
	if (data.restrictionsLimitations.excludeGeneticInfo === 'no') {
		flags.push({
			id: 'FLAG-SENSITIVE-004',
			category: 'Sensitive Records',
			message: 'Genetic information will be included - ensure compliance with genetic information non-discrimination regulations',
			priority: 'medium'
		});
	}

	// ─── Substance abuse records ─────────────────────────────
	if (data.restrictionsLimitations.excludeSubstanceAbuse === 'no') {
		flags.push({
			id: 'FLAG-SENSITIVE-005',
			category: 'Sensitive Records',
			message: 'Substance abuse treatment records will be included - additional patient consent may be required',
			priority: 'medium'
		});
	}

	// ─── Missing witness for vulnerable patients ─────────────
	if (data.signatureConsent.parentGuardianName && !data.signatureConsent.witnessName) {
		flags.push({
			id: 'FLAG-WITNESS-001',
			category: 'Missing Witness',
			message: 'Parent/guardian name is provided but no witness is recorded - a witness signature is recommended for vulnerable patients',
			priority: 'high'
		});
	}

	// ─── Missing witness signature confirmation ──────────────
	if (data.signatureConsent.witnessName && data.signatureConsent.witnessSignatureConfirmed !== 'yes') {
		flags.push({
			id: 'FLAG-WITNESS-002',
			category: 'Missing Witness Signature',
			message: 'Witness name is provided but signature has not been confirmed',
			priority: 'medium'
		});
	}

	// ─── Complete medical record request ─────────────────────
	if (data.recordsToRelease.recordTypes.includes('complete-medical-record')) {
		flags.push({
			id: 'FLAG-SCOPE-001',
			category: 'Broad Release Scope',
			message: 'Complete medical record has been requested - ensure patient understands the breadth of information being released',
			priority: 'medium'
		});
	}

	// ─── Release for legal proceedings ───────────────────────
	if (data.purposeOfRelease.purpose === 'legal') {
		flags.push({
			id: 'FLAG-LEGAL-001',
			category: 'Legal Release',
			message: 'Records are being released for legal proceedings - ensure compliance with court order requirements if applicable',
			priority: 'medium'
		});
	}

	// ─── Release for insurance ───────────────────────────────
	if (data.purposeOfRelease.purpose === 'insurance') {
		flags.push({
			id: 'FLAG-INSURANCE-001',
			category: 'Insurance Release',
			message: 'Records are being released to an insurer - ensure only relevant records are included per patient authorization',
			priority: 'low'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
