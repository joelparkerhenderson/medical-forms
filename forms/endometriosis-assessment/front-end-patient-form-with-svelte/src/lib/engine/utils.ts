import type { ASRMStage, SeverityLevel } from './types';

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

/** ASRM Stage label. */
export function asrmStageLabel(stage: ASRMStage | null): string {
	switch (stage) {
		case 1:
			return 'Stage I - Minimal (1-5 points)';
		case 2:
			return 'Stage II - Mild (6-15 points)';
		case 3:
			return 'Stage III - Moderate (16-40 points)';
		case 4:
			return 'Stage IV - Severe (>40 points)';
		default:
			return 'Not staged';
	}
}

/** ASRM Stage short label. */
export function asrmStageShort(stage: ASRMStage | null): string {
	switch (stage) {
		case 1:
			return 'Stage I';
		case 2:
			return 'Stage II';
		case 3:
			return 'Stage III';
		case 4:
			return 'Stage IV';
		default:
			return 'N/A';
	}
}

/** EHP-30 score interpretation. */
export function ehp30Label(score: number | null): string {
	if (score === null) return 'Not assessed';
	if (score <= 25) return 'Minimal impact';
	if (score <= 50) return 'Moderate impact';
	if (score <= 75) return 'Significant impact';
	return 'Severe impact';
}

/** Overall severity label. */
export function severityLabel(severity: SeverityLevel): string {
	switch (severity) {
		case 'mild':
			return 'Mild';
		case 'moderate':
			return 'Moderate';
		case 'severe':
			return 'Severe';
		case 'critical':
			return 'Critical';
	}
}

/** Endometriosis grading colour class (used by Badge component). */
export function endoGradeColor(grade: number): string {
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

/** Endometriosis grade label (used by Badge component). */
export function endoGradeLabel(grade: number): string {
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

/** Severity colour class. */
export function severityColor(severity: SeverityLevel): string {
	switch (severity) {
		case 'mild':
			return 'bg-green-100 text-green-800 border-green-300';
		case 'moderate':
			return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		case 'severe':
			return 'bg-orange-100 text-orange-800 border-orange-300';
		case 'critical':
			return 'bg-red-100 text-red-800 border-red-300';
	}
}

/** Calculate EHP-30 total score from domain scores. Returns null if fewer than 3 domains answered. */
export function calculateEHP30Total(
	painDomain: number | null,
	controlDomain: number | null,
	emotionalDomain: number | null,
	socialDomain: number | null,
	selfImageDomain: number | null
): number | null {
	const scores = [painDomain, controlDomain, emotionalDomain, socialDomain, selfImageDomain].filter(
		(s): s is number => s !== null
	);
	if (scores.length < 3) return null;
	return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}
