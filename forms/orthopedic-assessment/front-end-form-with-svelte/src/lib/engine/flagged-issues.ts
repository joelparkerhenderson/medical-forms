import type { AssessmentData, AdditionalFlag } from './types';

/**
 * Detects additional flags that should be highlighted for the orthopedic surgeon,
 * independent of DASH score. These are safety-critical or clinically
 * significant alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// ─── Severe pain (>8/10) ────────────────────────────
	if (
		data.painAssessment.currentPainLevel !== null &&
		data.painAssessment.currentPainLevel > 8
	) {
		flags.push({
			id: 'FLAG-PAIN-001',
			category: 'Severe Pain',
			message: `Current pain level ${data.painAssessment.currentPainLevel}/10 - urgent pain management review recommended`,
			priority: 'high'
		});
	}

	if (
		data.painAssessment.worstPain !== null &&
		data.painAssessment.worstPain > 8
	) {
		flags.push({
			id: 'FLAG-PAIN-002',
			category: 'Severe Pain',
			message: `Worst pain level ${data.painAssessment.worstPain}/10 reported - assess for acute pathology`,
			priority: 'high'
		});
	}

	// ─── Red flags: night pain ──────────────────────────
	if (data.painAssessment.nightPain === 'yes') {
		flags.push({
			id: 'FLAG-RED-001',
			category: 'Red Flag',
			message: 'Night pain reported - rule out infection, malignancy, or inflammatory arthropathy',
			priority: 'high'
		});
	}

	// ─── Neurological symptoms (tingling) ────────────────
	const tingleScore = data.dashQuestionnaire.q26;
	if (tingleScore !== null && tingleScore >= 3) {
		flags.push({
			id: 'FLAG-NEURO-001',
			category: 'Neurological Symptoms',
			message: 'Significant tingling/pins and needles reported - assess for nerve compression or neuropathy',
			priority: 'high'
		});
	}

	// ─── Weakness ───────────────────────────────────────
	const weaknessScore = data.dashQuestionnaire.q27;
	if (weaknessScore !== null && weaknessScore >= 4) {
		flags.push({
			id: 'FLAG-WEAKNESS-001',
			category: 'Significant Weakness',
			message: 'Severe weakness reported in arm/shoulder/hand - assess for tendon rupture or neurological cause',
			priority: 'high'
		});
	}

	// ─── Joint instability ──────────────────────────────
	if (
		data.chiefComplaint.onsetType === 'traumatic' &&
		data.painAssessment.painWithWeightBearing === 'yes'
	) {
		flags.push({
			id: 'FLAG-INSTABILITY-001',
			category: 'Joint Instability',
			message: 'Traumatic onset with weight-bearing pain - assess for fracture, dislocation, or ligament injury',
			priority: 'high'
		});
	}

	// ─── Infection signs ────────────────────────────────
	if (
		data.chiefComplaint.aggravatingFactors.includes('swelling') &&
		data.chiefComplaint.aggravatingFactors.includes('redness') &&
		data.painAssessment.nightPain === 'yes'
	) {
		flags.push({
			id: 'FLAG-INFECTION-001',
			category: 'Possible Infection',
			message: 'Swelling, redness, and night pain present - rule out septic arthritis or osteomyelitis',
			priority: 'high'
		});
	}

	// ─── Fracture suspicion ─────────────────────────────
	if (
		data.chiefComplaint.onsetType === 'traumatic' &&
		data.imagingHistory.xRay.performed !== 'yes'
	) {
		flags.push({
			id: 'FLAG-FRACTURE-001',
			category: 'Fracture Suspicion',
			message: 'Traumatic onset without X-ray - imaging recommended to rule out fracture',
			priority: 'high'
		});
	}

	// ─── Previous orthopedic surgery ────────────────────
	if (data.surgicalHistory.previousOrthopedicSurgery === 'yes') {
		const surgeryCount = data.surgicalHistory.surgeries.length;
		flags.push({
			id: 'FLAG-SURGERY-001',
			category: 'Surgical History',
			message: `${surgeryCount} previous orthopedic surgery/surgeries documented - review for relevance to current complaint`,
			priority: 'medium'
		});
	}

	// ─── Anesthesia complications ───────────────────────
	if (data.surgicalHistory.anesthesiaComplications === 'yes') {
		flags.push({
			id: 'FLAG-ANESTH-001',
			category: 'Anesthesia Risk',
			message: `Previous anesthesia complications: ${data.surgicalHistory.anesthesiaDetails || 'details not specified'} - anesthetic review required if surgery planned`,
			priority: 'high'
		});
	}

	// ─── Drug allergy anaphylaxis ───────────────────────
	for (const [i, allergy] of data.currentTreatment.allergies.entries()) {
		if (allergy.severity === 'anaphylaxis') {
			flags.push({
				id: `FLAG-ALLERGY-ANAPH-${i}`,
				category: 'Allergy',
				message: `ANAPHYLAXIS history: ${allergy.allergen}`,
				priority: 'high'
			});
		}
	}

	if (data.currentTreatment.allergies.length > 0) {
		flags.push({
			id: 'FLAG-ALLERGY-001',
			category: 'Allergy',
			message: `${data.currentTreatment.allergies.length} drug allergy/allergies documented`,
			priority: 'medium'
		});
	}

	// ─── Sleep disturbance from pain ────────────────────
	const sleepScore = data.dashQuestionnaire.q29;
	if (sleepScore !== null && sleepScore >= 4) {
		flags.push({
			id: 'FLAG-SLEEP-001',
			category: 'Sleep Disturbance',
			message: 'Severe sleep disturbance due to pain - consider pain management review',
			priority: 'medium'
		});
	}

	// ─── Bilateral involvement ──────────────────────────
	if (data.chiefComplaint.side === 'bilateral') {
		flags.push({
			id: 'FLAG-BILATERAL-001',
			category: 'Bilateral Involvement',
			message: 'Bilateral joint involvement - consider systemic or inflammatory cause',
			priority: 'medium'
		});
	}

	// ─── Significant functional limitation ──────────────
	if (
		data.functionalLimitations.difficultyWithADLs.length >= 4
	) {
		flags.push({
			id: 'FLAG-FUNCTION-001',
			category: 'Functional Limitation',
			message: `Patient reports difficulty with ${data.functionalLimitations.difficultyWithADLs.length} activities of daily living - significant functional impairment`,
			priority: 'medium'
		});
	}

	// ─── Failed conservative treatment ──────────────────
	if (
		data.currentTreatment.physicalTherapy === 'yes' &&
		data.currentTreatment.injections === 'yes' &&
		data.currentTreatment.medications.length > 0
	) {
		flags.push({
			id: 'FLAG-CONSERV-001',
			category: 'Treatment Failure',
			message: 'Multiple conservative treatments tried (PT, injections, medications) - surgical consultation may be warranted',
			priority: 'medium'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
