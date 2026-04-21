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

/** ASA grade label. */
export function asaGradeLabel(grade: number): string {
	switch (grade) {
		case 1:
			return 'ASA I - Healthy';
		case 2:
			return 'ASA II - Mild Systemic Disease';
		case 3:
			return 'ASA III - Severe Systemic Disease';
		case 4:
			return 'ASA IV - Life-Threatening Disease';
		case 5:
			return 'ASA V - Moribund';
		default:
			return `ASA ${grade}`;
	}
}

/** ASA grade colour class. */
export function asaGradeColor(grade: number): string {
	switch (grade) {
		case 1:
			return 'bg-green-100 text-green-800 border-green-300';
		case 2:
			return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		case 3:
			return 'bg-orange-100 text-orange-800 border-orange-300';
		case 4:
			return 'bg-red-100 text-red-800 border-red-300';
		case 5:
			return 'bg-red-200 text-red-900 border-red-400';
		default:
			return 'bg-gray-100 text-gray-800 border-gray-300';
	}
}
