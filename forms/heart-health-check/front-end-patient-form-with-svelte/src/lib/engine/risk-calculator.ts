import type { AssessmentData } from './types';
import { calculateBMI, calculateTcHdlRatio, smokingPoints, createDefaultAssessmentData } from './utils';

export function estimateTenYearRisk(data: AssessmentData): number {
	let points = 0;

	// Age contribution
	if (data.demographicsEthnicity.age != null) {
		const age = data.demographicsEthnicity.age;
		if (data.demographicsEthnicity.sex === 'male') {
			points += Math.max(age - 25, 0) * 0.8;
		} else {
			points += Math.max(age - 25, 0) * 0.6;
		}
	}

	// Smoking
	points += smokingPoints(data.smokingAlcohol.smokingStatus);

	// Systolic BP
	if (data.bloodPressure.systolicBP != null) {
		points += Math.max((data.bloodPressure.systolicBP - 100) * 0.15, 0);
		// BP variability
		if (data.bloodPressure.systolicBPSD != null && data.bloodPressure.systolicBPSD > 10) {
			points += 5;
		}
	}

	// Cholesterol ratio
	const tcHdl = data.cholesterol.totalHDLRatio
		?? calculateTcHdlRatio(data.cholesterol.totalCholesterol, data.cholesterol.hdlCholesterol);
	if (tcHdl != null) {
		points += Math.max((tcHdl - 3) * 3, 0);
	}

	// Diabetes
	if (data.medicalConditions.hasDiabetes === 'type1') {
		points += 20;
	} else if (data.medicalConditions.hasDiabetes === 'type2') {
		points += 15;
	}

	// Atrial fibrillation
	if (data.medicalConditions.hasAtrialFibrillation === 'yes') {
		points += 10;
	}

	// CKD
	if (data.medicalConditions.hasChronicKidneyDisease === 'yes') {
		points += 10;
	}

	// Rheumatoid arthritis
	if (data.medicalConditions.hasRheumatoidArthritis === 'yes') {
		points += 5;
	}

	// Family CVD under 60
	if (data.familyHistory.familyCVDUnder60 === 'yes') {
		points += 10;
	}

	// Townsend deprivation
	if (data.demographicsEthnicity.townsendDeprivation != null && data.demographicsEthnicity.townsendDeprivation > 0) {
		points += data.demographicsEthnicity.townsendDeprivation * 1.5;
	}

	// BMI
	const bmi = data.bodyMeasurements.bmi
		?? calculateBMI(data.bodyMeasurements.heightCm, data.bodyMeasurements.weightKg);
	if (bmi != null && bmi > 25) {
		points += (bmi - 25) * 0.5;
	}

	// BP treatment
	if (data.bloodPressure.onBPTreatment === 'yes') {
		points += 3;
	}

	// Atypical antipsychotic
	if (data.medicalConditions.onAtypicalAntipsychotic === 'yes') {
		points += 3;
	}

	// Corticosteroids
	if (data.medicalConditions.onCorticosteroids === 'yes') {
		points += 5;
	}

	// Migraine
	if (data.medicalConditions.hasMigraine === 'yes') {
		points += 3;
	}

	// Severe mental illness
	if (data.medicalConditions.hasSevereMentalIllness === 'yes') {
		points += 3;
	}

	// Erectile dysfunction (male only)
	if (data.demographicsEthnicity.sex === 'male' && data.medicalConditions.hasErectileDysfunction === 'yes') {
		points += 5;
	}

	// Exponential mapping
	const risk = 0.8 * Math.exp(0.1 * points);
	const rounded = Math.round(risk * 10) / 10;
	return Math.min(Math.max(rounded, 0.1), 95);
}

export function calculateHeartAge(data: AssessmentData, actualRisk: number): number | null {
	if (data.demographicsEthnicity.age == null) return null;
	const sex = data.demographicsEthnicity.sex;
	if (!sex) return null;

	for (let testAge = 25; testAge <= 100; testAge++) {
		const baseline = createDefaultAssessmentData();
		baseline.demographicsEthnicity.age = testAge;
		baseline.demographicsEthnicity.sex = sex;
		baseline.bloodPressure.systolicBP = 120;
		baseline.cholesterol.totalHDLRatio = 4;
		baseline.smokingAlcohol.smokingStatus = 'nonSmoker';

		const baselineRisk = estimateTenYearRisk(baseline);
		if (baselineRisk >= actualRisk) {
			return Math.min(testAge, 100);
		}
	}

	return 100;
}
