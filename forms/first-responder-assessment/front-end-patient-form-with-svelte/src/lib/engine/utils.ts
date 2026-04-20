import type { CompetencyLevel, FitnessDecision, RiskLevel } from './types';

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

/** Competency level numeric value (1-4). */
export function competencyToNumber(level: CompetencyLevel): number {
	switch (level) {
		case 'not-competent':
			return 1;
		case 'developing':
			return 2;
		case 'competent':
			return 3;
		case 'expert':
			return 4;
		default:
			return 0;
	}
}

/** Competency level label. */
export function competencyLabel(level: CompetencyLevel): string {
	switch (level) {
		case 'not-competent':
			return 'Not Competent';
		case 'developing':
			return 'Developing';
		case 'competent':
			return 'Competent';
		case 'expert':
			return 'Expert';
		default:
			return 'Not assessed';
	}
}

/** Competency level colour class. */
export function competencyColor(level: CompetencyLevel): string {
	switch (level) {
		case 'not-competent':
			return 'bg-red-100 text-red-800 border-red-300';
		case 'developing':
			return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		case 'competent':
			return 'bg-green-100 text-green-800 border-green-300';
		case 'expert':
			return 'bg-blue-100 text-blue-800 border-blue-300';
		default:
			return 'bg-gray-100 text-gray-800 border-gray-300';
	}
}

/** Fitness decision label. */
export function fitnessDecisionLabel(decision: FitnessDecision): string {
	switch (decision) {
		case 'fit-for-duty':
			return 'Fit for Duty';
		case 'fit-with-restrictions':
			return 'Fit with Restrictions';
		case 'temporarily-unfit':
			return 'Temporarily Unfit';
		case 'permanently-unfit':
			return 'Permanently Unfit';
		default:
			return 'Not determined';
	}
}

/** Fitness decision colour class. */
export function fitnessDecisionColor(decision: FitnessDecision): string {
	switch (decision) {
		case 'fit-for-duty':
			return 'bg-green-100 text-green-800 border-green-300';
		case 'fit-with-restrictions':
			return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		case 'temporarily-unfit':
			return 'bg-orange-100 text-orange-800 border-orange-300';
		case 'permanently-unfit':
			return 'bg-red-100 text-red-800 border-red-300';
		default:
			return 'bg-gray-100 text-gray-800 border-gray-300';
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

/** Grade label (used by Badge component). */
export function gradeLabel(grade: number): string {
	switch (grade) {
		case 1:
			return 'Grade 1 - Minor';
		case 2:
			return 'Grade 2 - Moderate';
		case 3:
			return 'Grade 3 - Significant';
		case 4:
			return 'Grade 4 - Critical';
		default:
			return `Grade ${grade}`;
	}
}

/** Grade colour class (used by Badge component). */
export function gradeColor(grade: number): string {
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

/** Aggregate an array of competency levels into a single domain level. Uses the lowest (worst) competency. */
export function aggregateCompetency(levels: CompetencyLevel[]): CompetencyLevel {
	const valid = levels.filter((l) => l !== '');
	if (valid.length === 0) return '';
	const nums = valid.map(competencyToNumber);
	const minVal = Math.min(...nums);
	switch (minVal) {
		case 1:
			return 'not-competent';
		case 2:
			return 'developing';
		case 3:
			return 'competent';
		case 4:
			return 'expert';
		default:
			return '';
	}
}
