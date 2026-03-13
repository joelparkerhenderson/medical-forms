import { describe, it, expect } from 'vitest';
import { calculateRisk } from './risk-grader';
import { detectAdditionalFlags } from './flagged-issues';
import { riskRules } from './risk-rules';
import type { AssessmentData } from './types';

function createHealthyPatient(): AssessmentData {
	return {
		demographics: {
			firstName: 'Jane',
			lastName: 'Smith',
			dateOfBirth: '1992-06-15',
			sex: 'female'
		},
		pregnancyDetails: {
			gestationalWeeks: 28,
			estimatedDueDate: '2026-06-01',
			conceptionMethod: 'natural',
			multipleGestation: 'no',
			placentaLocation: 'anterior'
		},
		obstetricHistory: {
			gravida: 2,
			para: 1,
			abortions: 0,
			livingChildren: 1,
			previousComplications: {
				preeclampsia: 'no',
				gestationalDiabetes: 'no',
				pretermBirth: 'no',
				cesareanSection: 'no'
			}
		},
		medicalHistory: {
			chronicConditions: '',
			autoimmune: 'no',
			thyroid: 'no',
			diabetes: 'no',
			hypertension: 'no'
		},
		currentSymptoms: {
			nausea: 'no',
			bleeding: 'no',
			headache: 'no',
			visionChanges: 'no',
			edema: 'no',
			abdominalPain: 'no',
			reducedFetalMovement: 'no'
		},
		vitalSigns: {
			bloodPressureSystolic: 120,
			bloodPressureDiastolic: 80,
			weight: 70,
			height: 165,
			bmi: 25.7,
			fundalHeight: 28,
			fetalHeartRate: 140
		},
		laboratoryResults: {
			bloodType: 'A',
			rhFactor: 'positive',
			hemoglobin: 12.5,
			glucose: 5.0,
			urinalysis: 'Normal',
			gbs: 'no'
		},
		lifestyleNutrition: {
			smoking: 'no',
			alcohol: 'no',
			drugs: 'no',
			exercise: 'moderate',
			diet: 'good',
			supplements: 'Prenatal vitamins',
			folicAcid: 'yes'
		},
		mentalHealthScreening: {
			edinburghScore: 4,
			anxietyLevel: 'mild',
			supportSystem: 'yes',
			domesticViolenceScreen: 'no'
		},
		birthPlanPreferences: {
			deliveryPreference: 'Vaginal delivery',
			painManagement: 'Epidural if needed',
			feedingPlan: 'Breastfeeding',
			specialRequests: ''
		}
	};
}

describe('Risk Grading Engine', () => {
	it('returns risk score 0 for a healthy patient with no risk factors', () => {
		const data = createHealthyPatient();
		const result = calculateRisk(data);
		expect(result.riskScore).toBe(0);
		expect(result.riskLevel).toBe('low');
		expect(result.firedRules).toHaveLength(0);
	});

	it('returns moderate risk for a patient with previous gestational diabetes and cesarean', () => {
		const data = createHealthyPatient();
		data.obstetricHistory.previousComplications.gestationalDiabetes = 'yes';
		data.obstetricHistory.previousComplications.cesareanSection = 'yes';

		const result = calculateRisk(data);
		expect(result.riskScore).toBe(3); // 2 + 1
		expect(result.riskLevel).toBe('moderate');
		expect(result.firedRules.length).toBeGreaterThanOrEqual(2);
	});

	it('returns high risk for pre-existing hypertension and previous preeclampsia', () => {
		const data = createHealthyPatient();
		data.medicalHistory.hypertension = 'yes';
		data.obstetricHistory.previousComplications.preeclampsia = 'yes';

		const result = calculateRisk(data);
		expect(result.riskScore).toBe(6); // 3 + 3
		expect(result.riskLevel).toBe('high');
	});

	it('returns very high risk for multiple severe risk factors', () => {
		const data = createHealthyPatient();
		data.obstetricHistory.previousComplications.preeclampsia = 'yes'; // 3
		data.medicalHistory.hypertension = 'yes'; // 3
		data.pregnancyDetails.placentaLocation = 'previa'; // 4
		data.currentSymptoms.bleeding = 'yes'; // 4

		const result = calculateRisk(data);
		expect(result.riskScore).toBe(14);
		expect(result.riskLevel).toBe('very-high');
	});

	it('detects high BP as risk factor', () => {
		const data = createHealthyPatient();
		data.vitalSigns.bloodPressureSystolic = 145;
		data.vitalSigns.bloodPressureDiastolic = 95;

		const result = calculateRisk(data);
		expect(result.firedRules.some((r) => r.id === 'RISK-VITAL-001')).toBe(true);
	});

	it('detects Rh-negative as risk factor', () => {
		const data = createHealthyPatient();
		data.laboratoryResults.rhFactor = 'negative';

		const result = calculateRisk(data);
		expect(result.firedRules.some((r) => r.id === 'RISK-LAB-001')).toBe(true);
	});

	it('detects smoking as risk factor', () => {
		const data = createHealthyPatient();
		data.lifestyleNutrition.smoking = 'yes';

		const result = calculateRisk(data);
		expect(result.firedRules.some((r) => r.id === 'RISK-LIFE-001')).toBe(true);
	});

	it('detects high Edinburgh score as risk factor', () => {
		const data = createHealthyPatient();
		data.mentalHealthScreening.edinburghScore = 15;

		const result = calculateRisk(data);
		expect(result.firedRules.some((r) => r.id === 'RISK-MH-001')).toBe(true);
	});

	it('detects all rule IDs are unique', () => {
		const ids = riskRules.map((r) => r.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});
});

describe('Additional Flags Detection', () => {
	it('returns no flags for healthy patient', () => {
		const data = createHealthyPatient();
		const flags = detectAdditionalFlags(data);
		expect(flags).toHaveLength(0);
	});

	it('flags high blood pressure', () => {
		const data = createHealthyPatient();
		data.vitalSigns.bloodPressureSystolic = 145;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-BP-001')).toBe(true);
	});

	it('flags vaginal bleeding', () => {
		const data = createHealthyPatient();
		data.currentSymptoms.bleeding = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-BLEED-001')).toBe(true);
	});

	it('flags reduced fetal movement', () => {
		const data = createHealthyPatient();
		data.currentSymptoms.reducedFetalMovement = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-FETAL-001')).toBe(true);
	});

	it('flags preeclampsia signs (headache + vision + edema)', () => {
		const data = createHealthyPatient();
		data.currentSymptoms.headache = 'yes';
		data.currentSymptoms.visionChanges = 'yes';
		data.currentSymptoms.edema = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-PE-001')).toBe(true);
	});

	it('flags Rh-negative mother', () => {
		const data = createHealthyPatient();
		data.laboratoryResults.rhFactor = 'negative';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-RH-001')).toBe(true);
	});

	it('flags high Edinburgh depression score', () => {
		const data = createHealthyPatient();
		data.mentalHealthScreening.edinburghScore = 15;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-EPDS-001')).toBe(true);
	});

	it('flags domestic violence', () => {
		const data = createHealthyPatient();
		data.mentalHealthScreening.domesticViolenceScreen = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-DV-001')).toBe(true);
	});

	it('flags alcohol use during pregnancy', () => {
		const data = createHealthyPatient();
		data.lifestyleNutrition.alcohol = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-ALCOHOL-001')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createHealthyPatient();
		data.currentSymptoms.bleeding = 'yes';
		data.lifestyleNutrition.smoking = 'yes';
		data.laboratoryResults.rhFactor = 'negative';
		const flags = detectAdditionalFlags(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
