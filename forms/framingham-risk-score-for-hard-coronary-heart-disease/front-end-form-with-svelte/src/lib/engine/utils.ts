import type { AssessmentData } from './types';

/** Returns a human-readable label for a risk level. */
export function riskLevelLabel(level: string): string {
	switch (level) {
		case 'low':
			return 'Low Risk';
		case 'intermediate':
			return 'Intermediate Risk';
		case 'high':
			return 'High Risk';
		case 'draft':
			return 'Draft';
		default:
			return 'Unknown';
	}
}

/** Convert mmol/L to mg/dL (multiply by 38.67). */
export function convertMmolToMg(mmol: number): number {
	return mmol * 38.67;
}

/** Calculate BMI from height (cm) and weight (kg). */
export function calculateBmi(
	heightCm: number | null,
	weightKg: number | null
): number | null {
	if (heightCm === null || weightKg === null || heightCm <= 0) return null;
	const heightM = heightCm / 100;
	return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

/** Returns true if smoking_status indicates current smoker. */
export function isSmoker(status: string): boolean {
	return status === 'current';
}

/** Returns true if the assessment data is likely a draft (missing age and sex). */
export function isLikelyDraft(data: AssessmentData): boolean {
	return data.demographics.age === null && data.demographics.sex === '';
}

/** Risk level colour class for display. */
export function riskLevelColor(level: string): string {
	switch (level) {
		case 'low':
			return 'bg-green-100 text-green-800 border-green-300';
		case 'intermediate':
			return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		case 'high':
			return 'bg-red-100 text-red-800 border-red-300';
		default:
			return 'bg-gray-100 text-gray-700 border-gray-300';
	}
}

/**
 * Calculate the Framingham 10-year risk of hard CHD using the Wilson/D'Agostino
 * 1998 Cox regression model with sex-specific coefficients.
 *
 * Returns the 10-year risk as a percentage (0.0 to 100.0).
 */
export function calculateFraminghamRisk(data: AssessmentData): number {
	const age = data.demographics.age;
	if (age === null) return 0.0;

	const sex = data.demographics.sex;
	if (!sex) return 0.0;

	// Get cholesterol values, converting from mmol/L if needed
	let totalChol = data.cholesterol.totalCholesterol ?? 200.0;
	let hdlChol = data.cholesterol.hdlCholesterol ?? 50.0;

	if (data.cholesterol.cholesterolUnit === 'mmolL') {
		totalChol = convertMmolToMg(totalChol);
		hdlChol = convertMmolToMg(hdlChol);
	}

	const sbp = data.bloodPressure.systolicBp ?? 120.0;
	const treated = data.bloodPressure.onBpTreatment === 'yes';
	const smoker = isSmoker(data.smokingHistory.smokingStatus);

	const lnAge = Math.log(age);
	const lnTc = Math.log(totalChol);
	const lnHdl = Math.log(hdlChol);
	const lnSbp = Math.log(sbp);

	if (sex === 'male') {
		// Male coefficients
		const lnSbpCoeff = treated ? 1.305784 + 0.241549 : 1.305784;

		// Age cap for smoker interaction: cap at 70 for males
		const ageForSmokeInteraction = age > 70 ? 70 : age;
		const lnAgeSmoke = Math.log(ageForSmokeInteraction);

		const l =
			52.00961 * lnAge +
			20.014077 * lnTc +
			-0.905964 * lnHdl +
			lnSbpCoeff * lnSbp +
			(smoker ? 12.096316 : 0.0) +
			-4.605038 * lnAge * lnTc +
			(smoker ? -2.84367 * lnAgeSmoke : 0.0) +
			-2.93323 * lnAge * lnAge +
			-172.300168;

		const risk = 1.0 - Math.pow(0.9402, Math.exp(l));
		return Math.max(0, Math.min(100, risk * 100));
	} else {
		// Female coefficients
		const lnSbpCoeff = treated ? 2.552905 + 0.420251 : 2.552905;

		// Age cap for smoker interaction: cap at 78 for females
		const ageForSmokeInteraction = age > 78 ? 78 : age;
		const lnAgeSmoke = Math.log(ageForSmokeInteraction);

		const l =
			31.764001 * lnAge +
			22.465206 * lnTc +
			-1.187731 * lnHdl +
			lnSbpCoeff * lnSbp +
			(smoker ? 13.07543 : 0.0) +
			-5.060998 * lnAge * lnTc +
			(smoker ? -2.996945 * lnAgeSmoke : 0.0) +
			-146.5933061;

		const risk = 1.0 - Math.pow(0.98767, Math.exp(l));
		return Math.max(0, Math.min(100, risk * 100));
	}
}
