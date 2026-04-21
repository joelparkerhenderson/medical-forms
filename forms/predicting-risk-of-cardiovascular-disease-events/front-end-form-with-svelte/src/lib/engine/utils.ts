import type { AssessmentData } from './types';

/** Returns a human-readable label for a risk category. */
export function riskCategoryLabel(level: string): string {
	switch (level) {
		case 'low':
			return 'Low Risk';
		case 'borderline':
			return 'Borderline Risk';
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

/** Returns Tailwind classes for risk category colouring. */
export function riskCategoryColor(level: string): string {
	switch (level) {
		case 'low':
			return 'bg-green-100 text-green-800 border-green-300';
		case 'borderline':
			return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		case 'intermediate':
			return 'bg-orange-100 text-orange-800 border-orange-300';
		case 'high':
			return 'bg-red-100 text-red-800 border-red-300';
		case 'draft':
			return 'bg-gray-100 text-gray-600 border-gray-300';
		default:
			return 'bg-gray-100 text-gray-600 border-gray-300';
	}
}

/** Calculate BMI from height (cm) and weight (kg). */
export function calculateBmi(heightCm: number | null, weightKg: number | null): number | null {
	if (heightCm === null || weightKg === null || heightCm <= 0) return null;
	const heightM = heightCm / 100.0;
	return Math.round((weightKg / (heightM * heightM)) * 10.0) / 10.0;
}

/** Determine if the patient is a current smoker based on smoking status string. */
export function isSmoker(status: string): boolean {
	const lower = status.toLowerCase();
	return lower === 'current' || lower === 'yes' || lower === 'currentsmoker';
}

/** Check if the assessment is likely a draft (missing key required fields). */
export function isLikelyDraft(data: AssessmentData): boolean {
	return data.demographics.age === null && data.demographics.sex === '';
}

/**
 * Convert HbA1c from mmol/mol to percent if needed.
 * If unit is "mmolMol", converts using IFCC formula: % = (mmol/mol / 10.929) + 2.15
 * Otherwise returns value as-is (assumed to be in %).
 */
export function hba1cToPercent(value: number | null, unit: string): number | null {
	if (value === null) return null;
	if (unit === 'mmolMol' || unit === 'mmol/mol') {
		return value / 10.929 + 2.15;
	}
	return value;
}

/**
 * Estimate 10-year CVD risk using a point-based scoring system
 * that approximates the PREVENT Base model outcomes.
 */
export function estimateTenYearRisk(data: AssessmentData): number {
	const age = data.demographics.age;
	if (age === null) return 0.0;

	const isMale = data.demographics.sex.toLowerCase() === 'male';

	// Base points by age and sex
	let points: number;
	if (isMale) {
		if (age >= 75) points = 16.0;
		else if (age >= 70) points = 14.0;
		else if (age >= 65) points = 12.0;
		else if (age >= 60) points = 10.0;
		else if (age >= 55) points = 8.0;
		else if (age >= 50) points = 6.0;
		else if (age >= 45) points = 4.0;
		else if (age >= 40) points = 2.0;
		else if (age >= 30) points = 0.0;
		else points = 0.0;
	} else {
		if (age >= 75) points = 13.0;
		else if (age >= 70) points = 11.0;
		else if (age >= 65) points = 9.0;
		else if (age >= 60) points = 7.0;
		else if (age >= 55) points = 5.0;
		else if (age >= 50) points = 4.0;
		else if (age >= 45) points = 2.0;
		else if (age >= 40) points = 1.0;
		else if (age >= 30) points = 0.0;
		else points = 0.0;
	}

	// Total cholesterol points
	const tc = data.cholesterolLipids.totalCholesterol;
	if (tc !== null) {
		if (tc >= 280.0) points += 3.0;
		else if (tc >= 240.0) points += 2.0;
		else if (tc >= 200.0) points += 1.0;
	}

	// HDL cholesterol (inverse relationship)
	const hdl = data.cholesterolLipids.hdlCholesterol;
	if (hdl !== null) {
		if (hdl < 35.0) points += 3.0;
		else if (hdl < 40.0) points += 2.0;
		else if (hdl < 50.0) points += 1.0;
		else if (hdl >= 60.0) points -= 1.0;
	}

	// Systolic BP points
	const sbp = data.bloodPressure.systolicBp;
	if (sbp !== null) {
		if (sbp >= 180.0) points += 5.0;
		else if (sbp >= 160.0) points += 4.0;
		else if (sbp >= 140.0) points += 3.0;
		else if (sbp >= 130.0) points += 2.0;
		else if (sbp >= 120.0) points += 1.0;
	}

	// Diabetes
	if (data.metabolicHealth.hasDiabetes === 'yes') {
		points += 3.0;
	}

	// Current smoking
	if (isSmoker(data.smokingHistory.smokingStatus)) {
		points += 3.0;
	}

	// eGFR (renal function)
	const egfr = data.renalFunction.egfr;
	if (egfr !== null) {
		if (egfr < 30.0) points += 4.0;
		else if (egfr < 45.0) points += 3.0;
		else if (egfr < 60.0) points += 2.0;
		else if (egfr < 90.0) points += 1.0;
	}

	// BMI (use provided BMI or calculate from height/weight)
	const bmi = data.metabolicHealth.bmi ?? calculateBmi(data.demographics.heightCm, data.demographics.weightKg);
	if (bmi !== null) {
		if (bmi >= 35.0) points += 3.0;
		else if (bmi >= 30.0) points += 2.0;
		else if (bmi >= 25.0) points += 1.0;
	}

	// Antihypertensive use
	if (data.bloodPressure.onAntihypertensive === 'yes') {
		points += 1.0;
	}

	// Statin use (treated indicates known risk, but also mitigates)
	if (data.cholesterolLipids.onStatin === 'yes') {
		points += 0.5;
	}

	// Convert points to approximate 10-year risk percentage
	// Using a scaled exponential mapping that approximates PREVENT outcomes:
	// ~0 points -> ~1%, ~8 points -> ~3%, ~12 points -> ~5%, ~16 points -> ~10%,
	// ~20 points -> ~20%, ~25+ points -> ~40%+
	let risk = 0.5 * Math.exp(0.18 * points);

	// Round to 1 decimal place and clamp
	risk = Math.round(risk * 10.0) / 10.0;
	return Math.max(0.1, Math.min(95.0, risk));
}

/**
 * Estimate 30-year risk from 10-year risk.
 * Approximation: 30-year risk = 10-year risk * 2.5, capped at 95%.
 */
export function estimateThirtyYearRisk(tenYear: number): number {
	let thirty = tenYear * 2.5;
	thirty = Math.round(thirty * 10.0) / 10.0;
	return Math.min(95.0, thirty);
}
