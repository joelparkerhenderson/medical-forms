import type { AssessmentData } from './types';

export function riskCategoryLabel(level: string): string {
	switch (level) {
		case 'low': return 'Low Risk';
		case 'moderate': return 'Moderate Risk';
		case 'high': return 'High Risk';
		case 'draft': return 'Draft';
		default: return 'Unknown';
	}
}

export function riskCategoryColor(level: string): string {
	switch (level) {
		case 'low': return 'bg-green-100 text-green-800 border-green-300';
		case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		case 'high': return 'bg-red-100 text-red-800 border-red-300';
		default: return 'bg-gray-100 text-gray-800 border-gray-300';
	}
}

export function calculateBMI(heightCm: number | null, weightKg: number | null): number | null {
	if (heightCm == null || weightKg == null || heightCm <= 0) return null;
	const heightM = heightCm / 100;
	return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function calculateTcHdlRatio(tc: number | null, hdl: number | null): number | null {
	if (tc == null || hdl == null || hdl <= 0) return null;
	return Math.round((tc / hdl) * 10) / 10;
}

export function isSmoker(status: string): boolean {
	return status === 'lightSmoker' || status === 'moderateSmoker' || status === 'heavySmoker';
}

export function isLikelyDraft(data: AssessmentData): boolean {
	return data.demographicsEthnicity.age == null && data.demographicsEthnicity.sex === '';
}

export function smokingPoints(status: string): number {
	switch (status) {
		case 'heavySmoker': return 15;
		case 'moderateSmoker': return 10;
		case 'lightSmoker': return 5;
		case 'exSmoker': return 2;
		default: return 0;
	}
}

export function createDefaultAssessmentData(): AssessmentData {
	return {
		patientInformation: {
			fullName: '',
			dateOfBirth: '',
			nhsNumber: '',
			address: '',
			postcode: '',
			telephone: '',
			email: '',
			gpName: '',
			gpPractice: ''
		},
		demographicsEthnicity: {
			age: null,
			sex: '',
			ethnicity: '',
			townsendDeprivation: null
		},
		bloodPressure: {
			systolicBP: null,
			systolicBPSD: null,
			diastolicBP: null,
			onBPTreatment: '',
			numberOfBPMedications: null
		},
		cholesterol: {
			totalCholesterol: null,
			hdlCholesterol: null,
			totalHDLRatio: null,
			onStatin: ''
		},
		medicalConditions: {
			hasDiabetes: '',
			hasAtrialFibrillation: '',
			hasRheumatoidArthritis: '',
			hasChronicKidneyDisease: '',
			hasMigraine: '',
			hasSevereMentalIllness: '',
			hasErectileDysfunction: '',
			onAtypicalAntipsychotic: '',
			onCorticosteroids: ''
		},
		familyHistory: {
			familyCVDUnder60: '',
			familyCVDRelationship: '',
			familyDiabetesHistory: ''
		},
		smokingAlcohol: {
			smokingStatus: '',
			cigarettesPerDay: null,
			yearsSinceQuit: null,
			alcoholUnitsPerWeek: null,
			alcoholFrequency: ''
		},
		physicalActivityDiet: {
			physicalActivityMinutesPerWeek: null,
			activityIntensity: '',
			fruitVegPortionsPerDay: null,
			dietQuality: '',
			saltIntake: ''
		},
		bodyMeasurements: {
			heightCm: null,
			weightKg: null,
			bmi: null,
			waistCircumferenceCm: null
		},
		reviewCalculate: {
			clinicianName: '',
			reviewDate: '',
			clinicalNotes: '',
			auditScore: null
		}
	};
}
