import type { AssessmentData, AdditionalFlag } from './types';

/**
 * Detects additional flags that should be highlighted for the clinician,
 * independent of the vaccination score. These are actionable alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// ─── MMR not given - measles outbreak risk ──────────────
	if (data.childhoodVaccinations.mmr === 0) {
		flags.push({
			id: 'FLAG-VAX-001',
			category: 'Childhood',
			message: 'MMR vaccination not given - measles outbreak risk',
			priority: 'high'
		});
	}

	// ─── Previous anaphylaxis ────────────────────────────────
	if (data.contraindicationsAllergies.previousAnaphylaxis === 'yes') {
		flags.push({
			id: 'FLAG-VAX-002',
			category: 'Contraindication',
			message: 'Previous anaphylaxis to vaccine - specialist allergy review required',
			priority: 'high'
		});
	}

	// ─── Immunocompromised patient ───────────────────────────
	if (data.immunizationHistory.immunocompromised === 'yes') {
		flags.push({
			id: 'FLAG-VAX-003',
			category: 'Clinical',
			message: 'Immunocompromised patient - avoid live vaccines, specialist review needed',
			priority: 'high'
		});
	}

	// ─── Immediate adverse reaction ──────────────────────────
	if (data.clinicalReview.immediateReaction === 'yes') {
		flags.push({
			id: 'FLAG-VAX-004',
			category: 'Clinical',
			message: 'Immediate adverse reaction reported - document and report via Yellow Card',
			priority: 'high'
		});
	}

	// ─── Pregnant patient ────────────────────────────────────
	if (data.contraindicationsAllergies.pregnant === 'yes') {
		flags.push({
			id: 'FLAG-VAX-005',
			category: 'Contraindication',
			message: 'Pregnant patient - live vaccines contraindicated',
			priority: 'high'
		});
	}

	// ─── No vaccination record available ─────────────────────
	if (data.immunizationHistory.hasVaccinationRecord === 'no') {
		flags.push({
			id: 'FLAG-VAX-006',
			category: 'History',
			message: 'No vaccination record available - full history review needed',
			priority: 'medium'
		});
	}

	// ─── Healthcare worker missing hepatitis B ───────────────
	if (
		data.occupationalVaccinations.healthcareWorker === 'yes' &&
		data.occupationalVaccinations.hepatitisBOccupational === 0
	) {
		flags.push({
			id: 'FLAG-VAX-007',
			category: 'Occupational',
			message: 'Healthcare worker without hepatitis B vaccination - occupational health referral',
			priority: 'medium'
		});
	}

	// ─── Egg allergy with influenza needed ───────────────────
	if (data.contraindicationsAllergies.eggAllergy === 'yes') {
		flags.push({
			id: 'FLAG-VAX-008',
			category: 'Allergy',
			message: 'Egg allergy reported - use egg-free vaccine formulations',
			priority: 'medium'
		});
	}

	// ─── Travel planned, yellow fever not given ──────────────
	if (
		data.travelVaccinations.travelPlanned === 'yes' &&
		data.travelVaccinations.yellowFever === 0
	) {
		flags.push({
			id: 'FLAG-VAX-009',
			category: 'Travel',
			message: 'Travel planned but yellow fever vaccination not given - check destination requirements',
			priority: 'medium'
		});
	}

	// ─── Catch-up schedule needed ────────────────────────────
	if (data.clinicalReview.catchUpScheduleNeeded === 'yes') {
		flags.push({
			id: 'FLAG-VAX-010',
			category: 'Clinical',
			message: 'Catch-up vaccination schedule required - create individualised plan',
			priority: 'medium'
		});
	}

	// ─── Consent not given ───────────────────────────────────
	if (data.consentInformation.consentGiven === 'no') {
		flags.push({
			id: 'FLAG-VAX-011',
			category: 'Consent',
			message: 'Consent not given - vaccination cannot proceed',
			priority: 'high'
		});
	}

	// ─── Previous adverse reaction history ───────────────────
	if (data.immunizationHistory.previousAdverseReactions === 'yes') {
		flags.push({
			id: 'FLAG-VAX-012',
			category: 'History',
			message: 'Previous adverse reactions documented - review before administering',
			priority: 'medium'
		});
	}

	// ─── Severe illness ──────────────────────────────────────
	if (data.contraindicationsAllergies.severeIllness === 'yes') {
		flags.push({
			id: 'FLAG-VAX-013',
			category: 'Contraindication',
			message: 'Patient currently has severe illness - defer vaccination',
			priority: 'high'
		});
	}

	// ─── Referral needed ─────────────────────────────────────
	if (data.clinicalReview.referralNeeded === 'yes') {
		flags.push({
			id: 'FLAG-VAX-014',
			category: 'Clinical',
			message: 'Specialist referral required - ensure referral is completed',
			priority: 'low'
		});
	}

	// Sort: high > medium > low
	const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
