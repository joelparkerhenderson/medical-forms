import type { AssessmentData, AdditionalFlag } from './types';

/**
 * Detects additional flags that should be highlighted for the oncologist,
 * independent of ECOG grade. These are safety-critical alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// ─── Neutropenic fever risk ─────────────────────────────
	if (
		data.sideEffects.neutropenia === 'yes' ||
		(data.laboratoryResults.neutrophils !== null && data.laboratoryResults.neutrophils < 1.0)
	) {
		flags.push({
			id: 'FLAG-NEUTRO-001',
			category: 'Haematological',
			message: 'Neutropenic fever risk - monitor temperature, consider prophylactic antibiotics',
			priority: 'high'
		});
	}

	// ─── Severe pain ────────────────────────────────────────
	if (data.symptomAssessment.painNRS !== null && data.symptomAssessment.painNRS >= 7) {
		flags.push({
			id: 'FLAG-PAIN-001',
			category: 'Symptoms',
			message: `Severe pain (NRS ${data.symptomAssessment.painNRS}/10) - urgent pain management review`,
			priority: 'high'
		});
	}

	// ─── ECOG 3-4 ───────────────────────────────────────────
	if (
		data.demographics.ecogPerformanceStatus === '3' ||
		data.demographics.ecogPerformanceStatus === '4'
	) {
		flags.push({
			id: 'FLAG-ECOG-001',
			category: 'Performance Status',
			message: `ECOG ${data.demographics.ecogPerformanceStatus} - poor performance status, review treatment goals`,
			priority: 'high'
		});
	}

	// ─── Active bleeding (severe thrombocytopenia) ──────────
	if (data.laboratoryResults.platelets !== null && data.laboratoryResults.platelets < 20) {
		flags.push({
			id: 'FLAG-BLEED-001',
			category: 'Haematological',
			message: `Active bleeding risk - platelets critically low (${data.laboratoryResults.platelets})`,
			priority: 'high'
		});
	}

	// ─── Cord compression (brain/sarcoma with neuro symptoms)
	if (
		(data.cancerDiagnosis.cancerType === 'brain' ||
			data.cancerDiagnosis.primarySite.toLowerCase().includes('spine') ||
			data.cancerDiagnosis.primarySite.toLowerCase().includes('spinal')) &&
		data.cancerDiagnosis.stageM === '1'
	) {
		flags.push({
			id: 'FLAG-CORD-001',
			category: 'Oncological Emergency',
			message: 'Potential cord compression - urgent MRI and neurosurgical review',
			priority: 'high'
		});
	}

	// ─── Hypercalcaemia ─────────────────────────────────────
	if (data.laboratoryResults.calcium !== null && data.laboratoryResults.calcium > 2.8) {
		flags.push({
			id: 'FLAG-CALCIUM-001',
			category: 'Metabolic',
			message: `Hypercalcaemia (${data.laboratoryResults.calcium} mmol/L) - hydration and bisphosphonate therapy`,
			priority: 'high'
		});
	}

	// ─── Distress thermometer >7 ────────────────────────────
	if (
		data.psychosocial.distressThermometer !== null &&
		data.psychosocial.distressThermometer > 7
	) {
		flags.push({
			id: 'FLAG-DISTRESS-001',
			category: 'Psychosocial',
			message: `High distress score (${data.psychosocial.distressThermometer}/10) - psycho-oncology referral recommended`,
			priority: 'medium'
		});
	}

	// ─── Progressive disease ────────────────────────────────
	if (data.currentTreatment.responseAssessment === 'progressive-disease') {
		flags.push({
			id: 'FLAG-PD-001',
			category: 'Treatment',
			message: 'Progressive disease on current regimen - consider treatment change or MDT discussion',
			priority: 'medium'
		});
	}

	// ─── Severe weight loss ─────────────────────────────────
	if (data.symptomAssessment.weightChange === 'losing-more-10') {
		flags.push({
			id: 'FLAG-WEIGHT-001',
			category: 'Nutritional',
			message: 'Significant weight loss >10% - nutritional support and dietitian referral',
			priority: 'medium'
		});
	}

	// ─── Malnourished ───────────────────────────────────────
	if (data.functionalNutritional.nutritionalStatus === 'malnourished') {
		flags.push({
			id: 'FLAG-NUTR-001',
			category: 'Nutritional',
			message: 'Malnourished - consider enteral/parenteral nutrition support',
			priority: 'medium'
		});
	}

	// ─── Severe organ toxicity ──────────────────────────────
	if (
		data.sideEffects.organToxicityGrade === '3' ||
		data.sideEffects.organToxicityGrade === '4'
	) {
		flags.push({
			id: 'FLAG-TOXICITY-001',
			category: 'Side Effects',
			message: `CTCAE Grade ${data.sideEffects.organToxicityGrade} organ toxicity: ${data.sideEffects.organToxicityDetails || 'details not specified'}`,
			priority: 'high'
		});
	}

	// ─── Severe anaemia ─────────────────────────────────────
	if (data.laboratoryResults.haemoglobin !== null && data.laboratoryResults.haemoglobin < 80) {
		flags.push({
			id: 'FLAG-ANAEMIA-001',
			category: 'Haematological',
			message: `Severe anaemia (Hb ${data.laboratoryResults.haemoglobin} g/L) - consider transfusion`,
			priority: 'high'
		});
	}

	// ─── Coagulopathy ───────────────────────────────────────
	if (data.laboratoryResults.inr !== null && data.laboratoryResults.inr > 1.5) {
		flags.push({
			id: 'FLAG-COAG-001',
			category: 'Haematological',
			message: `Elevated INR (${data.laboratoryResults.inr}) - bleeding risk, review anticoagulation`,
			priority: 'medium'
		});
	}

	// ─── Advance care planning ──────────────────────────────
	if (data.psychosocial.advanceCarePlanning === 'yes') {
		flags.push({
			id: 'FLAG-ACP-001',
			category: 'Psychosocial',
			message: 'Advance care planning documented - review preferences',
			priority: 'low'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
