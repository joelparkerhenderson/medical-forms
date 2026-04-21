import type { AssessmentData, FiredRule } from './types';
import { calculateBMI, calculateTcHdlRatio, isSmoker } from './utils';

interface RiskRule {
	id: string;
	category: string;
	description: string;
	riskLevel: string;
	evaluate: (data: AssessmentData, risk: number, heartAge: number | null) => boolean;
}

function allRules(): RiskRule[] {
	return [
		// ─── HIGH RISK ─────────────────────────────────────────
		{
			id: 'HHC-001',
			category: 'Overall Risk',
			description: '10-year CVD risk 20% or higher',
			riskLevel: 'high',
			evaluate: (_d, risk) => risk >= 20
		},
		{
			id: 'HHC-002',
			category: 'Diabetes',
			description: 'Type 1 diabetes with age 40 or over',
			riskLevel: 'high',
			evaluate: (d) =>
				d.medicalConditions.hasDiabetes === 'type1' &&
				d.demographicsEthnicity.age != null && d.demographicsEthnicity.age >= 40
		},
		{
			id: 'HHC-003',
			category: 'Blood Pressure',
			description: 'Systolic BP 180 or higher (hypertensive crisis)',
			riskLevel: 'high',
			evaluate: (d) => d.bloodPressure.systolicBP != null && d.bloodPressure.systolicBP >= 180
		},
		{
			id: 'HHC-004',
			category: 'Renal',
			description: 'CKD stage 3+ combined with diabetes',
			riskLevel: 'high',
			evaluate: (d) =>
				d.medicalConditions.hasChronicKidneyDisease === 'yes' &&
				(d.medicalConditions.hasDiabetes === 'type1' || d.medicalConditions.hasDiabetes === 'type2')
		},
		{
			id: 'HHC-005',
			category: 'Multiple Factors',
			description: 'Three or more major risk factors present',
			riskLevel: 'high',
			evaluate: (d) => {
				let count = 0;
				if (d.medicalConditions.hasDiabetes === 'type1' || d.medicalConditions.hasDiabetes === 'type2') count++;
				if (isSmoker(d.smokingAlcohol.smokingStatus)) count++;
				if (d.medicalConditions.hasAtrialFibrillation === 'yes') count++;
				if (d.bloodPressure.systolicBP != null && d.bloodPressure.systolicBP >= 160) count++;
				const ratio = d.cholesterol.totalHDLRatio
					?? calculateTcHdlRatio(d.cholesterol.totalCholesterol, d.cholesterol.hdlCholesterol);
				if (ratio != null && ratio >= 6) count++;
				return count >= 3;
			}
		},
		// ─── MEDIUM RISK ───────────────────────────────────────
		{
			id: 'HHC-006',
			category: 'Overall Risk',
			description: '10-year CVD risk between 10% and 19.9%',
			riskLevel: 'medium',
			evaluate: (_d, risk) => risk >= 10 && risk < 20
		},
		{
			id: 'HHC-007',
			category: 'Smoking',
			description: 'Current smoker (any level)',
			riskLevel: 'medium',
			evaluate: (d) => isSmoker(d.smokingAlcohol.smokingStatus)
		},
		{
			id: 'HHC-008',
			category: 'Diabetes',
			description: 'Type 2 diabetes',
			riskLevel: 'medium',
			evaluate: (d) => d.medicalConditions.hasDiabetes === 'type2'
		},
		{
			id: 'HHC-009',
			category: 'Cardiac',
			description: 'Atrial fibrillation',
			riskLevel: 'medium',
			evaluate: (d) => d.medicalConditions.hasAtrialFibrillation === 'yes'
		},
		{
			id: 'HHC-010',
			category: 'Blood Pressure',
			description: 'Systolic BP between 140 and 179',
			riskLevel: 'medium',
			evaluate: (d) =>
				d.bloodPressure.systolicBP != null && d.bloodPressure.systolicBP >= 140 && d.bloodPressure.systolicBP < 180
		},
		{
			id: 'HHC-011',
			category: 'Cholesterol',
			description: 'TC/HDL ratio 6 or higher',
			riskLevel: 'medium',
			evaluate: (d) => {
				const ratio = d.cholesterol.totalHDLRatio
					?? calculateTcHdlRatio(d.cholesterol.totalCholesterol, d.cholesterol.hdlCholesterol);
				return ratio != null && ratio >= 6;
			}
		},
		{
			id: 'HHC-012',
			category: 'Renal',
			description: 'CKD stage 3 or higher',
			riskLevel: 'medium',
			evaluate: (d) => d.medicalConditions.hasChronicKidneyDisease === 'yes'
		},
		{
			id: 'HHC-013',
			category: 'Body Composition',
			description: 'BMI 30 or higher (obese)',
			riskLevel: 'medium',
			evaluate: (d) => {
				const bmi = d.bodyMeasurements.bmi
					?? calculateBMI(d.bodyMeasurements.heightCm, d.bodyMeasurements.weightKg);
				return bmi != null && bmi >= 30;
			}
		},
		{
			id: 'HHC-014',
			category: 'Family History',
			description: 'First-degree relative with CVD under 60',
			riskLevel: 'medium',
			evaluate: (d) => d.familyHistory.familyCVDUnder60 === 'yes'
		},
		{
			id: 'HHC-015',
			category: 'Heart Age',
			description: 'Heart age 10 or more years above chronological age',
			riskLevel: 'medium',
			evaluate: (d, _risk, ha) => {
				if (ha != null && d.demographicsEthnicity.age != null) {
					return ha >= d.demographicsEthnicity.age + 10;
				}
				return false;
			}
		},
		// ─── LOW RISK (positive indicators) ────────────────────
		{
			id: 'HHC-016',
			category: 'Smoking',
			description: 'Non-smoker',
			riskLevel: 'low',
			evaluate: (d) => d.smokingAlcohol.smokingStatus === 'nonSmoker'
		},
		{
			id: 'HHC-017',
			category: 'Blood Pressure',
			description: 'Normal blood pressure (below 120/80) without treatment',
			riskLevel: 'low',
			evaluate: (d) =>
				d.bloodPressure.systolicBP != null && d.bloodPressure.systolicBP < 120 &&
				d.bloodPressure.diastolicBP != null && d.bloodPressure.diastolicBP < 80 &&
				d.bloodPressure.onBPTreatment !== 'yes'
		},
		{
			id: 'HHC-018',
			category: 'Cholesterol',
			description: 'Optimal TC/HDL ratio (below 4)',
			riskLevel: 'low',
			evaluate: (d) => {
				const ratio = d.cholesterol.totalHDLRatio
					?? calculateTcHdlRatio(d.cholesterol.totalCholesterol, d.cholesterol.hdlCholesterol);
				return ratio != null && ratio < 4;
			}
		},
		{
			id: 'HHC-019',
			category: 'Physical Activity',
			description: 'Physically active (150+ minutes per week moderate intensity)',
			riskLevel: 'low',
			evaluate: (d) =>
				d.physicalActivityDiet.physicalActivityMinutesPerWeek != null &&
				d.physicalActivityDiet.physicalActivityMinutesPerWeek >= 150
		},
		{
			id: 'HHC-020',
			category: 'Body Composition',
			description: 'Normal BMI (18.5 to 24.9)',
			riskLevel: 'low',
			evaluate: (d) => {
				const bmi = d.bodyMeasurements.bmi
					?? calculateBMI(d.bodyMeasurements.heightCm, d.bodyMeasurements.weightKg);
				return bmi != null && bmi >= 18.5 && bmi < 25;
			}
		}
	];
}

export function evaluateRules(data: AssessmentData, tenYearRisk: number, heartAge: number | null): FiredRule[] {
	const fired: FiredRule[] = [];
	for (const rule of allRules()) {
		if (rule.evaluate(data, tenYearRisk, heartAge)) {
			fired.push({
				id: rule.id,
				category: rule.category,
				description: rule.description,
				riskLevel: rule.riskLevel
			});
		}
	}
	return fired;
}
