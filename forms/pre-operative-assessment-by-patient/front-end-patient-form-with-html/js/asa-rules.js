// ──────────────────────────────────────────────
// 42 Declarative ASA grading rules
// ──────────────────────────────────────────────

import { calculateAge } from './utils.js';

/**
 * Each rule evaluates patient data and returns true if the condition is present.
 * The ASA grade is determined by the highest-grade rule that fires.
 * ASA I is the default when no rules fire (healthy patient).
 */
export const asaRules = [
	// ─── CARDIOVASCULAR ──────────────────────────────────────
	{
		id: 'CV-001',
		system: 'Cardiovascular',
		description: 'Controlled hypertension',
		grade: 2,
		evaluate: (d) =>
			d.cardiovascular.hypertension === 'yes' && d.cardiovascular.hypertensionControlled === 'yes'
	},
	{
		id: 'CV-002',
		system: 'Cardiovascular',
		description: 'Uncontrolled hypertension',
		grade: 3,
		evaluate: (d) =>
			d.cardiovascular.hypertension === 'yes' && d.cardiovascular.hypertensionControlled === 'no'
	},
	{
		id: 'CV-003',
		system: 'Cardiovascular',
		description: 'Stable ischaemic heart disease',
		grade: 2,
		evaluate: (d) =>
			d.cardiovascular.ischemicHeartDisease === 'yes' && d.cardiovascular.recentMI !== 'yes'
	},
	{
		id: 'CV-004',
		system: 'Cardiovascular',
		description: 'Recent myocardial infarction (<3 months)',
		grade: 4,
		evaluate: (d) =>
			d.cardiovascular.recentMI === 'yes' &&
			d.cardiovascular.recentMIWeeks !== null &&
			d.cardiovascular.recentMIWeeks < 12
	},
	{
		id: 'CV-005',
		system: 'Cardiovascular',
		description: 'Heart failure NYHA I-II',
		grade: 2,
		evaluate: (d) =>
			d.cardiovascular.heartFailure === 'yes' &&
			(d.cardiovascular.heartFailureNYHA === '1' || d.cardiovascular.heartFailureNYHA === '2')
	},
	{
		id: 'CV-006',
		system: 'Cardiovascular',
		description: 'Heart failure NYHA III',
		grade: 3,
		evaluate: (d) =>
			d.cardiovascular.heartFailure === 'yes' && d.cardiovascular.heartFailureNYHA === '3'
	},
	{
		id: 'CV-007',
		system: 'Cardiovascular',
		description: 'Heart failure NYHA IV',
		grade: 4,
		evaluate: (d) =>
			d.cardiovascular.heartFailure === 'yes' && d.cardiovascular.heartFailureNYHA === '4'
	},
	{
		id: 'CV-008',
		system: 'Cardiovascular',
		description: 'Valvular heart disease',
		grade: 3,
		evaluate: (d) => d.cardiovascular.valvularDisease === 'yes'
	},
	{
		id: 'CV-009',
		system: 'Cardiovascular',
		description: 'Arrhythmia',
		grade: 2,
		evaluate: (d) => d.cardiovascular.arrhythmia === 'yes'
	},
	{
		id: 'CV-010',
		system: 'Cardiovascular',
		description: 'Pacemaker/ICD in situ',
		grade: 2,
		evaluate: (d) => d.cardiovascular.pacemaker === 'yes'
	},

	// ─── RESPIRATORY ─────────────────────────────────────────
	{
		id: 'RS-001',
		system: 'Respiratory',
		description: 'Mild/intermittent asthma',
		grade: 2,
		evaluate: (d) =>
			d.respiratory.asthma === 'yes' &&
			(d.respiratory.asthmaFrequency === 'intermittent' ||
				d.respiratory.asthmaFrequency === 'mild-persistent')
	},
	{
		id: 'RS-002',
		system: 'Respiratory',
		description: 'Moderate-severe persistent asthma',
		grade: 3,
		evaluate: (d) =>
			d.respiratory.asthma === 'yes' &&
			(d.respiratory.asthmaFrequency === 'moderate-persistent' ||
				d.respiratory.asthmaFrequency === 'severe-persistent')
	},
	{
		id: 'RS-003',
		system: 'Respiratory',
		description: 'Mild COPD',
		grade: 2,
		evaluate: (d) => d.respiratory.copd === 'yes' && d.respiratory.copdSeverity === 'mild'
	},
	{
		id: 'RS-004',
		system: 'Respiratory',
		description: 'Moderate COPD',
		grade: 3,
		evaluate: (d) => d.respiratory.copd === 'yes' && d.respiratory.copdSeverity === 'moderate'
	},
	{
		id: 'RS-005',
		system: 'Respiratory',
		description: 'Severe COPD',
		grade: 3,
		evaluate: (d) => d.respiratory.copd === 'yes' && d.respiratory.copdSeverity === 'severe'
	},
	{
		id: 'RS-006',
		system: 'Respiratory',
		description: 'Obstructive sleep apnoea',
		grade: 2,
		evaluate: (d) => d.respiratory.osa === 'yes'
	},
	{
		id: 'RS-007',
		system: 'Respiratory',
		description: 'Current smoker',
		grade: 2,
		evaluate: (d) => d.respiratory.smoking === 'current'
	},

	// ─── RENAL ───────────────────────────────────────────────
	{
		id: 'RN-001',
		system: 'Renal',
		description: 'CKD Stage 1-3',
		grade: 2,
		evaluate: (d) =>
			d.renal.ckd === 'yes' &&
			(d.renal.ckdStage === '1' || d.renal.ckdStage === '2' || d.renal.ckdStage === '3')
	},
	{
		id: 'RN-002',
		system: 'Renal',
		description: 'CKD Stage 4-5',
		grade: 3,
		evaluate: (d) =>
			d.renal.ckd === 'yes' && (d.renal.ckdStage === '4' || d.renal.ckdStage === '5')
	},
	{
		id: 'RN-003',
		system: 'Renal',
		description: 'On dialysis',
		grade: 3,
		evaluate: (d) => d.renal.dialysis === 'yes'
	},

	// ─── HEPATIC ─────────────────────────────────────────────
	{
		id: 'HP-001',
		system: 'Hepatic',
		description: 'Liver disease (non-cirrhotic)',
		grade: 2,
		evaluate: (d) => d.hepatic.liverDisease === 'yes' && d.hepatic.cirrhosis !== 'yes'
	},
	{
		id: 'HP-002',
		system: 'Hepatic',
		description: 'Cirrhosis Child-Pugh A',
		grade: 3,
		evaluate: (d) => d.hepatic.cirrhosis === 'yes' && d.hepatic.childPughScore === 'A'
	},
	{
		id: 'HP-003',
		system: 'Hepatic',
		description: 'Cirrhosis Child-Pugh B/C',
		grade: 4,
		evaluate: (d) =>
			d.hepatic.cirrhosis === 'yes' &&
			(d.hepatic.childPughScore === 'B' || d.hepatic.childPughScore === 'C')
	},

	// ─── ENDOCRINE ───────────────────────────────────────────
	{
		id: 'EN-001',
		system: 'Endocrine',
		description: 'Well-controlled diabetes',
		grade: 2,
		evaluate: (d) =>
			d.endocrine.diabetes !== '' &&
			d.endocrine.diabetes !== 'none' &&
			d.endocrine.diabetesControl === 'well-controlled'
	},
	{
		id: 'EN-002',
		system: 'Endocrine',
		description: 'Poorly controlled diabetes',
		grade: 3,
		evaluate: (d) =>
			d.endocrine.diabetes !== '' &&
			d.endocrine.diabetes !== 'none' &&
			d.endocrine.diabetesControl === 'poorly-controlled'
	},
	{
		id: 'EN-003',
		system: 'Endocrine',
		description: 'Thyroid disease',
		grade: 2,
		evaluate: (d) => d.endocrine.thyroidDisease === 'yes'
	},
	{
		id: 'EN-004',
		system: 'Endocrine',
		description: 'Adrenal insufficiency',
		grade: 3,
		evaluate: (d) => d.endocrine.adrenalInsufficiency === 'yes'
	},

	// ─── NEUROLOGICAL ────────────────────────────────────────
	{
		id: 'NR-001',
		system: 'Neurological',
		description: 'Previous stroke/TIA',
		grade: 3,
		evaluate: (d) => d.neurological.strokeOrTIA === 'yes'
	},
	{
		id: 'NR-002',
		system: 'Neurological',
		description: 'Controlled epilepsy',
		grade: 2,
		evaluate: (d) =>
			d.neurological.epilepsy === 'yes' && d.neurological.epilepsyControlled === 'yes'
	},
	{
		id: 'NR-003',
		system: 'Neurological',
		description: 'Uncontrolled epilepsy',
		grade: 3,
		evaluate: (d) =>
			d.neurological.epilepsy === 'yes' && d.neurological.epilepsyControlled === 'no'
	},
	{
		id: 'NR-004',
		system: 'Neurological',
		description: 'Neuromuscular disease',
		grade: 3,
		evaluate: (d) => d.neurological.neuromuscularDisease === 'yes'
	},
	{
		id: 'NR-005',
		system: 'Neurological',
		description: 'Raised intracranial pressure',
		grade: 4,
		evaluate: (d) => d.neurological.raisedICP === 'yes'
	},

	// ─── HAEMATOLOGICAL ──────────────────────────────────────
	{
		id: 'HM-001',
		system: 'Haematological',
		description: 'Bleeding disorder',
		grade: 3,
		evaluate: (d) => d.haematological.bleedingDisorder === 'yes'
	},
	{
		id: 'HM-002',
		system: 'Haematological',
		description: 'On anticoagulants',
		grade: 2,
		evaluate: (d) => d.haematological.onAnticoagulants === 'yes'
	},
	{
		id: 'HM-003',
		system: 'Haematological',
		description: 'Sickle cell disease',
		grade: 3,
		evaluate: (d) => d.haematological.sickleCellDisease === 'yes'
	},
	{
		id: 'HM-004',
		system: 'Haematological',
		description: 'Anaemia',
		grade: 2,
		evaluate: (d) => d.haematological.anaemia === 'yes'
	},

	// ─── OBESITY ─────────────────────────────────────────────
	{
		id: 'OB-001',
		system: 'Obesity',
		description: 'BMI 30-39 (Obese)',
		grade: 2,
		evaluate: (d) => d.demographics.bmi !== null && d.demographics.bmi >= 30 && d.demographics.bmi < 40
	},
	{
		id: 'OB-002',
		system: 'Obesity',
		description: 'BMI ≥40 (Morbid obesity)',
		grade: 3,
		evaluate: (d) => d.demographics.bmi !== null && d.demographics.bmi >= 40
	},

	// ─── FUNCTIONAL CAPACITY ─────────────────────────────────
	{
		id: 'FC-001',
		system: 'Functional Capacity',
		description: 'Poor functional capacity (<4 METs)',
		grade: 3,
		evaluate: (d) =>
			d.functionalCapacity.estimatedMETs !== null && d.functionalCapacity.estimatedMETs < 4
	},

	// ─── AGE ─────────────────────────────────────────────────
	{
		id: 'AG-001',
		system: 'Demographics',
		description: 'Age >80 years',
		grade: 2,
		evaluate: (d) => {
			const age = calculateAge(d.demographics.dateOfBirth);
			return age !== null && age > 80;
		}
	},

	// ─── SOCIAL HISTORY ──────────────────────────────────────
	{
		id: 'SH-001',
		system: 'Social',
		description: 'Heavy alcohol use',
		grade: 2,
		evaluate: (d) => d.socialHistory.alcohol === 'heavy'
	},
	{
		id: 'SH-002',
		system: 'Social',
		description: 'Recreational drug use',
		grade: 2,
		evaluate: (d) => d.socialHistory.recreationalDrugs === 'yes'
	}
];
