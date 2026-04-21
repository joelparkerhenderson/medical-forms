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

/** Clinical Frailty Scale score label. */
export function cfsScoreLabel(score: number): string {
	switch (score) {
		case 1:
			return 'CFS 1 - Very Fit';
		case 2:
			return 'CFS 2 - Well';
		case 3:
			return 'CFS 3 - Managing Well';
		case 4:
			return 'CFS 4 - Vulnerable';
		case 5:
			return 'CFS 5 - Mildly Frail';
		case 6:
			return 'CFS 6 - Moderately Frail';
		case 7:
			return 'CFS 7 - Severely Frail';
		case 8:
			return 'CFS 8 - Very Severely Frail';
		case 9:
			return 'CFS 9 - Terminally Ill';
		default:
			return `CFS ${score}`;
	}
}

/** CFS score colour class. */
export function cfsScoreColor(score: number): string {
	switch (score) {
		case 1:
			return 'bg-green-100 text-green-800 border-green-300';
		case 2:
			return 'bg-green-100 text-green-800 border-green-300';
		case 3:
			return 'bg-lime-100 text-lime-800 border-lime-300';
		case 4:
			return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		case 5:
			return 'bg-amber-100 text-amber-800 border-amber-300';
		case 6:
			return 'bg-orange-100 text-orange-800 border-orange-300';
		case 7:
			return 'bg-red-100 text-red-800 border-red-300';
		case 8:
			return 'bg-red-200 text-red-900 border-red-400';
		case 9:
			return 'bg-red-300 text-red-900 border-red-500';
		default:
			return 'bg-gray-100 text-gray-800 border-gray-300';
	}
}

/** Count dependent ADLs (returns count of fields marked 'dependent'). */
export function countDependentADLs(data: {
	bathingADL: string;
	dressingADL: string;
	toiletingADL: string;
	transferringADL: string;
	feedingADL: string;
}): number {
	const fields = [
		data.bathingADL,
		data.dressingADL,
		data.toiletingADL,
		data.transferringADL,
		data.feedingADL
	];
	return fields.filter((f) => f === 'dependent').length;
}

/** Count ADLs needing assistance (returns count of 'needs-assistance' or 'dependent'). */
export function countADLsNeedingHelp(data: {
	bathingADL: string;
	dressingADL: string;
	toiletingADL: string;
	transferringADL: string;
	feedingADL: string;
}): number {
	const fields = [
		data.bathingADL,
		data.dressingADL,
		data.toiletingADL,
		data.transferringADL,
		data.feedingADL
	];
	return fields.filter((f) => f === 'needs-assistance' || f === 'dependent').length;
}

/** Count IADLs needing help. */
export function countIADLsNeedingHelp(data: {
	cookingIADL: string;
	cleaningIADL: string;
	shoppingIADL: string;
	financesIADL: string;
	medicationManagementIADL: string;
}): number {
	const fields = [
		data.cookingIADL,
		data.cleaningIADL,
		data.shoppingIADL,
		data.financesIADL,
		data.medicationManagementIADL
	];
	return fields.filter((f) => f === 'needs-assistance' || f === 'dependent').length;
}
