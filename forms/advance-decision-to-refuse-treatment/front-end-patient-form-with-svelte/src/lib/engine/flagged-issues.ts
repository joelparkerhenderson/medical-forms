import type { AssessmentData, AdditionalFlag } from './types';
import { hasLifeSustainingRefusal } from './utils';

/**
 * Detects additional flags that should be highlighted for clinical and legal review,
 * independent of validity status. These are safety-critical and legally-critical alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// ─── CRITICAL: Life-sustaining treatment without witness ─────
	if (
		hasLifeSustainingRefusal(data) &&
		data.legalSignatures.lifeSustainingWitnessSignature !== 'yes'
	) {
		flags.push({
			id: 'FLAG-LS-001',
			category: 'Life-Sustaining Treatment',
			message: 'CRITICAL: Life-sustaining treatment refusal without witness signature - ADRT is NOT legally valid',
			priority: 'high'
		});
	}

	// ─── CRITICAL: Missing "even if life at risk" statement ──────
	if (
		hasLifeSustainingRefusal(data) &&
		data.legalSignatures.lifeSustainingWrittenStatement !== 'yes'
	) {
		flags.push({
			id: 'FLAG-LS-002',
			category: 'Life-Sustaining Treatment',
			message: 'CRITICAL: Missing written "even if life is at risk" statement - ADRT is NOT legally valid for life-sustaining treatment',
			priority: 'high'
		});
	}

	// ─── HIGH: Unsigned document ─────────────────────────────────
	if (data.legalSignatures.patientSignature !== 'yes') {
		flags.push({
			id: 'FLAG-SIG-001',
			category: 'Signature',
			message: 'Document has not been signed by the patient',
			priority: 'high'
		});
	}

	// ─── HIGH: No capacity assessment ────────────────────────────
	if (data.capacityDeclaration.confirmsCapacity !== 'yes') {
		flags.push({
			id: 'FLAG-CAP-001',
			category: 'Mental Capacity',
			message: 'No confirmation of mental capacity - ADRT validity may be challenged',
			priority: 'high'
		});
	}

	// ─── HIGH: No professional capacity assessment ───────────────
	if (data.capacityDeclaration.professionalCapacityAssessment !== 'yes') {
		flags.push({
			id: 'FLAG-CAP-002',
			category: 'Mental Capacity',
			message: 'No professional capacity assessment documented - recommended for legal robustness',
			priority: 'high'
		});
	}

	// ─── HIGH: Potential conflict with LPA ────────────────────────
	if (
		data.lastingPowerOfAttorney.hasLPA === 'yes' &&
		data.lastingPowerOfAttorney.relationshipBetweenADRTAndLPA.trim() === ''
	) {
		flags.push({
			id: 'FLAG-LPA-001',
			category: 'Lasting Power of Attorney',
			message: 'LPA exists but relationship between ADRT and LPA has not been described - potential conflict',
			priority: 'high'
		});
	}

	// ─── HIGH: LPA registered after ADRT could override it ───────
	if (
		data.lastingPowerOfAttorney.hasLPA === 'yes' &&
		(data.lastingPowerOfAttorney.lpaType === 'health-and-welfare' ||
			data.lastingPowerOfAttorney.lpaType === 'both') &&
		data.lastingPowerOfAttorney.lpaRegistered === 'yes'
	) {
		flags.push({
			id: 'FLAG-LPA-002',
			category: 'Lasting Power of Attorney',
			message: 'Health and Welfare LPA is registered - if LPA was granted after this ADRT, the LPA attorney may have authority to consent to the refused treatment',
			priority: 'high'
		});
	}

	// ─── MEDIUM: No review date ──────────────────────────────────
	if (data.healthcareProfessionalReview.reviewDate === '') {
		flags.push({
			id: 'FLAG-REV-001',
			category: 'Healthcare Professional Review',
			message: 'No healthcare professional review date recorded',
			priority: 'medium'
		});
	}

	// ─── MEDIUM: Clinician has concerns ──────────────────────────
	if (data.healthcareProfessionalReview.anyConcerns === 'yes') {
		flags.push({
			id: 'FLAG-REV-002',
			category: 'Healthcare Professional Review',
			message: `Clinician has raised concerns: ${data.healthcareProfessionalReview.concernsDetails || 'details not specified'}`,
			priority: 'medium'
		});
	}

	// ─── MEDIUM: No witness details ──────────────────────────────
	if (
		data.legalSignatures.witnessSignature === 'yes' &&
		data.legalSignatures.witnessAddress.trim() === ''
	) {
		flags.push({
			id: 'FLAG-WIT-001',
			category: 'Witness',
			message: 'Witness has signed but address has not been recorded',
			priority: 'medium'
		});
	}

	// ─── MEDIUM: Possible undue influence not ruled out ──────────
	if (data.capacityDeclaration.noUndueInfluence !== 'yes') {
		flags.push({
			id: 'FLAG-CAP-003',
			category: 'Mental Capacity',
			message: 'Undue influence has not been explicitly ruled out',
			priority: 'medium'
		});
	}

	// ─── MEDIUM: Exceptions not addressed ────────────────────────
	if (data.exceptionsConditions.hasExceptions === '') {
		flags.push({
			id: 'FLAG-EXC-001',
			category: 'Exceptions',
			message: 'No declaration made about whether exceptions apply',
			priority: 'medium'
		});
	}

	// ─── LOW: GP not recorded ────────────────────────────────────
	if (data.personalInformation.gpName.trim() === '') {
		flags.push({
			id: 'FLAG-GP-001',
			category: 'Personal Information',
			message: 'GP details not recorded - recommended for clinical communication',
			priority: 'low'
		});
	}

	// ─── LOW: NHS number not recorded ────────────────────────────
	if (data.personalInformation.nhsNumber.trim() === '') {
		flags.push({
			id: 'FLAG-NHS-001',
			category: 'Personal Information',
			message: 'NHS number not recorded - may affect identification',
			priority: 'low'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
