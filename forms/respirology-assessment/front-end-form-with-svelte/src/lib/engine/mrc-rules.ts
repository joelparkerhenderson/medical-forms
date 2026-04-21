import type { MRCRule } from './types';

/**
 * Declarative MRC Dyspnoea Scale grading rules.
 * Each rule evaluates patient data and returns true if the condition is present.
 * The MRC grade is determined by the highest-grade rule that fires.
 * MRC 1 is the default when no rules fire (breathless only on strenuous exercise).
 */
export const mrcRules: MRCRule[] = [
	// ─── DIRECT MRC GRADE ─────────────────────────────────────
	{
		id: 'MRC-001',
		system: 'Dyspnoea',
		description: 'Patient self-reported MRC Grade 2',
		grade: 2,
		evaluate: (d) => d.dyspnoeaAssessment.mrcGrade === '2'
	},
	{
		id: 'MRC-002',
		system: 'Dyspnoea',
		description: 'Patient self-reported MRC Grade 3',
		grade: 3,
		evaluate: (d) => d.dyspnoeaAssessment.mrcGrade === '3'
	},
	{
		id: 'MRC-003',
		system: 'Dyspnoea',
		description: 'Patient self-reported MRC Grade 4',
		grade: 4,
		evaluate: (d) => d.dyspnoeaAssessment.mrcGrade === '4'
	},
	{
		id: 'MRC-004',
		system: 'Dyspnoea',
		description: 'Patient self-reported MRC Grade 5',
		grade: 5,
		evaluate: (d) => d.dyspnoeaAssessment.mrcGrade === '5'
	},

	// ─── PULMONARY FUNCTION ─────────────────────────────────────
	{
		id: 'PF-001',
		system: 'Pulmonary Function',
		description: 'FEV1 50-79% predicted (moderate obstruction)',
		grade: 3,
		evaluate: (d) =>
			d.pulmonaryFunction.fev1 !== null && d.pulmonaryFunction.fev1 >= 50 && d.pulmonaryFunction.fev1 < 80
	},
	{
		id: 'PF-002',
		system: 'Pulmonary Function',
		description: 'FEV1 30-49% predicted (severe obstruction)',
		grade: 4,
		evaluate: (d) =>
			d.pulmonaryFunction.fev1 !== null && d.pulmonaryFunction.fev1 >= 30 && d.pulmonaryFunction.fev1 < 50
	},
	{
		id: 'PF-003',
		system: 'Pulmonary Function',
		description: 'FEV1 <30% predicted (very severe obstruction)',
		grade: 5,
		evaluate: (d) => d.pulmonaryFunction.fev1 !== null && d.pulmonaryFunction.fev1 < 30
	},
	{
		id: 'PF-004',
		system: 'Pulmonary Function',
		description: 'Reduced FEV1/FVC ratio (<0.70, obstructive pattern)',
		grade: 2,
		evaluate: (d) => d.pulmonaryFunction.fev1FvcRatio !== null && d.pulmonaryFunction.fev1FvcRatio < 70
	},
	{
		id: 'PF-005',
		system: 'Pulmonary Function',
		description: 'Low oxygen saturation (SpO2 88-92%)',
		grade: 3,
		evaluate: (d) =>
			d.pulmonaryFunction.oxygenSaturation !== null &&
			d.pulmonaryFunction.oxygenSaturation >= 88 &&
			d.pulmonaryFunction.oxygenSaturation < 93
	},
	{
		id: 'PF-006',
		system: 'Pulmonary Function',
		description: 'Very low oxygen saturation (SpO2 <88%)',
		grade: 4,
		evaluate: (d) =>
			d.pulmonaryFunction.oxygenSaturation !== null && d.pulmonaryFunction.oxygenSaturation < 88
	},
	{
		id: 'PF-007',
		system: 'Pulmonary Function',
		description: 'Reduced DLCO (<60% predicted)',
		grade: 3,
		evaluate: (d) => d.pulmonaryFunction.dlco !== null && d.pulmonaryFunction.dlco < 60
	},

	// ─── RESPIRATORY HISTORY ────────────────────────────────────
	{
		id: 'RH-001',
		system: 'Respiratory History',
		description: 'Known asthma',
		grade: 2,
		evaluate: (d) => d.respiratoryHistory.asthma === 'yes'
	},
	{
		id: 'RH-002',
		system: 'Respiratory History',
		description: 'Mild COPD',
		grade: 2,
		evaluate: (d) =>
			d.respiratoryHistory.copd === 'yes' && d.respiratoryHistory.copdSeverity === 'mild'
	},
	{
		id: 'RH-003',
		system: 'Respiratory History',
		description: 'Moderate COPD',
		grade: 3,
		evaluate: (d) =>
			d.respiratoryHistory.copd === 'yes' && d.respiratoryHistory.copdSeverity === 'moderate'
	},
	{
		id: 'RH-004',
		system: 'Respiratory History',
		description: 'Severe COPD',
		grade: 4,
		evaluate: (d) =>
			d.respiratoryHistory.copd === 'yes' && d.respiratoryHistory.copdSeverity === 'severe'
	},
	{
		id: 'RH-005',
		system: 'Respiratory History',
		description: 'Bronchiectasis',
		grade: 3,
		evaluate: (d) => d.respiratoryHistory.bronchiectasis === 'yes'
	},
	{
		id: 'RH-006',
		system: 'Respiratory History',
		description: 'Interstitial lung disease',
		grade: 3,
		evaluate: (d) => d.respiratoryHistory.interstitialLungDisease === 'yes'
	},
	{
		id: 'RH-007',
		system: 'Respiratory History',
		description: 'Previous pulmonary embolism',
		grade: 3,
		evaluate: (d) => d.respiratoryHistory.pulmonaryEmbolism === 'yes'
	},
	{
		id: 'RH-008',
		system: 'Respiratory History',
		description: 'Recurrent pneumonia',
		grade: 3,
		evaluate: (d) =>
			d.respiratoryHistory.pneumonia === 'yes' && d.respiratoryHistory.pneumoniaRecurrent === 'yes'
	},

	// ─── OXYGEN THERAPY ─────────────────────────────────────────
	{
		id: 'OX-001',
		system: 'Current Treatment',
		description: 'On long-term oxygen therapy',
		grade: 4,
		evaluate: (d) => d.currentMedications.oxygenTherapy === 'yes'
	},
	{
		id: 'OX-002',
		system: 'Current Treatment',
		description: 'On oral corticosteroids',
		grade: 3,
		evaluate: (d) => d.currentMedications.oralSteroids === 'yes'
	},

	// ─── FUNCTIONAL STATUS ──────────────────────────────────────
	{
		id: 'FS-001',
		system: 'Functional',
		description: 'Limited functional status',
		grade: 3,
		evaluate: (d) => d.sleepFunctional.functionalStatus === 'limited'
	},
	{
		id: 'FS-002',
		system: 'Functional',
		description: 'Dependent functional status',
		grade: 4,
		evaluate: (d) => d.sleepFunctional.functionalStatus === 'dependent'
	},

	// ─── ORTHOPNOEA / PND ───────────────────────────────────────
	{
		id: 'DY-001',
		system: 'Dyspnoea',
		description: 'Orthopnoea present',
		grade: 3,
		evaluate: (d) => d.dyspnoeaAssessment.orthopnoea === 'yes'
	},
	{
		id: 'DY-002',
		system: 'Dyspnoea',
		description: 'Paroxysmal nocturnal dyspnoea (PND)',
		grade: 3,
		evaluate: (d) => d.dyspnoeaAssessment.pnd === 'yes'
	},

	// ─── SMOKING ────────────────────────────────────────────────
	{
		id: 'SM-001',
		system: 'Smoking',
		description: 'Current smoker',
		grade: 2,
		evaluate: (d) => d.smokingExposures.smokingStatus === 'current'
	},
	{
		id: 'SM-002',
		system: 'Smoking',
		description: 'Heavy smoking history (>30 pack-years)',
		grade: 3,
		evaluate: (d) =>
			d.smokingExposures.packYears !== null && d.smokingExposures.packYears > 30
	},

	// ─── SLEEP ──────────────────────────────────────────────────
	{
		id: 'SL-001',
		system: 'Sleep',
		description: 'High STOP-BANG score (>=5)',
		grade: 3,
		evaluate: (d) =>
			d.sleepFunctional.stopBangScore !== null && d.sleepFunctional.stopBangScore >= 5
	},

	// ─── OBESITY ────────────────────────────────────────────────
	{
		id: 'OB-001',
		system: 'Obesity',
		description: 'BMI 30-39 (Obese)',
		grade: 2,
		evaluate: (d) =>
			d.demographics.bmi !== null && d.demographics.bmi >= 30 && d.demographics.bmi < 40
	},
	{
		id: 'OB-002',
		system: 'Obesity',
		description: 'BMI >=40 (Morbid obesity)',
		grade: 3,
		evaluate: (d) => d.demographics.bmi !== null && d.demographics.bmi >= 40
	}
];
