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

/** MRC Dyspnoea Scale grade label. */
export function mrcGradeLabel(grade: number): string {
	switch (grade) {
		case 1:
			return 'MRC 1 - Breathless only on strenuous exercise';
		case 2:
			return 'MRC 2 - Breathless when hurrying or walking up a slight hill';
		case 3:
			return 'MRC 3 - Walks slower than peers / stops after ~15 min';
		case 4:
			return 'MRC 4 - Stops for breath after ~100 yards on level';
		case 5:
			return 'MRC 5 - Too breathless to leave house / breathless dressing';
		default:
			return `MRC ${grade}`;
	}
}

/** MRC grade colour class. */
export function mrcGradeColor(grade: number): string {
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

/** Classify MRC grade severity as a short label. */
export function mrcSeverityLabel(grade: number): string {
	switch (grade) {
		case 1:
			return 'Normal';
		case 2:
			return 'Mild';
		case 3:
			return 'Moderate';
		case 4:
			return 'Severe';
		case 5:
			return 'Very Severe';
		default:
			return 'Unknown';
	}
}

/** Calculate STOP-BANG score from individual items. */
export function calculateStopBang(
	snoring: string,
	tired: string,
	observed: string,
	bmiOver35: string,
	age50Plus: string,
	neckOver40: string,
	male: string
): number {
	let score = 0;
	if (snoring === 'yes') score++;
	if (tired === 'yes') score++;
	if (observed === 'yes') score++;
	if (bmiOver35 === 'yes') score++;
	if (age50Plus === 'yes') score++;
	if (neckOver40 === 'yes') score++;
	if (male === 'yes') score++;
	return score;
}
