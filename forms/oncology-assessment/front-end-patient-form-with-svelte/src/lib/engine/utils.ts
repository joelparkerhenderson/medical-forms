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

/** ECOG grade label. */
export function ecogGradeLabel(grade: number): string {
	switch (grade) {
		case 0:
			return 'ECOG 0 - Fully Active';
		case 1:
			return 'ECOG 1 - Restricted Strenuous Activity';
		case 2:
			return 'ECOG 2 - Ambulatory, Self-Care';
		case 3:
			return 'ECOG 3 - Limited Self-Care';
		case 4:
			return 'ECOG 4 - Completely Disabled';
		default:
			return `ECOG ${grade}`;
	}
}

/** ECOG grade colour class. */
export function ecogGradeColor(grade: number): string {
	switch (grade) {
		case 0:
			return 'bg-green-100 text-green-800 border-green-300';
		case 1:
			return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		case 2:
			return 'bg-orange-100 text-orange-800 border-orange-300';
		case 3:
			return 'bg-red-100 text-red-800 border-red-300';
		case 4:
			return 'bg-red-200 text-red-900 border-red-400';
		default:
			return 'bg-gray-100 text-gray-800 border-gray-300';
	}
}

/** TNM stage formatted string. */
export function formatTNM(t: string, n: string, m: string): string {
	if (!t && !n && !m) return 'N/A';
	return `T${t || 'X'}N${n || 'X'}M${m || 'X'}`;
}

/** Overall stage label. */
export function stageLabel(stage: string): string {
	switch (stage) {
		case 'I':
			return 'Stage I';
		case 'II':
			return 'Stage II';
		case 'III':
			return 'Stage III';
		case 'IV':
			return 'Stage IV';
		default:
			return stage || 'Not staged';
	}
}

/** Cancer type display label. */
export function cancerTypeLabel(type: string): string {
	const labels: Record<string, string> = {
		breast: 'Breast',
		lung: 'Lung',
		colorectal: 'Colorectal',
		prostate: 'Prostate',
		melanoma: 'Melanoma',
		lymphoma: 'Lymphoma',
		leukaemia: 'Leukaemia',
		pancreatic: 'Pancreatic',
		ovarian: 'Ovarian',
		bladder: 'Bladder',
		renal: 'Renal',
		hepatocellular: 'Hepatocellular',
		gastric: 'Gastric',
		oesophageal: 'Oesophageal',
		'head-and-neck': 'Head and Neck',
		brain: 'Brain',
		sarcoma: 'Sarcoma',
		thyroid: 'Thyroid',
		cervical: 'Cervical',
		endometrial: 'Endometrial',
		other: 'Other'
	};
	return labels[type] || type || 'N/A';
}

/** Karnofsky score to approximate ECOG mapping. */
export function karnofskyToECOG(kps: number | null): number | null {
	if (kps === null) return null;
	if (kps >= 90) return 0;
	if (kps >= 70) return 1;
	if (kps >= 50) return 2;
	if (kps >= 30) return 3;
	return 4;
}
