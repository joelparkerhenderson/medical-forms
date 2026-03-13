import type { AssessmentData, AdditionalFlag } from './types';

/**
 * Detects additional flags that should be highlighted for the dermatologist,
 * independent of DLQI score. These are safety-critical or clinically
 * significant alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// ─── Suspected melanoma (ABCDE criteria) ────────────────
	if (
		data.lesionCharacteristics.border === 'irregular' &&
		data.lesionCharacteristics.color === 'hyperpigmented'
	) {
		flags.push({
			id: 'FLAG-MELANOMA-001',
			category: 'Suspected Melanoma',
			message: 'Irregular border with hyperpigmented lesion - assess for melanoma (ABCDE criteria)',
			priority: 'high'
		});
	}

	if (
		data.lesionCharacteristics.type === 'nodule' &&
		data.lesionCharacteristics.color === 'hyperpigmented'
	) {
		flags.push({
			id: 'FLAG-MELANOMA-002',
			category: 'Suspected Melanoma',
			message: 'Hyperpigmented nodule detected - urgent dermatoscopy recommended',
			priority: 'high'
		});
	}

	// ─── Rapidly changing lesion ─────────────────────────────
	if (data.chiefComplaint.progression === 'worsening') {
		flags.push({
			id: 'FLAG-CHANGE-001',
			category: 'Rapidly Changing Lesion',
			message: 'Lesion reported as worsening - monitor closely for malignant transformation',
			priority: 'high'
		});
	}

	// ─── Immunosuppressed patient ────────────────────────────
	if (data.medicalHistory.immunosuppression === 'yes') {
		flags.push({
			id: 'FLAG-IMMUNO-001',
			category: 'Immunosuppression',
			message: `Patient is immunosuppressed: ${data.medicalHistory.immunosuppressionDetails || 'details not specified'} - increased risk of skin infections and malignancy`,
			priority: 'medium'
		});
	}

	// ─── Cancer history ─────────────────────────────────────
	if (data.medicalHistory.cancerHistory === 'yes') {
		flags.push({
			id: 'FLAG-CANCER-001',
			category: 'Cancer History',
			message: `Previous cancer history: ${data.medicalHistory.cancerHistoryDetails || 'details not specified'} - assess for recurrence or new primary`,
			priority: 'medium'
		});
	}

	// ─── Autoimmune disease ─────────────────────────────────
	if (data.medicalHistory.autoimmuneDiseases === 'yes') {
		flags.push({
			id: 'FLAG-AUTOIMMUNE-001',
			category: 'Autoimmune Disease',
			message: `Autoimmune disease present: ${data.medicalHistory.autoimmuneDiseaseDetails || 'details not specified'} - consider systemic involvement`,
			priority: 'medium'
		});
	}

	// ─── Latex allergy ──────────────────────────────────────
	if (data.allergies.latexAllergy === 'yes') {
		flags.push({
			id: 'FLAG-LATEX-001',
			category: 'Allergy',
			message: 'Latex allergy - use latex-free gloves and equipment',
			priority: 'high'
		});
	}

	// ─── Drug allergy anaphylaxis ───────────────────────────
	for (const [i, allergy] of data.allergies.drugAllergies.entries()) {
		if (allergy.severity === 'anaphylaxis') {
			flags.push({
				id: `FLAG-ALLERGY-ANAPH-${i}`,
				category: 'Allergy',
				message: `ANAPHYLAXIS history: ${allergy.allergen}`,
				priority: 'high'
			});
		}
	}

	if (data.allergies.drugAllergies.length > 0) {
		flags.push({
			id: 'FLAG-ALLERGY-001',
			category: 'Allergy',
			message: `${data.allergies.drugAllergies.length} drug allergy/allergies documented`,
			priority: 'medium'
		});
	}

	// ─── Family history of melanoma ─────────────────────────
	if (data.familyHistory.melanoma === 'yes') {
		flags.push({
			id: 'FLAG-FAMILY-MEL-001',
			category: 'Family History',
			message: 'Family history of melanoma - increased personal risk, recommend regular skin checks',
			priority: 'high'
		});
	}

	// ─── Family history of skin cancer (non-melanoma) ───────
	if (data.familyHistory.skinCancer === 'yes') {
		flags.push({
			id: 'FLAG-FAMILY-SC-001',
			category: 'Family History',
			message: 'Family history of skin cancer - monitor for basal cell and squamous cell carcinoma',
			priority: 'medium'
		});
	}

	// ─── High sun exposure with fair skin ────────────────────
	if (
		data.socialHistory.sunExposure === 'excessive' &&
		(data.demographics.skinType === 'I' || data.demographics.skinType === 'II')
	) {
		flags.push({
			id: 'FLAG-SUN-001',
			category: 'UV Exposure Risk',
			message: 'Excessive sun exposure with Fitzpatrick Type I/II skin - high risk for UV-related skin damage and malignancy',
			priority: 'high'
		});
	}

	// ─── Tanning bed use ────────────────────────────────────
	if (data.socialHistory.tanningHistory === 'tanning-bed') {
		flags.push({
			id: 'FLAG-TAN-001',
			category: 'UV Exposure Risk',
			message: 'History of tanning bed use - increased risk of melanoma and non-melanoma skin cancer',
			priority: 'medium'
		});
	}

	// ─── Ulcerated lesion ───────────────────────────────────
	if (data.lesionCharacteristics.surface === 'ulcerated') {
		flags.push({
			id: 'FLAG-ULCER-001',
			category: 'Lesion Concern',
			message: 'Ulcerated lesion - biopsy recommended to rule out malignancy',
			priority: 'high'
		});
	}

	// ─── Large lesion ───────────────────────────────────────
	if (
		data.lesionCharacteristics.sizeMillimeters !== null &&
		data.lesionCharacteristics.sizeMillimeters > 6
	) {
		flags.push({
			id: 'FLAG-SIZE-001',
			category: 'Lesion Concern',
			message: `Lesion >6mm (${data.lesionCharacteristics.sizeMillimeters}mm) - exceeds safe threshold for pigmented lesions`,
			priority: 'medium'
		});
	}

	// ─── Biologic therapy ───────────────────────────────────
	if (data.currentMedications.biologics.length > 0) {
		flags.push({
			id: 'FLAG-BIOLOGIC-001',
			category: 'Treatment',
			message: `On biologic therapy (${data.currentMedications.biologics.map((b) => b.name).join(', ')}) - monitor for infections and malignancy`,
			priority: 'medium'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
