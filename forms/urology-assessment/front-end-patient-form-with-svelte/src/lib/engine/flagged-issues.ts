import type { AssessmentData, AdditionalFlag } from './types';

/**
 * Detects additional flags that should be highlighted for the urologist,
 * independent of IPSS score. These are safety-critical or clinically
 * significant alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// ─── Severe IPSS symptoms ────────────────────────────────
	const q = data.ipssQuestionnaire;
	const scores = [q.q1, q.q2, q.q3, q.q4, q.q5, q.q6, q.q7];
	const totalIPSS = scores.reduce((sum, s) => sum + (s ?? 0), 0);
	if (totalIPSS >= 20) {
		flags.push({
			id: 'FLAG-SEVERE-001',
			category: 'Severe Symptoms',
			message: `IPSS score ${totalIPSS}/35 indicates severe lower urinary tract symptoms - urgent urological referral recommended`,
			priority: 'high'
		});
	}

	// ─── Hematuria ───────────────────────────────────────────
	if (data.urinarySymptoms.hematuria === 'yes') {
		flags.push({
			id: 'FLAG-HEMATURIA-001',
			category: 'Hematuria',
			message: 'Patient reports hematuria - urgent investigation required to rule out malignancy',
			priority: 'high'
		});
	}

	// ─── Elevated PSA ────────────────────────────────────────
	if (data.renalFunction.psa !== null && data.renalFunction.psa > 4.0) {
		flags.push({
			id: 'FLAG-PSA-001',
			category: 'Elevated PSA',
			message: `PSA level ${data.renalFunction.psa} ng/mL exceeds normal range (>4.0) - consider prostate biopsy referral`,
			priority: 'high'
		});
	}

	// ─── Renal impairment ────────────────────────────────────
	if (data.renalFunction.eGFR !== null && data.renalFunction.eGFR < 60) {
		flags.push({
			id: 'FLAG-RENAL-001',
			category: 'Renal Impairment',
			message: `eGFR ${data.renalFunction.eGFR} mL/min indicates renal impairment - assess for obstructive uropathy`,
			priority: 'high'
		});
	}

	// ─── Urinary retention (significant straining + weak stream) ─
	if (
		data.urinarySymptoms.straining === 'yes' &&
		data.urinarySymptoms.stream === 'weak'
	) {
		flags.push({
			id: 'FLAG-RETENTION-001',
			category: 'Urinary Retention',
			message: 'Straining with weak stream suggests possible urinary retention - post-void residual measurement recommended',
			priority: 'medium'
		});
	}

	// ─── Recurrent UTI ───────────────────────────────────────
	if (data.urinarySymptoms.dysuria === 'yes' && data.urinarySymptoms.frequency === 'yes') {
		flags.push({
			id: 'FLAG-UTI-001',
			category: 'Recurrent UTI',
			message: 'Dysuria with frequency may indicate recurrent urinary tract infection - urine culture recommended',
			priority: 'medium'
		});
	}

	// ─── Family history of prostate cancer ───────────────────
	if (data.familyHistory.prostateCancer === 'yes') {
		flags.push({
			id: 'FLAG-FAMILY-PC-001',
			category: 'Family History',
			message: 'Family history of prostate cancer - increased personal risk, recommend regular PSA monitoring',
			priority: 'high'
		});
	}

	// ─── Family history of bladder cancer ────────────────────
	if (data.familyHistory.bladderCancer === 'yes') {
		flags.push({
			id: 'FLAG-FAMILY-BC-001',
			category: 'Family History',
			message: 'Family history of bladder cancer - monitor for hematuria and other warning signs',
			priority: 'medium'
		});
	}

	// ─── Family history of kidney disease ────────────────────
	if (data.familyHistory.kidneyDisease === 'yes') {
		flags.push({
			id: 'FLAG-FAMILY-KD-001',
			category: 'Family History',
			message: 'Family history of kidney disease - regular renal function monitoring recommended',
			priority: 'medium'
		});
	}

	// ─── Medication interactions ─────────────────────────────
	if (
		data.currentMedications.alphaBlockers.length > 0 &&
		data.currentMedications.fiveAlphaReductaseInhibitors.length > 0
	) {
		flags.push({
			id: 'FLAG-MED-001',
			category: 'Medication Interaction',
			message: 'Patient on combination alpha-blocker and 5-alpha-reductase inhibitor therapy - monitor for hypotension and sexual side effects',
			priority: 'medium'
		});
	}

	if (data.currentMedications.anticholinergics.length > 0 && totalIPSS >= 20) {
		flags.push({
			id: 'FLAG-MED-002',
			category: 'Medication Interaction',
			message: 'Anticholinergic use with severe LUTS - risk of urinary retention, monitor closely',
			priority: 'high'
		});
	}

	// ─── Neurologic conditions ───────────────────────────────
	if (data.medicalHistory.neurologicConditions === 'yes') {
		flags.push({
			id: 'FLAG-NEURO-001',
			category: 'Neurogenic Bladder',
			message: `Neurological condition present: ${data.medicalHistory.neurologicConditionDetails || 'details not specified'} - consider neurogenic bladder evaluation`,
			priority: 'medium'
		});
	}

	// ─── Erectile dysfunction with urinary symptoms ──────────
	if (data.sexualHealth.erectileDysfunction === 'yes' && totalIPSS >= 8) {
		flags.push({
			id: 'FLAG-ED-001',
			category: 'Sexual Health',
			message: 'Erectile dysfunction with moderate-to-severe LUTS - consider shared pathophysiology assessment',
			priority: 'low'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
