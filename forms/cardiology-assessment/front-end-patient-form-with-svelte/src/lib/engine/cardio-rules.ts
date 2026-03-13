import type { CardioRule } from './types';
import { calculateAge } from './utils';

/**
 * Declarative cardiology grading rules.
 * Each rule evaluates patient data and returns true if the condition is present.
 * Rules contribute to both CCS/NYHA classification and overall risk determination.
 * Grade 1 = mild finding, 2 = moderate, 3 = significant, 4 = severe/critical.
 */
export const cardioRules: CardioRule[] = [
	// ─── CHEST PAIN / ANGINA ──────────────────────────────────────
	{
		id: 'CP-001',
		system: 'Chest Pain',
		description: 'CCS Class I angina - strenuous exertion only',
		grade: 1,
		evaluate: (d) => d.chestPainAngina.ccsClass === '1'
	},
	{
		id: 'CP-002',
		system: 'Chest Pain',
		description: 'CCS Class II angina - slight limitation of ordinary activity',
		grade: 2,
		evaluate: (d) => d.chestPainAngina.ccsClass === '2'
	},
	{
		id: 'CP-003',
		system: 'Chest Pain',
		description: 'CCS Class III angina - marked limitation of ordinary activity',
		grade: 3,
		evaluate: (d) => d.chestPainAngina.ccsClass === '3'
	},
	{
		id: 'CP-004',
		system: 'Chest Pain',
		description: 'CCS Class IV angina - angina at rest',
		grade: 4,
		evaluate: (d) => d.chestPainAngina.ccsClass === '4'
	},
	{
		id: 'CP-005',
		system: 'Chest Pain',
		description: 'Unstable angina',
		grade: 4,
		evaluate: (d) => d.chestPainAngina.unstableAngina === 'yes'
	},
	{
		id: 'CP-006',
		system: 'Chest Pain',
		description: 'Daily angina episodes',
		grade: 3,
		evaluate: (d) =>
			d.chestPainAngina.chestPain === 'yes' && d.chestPainAngina.anginaFrequency === 'daily'
	},
	{
		id: 'CP-007',
		system: 'Chest Pain',
		description: 'Prolonged angina episodes (>20 min)',
		grade: 3,
		evaluate: (d) =>
			d.chestPainAngina.chestPain === 'yes' &&
			d.chestPainAngina.anginaDuration === 'greater-20-min'
	},

	// ─── HEART FAILURE ──────────────────────────────────────────
	{
		id: 'HF-001',
		system: 'Heart Failure',
		description: 'NYHA Class I - no limitation',
		grade: 1,
		evaluate: (d) => d.heartFailureSymptoms.nyhaClass === '1'
	},
	{
		id: 'HF-002',
		system: 'Heart Failure',
		description: 'NYHA Class II - slight limitation',
		grade: 2,
		evaluate: (d) => d.heartFailureSymptoms.nyhaClass === '2'
	},
	{
		id: 'HF-003',
		system: 'Heart Failure',
		description: 'NYHA Class III - marked limitation',
		grade: 3,
		evaluate: (d) => d.heartFailureSymptoms.nyhaClass === '3'
	},
	{
		id: 'HF-004',
		system: 'Heart Failure',
		description: 'NYHA Class IV - symptoms at rest',
		grade: 4,
		evaluate: (d) => d.heartFailureSymptoms.nyhaClass === '4'
	},
	{
		id: 'HF-005',
		system: 'Heart Failure',
		description: 'Orthopnoea present',
		grade: 3,
		evaluate: (d) => d.heartFailureSymptoms.orthopnoea === 'yes'
	},
	{
		id: 'HF-006',
		system: 'Heart Failure',
		description: 'Paroxysmal nocturnal dyspnoea (PND)',
		grade: 3,
		evaluate: (d) => d.heartFailureSymptoms.pnd === 'yes'
	},
	{
		id: 'HF-007',
		system: 'Heart Failure',
		description: 'Peripheral oedema',
		grade: 2,
		evaluate: (d) => d.heartFailureSymptoms.peripheralOedema === 'yes'
	},

	// ─── CARDIAC HISTORY ────────────────────────────────────────
	{
		id: 'CH-001',
		system: 'Cardiac History',
		description: 'Previous myocardial infarction',
		grade: 2,
		evaluate: (d) =>
			d.cardiacHistory.previousMI === 'yes' && d.cardiacHistory.recentMI !== 'yes'
	},
	{
		id: 'CH-002',
		system: 'Cardiac History',
		description: 'Recent MI (<3 months)',
		grade: 4,
		evaluate: (d) =>
			d.cardiacHistory.recentMI === 'yes' &&
			d.cardiacHistory.recentMIWeeks !== null &&
			d.cardiacHistory.recentMIWeeks < 12
	},
	{
		id: 'CH-003',
		system: 'Cardiac History',
		description: 'Previous PCI (percutaneous coronary intervention)',
		grade: 2,
		evaluate: (d) => d.cardiacHistory.pci === 'yes'
	},
	{
		id: 'CH-004',
		system: 'Cardiac History',
		description: 'Previous CABG',
		grade: 2,
		evaluate: (d) => d.cardiacHistory.cabg === 'yes'
	},
	{
		id: 'CH-005',
		system: 'Cardiac History',
		description: 'Valvular heart disease',
		grade: 3,
		evaluate: (d) => d.cardiacHistory.valvularDisease === 'yes'
	},
	{
		id: 'CH-006',
		system: 'Cardiac History',
		description: 'Cardiomyopathy',
		grade: 3,
		evaluate: (d) => d.cardiacHistory.cardiomyopathy === 'yes'
	},
	{
		id: 'CH-007',
		system: 'Cardiac History',
		description: 'Pericarditis',
		grade: 2,
		evaluate: (d) => d.cardiacHistory.pericarditis === 'yes'
	},

	// ─── ARRHYTHMIA & CONDUCTION ────────────────────────────────
	{
		id: 'AR-001',
		system: 'Arrhythmia',
		description: 'Paroxysmal atrial fibrillation',
		grade: 2,
		evaluate: (d) =>
			d.arrhythmiaConduction.atrialFibrillation === 'yes' &&
			d.arrhythmiaConduction.afType === 'paroxysmal'
	},
	{
		id: 'AR-002',
		system: 'Arrhythmia',
		description: 'Persistent/permanent atrial fibrillation',
		grade: 3,
		evaluate: (d) =>
			d.arrhythmiaConduction.atrialFibrillation === 'yes' &&
			(d.arrhythmiaConduction.afType === 'persistent' ||
				d.arrhythmiaConduction.afType === 'permanent')
	},
	{
		id: 'AR-003',
		system: 'Arrhythmia',
		description: 'Pacemaker/ICD in situ',
		grade: 2,
		evaluate: (d) => d.arrhythmiaConduction.pacemaker === 'yes'
	},
	{
		id: 'AR-004',
		system: 'Arrhythmia',
		description: 'Syncope history',
		grade: 3,
		evaluate: (d) => d.arrhythmiaConduction.syncope === 'yes'
	},
	{
		id: 'AR-005',
		system: 'Arrhythmia',
		description: 'Other arrhythmia',
		grade: 2,
		evaluate: (d) => d.arrhythmiaConduction.otherArrhythmia === 'yes'
	},

	// ─── RISK FACTORS ───────────────────────────────────────────
	{
		id: 'RF-001',
		system: 'Risk Factors',
		description: 'Controlled hypertension',
		grade: 1,
		evaluate: (d) =>
			d.riskFactors.hypertension === 'yes' && d.riskFactors.hypertensionControlled === 'yes'
	},
	{
		id: 'RF-002',
		system: 'Risk Factors',
		description: 'Uncontrolled hypertension',
		grade: 3,
		evaluate: (d) =>
			d.riskFactors.hypertension === 'yes' && d.riskFactors.hypertensionControlled === 'no'
	},
	{
		id: 'RF-003',
		system: 'Risk Factors',
		description: 'Diabetes mellitus',
		grade: 2,
		evaluate: (d) => d.riskFactors.diabetes === 'yes'
	},
	{
		id: 'RF-004',
		system: 'Risk Factors',
		description: 'Hyperlipidaemia',
		grade: 1,
		evaluate: (d) => d.riskFactors.hyperlipidaemia === 'yes'
	},
	{
		id: 'RF-005',
		system: 'Risk Factors',
		description: 'Family history of premature cardiovascular disease',
		grade: 1,
		evaluate: (d) => d.riskFactors.familyHistory === 'yes'
	},
	{
		id: 'RF-006',
		system: 'Risk Factors',
		description: 'Obesity',
		grade: 2,
		evaluate: (d) =>
			d.riskFactors.obesity === 'yes' ||
			(d.demographics.bmi !== null && d.demographics.bmi >= 30)
	},

	// ─── DIAGNOSTIC RESULTS ─────────────────────────────────────
	{
		id: 'DX-001',
		system: 'Diagnostics',
		description: 'Abnormal ECG',
		grade: 2,
		evaluate: (d) => d.diagnosticResults.ecgNormal === 'no'
	},
	{
		id: 'DX-002',
		system: 'Diagnostics',
		description: 'Reduced LVEF (<40%)',
		grade: 3,
		evaluate: (d) =>
			d.diagnosticResults.echoPerformed === 'yes' &&
			d.diagnosticResults.echoLVEF !== null &&
			d.diagnosticResults.echoLVEF < 40
	},
	{
		id: 'DX-003',
		system: 'Diagnostics',
		description: 'Severely reduced LVEF (<25%)',
		grade: 4,
		evaluate: (d) =>
			d.diagnosticResults.echoPerformed === 'yes' &&
			d.diagnosticResults.echoLVEF !== null &&
			d.diagnosticResults.echoLVEF < 25
	},
	{
		id: 'DX-004',
		system: 'Diagnostics',
		description: 'Abnormal stress test',
		grade: 3,
		evaluate: (d) =>
			d.diagnosticResults.stressTestPerformed === 'yes' &&
			d.diagnosticResults.stressTestResult === 'abnormal'
	},

	// ─── FUNCTIONAL CAPACITY ────────────────────────────────────
	{
		id: 'FC-001',
		system: 'Functional Capacity',
		description: 'Poor functional capacity (<4 METs)',
		grade: 3,
		evaluate: (d) =>
			d.socialFunctional.estimatedMETs !== null && d.socialFunctional.estimatedMETs < 4
	},

	// ─── DEMOGRAPHICS ───────────────────────────────────────────
	{
		id: 'AG-001',
		system: 'Demographics',
		description: 'Age >75 years',
		grade: 2,
		evaluate: (d) => {
			const age = calculateAge(d.demographics.dateOfBirth);
			return age !== null && age > 75;
		}
	},

	// ─── SOCIAL ─────────────────────────────────────────────────
	{
		id: 'SH-001',
		system: 'Social',
		description: 'Current smoker',
		grade: 2,
		evaluate: (d) => d.socialFunctional.smoking === 'current'
	},
	{
		id: 'SH-002',
		system: 'Social',
		description: 'Heavy alcohol use',
		grade: 2,
		evaluate: (d) => d.socialFunctional.alcohol === 'heavy'
	}
];
