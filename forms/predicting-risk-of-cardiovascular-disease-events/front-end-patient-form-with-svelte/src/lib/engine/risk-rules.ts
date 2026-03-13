import type { AssessmentData, FiredRule } from './types';
import { estimateTenYearRisk, hba1cToPercent, isSmoker } from './utils';

interface RiskRule {
	id: string;
	category: string;
	description: string;
	riskLevel: string;
	evaluate: (d: AssessmentData) => boolean;
}

/** All risk rules, ordered by risk level (high -> medium -> low). */
export function allRules(): RiskRule[] {
	return [
		// HIGH RISK
		{
			id: 'PVT-001',
			category: 'Overall Risk',
			description: 'Estimated 10-year CVD risk >= 20%',
			riskLevel: 'high',
			evaluate: (d) => estimateTenYearRisk(d) >= 20.0
		},
		{
			id: 'PVT-002',
			category: 'Renal / Diabetes',
			description: 'Diabetes with eGFR < 30 (severe CKD with diabetes)',
			riskLevel: 'high',
			evaluate: (d) =>
				d.metabolicHealth.hasDiabetes === 'yes' &&
				d.renalFunction.egfr !== null &&
				d.renalFunction.egfr < 30.0
		},
		{
			id: 'PVT-003',
			category: 'Blood Pressure',
			description: 'Systolic BP >= 180 mmHg (hypertensive crisis)',
			riskLevel: 'high',
			evaluate: (d) =>
				d.bloodPressure.systolicBp !== null && d.bloodPressure.systolicBp >= 180.0
		},
		{
			id: 'PVT-004',
			category: 'Multiple Factors',
			description:
				'Multiple major risk factors (>= 3 of: diabetes, smoking, BP >= 160, TC >= 280, eGFR < 45)',
			riskLevel: 'high',
			evaluate: (d) => {
				let count = 0;
				if (d.metabolicHealth.hasDiabetes === 'yes') count++;
				if (isSmoker(d.smokingHistory.smokingStatus)) count++;
				if (d.bloodPressure.systolicBp !== null && d.bloodPressure.systolicBp >= 160.0) count++;
				if (
					d.cholesterolLipids.totalCholesterol !== null &&
					d.cholesterolLipids.totalCholesterol >= 280.0
				)
					count++;
				if (d.renalFunction.egfr !== null && d.renalFunction.egfr < 45.0) count++;
				return count >= 3;
			}
		},
		{
			id: 'PVT-005',
			category: 'Diabetes / Smoking',
			description: 'HbA1c >= 10% with current smoking',
			riskLevel: 'high',
			evaluate: (d) => {
				const hba1c = hba1cToPercent(
					d.metabolicHealth.hba1cValue,
					d.metabolicHealth.hba1cUnit
				);
				return hba1c !== null && hba1c >= 10.0 && isSmoker(d.smokingHistory.smokingStatus);
			}
		},
		// MEDIUM RISK
		{
			id: 'PVT-006',
			category: 'Overall Risk',
			description: '10-year risk 7.5-19.9% (intermediate risk)',
			riskLevel: 'medium',
			evaluate: (d) => {
				const risk = estimateTenYearRisk(d);
				return risk >= 7.5 && risk < 20.0;
			}
		},
		{
			id: 'PVT-007',
			category: 'Smoking',
			description: 'Current smoker',
			riskLevel: 'medium',
			evaluate: (d) => isSmoker(d.smokingHistory.smokingStatus)
		},
		{
			id: 'PVT-008',
			category: 'Diabetes',
			description: 'Diabetes present',
			riskLevel: 'medium',
			evaluate: (d) => d.metabolicHealth.hasDiabetes === 'yes'
		},
		{
			id: 'PVT-009',
			category: 'Renal Function',
			description: 'eGFR 15-44 mL/min (CKD stage 3b-4)',
			riskLevel: 'medium',
			evaluate: (d) =>
				d.renalFunction.egfr !== null &&
				d.renalFunction.egfr >= 15.0 &&
				d.renalFunction.egfr < 45.0
		},
		{
			id: 'PVT-010',
			category: 'Blood Pressure',
			description: 'Systolic BP 140-179 mmHg (hypertension)',
			riskLevel: 'medium',
			evaluate: (d) =>
				d.bloodPressure.systolicBp !== null &&
				d.bloodPressure.systolicBp >= 140.0 &&
				d.bloodPressure.systolicBp < 180.0
		},
		{
			id: 'PVT-011',
			category: 'Cholesterol',
			description: 'Total cholesterol >= 240 mg/dL',
			riskLevel: 'medium',
			evaluate: (d) =>
				d.cholesterolLipids.totalCholesterol !== null &&
				d.cholesterolLipids.totalCholesterol >= 240.0
		},
		{
			id: 'PVT-012',
			category: 'Cholesterol',
			description: 'HDL cholesterol < 40 mg/dL (low)',
			riskLevel: 'medium',
			evaluate: (d) =>
				d.cholesterolLipids.hdlCholesterol !== null &&
				d.cholesterolLipids.hdlCholesterol < 40.0
		},
		{
			id: 'PVT-013',
			category: 'BMI',
			description: 'BMI >= 30 (obese)',
			riskLevel: 'medium',
			evaluate: (d) => d.metabolicHealth.bmi !== null && d.metabolicHealth.bmi >= 30.0
		},
		{
			id: 'PVT-014',
			category: 'Medications',
			description: 'On antihypertensive medication (known hypertension)',
			riskLevel: 'medium',
			evaluate: (d) => d.bloodPressure.onAntihypertensive === 'yes'
		},
		{
			id: 'PVT-015',
			category: 'Renal Function',
			description: 'Albuminuria (uACR > 30 mg/g)',
			riskLevel: 'medium',
			evaluate: (d) => d.renalFunction.urineAcr !== null && d.renalFunction.urineAcr > 30.0
		},
		// LOW RISK (protective indicators)
		{
			id: 'PVT-016',
			category: 'Cholesterol',
			description: 'HDL cholesterol >= 60 mg/dL (protective)',
			riskLevel: 'low',
			evaluate: (d) =>
				d.cholesterolLipids.hdlCholesterol !== null &&
				d.cholesterolLipids.hdlCholesterol >= 60.0
		},
		{
			id: 'PVT-017',
			category: 'Smoking',
			description: 'Non-smoker',
			riskLevel: 'low',
			evaluate: (d) =>
				d.smokingHistory.smokingStatus !== '' &&
				!isSmoker(d.smokingHistory.smokingStatus)
		},
		{
			id: 'PVT-018',
			category: 'Blood Pressure',
			description: 'Normal BP (< 120/80 mmHg), no treatment',
			riskLevel: 'low',
			evaluate: (d) =>
				d.bloodPressure.systolicBp !== null &&
				d.bloodPressure.systolicBp < 120.0 &&
				d.bloodPressure.diastolicBp !== null &&
				d.bloodPressure.diastolicBp < 80.0 &&
				d.bloodPressure.onAntihypertensive !== 'yes'
		},
		{
			id: 'PVT-019',
			category: 'Renal Function',
			description: 'eGFR >= 90 mL/min (normal renal function)',
			riskLevel: 'low',
			evaluate: (d) => d.renalFunction.egfr !== null && d.renalFunction.egfr >= 90.0
		},
		{
			id: 'PVT-020',
			category: 'BMI',
			description: 'BMI 18.5-24.9 (normal weight)',
			riskLevel: 'low',
			evaluate: (d) =>
				d.metabolicHealth.bmi !== null &&
				d.metabolicHealth.bmi >= 18.5 &&
				d.metabolicHealth.bmi <= 24.9
		}
	];
}

/** Evaluate all rules against assessment data and return fired rules. */
export function evaluateRules(data: AssessmentData): FiredRule[] {
	const fired: FiredRule[] = [];
	for (const rule of allRules()) {
		if (rule.evaluate(data)) {
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
