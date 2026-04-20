import type { AuditRiskCategory, DastRiskCategory, RiskLevel } from './types';

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

/** Calculate AUDIT total score from individual question scores. */
export function calculateAuditScore(q: {
	auditQ1Frequency: number;
	auditQ2TypicalQuantity: number;
	auditQ3BingeFrequency: number;
	auditQ4ImpairedControl: number;
	auditQ5FailedExpectations: number;
	auditQ6MorningDrinking: number;
	auditQ7Guilt: number;
	auditQ8Blackout: number;
	auditQ9Injury: number;
	auditQ10Concern: number;
}): number {
	return (
		q.auditQ1Frequency +
		q.auditQ2TypicalQuantity +
		q.auditQ3BingeFrequency +
		q.auditQ4ImpairedControl +
		q.auditQ5FailedExpectations +
		q.auditQ6MorningDrinking +
		q.auditQ7Guilt +
		q.auditQ8Blackout +
		q.auditQ9Injury +
		q.auditQ10Concern
	);
}

/** Derive AUDIT risk category from total score. */
export function auditRiskCategory(score: number): AuditRiskCategory {
	if (score <= 7) return 'low-risk';
	if (score <= 15) return 'hazardous';
	if (score <= 19) return 'harmful';
	return 'dependence-likely';
}

/** Calculate DAST-10 total score from yes/no answers. Q3 is inversely scored. */
export function calculateDastScore(q: {
	dastQ1NonMedicalUse: string;
	dastQ2PolyDrug: string;
	dastQ3AbleToStop: string;
	dastQ4Blackouts: string;
	dastQ5Guilt: string;
	dastQ6Complaints: string;
	dastQ7Neglect: string;
	dastQ8IllegalActivities: string;
	dastQ9Withdrawal: string;
	dastQ10MedicalProblems: string;
}): number {
	let score = 0;
	if (q.dastQ1NonMedicalUse === 'yes') score++;
	if (q.dastQ2PolyDrug === 'yes') score++;
	if (q.dastQ3AbleToStop === 'no') score++; // inversely scored
	if (q.dastQ4Blackouts === 'yes') score++;
	if (q.dastQ5Guilt === 'yes') score++;
	if (q.dastQ6Complaints === 'yes') score++;
	if (q.dastQ7Neglect === 'yes') score++;
	if (q.dastQ8IllegalActivities === 'yes') score++;
	if (q.dastQ9Withdrawal === 'yes') score++;
	if (q.dastQ10MedicalProblems === 'yes') score++;
	return score;
}

/** Derive DAST-10 risk category from total score. */
export function dastRiskCategory(score: number): DastRiskCategory {
	if (score === 0) return 'no-problems';
	if (score <= 2) return 'low';
	if (score <= 5) return 'moderate';
	if (score <= 8) return 'substantial';
	return 'severe';
}

/** AUDIT risk category label. */
export function auditRiskLabel(category: AuditRiskCategory): string {
	switch (category) {
		case 'low-risk':
			return 'Low Risk (0-7)';
		case 'hazardous':
			return 'Hazardous (8-15)';
		case 'harmful':
			return 'Harmful (16-19)';
		case 'dependence-likely':
			return 'Dependence Likely (20-40)';
		default:
			return 'Not scored';
	}
}

/** DAST risk category label. */
export function dastRiskLabel(category: DastRiskCategory): string {
	switch (category) {
		case 'no-problems':
			return 'No Problems (0)';
		case 'low':
			return 'Low Level (1-2)';
		case 'moderate':
			return 'Moderate Level (3-5)';
		case 'substantial':
			return 'Substantial Level (6-8)';
		case 'severe':
			return 'Severe Level (9-10)';
		default:
			return 'Not scored';
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

/** Substance grade label (used by Badge component). */
export function substanceGradeLabel(grade: number): string {
	switch (grade) {
		case 1:
			return 'Grade I - Minimal';
		case 2:
			return 'Grade II - Mild';
		case 3:
			return 'Grade III - Moderate';
		case 4:
			return 'Grade IV - Severe';
		default:
			return `Grade ${grade}`;
	}
}

/** Substance grade colour class (used by Badge component). */
export function substanceGradeColor(grade: number): string {
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
