import { describe, it, expect } from 'vitest';
import { calculateRisk } from './risk-grader';
import type { AssessmentData } from './types';

function emptyAssessment(): AssessmentData {
	return {
		patientInformation: {
			fullName: '',
			dateOfBirth: '',
			nhsNumber: '',
			address: '',
			telephone: '',
			email: '',
			gpName: '',
			gpPractice: ''
		},
		demographics: {
			age: null,
			sex: '',
			ethnicity: '',
			heightCm: null,
			weightKg: null,
			zipCode: ''
		},
		bloodPressure: {
			systolicBp: null,
			diastolicBp: null,
			onAntihypertensive: '',
			numberOfBpMedications: null,
			bpAtTarget: ''
		},
		cholesterolLipids: {
			totalCholesterol: null,
			hdlCholesterol: null,
			ldlCholesterol: null,
			triglycerides: null,
			nonHdlCholesterol: null,
			onStatin: '',
			statinName: ''
		},
		metabolicHealth: {
			hasDiabetes: '',
			diabetesType: '',
			hba1cValue: null,
			hba1cUnit: '',
			fastingGlucose: null,
			bmi: null,
			waistCircumferenceCm: null
		},
		renalFunction: { egfr: null, creatinine: null, urineAcr: null, ckdStage: '' },
		smokingHistory: {
			smokingStatus: '',
			cigarettesPerDay: null,
			yearsSmoked: null,
			yearsSinceQuit: null
		},
		medicalHistory: {
			hasKnownCvd: '',
			previousMi: '',
			previousStroke: '',
			heartFailure: '',
			atrialFibrillation: '',
			peripheralArterialDisease: '',
			familyCvdHistory: '',
			familyCvdDetails: ''
		},
		currentMedications: {
			onAntihypertensiveDetail: '',
			onStatinDetail: '',
			onAspirin: '',
			onAnticoagulant: '',
			onDiabetesMedication: '',
			otherMedications: ''
		},
		reviewCalculate: { modelType: '', clinicianName: '', reviewDate: '', clinicalNotes: '' }
	};
}

describe('calculateRisk', () => {
	it('should return draft for empty assessment', () => {
		const result = calculateRisk(emptyAssessment());
		expect(result.riskCategory).toBe('draft');
		expect(result.tenYearRiskPercent).toBe(0.0);
		expect(result.thirtyYearRiskPercent).toBe(0.0);
		expect(result.firedRules).toHaveLength(0);
	});

	it('should return low risk for young healthy male', () => {
		const data = emptyAssessment();
		data.demographics.age = 35;
		data.demographics.sex = 'male';
		data.bloodPressure.systolicBp = 110;
		data.bloodPressure.diastolicBp = 70;
		data.cholesterolLipids.totalCholesterol = 180;
		data.cholesterolLipids.hdlCholesterol = 65;
		data.metabolicHealth.hasDiabetes = 'no';
		data.metabolicHealth.bmi = 22;
		data.smokingHistory.smokingStatus = 'never';
		data.renalFunction.egfr = 100;

		const result = calculateRisk(data);
		expect(result.riskCategory).toBe('low');
		expect(result.tenYearRiskPercent).toBeLessThan(5.0);
	});

	it('should return high risk for patient with many risk factors', () => {
		const data = emptyAssessment();
		data.demographics.age = 70;
		data.demographics.sex = 'male';
		data.bloodPressure.systolicBp = 185;
		data.bloodPressure.diastolicBp = 100;
		data.bloodPressure.onAntihypertensive = 'yes';
		data.cholesterolLipids.totalCholesterol = 290;
		data.cholesterolLipids.hdlCholesterol = 32;
		data.cholesterolLipids.onStatin = 'no';
		data.metabolicHealth.hasDiabetes = 'yes';
		data.metabolicHealth.bmi = 36;
		data.smokingHistory.smokingStatus = 'current';
		data.renalFunction.egfr = 25;

		const result = calculateRisk(data);
		expect(result.riskCategory).toBe('high');
		expect(result.tenYearRiskPercent).toBeGreaterThanOrEqual(20.0);
	});

	it('should return 30-year risk exceeding 10-year risk', () => {
		const data = emptyAssessment();
		data.demographics.age = 50;
		data.demographics.sex = 'female';
		data.bloodPressure.systolicBp = 135;
		data.bloodPressure.diastolicBp = 85;
		data.cholesterolLipids.totalCholesterol = 210;
		data.cholesterolLipids.hdlCholesterol = 50;
		data.metabolicHealth.hasDiabetes = 'no';
		data.metabolicHealth.bmi = 26;
		data.smokingHistory.smokingStatus = 'never';
		data.renalFunction.egfr = 80;

		const result = calculateRisk(data);
		expect(result.thirtyYearRiskPercent).toBeGreaterThan(result.tenYearRiskPercent);
	});
});
