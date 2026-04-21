import type { AssessmentData, AdditionalFlag } from './types';
import { calculateBmi, calculateFraminghamRisk, convertMmolToMg, isSmoker } from './utils';

/**
 * Detects additional flags that should be highlighted for the clinician,
 * independent of the risk score. These are actionable alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// Helper: get TC in mg/dL
	const tcMg =
		data.cholesterol.totalCholesterol !== null
			? data.cholesterol.cholesterolUnit === 'mmolL'
				? convertMmolToMg(data.cholesterol.totalCholesterol)
				: data.cholesterol.totalCholesterol
			: null;

	// Helper: get HDL in mg/dL
	const hdlMg =
		data.cholesterol.hdlCholesterol !== null
			? data.cholesterol.cholesterolUnit === 'mmolL'
				? convertMmolToMg(data.cholesterol.hdlCholesterol)
				: data.cholesterol.hdlCholesterol
			: null;

	// Helper: get effective BMI
	const bmi =
		data.lifestyleFactors.bmi ??
		calculateBmi(data.demographics.heightCm, data.demographics.weightKg);

	// ─── FLAG-ELIG-001: Age outside 30-79 range ───────────
	if (data.demographics.age !== null) {
		if (data.demographics.age < 30 || data.demographics.age > 79) {
			flags.push({
				id: 'FLAG-ELIG-001',
				category: 'Eligibility',
				message:
					'Age outside valid range (30-79) - calculator may not be applicable',
				priority: 'high'
			});
		}
	}

	// ─── FLAG-ELIG-002: Has prior CHD ─────────────────────
	if (data.medicalHistory.hasPriorChd === 'yes') {
		flags.push({
			id: 'FLAG-ELIG-002',
			category: 'Eligibility',
			message:
				'Patient has prior CHD - Framingham calculator not applicable for secondary prevention',
			priority: 'high'
		});
	}

	// ─── FLAG-ELIG-003: Has diabetes ──────────────────────
	if (data.medicalHistory.hasDiabetes === 'yes') {
		flags.push({
			id: 'FLAG-ELIG-003',
			category: 'Eligibility',
			message:
				'Patient has diabetes - use diabetes-specific risk calculator instead',
			priority: 'high'
		});
	}

	// ─── FLAG-BP-001: Systolic >= 180 ─────────────────────
	if (
		data.bloodPressure.systolicBp !== null &&
		data.bloodPressure.systolicBp >= 180.0
	) {
		flags.push({
			id: 'FLAG-BP-001',
			category: 'Blood Pressure',
			message: 'Systolic BP >= 180 mmHg - urgent evaluation needed',
			priority: 'high'
		});
	}

	// ─── FLAG-BP-002: Diastolic >= 120 ────────────────────
	if (
		data.bloodPressure.diastolicBp !== null &&
		data.bloodPressure.diastolicBp >= 120.0
	) {
		flags.push({
			id: 'FLAG-BP-002',
			category: 'Blood Pressure',
			message: 'Diastolic BP >= 120 mmHg - hypertensive emergency',
			priority: 'high'
		});
	}

	// ─── FLAG-CHOL-001: Total cholesterol >= 300 ──────────
	if (tcMg !== null && tcMg >= 300.0) {
		flags.push({
			id: 'FLAG-CHOL-001',
			category: 'Cholesterol',
			message:
				'Total cholesterol >= 300 mg/dL - severe hypercholesterolemia',
			priority: 'high'
		});
	}

	// ─── FLAG-CHOL-002: HDL < 30 ──────────────────────────
	if (hdlMg !== null && hdlMg < 30.0) {
		flags.push({
			id: 'FLAG-CHOL-002',
			category: 'Cholesterol',
			message: 'HDL < 30 mg/dL - critically low protective cholesterol',
			priority: 'high'
		});
	}

	// ─── FLAG-SMOKE-001: Current smoker ───────────────────
	if (isSmoker(data.smokingHistory.smokingStatus)) {
		flags.push({
			id: 'FLAG-SMOKE-001',
			category: 'Smoking',
			message:
				'Current smoker - smoking cessation counselling recommended',
			priority: 'medium'
		});
	}

	// ─── FLAG-BMI-001: BMI >= 40 ──────────────────────────
	if (bmi !== null && bmi >= 40.0) {
		flags.push({
			id: 'FLAG-BMI-001',
			category: 'Lifestyle',
			message:
				'BMI >= 40 (morbid obesity) - weight management referral recommended',
			priority: 'high'
		});
	}

	// ─── FLAG-FAM-001: Premature family CHD history ───────
	if (
		data.familyHistory.familyChdHistory === 'yes' &&
		data.familyHistory.familyChdAgeOnset === 'under55'
	) {
		flags.push({
			id: 'FLAG-FAM-001',
			category: 'Family History',
			message:
				'Premature family CHD history - consider enhanced screening',
			priority: 'medium'
		});
	}

	// ─── FLAG-MED-001: High risk but not on statin ────────
	const riskPct = calculateFraminghamRisk(data);
	if (riskPct >= 20.0 && data.currentMedications.onStatin !== 'yes') {
		flags.push({
			id: 'FLAG-MED-001',
			category: 'Medications',
			message:
				'High 10-year risk but not on statin therapy - consider initiating',
			priority: 'high'
		});
	}

	// ─── FLAG-MED-002: Hypertension but not on treatment ──
	if (
		data.bloodPressure.systolicBp !== null &&
		data.bloodPressure.systolicBp >= 140.0 &&
		data.bloodPressure.onBpTreatment !== 'yes'
	) {
		flags.push({
			id: 'FLAG-MED-002',
			category: 'Medications',
			message:
				'Hypertension detected but not on antihypertensive treatment',
			priority: 'medium'
		});
	}

	// ─── FLAG-LIFE-001: Sedentary + obese ─────────────────
	if (
		data.lifestyleFactors.physicalActivity === 'sedentary' &&
		bmi !== null &&
		bmi >= 30.0
	) {
		flags.push({
			id: 'FLAG-LIFE-001',
			category: 'Lifestyle',
			message:
				'Sedentary lifestyle combined with obesity - lifestyle intervention needed',
			priority: 'medium'
		});
	}

	// ─── FLAG-AGE-001: Age >= 75 ──────────────────────────
	if (data.demographics.age !== null && data.demographics.age >= 75) {
		flags.push({
			id: 'FLAG-AGE-001',
			category: 'Demographics',
			message:
				'Age >= 75 - limited evidence for Framingham risk prediction in this age group',
			priority: 'medium'
		});
	}

	// Sort: high > medium > low
	const priorityOrder: Record<string, number> = {
		high: 0,
		medium: 1,
		low: 2
	};
	flags.sort(
		(a, b) => (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3)
	);

	return flags;
}
