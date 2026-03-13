import type { GoldRule } from './types';

/**
 * Declarative GOLD staging rules.
 * Each rule evaluates patient data and returns true if the condition is present.
 * The GOLD stage is determined by the highest-stage rule that fires.
 * GOLD I is the default when FEV1 data is available.
 */
export const goldRules: GoldRule[] = [
	// ─── SPIROMETRY-BASED GOLD STAGING ──────────────────────────
	{
		id: 'GOLD-001',
		system: 'Spirometry',
		description: 'GOLD I - FEV1 >= 80% predicted (Mild)',
		stage: 1,
		evaluate: (d) =>
			d.spirometry.fev1PercentPredicted !== null &&
			d.spirometry.fev1PercentPredicted >= 80 &&
			d.spirometry.fev1FvcRatio !== null &&
			d.spirometry.fev1FvcRatio < 0.7
	},
	{
		id: 'GOLD-002',
		system: 'Spirometry',
		description: 'GOLD II - 50% <= FEV1 < 80% predicted (Moderate)',
		stage: 2,
		evaluate: (d) =>
			d.spirometry.fev1PercentPredicted !== null &&
			d.spirometry.fev1PercentPredicted >= 50 &&
			d.spirometry.fev1PercentPredicted < 80 &&
			d.spirometry.fev1FvcRatio !== null &&
			d.spirometry.fev1FvcRatio < 0.7
	},
	{
		id: 'GOLD-003',
		system: 'Spirometry',
		description: 'GOLD III - 30% <= FEV1 < 50% predicted (Severe)',
		stage: 3,
		evaluate: (d) =>
			d.spirometry.fev1PercentPredicted !== null &&
			d.spirometry.fev1PercentPredicted >= 30 &&
			d.spirometry.fev1PercentPredicted < 50 &&
			d.spirometry.fev1FvcRatio !== null &&
			d.spirometry.fev1FvcRatio < 0.7
	},
	{
		id: 'GOLD-004',
		system: 'Spirometry',
		description: 'GOLD IV - FEV1 < 30% predicted (Very Severe)',
		stage: 4,
		evaluate: (d) =>
			d.spirometry.fev1PercentPredicted !== null &&
			d.spirometry.fev1PercentPredicted < 30 &&
			d.spirometry.fev1FvcRatio !== null &&
			d.spirometry.fev1FvcRatio < 0.7
	},

	// ─── SYMPTOM SEVERITY ──────────────────────────────────────
	{
		id: 'SYM-001',
		system: 'Symptoms',
		description: 'High symptom burden (CAT >= 10)',
		stage: 2,
		evaluate: (d) =>
			d.symptomAssessment.catScore !== null && d.symptomAssessment.catScore >= 10
	},
	{
		id: 'SYM-002',
		system: 'Symptoms',
		description: 'Very high symptom burden (CAT >= 20)',
		stage: 3,
		evaluate: (d) =>
			d.symptomAssessment.catScore !== null && d.symptomAssessment.catScore >= 20
	},
	{
		id: 'SYM-003',
		system: 'Symptoms',
		description: 'Severe dyspnoea (mMRC >= 3)',
		stage: 3,
		evaluate: (d) =>
			d.symptomAssessment.mmrcDyspnoea === '3' ||
			d.symptomAssessment.mmrcDyspnoea === '4' ||
			d.symptomAssessment.mmrcDyspnoea === '5'
	},
	{
		id: 'SYM-004',
		system: 'Symptoms',
		description: 'Copious sputum production',
		stage: 2,
		evaluate: (d) => d.symptomAssessment.sputumProduction === 'copious'
	},

	// ─── EXACERBATION HISTORY ──────────────────────────────────
	{
		id: 'EX-001',
		system: 'Exacerbations',
		description: 'Frequent exacerbations (>= 2 per year)',
		stage: 3,
		evaluate: (d) =>
			d.exacerbationHistory.exacerbationsPerYear !== null &&
			d.exacerbationHistory.exacerbationsPerYear >= 2
	},
	{
		id: 'EX-002',
		system: 'Exacerbations',
		description: 'Hospitalisation for exacerbation',
		stage: 3,
		evaluate: (d) =>
			d.exacerbationHistory.hospitalizationsPerYear !== null &&
			d.exacerbationHistory.hospitalizationsPerYear >= 1
	},
	{
		id: 'EX-003',
		system: 'Exacerbations',
		description: 'ICU admission for exacerbation',
		stage: 4,
		evaluate: (d) =>
			d.exacerbationHistory.icuAdmissions !== null &&
			d.exacerbationHistory.icuAdmissions >= 1
	},
	{
		id: 'EX-004',
		system: 'Exacerbations',
		description: 'History of intubation',
		stage: 4,
		evaluate: (d) => d.exacerbationHistory.intubationHistory === 'yes'
	},

	// ─── OXYGEN THERAPY ────────────────────────────────────────
	{
		id: 'OX-001',
		system: 'Medications',
		description: 'On long-term oxygen therapy',
		stage: 4,
		evaluate: (d) => d.currentMedications.oxygenTherapy === 'yes'
	},
	{
		id: 'OX-002',
		system: 'Medications',
		description: 'On oral corticosteroids',
		stage: 3,
		evaluate: (d) => d.currentMedications.oralCorticosteroids === 'yes'
	},

	// ─── SMOKING & EXPOSURES ───────────────────────────────────
	{
		id: 'SM-001',
		system: 'Smoking',
		description: 'Current smoker',
		stage: 2,
		evaluate: (d) => d.smokingExposures.smokingStatus === 'current'
	},
	{
		id: 'SM-002',
		system: 'Smoking',
		description: 'Heavy smoking history (>= 40 pack-years)',
		stage: 3,
		evaluate: (d) =>
			d.smokingExposures.packYears !== null && d.smokingExposures.packYears >= 40
	},

	// ─── FUNCTIONAL STATUS ─────────────────────────────────────
	{
		id: 'FS-001',
		system: 'Functional Status',
		description: 'Poor exercise tolerance (unable or light housework only)',
		stage: 3,
		evaluate: (d) =>
			d.functionalStatus.exerciseTolerance === 'unable' ||
			d.functionalStatus.exerciseTolerance === 'light-housework'
	},
	{
		id: 'FS-002',
		system: 'Functional Status',
		description: 'Low 6MWT distance (< 250m)',
		stage: 3,
		evaluate: (d) =>
			d.functionalStatus.sixMinuteWalkDistance !== null &&
			d.functionalStatus.sixMinuteWalkDistance < 250
	},
	{
		id: 'FS-003',
		system: 'Functional Status',
		description: 'Resting oxygen desaturation (SpO2 < 92%)',
		stage: 4,
		evaluate: (d) =>
			d.functionalStatus.oxygenSaturationRest !== null &&
			d.functionalStatus.oxygenSaturationRest < 92
	},
	{
		id: 'FS-004',
		system: 'Functional Status',
		description: 'Exercise-induced desaturation (SpO2 < 88%)',
		stage: 3,
		evaluate: (d) =>
			d.functionalStatus.oxygenSaturationExertion !== null &&
			d.functionalStatus.oxygenSaturationExertion < 88
	},

	// ─── COMORBIDITIES ─────────────────────────────────────────
	{
		id: 'CM-001',
		system: 'Comorbidities',
		description: 'Cardiovascular comorbidity',
		stage: 2,
		evaluate: (d) => d.comorbidities.cardiovascularDisease === 'yes'
	},
	{
		id: 'CM-002',
		system: 'Comorbidities',
		description: 'Lung cancer',
		stage: 4,
		evaluate: (d) => d.comorbidities.lungCancer === 'yes'
	},
	{
		id: 'CM-003',
		system: 'Comorbidities',
		description: 'Diabetes',
		stage: 2,
		evaluate: (d) => d.comorbidities.diabetes === 'yes'
	},
	{
		id: 'CM-004',
		system: 'Comorbidities',
		description: 'Depression',
		stage: 2,
		evaluate: (d) => d.comorbidities.depression === 'yes'
	},

	// ─── BMI ───────────────────────────────────────────────────
	{
		id: 'BMI-001',
		system: 'Demographics',
		description: 'BMI < 21 (underweight/cachexia)',
		stage: 3,
		evaluate: (d) => d.demographics.bmi !== null && d.demographics.bmi < 21
	},
	{
		id: 'BMI-002',
		system: 'Demographics',
		description: 'BMI >= 35 (obese)',
		stage: 2,
		evaluate: (d) => d.demographics.bmi !== null && d.demographics.bmi >= 35
	}
];
