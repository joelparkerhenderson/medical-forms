import type { AssessmentData, AdditionalFlag } from './types';

/**
 * Detects additional flags that should be highlighted for the obstetrician,
 * independent of the cumulative risk score. These are safety-critical or
 * clinically significant alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// ─── High blood pressure ────────────────────────────
	if (
		(data.vitalSigns.bloodPressureSystolic !== null && data.vitalSigns.bloodPressureSystolic >= 140) ||
		(data.vitalSigns.bloodPressureDiastolic !== null && data.vitalSigns.bloodPressureDiastolic >= 90)
	) {
		flags.push({
			id: 'FLAG-BP-001',
			category: 'Hypertension',
			message: `Elevated blood pressure (${data.vitalSigns.bloodPressureSystolic ?? '?'}/${data.vitalSigns.bloodPressureDiastolic ?? '?'} mmHg) - assess for preeclampsia`,
			priority: 'high'
		});
	}

	// ─── Severe hypertension ────────────────────────────
	if (
		(data.vitalSigns.bloodPressureSystolic !== null && data.vitalSigns.bloodPressureSystolic >= 160) ||
		(data.vitalSigns.bloodPressureDiastolic !== null && data.vitalSigns.bloodPressureDiastolic >= 110)
	) {
		flags.push({
			id: 'FLAG-BP-002',
			category: 'Severe Hypertension',
			message: 'Severely elevated blood pressure - urgent assessment required',
			priority: 'high'
		});
	}

	// ─── Vaginal bleeding ───────────────────────────────
	if (data.currentSymptoms.bleeding === 'yes') {
		flags.push({
			id: 'FLAG-BLEED-001',
			category: 'Vaginal Bleeding',
			message: 'Active vaginal bleeding reported - urgent assessment required to rule out placental abruption or previa',
			priority: 'high'
		});
	}

	// ─── Reduced fetal movement ─────────────────────────
	if (data.currentSymptoms.reducedFetalMovement === 'yes') {
		flags.push({
			id: 'FLAG-FETAL-001',
			category: 'Fetal Movement',
			message: 'Reduced fetal movement reported - immediate CTG monitoring recommended',
			priority: 'high'
		});
	}

	// ─── Preeclampsia signs ─────────────────────────────
	if (
		data.currentSymptoms.headache === 'yes' &&
		data.currentSymptoms.visionChanges === 'yes' &&
		data.currentSymptoms.edema === 'yes'
	) {
		flags.push({
			id: 'FLAG-PE-001',
			category: 'Preeclampsia Signs',
			message: 'Headache, vision changes, and edema present - assess urgently for preeclampsia',
			priority: 'high'
		});
	}

	// ─── Previous preeclampsia with current hypertension ─
	if (
		data.obstetricHistory.previousComplications.preeclampsia === 'yes' &&
		data.medicalHistory.hypertension === 'yes'
	) {
		flags.push({
			id: 'FLAG-PE-002',
			category: 'Preeclampsia Risk',
			message: 'Previous preeclampsia with current hypertension - high recurrence risk',
			priority: 'high'
		});
	}

	// ─── Gestational diabetes risk ──────────────────────
	if (data.laboratoryResults.glucose !== null && data.laboratoryResults.glucose > 7.8) {
		flags.push({
			id: 'FLAG-GDM-001',
			category: 'Gestational Diabetes',
			message: `Elevated glucose (${data.laboratoryResults.glucose} mmol/L) - glucose tolerance test recommended`,
			priority: 'medium'
		});
	}

	if (data.obstetricHistory.previousComplications.gestationalDiabetes === 'yes') {
		flags.push({
			id: 'FLAG-GDM-002',
			category: 'Gestational Diabetes',
			message: 'Previous gestational diabetes - early screening recommended',
			priority: 'medium'
		});
	}

	// ─── Rh incompatibility ─────────────────────────────
	if (data.laboratoryResults.rhFactor === 'negative') {
		flags.push({
			id: 'FLAG-RH-001',
			category: 'Rh Incompatibility',
			message: 'Rh-negative mother - anti-D immunoglobulin administration required, monitor for antibodies',
			priority: 'medium'
		});
	}

	// ─── High Edinburgh score ───────────────────────────
	if (data.mentalHealthScreening.edinburghScore !== null && data.mentalHealthScreening.edinburghScore >= 13) {
		flags.push({
			id: 'FLAG-EPDS-001',
			category: 'Mental Health',
			message: `Edinburgh score ${data.mentalHealthScreening.edinburghScore}/30 - probable perinatal depression, refer for specialist assessment`,
			priority: 'high'
		});
	}

	if (
		data.mentalHealthScreening.edinburghScore !== null &&
		data.mentalHealthScreening.edinburghScore >= 10 &&
		data.mentalHealthScreening.edinburghScore < 13
	) {
		flags.push({
			id: 'FLAG-EPDS-002',
			category: 'Mental Health',
			message: `Edinburgh score ${data.mentalHealthScreening.edinburghScore}/30 - possible depression, further evaluation recommended`,
			priority: 'medium'
		});
	}

	// ─── Domestic violence ──────────────────────────────
	if (data.mentalHealthScreening.domesticViolenceScreen === 'yes') {
		flags.push({
			id: 'FLAG-DV-001',
			category: 'Safeguarding',
			message: 'Positive domestic violence screen - activate safeguarding protocols and refer to specialist services',
			priority: 'high'
		});
	}

	// ─── Substance use ──────────────────────────────────
	if (data.lifestyleNutrition.smoking === 'yes') {
		flags.push({
			id: 'FLAG-SMOKE-001',
			category: 'Substance Use',
			message: 'Active smoking during pregnancy - offer smoking cessation support',
			priority: 'medium'
		});
	}

	if (data.lifestyleNutrition.alcohol === 'yes') {
		flags.push({
			id: 'FLAG-ALCOHOL-001',
			category: 'Substance Use',
			message: 'Alcohol use during pregnancy - counsel on fetal alcohol spectrum disorder risk',
			priority: 'high'
		});
	}

	if (data.lifestyleNutrition.drugs === 'yes') {
		flags.push({
			id: 'FLAG-DRUGS-001',
			category: 'Substance Use',
			message: 'Drug use during pregnancy - refer to specialist substance misuse service',
			priority: 'high'
		});
	}

	// ─── Multiple gestation ─────────────────────────────
	if (data.pregnancyDetails.multipleGestation === 'yes') {
		flags.push({
			id: 'FLAG-MULTI-001',
			category: 'Multiple Pregnancy',
			message: 'Multiple gestation - requires specialist multiple pregnancy pathway',
			priority: 'medium'
		});
	}

	// ─── Placenta previa ────────────────────────────────
	if (data.pregnancyDetails.placentaLocation === 'previa') {
		flags.push({
			id: 'FLAG-PLACENTA-001',
			category: 'Placenta Previa',
			message: 'Placenta previa - plan for cesarean delivery, monitor for antepartum haemorrhage',
			priority: 'high'
		});
	}

	// ─── Previous complications ─────────────────────────
	if (data.obstetricHistory.previousComplications.pretermBirth === 'yes') {
		flags.push({
			id: 'FLAG-PRETERM-001',
			category: 'Preterm Risk',
			message: 'Previous preterm birth - consider cervical length monitoring and progesterone supplementation',
			priority: 'medium'
		});
	}

	// ─── Abnormal fetal heart rate ──────────────────────
	if (
		data.vitalSigns.fetalHeartRate !== null &&
		(data.vitalSigns.fetalHeartRate < 110 || data.vitalSigns.fetalHeartRate > 160)
	) {
		flags.push({
			id: 'FLAG-FHR-001',
			category: 'Fetal Heart Rate',
			message: `Abnormal fetal heart rate (${data.vitalSigns.fetalHeartRate} bpm) - continuous monitoring recommended`,
			priority: 'high'
		});
	}

	// ─── Anemia ─────────────────────────────────────────
	if (data.laboratoryResults.hemoglobin !== null && data.laboratoryResults.hemoglobin < 11) {
		flags.push({
			id: 'FLAG-ANEMIA-001',
			category: 'Anemia',
			message: `Low hemoglobin (${data.laboratoryResults.hemoglobin} g/dL) - iron supplementation and dietary counselling recommended`,
			priority: 'medium'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
