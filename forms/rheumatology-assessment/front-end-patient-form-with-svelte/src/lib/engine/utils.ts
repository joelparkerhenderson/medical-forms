import type { DiseaseActivity } from './types';

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

/** Classify disease activity from DAS28 score. */
export function classifyDiseaseActivity(das28: number | null): DiseaseActivity | null {
	if (das28 === null) return null;
	if (das28 < 2.6) return 'remission';
	if (das28 < 3.2) return 'low';
	if (das28 <= 5.1) return 'moderate';
	return 'high';
}

/** DAS28 disease activity label. */
export function das28Label(score: number | null): string {
	if (score === null) return 'Not calculated';
	const activity = classifyDiseaseActivity(score);
	switch (activity) {
		case 'remission':
			return `DAS28 ${score.toFixed(2)} - Remission`;
		case 'low':
			return `DAS28 ${score.toFixed(2)} - Low Disease Activity`;
		case 'moderate':
			return `DAS28 ${score.toFixed(2)} - Moderate Disease Activity`;
		case 'high':
			return `DAS28 ${score.toFixed(2)} - High Disease Activity`;
		default:
			return `DAS28 ${score.toFixed(2)}`;
	}
}

/** DAS28 disease activity colour class. */
export function das28Color(score: number | null): string {
	if (score === null) return 'bg-gray-100 text-gray-800 border-gray-300';
	const activity = classifyDiseaseActivity(score);
	switch (activity) {
		case 'remission':
			return 'bg-green-100 text-green-800 border-green-300';
		case 'low':
			return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		case 'moderate':
			return 'bg-orange-100 text-orange-800 border-orange-300';
		case 'high':
			return 'bg-red-100 text-red-800 border-red-300';
		default:
			return 'bg-gray-100 text-gray-800 border-gray-300';
	}
}

/** Disease activity label without score for display. */
export function diseaseActivityLabel(activity: DiseaseActivity | null): string {
	switch (activity) {
		case 'remission':
			return 'Remission';
		case 'low':
			return 'Low Disease Activity';
		case 'moderate':
			return 'Moderate Disease Activity';
		case 'high':
			return 'High Disease Activity';
		default:
			return 'Not calculated';
	}
}
