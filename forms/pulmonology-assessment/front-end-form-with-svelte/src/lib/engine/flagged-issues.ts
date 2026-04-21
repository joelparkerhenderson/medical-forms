import type { AssessmentData, AdditionalFlag } from './types';

/**
 * Detects additional flags that should be highlighted for the pulmonologist,
 * independent of GOLD stage. These are safety-critical alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// ─── Severe airflow limitation ────────────────────────────
	if (
		data.spirometry.fev1PercentPredicted !== null &&
		data.spirometry.fev1PercentPredicted < 30
	) {
		flags.push({
			id: 'FLAG-SPIRO-001',
			category: 'Spirometry',
			message: `Very severe airflow limitation: FEV1 ${data.spirometry.fev1PercentPredicted}% predicted`,
			priority: 'high'
		});
	}

	// ─── Oxygen desaturation ──────────────────────────────────
	if (
		data.functionalStatus.oxygenSaturationRest !== null &&
		data.functionalStatus.oxygenSaturationRest < 92
	) {
		flags.push({
			id: 'FLAG-O2-001',
			category: 'Oxygenation',
			message: `Resting SpO2 ${data.functionalStatus.oxygenSaturationRest}% - consider supplemental oxygen assessment`,
			priority: 'high'
		});
	}

	if (
		data.functionalStatus.oxygenSaturationExertion !== null &&
		data.functionalStatus.oxygenSaturationExertion < 88
	) {
		flags.push({
			id: 'FLAG-O2-002',
			category: 'Oxygenation',
			message: `Exertional SpO2 ${data.functionalStatus.oxygenSaturationExertion}% - ambulatory oxygen assessment needed`,
			priority: 'high'
		});
	}

	// ─── Intubation history ───────────────────────────────────
	if (data.exacerbationHistory.intubationHistory === 'yes') {
		flags.push({
			id: 'FLAG-INTUB-001',
			category: 'Exacerbations',
			message: 'History of intubation for respiratory failure',
			priority: 'high'
		});
	}

	// ─── ICU admissions ───────────────────────────────────────
	if (
		data.exacerbationHistory.icuAdmissions !== null &&
		data.exacerbationHistory.icuAdmissions >= 1
	) {
		flags.push({
			id: 'FLAG-ICU-001',
			category: 'Exacerbations',
			message: `${data.exacerbationHistory.icuAdmissions} ICU admission(s) for exacerbation`,
			priority: 'high'
		});
	}

	// ─── Frequent exacerbations ───────────────────────────────
	if (
		data.exacerbationHistory.exacerbationsPerYear !== null &&
		data.exacerbationHistory.exacerbationsPerYear >= 2
	) {
		flags.push({
			id: 'FLAG-EXAC-001',
			category: 'Exacerbations',
			message: `${data.exacerbationHistory.exacerbationsPerYear} exacerbations per year - frequent exacerbator phenotype`,
			priority: 'high'
		});
	}

	// ─── Current smoker ──────────────────────────────────────
	if (data.smokingExposures.smokingStatus === 'current') {
		flags.push({
			id: 'FLAG-SMOKE-001',
			category: 'Smoking',
			message: 'Active smoker - smoking cessation intervention essential',
			priority: 'high'
		});
	}

	// ─── Occupational exposures ───────────────────────────────
	if (data.smokingExposures.occupationalExposures === 'yes') {
		flags.push({
			id: 'FLAG-OCCUP-001',
			category: 'Exposures',
			message: `Occupational exposure: ${data.smokingExposures.occupationalDetails || 'details not specified'}`,
			priority: 'medium'
		});
	}

	// ─── Biomass fuel exposure ────────────────────────────────
	if (data.smokingExposures.biomassFuelExposure === 'yes') {
		flags.push({
			id: 'FLAG-BIOMASS-001',
			category: 'Exposures',
			message: 'Biomass fuel exposure history',
			priority: 'medium'
		});
	}

	// ─── Lung cancer ─────────────────────────────────────────
	if (data.comorbidities.lungCancer === 'yes') {
		flags.push({
			id: 'FLAG-CANCER-001',
			category: 'Comorbidities',
			message: `Lung cancer: ${data.comorbidities.lungCancerDetails || 'details not specified'}`,
			priority: 'high'
		});
	}

	// ─── Cardiovascular disease ──────────────────────────────
	if (data.comorbidities.cardiovascularDisease === 'yes') {
		flags.push({
			id: 'FLAG-CVD-001',
			category: 'Comorbidities',
			message: `Cardiovascular disease: ${data.comorbidities.cardiovascularDetails || 'details not specified'}`,
			priority: 'medium'
		});
	}

	// ─── Long-term oxygen therapy ─────────────────────────────
	if (data.currentMedications.oxygenTherapy === 'yes') {
		flags.push({
			id: 'FLAG-LTOT-001',
			category: 'Medications',
			message: `On long-term oxygen therapy (${data.currentMedications.oxygenLitresPerMinute ?? '?'} L/min)`,
			priority: 'high'
		});
	}

	// ─── Oral corticosteroids ─────────────────────────────────
	if (data.currentMedications.oralCorticosteroids === 'yes') {
		flags.push({
			id: 'FLAG-OCS-001',
			category: 'Medications',
			message: 'On oral corticosteroids - monitor for steroid side effects',
			priority: 'medium'
		});
	}

	// ─── Allergy alerts ──────────────────────────────────────
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
			priority: 'medium'
		});
	}

	// ─── Low BMI / cachexia ──────────────────────────────────
	if (data.demographics.bmi !== null && data.demographics.bmi < 21) {
		flags.push({
			id: 'FLAG-BMI-001',
			category: 'Nutrition',
			message: `Low BMI (${data.demographics.bmi}) - assess for cachexia and nutritional support`,
			priority: 'medium'
		});
	}

	// ─── Depression ──────────────────────────────────────────
	if (data.comorbidities.depression === 'yes') {
		flags.push({
			id: 'FLAG-DEPR-001',
			category: 'Comorbidities',
			message: 'Depression - assess impact on adherence and quality of life',
			priority: 'medium'
		});
	}

	// ─── Bronchodilator response ──────────────────────────────
	if (data.spirometry.bronchodilatorResponse === 'yes') {
		flags.push({
			id: 'FLAG-BDR-001',
			category: 'Spirometry',
			message: 'Positive bronchodilator response - consider asthma-COPD overlap',
			priority: 'medium'
		});
	}

	// ─── ADL limitations ─────────────────────────────────────
	if (data.functionalStatus.adlLimitations === 'yes') {
		flags.push({
			id: 'FLAG-ADL-001',
			category: 'Functional Status',
			message: `ADL limitations: ${data.functionalStatus.adlDetails || 'details not specified'}`,
			priority: 'medium'
		});
	}

	// ─── Osteoporosis ────────────────────────────────────────
	if (data.comorbidities.osteoporosis === 'yes') {
		flags.push({
			id: 'FLAG-OSTEO-001',
			category: 'Comorbidities',
			message: 'Osteoporosis - review steroid use and fall risk',
			priority: 'low'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
