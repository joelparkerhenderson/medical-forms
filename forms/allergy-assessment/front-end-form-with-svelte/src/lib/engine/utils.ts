import type { AssessmentData, AllergyReactionSeverity } from './types';

/** Calculate BMI from weight (kg) and height (cm). Returns null if inputs are invalid. */
export function calculateBMI(weightKg: number | null, heightCm: number | null): number | null {
	if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) return null;
	const heightM = heightCm / 100;
	return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
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

/** Severity level label. */
export function severityLabel(level: string): string {
	switch (level) {
		case 'mild':
			return 'Mild - Localised reactions only';
		case 'moderate':
			return 'Moderate - Systemic, non-life-threatening';
		case 'severe':
			return 'Severe - Anaphylaxis risk';
		default:
			return `Severity: ${level}`;
	}
}

/** Severity level colour class. */
export function severityColor(level: string): string {
	switch (level) {
		case 'mild':
			return 'bg-green-100 text-green-800 border-green-300';
		case 'moderate':
			return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		case 'severe':
			return 'bg-red-100 text-red-800 border-red-300';
		default:
			return 'bg-gray-100 text-gray-800 border-gray-300';
	}
}

/** Numeric weight for an allergy reaction severity. */
export function severityWeight(severity: AllergyReactionSeverity): number {
	switch (severity) {
		case 'mild':
			return 1;
		case 'moderate':
			return 2;
		case 'severe':
			return 3;
		case 'anaphylaxis':
			return 4;
		default:
			return 0;
	}
}

/** Calculate Allergy Burden Score: count of confirmed allergies weighted by severity. */
export function calculateAllergyBurdenScore(data: AssessmentData): number {
	let score = 0;

	for (const item of data.drugAllergies.drugAllergies) {
		if (item.allergen) {
			score += severityWeight(item.severity) || 1;
		}
	}

	for (const item of data.foodAllergies.foodAllergies) {
		if (item.allergen) {
			score += severityWeight(item.severity) || 1;
		}
	}

	// Environmental allergens count as individual allergens
	const envAllergies = data.environmentalAllergies;
	if (envAllergies.pollenAllergy === 'yes') score += 1;
	if (envAllergies.dustMiteAllergy === 'yes') score += 1;
	if (envAllergies.mouldAllergy === 'yes') score += 1;
	if (envAllergies.animalDanderAllergy === 'yes') score += 1;
	if (envAllergies.latexAllergy === 'yes') score += 2; // Latex allergy weighted higher
	if (envAllergies.insectStingAllergy === 'yes') {
		score += severityWeight(envAllergies.insectStingSeverity) || 1;
	}

	return score;
}

/** Count total confirmed allergens across all categories. */
export function countAllergens(data: AssessmentData): number {
	let count = 0;

	count += data.drugAllergies.drugAllergies.filter((a) => a.allergen).length;
	count += data.foodAllergies.foodAllergies.filter((a) => a.allergen).length;

	const env = data.environmentalAllergies;
	if (env.pollenAllergy === 'yes') count++;
	if (env.dustMiteAllergy === 'yes') count++;
	if (env.mouldAllergy === 'yes') count++;
	if (env.animalDanderAllergy === 'yes') count++;
	if (env.latexAllergy === 'yes') count++;
	if (env.insectStingAllergy === 'yes') count++;

	return count;
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
