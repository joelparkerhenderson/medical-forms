import type { StatementData, FlaggedIssue } from './types';

/**
 * Detects flagged issues in the advance statement that should
 * be highlighted for review. These are not clinical flags but
 * documentation quality and legal validity concerns.
 */
export function detectFlaggedIssues(data: StatementData): FlaggedIssue[] {
	const flags: FlaggedIssue[] = [];

	// ─── Unsigned statement ────────────────────────────────────
	if (data.signaturesWitnesses.patientSignature.trim() === '') {
		flags.push({
			id: 'FLAG-SIGN-001',
			category: 'Signatures',
			message: 'Statement is unsigned - not valid without patient signature',
			priority: 'high'
		});
	}

	// ─── No witness ────────────────────────────────────────────
	if (
		data.signaturesWitnesses.witnessName.trim() === '' ||
		data.signaturesWitnesses.witnessSignature.trim() === ''
	) {
		flags.push({
			id: 'FLAG-WITNESS-001',
			category: 'Witnesses',
			message: 'No witness recorded - statement validity may be challenged',
			priority: 'high'
		});
	}

	// ─── No review date ────────────────────────────────────────
	if (data.signaturesWitnesses.reviewDate.trim() === '') {
		flags.push({
			id: 'FLAG-REVIEW-001',
			category: 'Review',
			message: 'No review date set - statement should be reviewed regularly',
			priority: 'medium'
		});
	}

	// ─── Review date in the past ───────────────────────────────
	if (data.signaturesWitnesses.reviewDate.trim() !== '') {
		const reviewDate = new Date(data.signaturesWitnesses.reviewDate);
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		if (!isNaN(reviewDate.getTime()) && reviewDate < today) {
			flags.push({
				id: 'FLAG-REVIEW-002',
				category: 'Review',
				message: 'Review date has passed - statement may need updating',
				priority: 'high'
			});
		}
	}

	// ─── Conflicting wishes ────────────────────────────────────
	const resuscitation = data.medicalTreatmentWishes.resuscitationWishes.toLowerCase();
	const ventilation = data.medicalTreatmentWishes.ventilationWishes.toLowerCase();
	if (
		resuscitation.includes('do not') &&
		ventilation.includes('would like') &&
		ventilation.includes('ventilat')
	) {
		flags.push({
			id: 'FLAG-CONFLICT-001',
			category: 'Conflicting Wishes',
			message:
				'Potential conflict between resuscitation and ventilation wishes - clarification recommended',
			priority: 'medium'
		});
	}

	// ─── No emergency contact ──────────────────────────────────
	const hasEmergencyContact = data.peopleImportantToMe.people.some(
		(p) => p.name.trim() !== '' && p.telephone.trim() !== ''
	);
	if (!hasEmergencyContact) {
		flags.push({
			id: 'FLAG-CONTACT-001',
			category: 'Emergency Contact',
			message: 'No emergency contact with telephone number provided',
			priority: 'high'
		});
	}

	// ─── No healthcare professional acknowledgement ────────────
	if (
		data.signaturesWitnesses.healthcareProfessionalName.trim() === '' ||
		data.signaturesWitnesses.healthcareProfessionalSignature.trim() === ''
	) {
		flags.push({
			id: 'FLAG-HCP-001',
			category: 'Healthcare Professional',
			message:
				'No healthcare professional acknowledgement - recommended for inclusion in medical records',
			priority: 'medium'
		});
	}

	// ─── Missing critical medical wishes ───────────────────────
	if (data.medicalTreatmentWishes.painManagementPreferences.trim() === '') {
		flags.push({
			id: 'FLAG-MED-001',
			category: 'Medical Wishes',
			message: 'Pain management preferences not stated',
			priority: 'medium'
		});
	}

	if (data.medicalTreatmentWishes.resuscitationWishes.trim() === '') {
		flags.push({
			id: 'FLAG-MED-002',
			category: 'Medical Wishes',
			message: 'Resuscitation wishes not stated',
			priority: 'medium'
		});
	}

	// ─── No reason for statement ───────────────────────────────
	if (data.statementContext.reasonForStatement.trim() === '') {
		flags.push({
			id: 'FLAG-CONTEXT-001',
			category: 'Statement Context',
			message: 'No reason given for making this statement',
			priority: 'low'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
