import type { AssessmentData, AdditionalFlag } from './types';

/**
 * Detects additional flags that should be highlighted for the dentist,
 * independent of DMFT score. These are safety-critical alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// ─── Dental abscess / acute pain ────────────────────────
	if (
		data.chiefComplaint.painSeverity !== null &&
		data.chiefComplaint.painSeverity >= 7
	) {
		flags.push({
			id: 'FLAG-ABSCESS-001',
			category: 'Dental Emergency',
			message: `Severe dental pain reported (severity ${data.chiefComplaint.painSeverity}/10) - assess for dental abscess`,
			priority: 'high'
		});
	}

	// ─── Anticoagulant use ──────────────────────────────────
	if (data.currentMedications.anticoagulantUse === 'yes') {
		flags.push({
			id: 'FLAG-ANTICOAG-001',
			category: 'Anticoagulation',
			message: `On anticoagulants: ${data.currentMedications.anticoagulantType || 'type not specified'} - increased bleeding risk during procedures`,
			priority: 'high'
		});
	}

	// ─── Bisphosphonate use ─────────────────────────────────
	if (
		data.currentMedications.bisphosphonateCurrentUse === 'yes' ||
		data.medicalHistory.bisphosphonateUse === 'yes'
	) {
		flags.push({
			id: 'FLAG-BISPHOS-001',
			category: 'Medication',
			message: 'Bisphosphonate use - risk of osteonecrosis of the jaw (MRONJ) with invasive procedures',
			priority: 'high'
		});
	}

	// ─── Severe dental anxiety ──────────────────────────────
	if (data.dentalHistory.dentalAnxietyLevel === 'severe') {
		flags.push({
			id: 'FLAG-ANXIETY-001',
			category: 'Patient Management',
			message: 'Severe dental anxiety - consider sedation options and anxiety management protocol',
			priority: 'medium'
		});
	}

	// ─── Bleeding disorder ──────────────────────────────────
	if (data.medicalHistory.bleedingDisorder === 'yes') {
		flags.push({
			id: 'FLAG-BLEEDING-001',
			category: 'Haematological',
			message: `Bleeding disorder: ${data.medicalHistory.bleedingDetails || 'details not specified'} - plan haemostasis measures`,
			priority: 'high'
		});
	}

	// ─── Allergy to anaesthetics ────────────────────────────
	if (data.currentMedications.allergyToAnaesthetics === 'yes') {
		flags.push({
			id: 'FLAG-ANAES-ALLERGY-001',
			category: 'Allergy',
			message: `Allergy to dental anaesthetics: ${data.currentMedications.anaestheticAllergyDetails || 'details not specified'}`,
			priority: 'high'
		});
	}

	// ─── Cardiovascular disease ─────────────────────────────
	if (data.medicalHistory.cardiovascularDisease === 'yes') {
		flags.push({
			id: 'FLAG-CARDIAC-001',
			category: 'Cardiac',
			message: `Cardiovascular disease: ${data.medicalHistory.cardiovascularDetails || 'details not specified'} - consider antibiotic prophylaxis`,
			priority: 'medium'
		});
	}

	// ─── Diabetes ───────────────────────────────────────────
	if (data.medicalHistory.diabetes === 'yes' && data.medicalHistory.diabetesControlled === 'no') {
		flags.push({
			id: 'FLAG-DIABETES-001',
			category: 'Endocrine',
			message: 'Poorly controlled diabetes - increased risk of periodontal disease and delayed healing',
			priority: 'medium'
		});
	}

	// ─── Radiation therapy ──────────────────────────────────
	if (data.medicalHistory.radiationTherapyHeadNeck === 'yes') {
		flags.push({
			id: 'FLAG-RADIATION-001',
			category: 'Oncology',
			message: 'History of head/neck radiation - risk of osteoradionecrosis, xerostomia, radiation caries',
			priority: 'high'
		});
	}

	// ─── Immunosuppression ──────────────────────────────────
	if (data.medicalHistory.immunosuppression === 'yes') {
		flags.push({
			id: 'FLAG-IMMUNO-001',
			category: 'Immunology',
			message: 'Immunosuppressed patient - increased infection risk, delayed healing',
			priority: 'high'
		});
	}

	// ─── Tooth mobility ─────────────────────────────────────
	if (data.periodontalAssessment.toothMobility === 'yes') {
		flags.push({
			id: 'FLAG-MOBILITY-001',
			category: 'Periodontal',
			message: 'Tooth mobility detected - advanced periodontal assessment recommended',
			priority: 'medium'
		});
	}

	// ─── Active decayed teeth ───────────────────────────────
	if (data.dmftAssessment.decayedTeeth !== null && data.dmftAssessment.decayedTeeth >= 5) {
		flags.push({
			id: 'FLAG-DECAY-001',
			category: 'Caries',
			message: `${data.dmftAssessment.decayedTeeth} actively decayed teeth - urgent treatment plan needed`,
			priority: 'high'
		});
	}

	// ─── Immunosuppressant medication ───────────────────────
	if (data.currentMedications.immunosuppressantUse === 'yes') {
		flags.push({
			id: 'FLAG-IMMUNOMED-001',
			category: 'Medication',
			message: `On immunosuppressants: ${data.currentMedications.immunosuppressantName || 'not specified'} - increased infection risk`,
			priority: 'medium'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
