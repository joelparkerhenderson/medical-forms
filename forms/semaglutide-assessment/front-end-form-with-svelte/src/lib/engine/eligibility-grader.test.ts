import { describe, it, expect } from 'vitest';
import { evaluateEligibility } from './eligibility-grader';
import { detectAdditionalFlags } from './flagged-issues';
import type { AssessmentData } from './types';

function createHealthyPatient(): AssessmentData {
	return {
		demographics: {
			firstName: 'Jane',
			lastName: 'Smith',
			dob: '1985-06-15',
			sex: 'female'
		},
		indicationGoals: {
			primaryIndication: 'type2-diabetes',
			weightLossGoalPercent: 10,
			previousWeightLossAttempts: 'Diet and exercise',
			motivationLevel: 'high'
		},
		bodyComposition: {
			heightCm: 170,
			weightKg: 95,
			bmi: null,
			waistCircumference: 100,
			bodyFatPercent: 35,
			previousMaxWeight: 100
		},
		metabolicProfile: {
			hba1c: 7.5,
			fastingGlucose: 7,
			insulinLevel: null,
			totalCholesterol: 5.2,
			ldl: 3.1,
			hdl: 1.3,
			triglycerides: 1.8,
			thyroidFunction: 'Normal'
		},
		cardiovascularRisk: {
			bloodPressureSystolic: 130,
			bloodPressureDiastolic: 80,
			heartRate: 72,
			previousMI: 'no',
			heartFailure: 'no',
			peripheralVascularDisease: 'no',
			cerebrovascularDisease: 'no',
			qriskScore: null
		},
		contraindicationsScreening: {
			personalHistoryMTC: 'no',
			familyHistoryMTC: 'no',
			men2Syndrome: 'no',
			pancreatitisHistory: 'no',
			severeGIDisease: 'no',
			pregnancyPlanned: 'no',
			breastfeeding: 'no',
			type1Diabetes: 'no',
			diabeticRetinopathySevere: 'no',
			allergySemaglutide: 'no'
		},
		gastrointestinalHistory: {
			nauseaHistory: 'no',
			vomitingHistory: 'no',
			gastroparesis: 'no',
			gallstoneHistory: 'no',
			ibd: 'no',
			gerdHistory: 'no',
			previousBariatricSurgery: 'no',
			currentGISymptoms: ''
		},
		currentMedications: {
			insulinTherapy: 'no',
			insulinType: '',
			sulfonylureas: 'no',
			otherDiabetesMedications: [],
			antihypertensives: [],
			lipidLowering: [],
			otherMedications: []
		},
		mentalHealthScreening: {
			eatingDisorderHistory: 'no',
			eatingDisorderDetails: '',
			depressionHistory: 'no',
			suicidalIdeation: 'no',
			bodyDysmorphia: 'no',
			bingeDrinkingHistory: 'no',
			currentMentalHealthTreatment: ''
		},
		treatmentPlan: {
			selectedFormulation: 'subcutaneous-weekly',
			startingDose: '0.25mg',
			titrationSchedule: 'Standard 4-weekly',
			monitoringFrequency: 'Monthly',
			dietaryGuidance: 'yes',
			exercisePlan: 'yes',
			followUpWeeks: 4
		}
	};
}

