import type { ControlLevel } from './types';

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

/** Classify ACT score into control level. */
export function classifyACTScore(score: number): ControlLevel {
	if (score === 25) return 'well-controlled';
	if (score >= 20) return 'well-controlled-but-could-be-better';
	if (score >= 16) return 'not-well-controlled';
	return 'very-poorly-controlled';
}

/** ACT score label for display. */
export function actScoreLabel(score: number): string {
	if (score === 25) return 'Well Controlled (25)';
	if (score >= 20) return `Well Controlled, Could Be Better (${score})`;
	if (score >= 16) return `Not Well Controlled (${score})`;
	return `Very Poorly Controlled (${score})`;
}

/** ACT score colour class. */
export function actScoreColor(score: number): string {
	if (score === 25) return 'bg-green-100 text-green-800 border-green-300';
	if (score >= 20) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
	if (score >= 16) return 'bg-orange-100 text-orange-800 border-orange-300';
	return 'bg-red-100 text-red-800 border-red-300';
}

/** Control level label for display. */
export function controlLevelLabel(level: ControlLevel): string {
	switch (level) {
		case 'well-controlled':
			return 'Well Controlled';
		case 'well-controlled-but-could-be-better':
			return 'Well Controlled, Could Be Better';
		case 'not-well-controlled':
			return 'Not Well Controlled';
		case 'very-poorly-controlled':
			return 'Very Poorly Controlled';
	}
}

/** Calculate peak flow percentage from current and best values. */
export function calculatePeakFlowPercent(current: number | null, best: number | null): number | null {
	if (!current || !best || best <= 0) return null;
	return Math.round((current / best) * 100);
}

/** Classify FEV1 percentage into severity. */
export function fev1Severity(fev1Percent: number | null): string {
	if (fev1Percent === null) return '';
	if (fev1Percent >= 80) return 'Normal';
	if (fev1Percent >= 60) return 'Mild obstruction';
	if (fev1Percent >= 40) return 'Moderate obstruction';
	return 'Severe obstruction';
}
