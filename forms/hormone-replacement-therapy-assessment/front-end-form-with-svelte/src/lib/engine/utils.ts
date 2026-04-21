import type { MRSSeverity, HRTRiskClassification } from './types';

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

/** MRS severity label with score range. */
export function mrsSeverityLabel(severity: MRSSeverity): string {
	switch (severity) {
		case 'No/Minimal':
			return 'No/Minimal Symptoms (0-4)';
		case 'Mild':
			return 'Mild Symptoms (5-8)';
		case 'Moderate':
			return 'Moderate Symptoms (9-15)';
		case 'Severe':
			return 'Severe Symptoms (16-44)';
		default:
			return severity;
	}
}

/** MRS severity colour class. */
export function mrsSeverityColor(severity: MRSSeverity): string {
	switch (severity) {
		case 'No/Minimal':
			return 'bg-green-100 text-green-800 border-green-300';
		case 'Mild':
			return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		case 'Moderate':
			return 'bg-orange-100 text-orange-800 border-orange-300';
		case 'Severe':
			return 'bg-red-100 text-red-800 border-red-300';
		default:
			return 'bg-gray-100 text-gray-800 border-gray-300';
	}
}

/** HRT risk classification label. */
export function riskClassificationLabel(classification: HRTRiskClassification): string {
	switch (classification) {
		case 'Favourable':
			return 'Favourable - Benefits likely outweigh risks';
		case 'Acceptable':
			return 'Acceptable - Benefits may outweigh risks with monitoring';
		case 'Cautious':
			return 'Cautious - Careful risk-benefit analysis required';
		case 'Contraindicated':
			return 'Contraindicated - Absolute contraindication(s) present';
		default:
			return classification;
	}
}

/** HRT risk classification colour class. */
export function riskClassificationColor(classification: HRTRiskClassification): string {
	switch (classification) {
		case 'Favourable':
			return 'bg-green-100 text-green-800 border-green-300';
		case 'Acceptable':
			return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		case 'Cautious':
			return 'bg-orange-100 text-orange-800 border-orange-300';
		case 'Contraindicated':
			return 'bg-red-100 text-red-800 border-red-300';
		default:
			return 'bg-gray-100 text-gray-800 border-gray-300';
	}
}

/** MRS item score label. */
export function mrsScoreLabel(score: number): string {
	switch (score) {
		case 0:
			return 'None (0)';
		case 1:
			return 'Mild (1)';
		case 2:
			return 'Moderate (2)';
		case 3:
			return 'Severe (3)';
		case 4:
			return 'Very Severe (4)';
		default:
			return `${score}`;
	}
}