describe('Eligibility Grading Engine', () => {
	it('returns Eligible for a healthy patient with no contraindications', () => {
		const data = createHealthyPatient();
		const result = evaluateEligibility(data);
		expect(result.eligibilityStatus).toBe('Eligible');
		expect(result.absoluteContraindications).toHaveLength(0);
		expect(result.relativeContraindications).toHaveLength(0);
		expect(result.bmi).toBeCloseTo(32.9, 1);
	});

	it('returns Ineligible when personal history of MTC is present', () => {
		const data = createHealthyPatient();
		data.contraindicationsScreening.personalHistoryMTC = 'yes';
		const result = evaluateEligibility(data);
		expect(result.eligibilityStatus).toBe('Ineligible');
		expect(result.absoluteContraindications.length).toBeGreaterThanOrEqual(1);
		expect(result.absoluteContraindications.some((r) => r.id === 'CONTRA-ABS-001')).toBe(true);
	});

	it('returns Ineligible when pregnancy is planned', () => {
		const data = createHealthyPatient();
		data.contraindicationsScreening.pregnancyPlanned = 'yes';
		const result = evaluateEligibility(data);
		expect(result.eligibilityStatus).toBe('Ineligible');
		expect(result.absoluteContraindications.some((r) => r.id === 'CONTRA-ABS-005')).toBe(true);
	});

	it('returns Conditional when gastroparesis is present', () => {
		const data = createHealthyPatient();
		data.gastrointestinalHistory.gastroparesis = 'yes';
		const result = evaluateEligibility(data);
		expect(result.eligibilityStatus).toBe('Conditional');
		expect(result.relativeContraindications.some((r) => r.id === 'CONTRA-REL-001')).toBe(true);
	});

	it('returns Conditional when eating disorder history is present', () => {
		const data = createHealthyPatient();
		data.mentalHealthScreening.eatingDisorderHistory = 'yes';
		const result = evaluateEligibility(data);
		expect(result.eligibilityStatus).toBe('Conditional');
		expect(result.relativeContraindications.some((r) => r.id === 'CONTRA-REL-004')).toBe(true);
	});

	it('returns Conditional when BMI is low for weight management indication', () => {
		const data = createHealthyPatient();
		data.indicationGoals.primaryIndication = 'weight-management';
		data.bodyComposition.heightCm = 170;
		data.bodyComposition.weightKg = 70;
		const result = evaluateEligibility(data);
		expect(result.eligibilityStatus).toBe('Conditional');
		expect(result.relativeContraindications.some((r) => r.id === 'BMI-LOW-001')).toBe(true);
	});

	it('returns Ineligible with multiple absolute contraindications', () => {
		const data = createHealthyPatient();
		data.contraindicationsScreening.personalHistoryMTC = 'yes';
		data.contraindicationsScreening.type1Diabetes = 'yes';
		data.contraindicationsScreening.allergySemaglutide = 'yes';
		const result = evaluateEligibility(data);
		expect(result.eligibilityStatus).toBe('Ineligible');
		expect(result.absoluteContraindications.length).toBe(3);
	});

	it('calculates BMI correctly', () => {
		const data = createHealthyPatient();
		data.bodyComposition.heightCm = 180;
		data.bodyComposition.weightKg = 90;
		const result = evaluateEligibility(data);
		expect(result.bmi).toBeCloseTo(27.8, 1);
		expect(result.bmiCategoryLabel).toBe('Overweight');
	});

	it('handles null height/weight gracefully', () => {
		const data = createHealthyPatient();
		data.bodyComposition.heightCm = null;
		data.bodyComposition.weightKg = null;
		const result = evaluateEligibility(data);
		expect(result.bmi).toBeNull();
		expect(result.bmiCategoryLabel).toBe('');
	});
});

describe('Additional Flags Detection', () => {
	it('returns no flags for healthy patient', () => {
		const data = createHealthyPatient();
		const flags = detectAdditionalFlags(data);
		expect(flags).toHaveLength(0);
	});

	it('flags insulin + semaglutide hypoglycemia risk', () => {
		const data = createHealthyPatient();
		data.currentMedications.insulinTherapy = 'yes';
		data.currentMedications.insulinType = 'Basal insulin glargine';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-HYPO-001')).toBe(true);
	});

	it('flags elevated HbA1c', () => {
		const data = createHealthyPatient();
		data.metabolicProfile.hba1c = 11.5;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-HBA1C-001')).toBe(true);
	});

	it('flags severe obesity BMI >= 40', () => {
		const data = createHealthyPatient();
		data.bodyComposition.heightCm = 170;
		data.bodyComposition.weightKg = 120;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-BMI-001')).toBe(true);
	});

	it('flags cardiovascular disease history', () => {
		const data = createHealthyPatient();
		data.cardiovascularRisk.previousMI = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-CVD-001')).toBe(true);
	});

	it('flags eating disorder history', () => {
		const data = createHealthyPatient();
		data.mentalHealthScreening.eatingDisorderHistory = 'yes';
		data.mentalHealthScreening.eatingDisorderDetails = 'Bulimia nervosa, treated 2018';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-ED-001')).toBe(true);
	});

	it('flags suicidal ideation', () => {
		const data = createHealthyPatient();
		data.mentalHealthScreening.suicidalIdeation = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-SI-001')).toBe(true);
	});

	it('flags gastroparesis', () => {
		const data = createHealthyPatient();
		data.gastrointestinalHistory.gastroparesis = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-GI-001')).toBe(true);
	});

	it('flags gallstone risk', () => {
		const data = createHealthyPatient();
		data.gastrointestinalHistory.gallstoneHistory = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-GI-002')).toBe(true);
	});

	it('flags breastfeeding', () => {
		const data = createHealthyPatient();
		data.contraindicationsScreening.breastfeeding = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-BF-001')).toBe(true);
	});

	it('flags low BMI for weight management indication', () => {
		const data = createHealthyPatient();
		data.indicationGoals.primaryIndication = 'weight-management';
		data.bodyComposition.heightCm = 170;
		data.bodyComposition.weightKg = 70;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-BMI-LOW-001')).toBe(true);
	});

	it('flags elderly concerns for patients >= 75', () => {
		const data = createHealthyPatient();
		data.demographics.dob = '1940-01-01';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-AGE-001')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createHealthyPatient();
		data.currentMedications.insulinTherapy = 'yes';
		data.gastrointestinalHistory.gallstoneHistory = 'yes';
		data.mentalHealthScreening.suicidalIdeation = 'yes';
		const flags = detectAdditionalFlags(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
