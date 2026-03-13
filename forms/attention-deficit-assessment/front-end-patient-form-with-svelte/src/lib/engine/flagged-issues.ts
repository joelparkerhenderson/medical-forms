import type { AssessmentData, AdditionalFlag } from './types';

/**
 * Detects additional flags that should be highlighted for the clinician,
 * independent of ASRS score. These are safety-critical alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// ─── Cardiovascular risk with stimulants ─────────────────
	if (data.medicalHistory.cardiovascularIssues === 'yes') {
		flags.push({
			id: 'FLAG-CV-001',
			category: 'Cardiovascular',
			message: `Cardiovascular issues reported: ${data.medicalHistory.cardiovascularDetails || 'details not specified'} - STIMULANT SAFETY REVIEW REQUIRED`,
			priority: 'high'
		});
	}

	// ─── Substance abuse history ─────────────────────────────
	if (data.comorbidConditions.substanceUse === 'yes') {
		flags.push({
			id: 'FLAG-SUBST-001',
			category: 'Substance Use',
			message: `Substance use history: ${data.comorbidConditions.substanceUseDetails || 'details not specified'} - CONTROLLED SUBSTANCE PRESCRIBING RISK`,
			priority: 'high'
		});
	}

	// ─── Suicidal ideation / severe depression ──────────────
	if (data.comorbidConditions.depression === 'yes') {
		flags.push({
			id: 'FLAG-DEPR-001',
			category: 'Mental Health',
			message: `Depression reported: ${data.comorbidConditions.depressionDetails || 'details not specified'} - ASSESS SUICIDAL IDEATION`,
			priority: 'high'
		});
	}

	// ─── Seizure history ────────────────────────────────────
	if (data.medicalHistory.seizureHistory === 'yes') {
		flags.push({
			id: 'FLAG-SEIZ-001',
			category: 'Neurological',
			message: `Seizure history: ${data.medicalHistory.seizureDetails || 'details not specified'} - stimulants may lower seizure threshold`,
			priority: 'medium'
		});
	}

	// ─── Tic disorder ───────────────────────────────────────
	if (data.medicalHistory.ticDisorder === 'yes') {
		flags.push({
			id: 'FLAG-TIC-001',
			category: 'Neurological',
			message: `Tic disorder: ${data.medicalHistory.ticDetails || 'details not specified'} - stimulants may exacerbate tics`,
			priority: 'medium'
		});
	}

	// ─── Childhood onset not confirmed ──────────────────────
	if (
		data.childhoodHistory.childhoodSymptoms === 'yes' &&
		data.childhoodHistory.onsetBeforeAge12 !== 'yes'
	) {
		flags.push({
			id: 'FLAG-ONSET-001',
			category: 'Diagnostic Criteria',
			message: 'Childhood symptoms reported but onset before age 12 not confirmed - DSM-5 criterion B',
			priority: 'medium'
		});
	}

	if (data.childhoodHistory.childhoodSymptoms === 'no') {
		flags.push({
			id: 'FLAG-ONSET-002',
			category: 'Diagnostic Criteria',
			message: 'No childhood symptoms reported - ADHD requires childhood onset per DSM-5',
			priority: 'medium'
		});
	}

	// ─── Anxiety comorbidity ────────────────────────────────
	if (data.comorbidConditions.anxiety === 'yes') {
		flags.push({
			id: 'FLAG-ANX-001',
			category: 'Comorbidity',
			message: `Anxiety reported: ${data.comorbidConditions.anxietyDetails || 'details not specified'} - stimulants may worsen anxiety`,
			priority: 'medium'
		});
	}

	// ─── Sleep disorders ────────────────────────────────────
	if (data.comorbidConditions.sleepDisorders === 'yes') {
		flags.push({
			id: 'FLAG-SLEEP-001',
			category: 'Comorbidity',
			message: `Sleep disorder reported: ${data.comorbidConditions.sleepDisordersDetails || 'details not specified'} - may mimic or exacerbate ADHD symptoms`,
			priority: 'medium'
		});
	}

	// ─── Autism spectrum ────────────────────────────────────
	if (data.comorbidConditions.autismSpectrum === 'yes') {
		flags.push({
			id: 'FLAG-ASD-001',
			category: 'Comorbidity',
			message: `Autism spectrum reported: ${data.comorbidConditions.autismSpectrumDetails || 'details not specified'} - consider overlapping symptoms`,
			priority: 'low'
		});
	}

	// ─── Learning disabilities ──────────────────────────────
	if (data.comorbidConditions.learningDisabilities === 'yes') {
		flags.push({
			id: 'FLAG-LD-001',
			category: 'Comorbidity',
			message: `Learning disability: ${data.comorbidConditions.learningDisabilitiesDetails || 'details not specified'} - may overlap with ADHD inattentive symptoms`,
			priority: 'low'
		});
	}

	// ─── Thyroid disease ────────────────────────────────────
	if (data.medicalHistory.thyroidDisease === 'yes') {
		flags.push({
			id: 'FLAG-THYROID-001',
			category: 'Medical',
			message: `Thyroid disease: ${data.medicalHistory.thyroidDetails || 'details not specified'} - thyroid dysfunction can mimic ADHD symptoms`,
			priority: 'medium'
		});
	}

	// ─── Head injuries ──────────────────────────────────────
	if (data.medicalHistory.headInjuries === 'yes') {
		flags.push({
			id: 'FLAG-HEAD-001',
			category: 'Medical',
			message: `Head injury history: ${data.medicalHistory.headInjuryDetails || 'details not specified'} - TBI can cause ADHD-like symptoms`,
			priority: 'medium'
		});
	}

	// ─── Allergy alerts ─────────────────────────────────────
	for (const [i, allergy] of data.allergies.entries()) {
		if (allergy.severity === 'anaphylaxis') {
			flags.push({
				id: `FLAG-ALLERGY-ANAPH-${i}`,
				category: 'Allergy',
				message: `ANAPHYLAXIS history: ${allergy.allergen}`,
				priority: 'high'
			});
		}
	}

	if (data.allergies.length > 0) {
		flags.push({
			id: 'FLAG-ALLERGY-001',
			category: 'Allergy',
			message: `${data.allergies.length} allergy/allergies documented`,
			priority: 'low'
		});
	}

	// ─── Previous diagnosis ─────────────────────────────────
	if (data.socialSupport.previousDiagnosis === 'yes') {
		flags.push({
			id: 'FLAG-PREVDX-001',
			category: 'History',
			message: `Previous ADHD diagnosis: ${data.socialSupport.previousDiagnosisDetails || 'details not specified'}`,
			priority: 'low'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
