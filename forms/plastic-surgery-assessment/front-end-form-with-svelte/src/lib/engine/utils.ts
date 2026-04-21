import type { ASAClass, WoundClass, ComplexityScore, RiskLevel } from './types';

/** Calculate BMI from weight (kg) and height (cm). Returns null if inputs are invalid. */
export function calculateBMI(weightKg: number | null, heightCm: number | null): number | null {
	if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) return null;
	const heightM = heightCm / 100;
	return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
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

/** ASA Physical Status Classification label. */
export function asaClassLabel(asaClass: ASAClass | null): string {
	switch (asaClass) {
		case 1:
			return 'ASA I - Normal healthy patient';
		case 2:
			return 'ASA II - Mild systemic disease';
		case 3:
			return 'ASA III - Severe systemic disease';
		case 4:
			return 'ASA IV - Severe systemic disease, constant threat to life';
		case 5:
			return 'ASA V - Moribund patient';
		default:
			return 'Not classified';
	}
}

/** Wound Classification label. */
export function woundClassLabel(woundClass: WoundClass | null): string {
	switch (woundClass) {
		case 1:
			return 'Class I - Clean';
		case 2:
			return 'Class II - Clean-Contaminated';
		case 3:
			return 'Class III - Contaminated';
		case 4:
			return 'Class IV - Dirty/Infected';
		default:
			return 'Not classified';
	}
}

/** Surgical Complexity Score label. */
export function complexityLabel(score: ComplexityScore | null): string {
	switch (score) {
		case 1:
			return 'Complexity 1 - Minor';
		case 2:
			return 'Complexity 2 - Intermediate';
		case 3:
			return 'Complexity 3 - Major';
		case 4:
			return 'Complexity 4 - Major Plus / Emergency';
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

/** Grade classification label (used by Badge component). */
export function gradeClassLabel(grade: number): string {
	switch (grade) {
		case 1:
			return 'Grade 1 - Minimal';
		case 2:
			return 'Grade 2 - Mild';
		case 3:
			return 'Grade 3 - Moderate';
		case 4:
			return 'Grade 4 - Severe';
		default:
			return `Grade ${grade}`;
	}
}

/** Grade classification colour class (used by Badge component). */
export function gradeClassColor(grade: number): string {
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
