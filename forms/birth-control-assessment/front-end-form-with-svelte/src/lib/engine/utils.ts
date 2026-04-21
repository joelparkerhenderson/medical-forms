import type { MECCategory, RiskLevel } from './types';

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

/** UK MEC category label. */
export function mecCategoryLabel(mec: MECCategory | null): string {
	switch (mec) {
		case 1:
			return 'MEC 1 - No restriction';
		case 2:
			return 'MEC 2 - Advantages outweigh risks';
		case 3:
			return 'MEC 3 - Risks outweigh advantages';
		case 4:
			return 'MEC 4 - Unacceptable health risk';
		default:
			return 'Not classified';
	}
}

/** MEC category short label. */
export function mecCategoryShort(mec: MECCategory): string {
	switch (mec) {
		case 1:
			return 'MEC 1';
		case 2:
			return 'MEC 2';
		case 3:
			return 'MEC 3';
		case 4:
			return 'MEC 4';
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

/** MEC classification colour class (used by Badge component). */
export function mecClassColor(mec: number): string {
	switch (mec) {
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

/** MEC classification label (used by Badge component). */
export function mecClassLabel(mec: number): string {
	switch (mec) {
		case 1:
			return 'MEC 1 - No restriction';
		case 2:
			return 'MEC 2 - Caution';
		case 3:
			return 'MEC 3 - Relative contraindication';
		case 4:
			return 'MEC 4 - Absolute contraindication';
		default:
			return `MEC ${mec}`;
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

/** Contraceptive method display name. */
export function methodDisplayName(method: string): string {
	const names: Record<string, string> = {
		coc: 'Combined Oral Contraception (COC)',
		pop: 'Progestogen-Only Pill (POP)',
		implant: 'Contraceptive Implant',
		injection: 'Injectable Contraception',
		iud: 'Copper IUD',
		ius: 'Hormonal IUS (Mirena)'
	};
	return names[method] || method;
}

/** Contraceptive method short name. */
export function methodShortName(method: string): string {
	const names: Record<string, string> = {
		coc: 'COC',
		pop: 'POP',
		implant: 'Implant',
		injection: 'Injection',
		iud: 'Cu-IUD',
		ius: 'IUS'
	};
	return names[method] || method;
}
