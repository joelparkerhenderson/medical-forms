import type { CCSClass, NYHAClass, RiskLevel } from './types';

/** Calculate BMI from weight (kg) and height (cm). Returns null if inputs are invalid. */
export function calculateBMI(weightKg: number | null, heightCm: number | null): number | null {
	if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) return null;
	const heightM = heightCm / 100;
	return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

/** Estimate METs from exercise tolerance category. */
export function estimateMETs(
	tolerance:
		| 'unable'
		| 'light-housework'
		| 'climb-stairs'
		| 'moderate-exercise'
		| 'vigorous-exercise'
		| ''
): number | null {
	switch (tolerance) {
		case 'unable':
			return 1;
		case 'light-housework':
			return 2;
		case 'climb-stairs':
			return 4;
		case 'moderate-exercise':
			return 7;
		case 'vigorous-exercise':
			return 10;
		default:
			return null;
	}
}

/** Get BMI category label. */
export function bmiCategory(bmi: number | null): string {
	if (bmi === null) return '';
	if (bmi < 18.5) return 'Underweight';
	if (bmi < 25) return 'Normal';
	if (bmi < 30) return 'Overweight';
	if (bmi < 35) return 'Obese Class I';
	if (bmi < 40) return 'Obese Class II';
	return 'Obese Class III (Morbid)';
}

/** Calculate age from date of birth string. */
export function calculateAge(dob: string): number | null {
	if (!dob) return null;
	const birth = new Date(dob);
	if (isNaN(birth.getTime())) return null;
	const today = new Date();
	let age = today.getFullYear() - birth.getFullYear();
	const m = today.getMonth() - birth.getMonth();
	if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
		age--;
	}
	return age;
}

/** CCS Angina Classification label. */
export function ccsClassLabel(ccsClass: CCSClass | null): string {
	switch (ccsClass) {
		case 1:
			return 'CCS I - Angina only with strenuous exertion';
		case 2:
			return 'CCS II - Slight limitation of ordinary activity';
		case 3:
			return 'CCS III - Marked limitation of ordinary activity';
		case 4:
			return 'CCS IV - Angina at rest';
		default:
			return 'Not classified';
	}
}

/** NYHA Heart Failure Classification label. */
export function nyhaClassLabel(nyhaClass: NYHAClass | null): string {
	switch (nyhaClass) {
		case 1:
			return 'NYHA I - No limitation';
		case 2:
			return 'NYHA II - Slight limitation';
		case 3:
			return 'NYHA III - Marked limitation';
		case 4:
			return 'NYHA IV - Symptoms at rest';
		default:
			return 'Not classified';
	}
}

/** Overall risk level label. */
export function riskLevelLabel(risk: RiskLevel): string {
	switch (risk) {
		case 'low':
			return 'Low Risk';
		case 'moderate':
			return 'Moderate Risk';
		case 'high':
			return 'High Risk';
		case 'critical':
			return 'Critical Risk';
	}
}

/** Cardiology classification label (used by Badge component). */
export function cardioClassLabel(grade: number): string {
	switch (grade) {
		case 1:
			return 'Class I - Minimal';
		case 2:
			return 'Class II - Mild';
		case 3:
			return 'Class III - Moderate';
		case 4:
			return 'Class IV - Severe';
		default:
			return `Class ${grade}`;
	}
}

/** Cardiology classification colour class (used by Badge component). */
export function cardioClassColor(grade: number): string {
	switch (grade) {
		case 1:
			return 'bg-green-100 text-green-800 border-green-300';
		case 2:
			return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		case 3:
			return 'bg-orange-100 text-orange-800 border-orange-300';
		case 4:
			return 'bg-red-100 text-red-800 border-red-300';
		default:
			return 'bg-gray-100 text-gray-800 border-gray-300';
	}
}

/** Risk level colour class. */
export function riskLevelColor(risk: RiskLevel): string {
	switch (risk) {
		case 'low':
			return 'bg-green-100 text-green-800 border-green-300';
		case 'moderate':
			return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		case 'high':
			return 'bg-orange-100 text-orange-800 border-orange-300';
		case 'critical':
			return 'bg-red-100 text-red-800 border-red-300';
	}
}
