import type { AssessmentData, RiskCategory } from './types.js';

/** Returns a human-readable label for a risk category. */
export function riskCategoryLabel(category: RiskCategory | string): string {
	switch (category) {
		case 'veryHigh':
			return 'Very High Risk';
		case 'high':
			return 'High Risk';
		case 'moderate':
			return 'Moderate Risk';
		case 'low':
			return 'Low Risk';
		case 'draft':
			return 'Draft';
		default:
			return 'Unknown';
	}
}

/** Calculate BMI from height (cm) and weight (kg). */
export function calculateBmi(heightCm: number | null, weightKg: number | null): number | null {
	if (heightCm == null || weightKg == null || heightCm <= 0) return null;
	const hM = heightCm / 100;
	return Math.round((weightKg / (hM * hM)) * 10) / 10;
}

/** Calculate age from date of birth (YYYY-MM-DD format). */
export function calculateAge(dob: string): number | null {
	const parts = dob.split('-');
	if (parts.length !== 3) return null;
	const year = parseInt(parts[0], 10);
	const month = parseInt(parts[1], 10);
	const day = parseInt(parts[2], 10);
	if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

	const now = new Date();
	let age = now.getFullYear() - year;
	const nowMonth = now.getMonth() + 1;
	const nowDay = now.getDate();
	if (nowMonth < month || (nowMonth === month && nowDay < day)) {
		age--;
	}
	return age;
}

/** Calculate diabetes duration from explicit value or age minus diagnosis age. */
export function diabetesDuration(data: AssessmentData): number | null {
	if (data.diabetesHistory.diabetesDurationYears != null) {
		return data.diabetesHistory.diabetesDurationYears;
	}
	const age = calculateAge(data.patientDemographics.dateOfBirth);
	if (age == null || data.diabetesHistory.ageAtDiagnosis == null) return null;
	return age - data.diabetesHistory.ageAtDiagnosis;
}

/** Check if patient has established cardiovascular disease. */
export function hasEstablishedCvd(data: AssessmentData): boolean {
	const cv = data.cardiovascularHistory;
	return (
		cv.previousMi === 'yes' ||
		cv.previousStroke === 'yes' ||
		cv.previousTia === 'yes' ||
		cv.peripheralArterialDisease === 'yes' ||
		cv.heartFailure === 'yes'
	);
}

/** Convert HbA1c percent to mmol/mol if needed. */
export function hba1cMmolMol(data: AssessmentData): number | null {
	const val = data.diabetesHistory.hba1cValue;
	if (val == null) return null;
	if (data.diabetesHistory.hba1cUnit === 'percent') {
		// IFCC formula: mmol/mol = (% - 2.15) * 10.929
		return Math.round((val - 2.15) * 10.929 * 10) / 10;
	}
	return val;
}

/** Determine CKD stage from eGFR. */
export function ckdStageFromEgfr(egfr: number | null): string {
	if (egfr == null) return '';
	if (egfr >= 90) return 'G1';
	if (egfr >= 60) return 'G2';
	if (egfr >= 45) return 'G3a';
	if (egfr >= 30) return 'G3b';
	if (egfr >= 15) return 'G4';
	return 'G5';
}

/** Check if the assessment is likely still a draft. */
export function isLikelyDraft(data: AssessmentData): boolean {
	return (
		data.patientDemographics.fullName.trim() === '' &&
		data.patientDemographics.dateOfBirth === '' &&
		data.diabetesHistory.hba1cValue == null &&
		data.bloodPressure.systolicBp == null
	);
}

/** CSS colour class for a risk category. */
export function riskCategoryColor(category: RiskCategory | string): string {
	switch (category) {
		case 'veryHigh':
			return 'text-risk-very-high';
		case 'high':
			return 'text-risk-high';
		case 'moderate':
			return 'text-risk-moderate';
		case 'low':
			return 'text-risk-low';
		case 'draft':
			return 'text-risk-draft';
		default:
			return 'text-gray-500';
	}
}

/** Background colour class for a risk category badge. */
export function riskCategoryBgColor(category: RiskCategory | string): string {
	switch (category) {
		case 'veryHigh':
			return 'bg-risk-very-high text-white';
		case 'high':
			return 'bg-risk-high text-white';
		case 'moderate':
			return 'bg-risk-moderate text-white';
		case 'low':
			return 'bg-risk-low text-white';
		case 'draft':
			return 'bg-risk-draft text-white';
		default:
			return 'bg-gray-400 text-white';
	}
}
