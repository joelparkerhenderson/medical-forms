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

/** GOLD stage label. */
export function goldStageLabel(stage: number): string {
	switch (stage) {
		case 1:
			return 'GOLD I - Mild';
		case 2:
			return 'GOLD II - Moderate';
		case 3:
			return 'GOLD III - Severe';
		case 4:
			return 'GOLD IV - Very Severe';
		default:
			return `GOLD ${stage}`;
	}
}

/** GOLD stage colour class. */
export function goldStageColor(stage: number): string {
	switch (stage) {
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

/** ABCD Group label. */
export function abcdGroupLabel(group: string): string {
	switch (group) {
		case 'A':
			return 'Group A - Low risk, fewer symptoms';
		case 'B':
			return 'Group B - Low risk, more symptoms';
		case 'E':
			return 'Group E - Exacerbation history';
		default:
			return `Group ${group}`;
	}
}

/** Determine ABCD Group from symptoms (CAT/mMRC) and exacerbation history. */
export function determineAbcdGroup(
	catScore: number | null,
	mmrcDyspnoea: string,
	exacerbationsPerYear: number | null,
	hospitalizationsPerYear: number | null
): string {
	const highSymptoms = (catScore !== null && catScore >= 10) || (mmrcDyspnoea >= '2');
	const highExacerbations = (exacerbationsPerYear !== null && exacerbationsPerYear >= 2) ||
		(hospitalizationsPerYear !== null && hospitalizationsPerYear >= 1);

	if (highExacerbations) return 'E';
	if (highSymptoms) return 'B';
	return 'A';
}
