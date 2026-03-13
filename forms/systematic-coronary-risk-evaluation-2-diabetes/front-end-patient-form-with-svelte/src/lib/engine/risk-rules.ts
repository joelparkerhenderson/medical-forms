import type { AssessmentData, FiredRule } from './types.js';
import { hasEstablishedCvd, hba1cMmolMol, calculateBmi } from './utils.js';

export interface RiskRule {
	id: string;
	category: string;
	description: string;
	riskLevel: string;
	evaluate: (d: AssessmentData) => boolean;
}

export function allRules(): RiskRule[] {
	return [
		// HIGH RISK rules
		{
			id: 'CVR-001',
			category: 'Cardiovascular History',
			description: 'Established cardiovascular disease (prior MI, stroke, TIA, PAD, or HF)',
			riskLevel: 'high',
			evaluate: (d) => hasEstablishedCvd(d)
		},
		{
			id: 'CVR-002',
			category: 'Blood Pressure',
			description: 'Severely elevated blood pressure (systolic >= 180 mmHg)',
			riskLevel: 'high',
			evaluate: (d) => d.bloodPressure.systolicBp != null && d.bloodPressure.systolicBp >= 180
		},
		{
			id: 'CVR-003',
			category: 'Glycaemic Control',
			description: 'Very poor glycaemic control (HbA1c >= 75 mmol/mol / 9%)',
			riskLevel: 'high',
			evaluate: (d) => {
				const v = hba1cMmolMol(d);
				return v != null && v >= 75;
			}
		},
		{
			id: 'CVR-004',
			category: 'Renal Function',
			description: 'Severe renal impairment (eGFR < 30 mL/min/1.73m2)',
			riskLevel: 'high',
			evaluate: (d) => d.renalFunction.egfr != null && d.renalFunction.egfr < 30
		},
		{
			id: 'CVR-005',
			category: 'Lipid Profile',
			description: 'Severely elevated total cholesterol (>= 8.0 mmol/L)',
			riskLevel: 'high',
			evaluate: (d) =>
				d.lipidProfile.totalCholesterol != null && d.lipidProfile.totalCholesterol >= 8.0
		},
		{
			id: 'CVR-006',
			category: 'Complications',
			description: 'Proliferative or maculopathy retinopathy',
			riskLevel: 'high',
			evaluate: (d) =>
				d.complicationsScreening.retinopathyStatus === 'proliferative' ||
				d.complicationsScreening.retinopathyStatus === 'maculopathy'
		},
		{
			id: 'CVR-007',
			category: 'Diabetes Duration',
			description: 'Long diabetes duration (>= 20 years)',
			riskLevel: 'high',
			evaluate: (d) =>
				d.diabetesHistory.diabetesDurationYears != null &&
				d.diabetesHistory.diabetesDurationYears >= 20
		},
		// MEDIUM RISK rules
		{
			id: 'CVR-008',
			category: 'Blood Pressure',
			description: 'Elevated blood pressure (systolic >= 140 mmHg)',
			riskLevel: 'medium',
			evaluate: (d) =>
				d.bloodPressure.systolicBp != null &&
				d.bloodPressure.systolicBp >= 140 &&
				d.bloodPressure.systolicBp < 180
		},
		{
			id: 'CVR-009',
			category: 'Glycaemic Control',
			description: 'Above-target HbA1c (>= 53 mmol/mol / 7%)',
			riskLevel: 'medium',
			evaluate: (d) => {
				const v = hba1cMmolMol(d);
				return v != null && v >= 53 && v < 75;
			}
		},
		{
			id: 'CVR-010',
			category: 'Lipid Profile',
			description: 'Elevated LDL cholesterol (>= 2.6 mmol/L)',
			riskLevel: 'medium',
			evaluate: (d) =>
				d.lipidProfile.ldlCholesterol != null && d.lipidProfile.ldlCholesterol >= 2.6
		},
		{
			id: 'CVR-011',
			category: 'Lifestyle',
			description: 'Current smoker',
			riskLevel: 'medium',
			evaluate: (d) => d.lifestyleFactors.smokingStatus === 'current'
		},
		{
			id: 'CVR-012',
			category: 'Renal Function',
			description: 'Moderate renal impairment (eGFR 30-59 mL/min/1.73m2)',
			riskLevel: 'medium',
			evaluate: (d) =>
				d.renalFunction.egfr != null &&
				d.renalFunction.egfr >= 30 &&
				d.renalFunction.egfr < 60
		},
		{
			id: 'CVR-013',
			category: 'Renal Function',
			description: 'Albuminuria present (urine ACR >= 3 mg/mmol)',
			riskLevel: 'medium',
			evaluate: (d) => d.renalFunction.urineAcr != null && d.renalFunction.urineAcr >= 3
		},
		{
			id: 'CVR-014',
			category: 'Lifestyle',
			description: 'Obesity (BMI >= 30)',
			riskLevel: 'medium',
			evaluate: (d) => {
				const bmi =
					d.lifestyleFactors.bmi ??
					calculateBmi(d.patientDemographics.heightCm, d.patientDemographics.weightKg);
				return bmi != null && bmi >= 30;
			}
		},
		{
			id: 'CVR-015',
			category: 'Cardiovascular',
			description: 'Atrial fibrillation',
			riskLevel: 'medium',
			evaluate: (d) => d.cardiovascularHistory.atrialFibrillation === 'yes'
		},
		{
			id: 'CVR-016',
			category: 'Cardiovascular',
			description: 'Family history of premature cardiovascular disease',
			riskLevel: 'medium',
			evaluate: (d) => d.cardiovascularHistory.familyCvdHistory === 'yes'
		},
		{
			id: 'CVR-017',
			category: 'Lipid Profile',
			description: 'Low HDL cholesterol (< 1.0 mmol/L male, < 1.2 mmol/L female)',
			riskLevel: 'medium',
			evaluate: (d) => {
				const threshold = d.patientDemographics.sex === 'male' ? 1.0 : 1.2;
				return (
					d.lipidProfile.hdlCholesterol != null &&
					d.lipidProfile.hdlCholesterol < threshold
				);
			}
		},
		// LOW RISK rules
		{
			id: 'CVR-018',
			category: 'Lifestyle',
			description: 'Sedentary lifestyle reported',
			riskLevel: 'low',
			evaluate: (d) => d.lifestyleFactors.physicalActivity === 'sedentary'
		},
		{
			id: 'CVR-019',
			category: 'Complications',
			description: 'Background retinopathy present',
			riskLevel: 'low',
			evaluate: (d) => d.complicationsScreening.retinopathyStatus === 'background'
		},
		{
			id: 'CVR-020',
			category: 'Lipid Profile',
			description: 'Elevated triglycerides (>= 2.3 mmol/L)',
			riskLevel: 'low',
			evaluate: (d) =>
				d.lipidProfile.triglycerides != null && d.lipidProfile.triglycerides >= 2.3
		}
	];
}

/** Evaluate all rules against assessment data. */
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
