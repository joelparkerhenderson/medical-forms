import type { GAFRule } from './types';

/**
 * Declarative GAF scoring rules.
 * Each rule evaluates patient data and returns true if the condition is present.
 * The GAF score starts at 100 and is decremented by each fired rule's scoreImpact.
 * The final score is clamped to 1-100.
 */
export const gafRules: GAFRule[] = [
	// ─── PRESENTING COMPLAINT ───────────────────────────────
	{
		id: 'PC-001',
		domain: 'Presenting Complaint',
		description: 'Mild severity presenting complaint',
		scoreImpact: 15,
		evaluate: (d) => d.presentingComplaint.severity === 'mild'
	},
	{
		id: 'PC-002',
		domain: 'Presenting Complaint',
		description: 'Moderate severity presenting complaint',
		scoreImpact: 30,
		evaluate: (d) => d.presentingComplaint.severity === 'moderate'
	},
	{
		id: 'PC-003',
		domain: 'Presenting Complaint',
		description: 'Severe presenting complaint',
		scoreImpact: 50,
		evaluate: (d) => d.presentingComplaint.severity === 'severe'
	},

	// ─── PSYCHIATRIC HISTORY ────────────────────────────────
	{
		id: 'PH-001',
		domain: 'Psychiatric History',
		description: 'Previous psychiatric hospitalizations',
		scoreImpact: 15,
		evaluate: (d) => d.psychiatricHistory.previousHospitalizations === 'yes'
	},
	{
		id: 'PH-002',
		domain: 'Psychiatric History',
		description: 'Previous suicide attempts',
		scoreImpact: 25,
		evaluate: (d) => d.psychiatricHistory.previousSuicideAttempts === 'yes'
	},
	{
		id: 'PH-003',
		domain: 'Psychiatric History',
		description: 'History of self-harm',
		scoreImpact: 15,
		evaluate: (d) => d.psychiatricHistory.selfHarmHistory === 'yes'
	},

	// ─── MENTAL STATUS EXAM ─────────────────────────────────
	{
		id: 'MSE-001',
		domain: 'Mental Status Exam',
		description: 'Depressed mood',
		scoreImpact: 15,
		evaluate: (d) => d.mentalStatusExam.mood === 'depressed'
	},
	{
		id: 'MSE-002',
		domain: 'Mental Status Exam',
		description: 'Flat affect',
		scoreImpact: 20,
		evaluate: (d) => d.mentalStatusExam.affect === 'flat'
	},
	{
		id: 'MSE-003',
		domain: 'Mental Status Exam',
		description: 'Blunted affect',
		scoreImpact: 10,
		evaluate: (d) => d.mentalStatusExam.affect === 'blunted'
	},
	{
		id: 'MSE-004',
		domain: 'Mental Status Exam',
		description: 'Labile affect',
		scoreImpact: 15,
		evaluate: (d) => d.mentalStatusExam.affect === 'labile'
	},
	{
		id: 'MSE-005',
		domain: 'Mental Status Exam',
		description: 'Disordered thought process (loosening/flight-of-ideas/thought-blocking)',
		scoreImpact: 25,
		evaluate: (d) =>
			d.mentalStatusExam.thoughtProcess === 'loosening' ||
			d.mentalStatusExam.thoughtProcess === 'flight-of-ideas' ||
			d.mentalStatusExam.thoughtProcess === 'thought-blocking'
	},
	{
		id: 'MSE-006',
		domain: 'Mental Status Exam',
		description: 'Perceptual disturbances present',
		scoreImpact: 30,
		evaluate: (d) => d.mentalStatusExam.perceptualDisturbances === 'yes'
	},
	{
		id: 'MSE-007',
		domain: 'Mental Status Exam',
		description: 'Cognitive impairment',
		scoreImpact: 15,
		evaluate: (d) => d.mentalStatusExam.cognitionIntact === 'no'
	},
	{
		id: 'MSE-008',
		domain: 'Mental Status Exam',
		description: 'No insight',
		scoreImpact: 20,
		evaluate: (d) => d.mentalStatusExam.insight === 'none'
	},
	{
		id: 'MSE-009',
		domain: 'Mental Status Exam',
		description: 'Partial insight',
		scoreImpact: 10,
		evaluate: (d) => d.mentalStatusExam.insight === 'partial'
	},
	{
		id: 'MSE-010',
		domain: 'Mental Status Exam',
		description: 'Poor judgement',
		scoreImpact: 15,
		evaluate: (d) => d.mentalStatusExam.judgement === 'poor'
	},

	// ─── RISK ASSESSMENT ────────────────────────────────────
	{
		id: 'RA-001',
		domain: 'Risk Assessment',
		description: 'Active suicidal ideation',
		scoreImpact: 30,
		evaluate: (d) => d.riskAssessment.suicidalIdeation === 'yes'
	},
	{
		id: 'RA-002',
		domain: 'Risk Assessment',
		description: 'Suicidal plan present',
		scoreImpact: 40,
		evaluate: (d) => d.riskAssessment.suicidalPlan === 'yes'
	},
	{
		id: 'RA-003',
		domain: 'Risk Assessment',
		description: 'Suicidal intent present',
		scoreImpact: 45,
		evaluate: (d) => d.riskAssessment.suicidalIntent === 'yes'
	},
	{
		id: 'RA-004',
		domain: 'Risk Assessment',
		description: 'Access to means of self-harm',
		scoreImpact: 20,
		evaluate: (d) => d.riskAssessment.suicidalMeans === 'yes'
	},
	{
		id: 'RA-005',
		domain: 'Risk Assessment',
		description: 'Current self-harm',
		scoreImpact: 25,
		evaluate: (d) => d.riskAssessment.selfHarmCurrent === 'yes'
	},
	{
		id: 'RA-006',
		domain: 'Risk Assessment',
		description: 'High violence risk',
		scoreImpact: 35,
		evaluate: (d) =>
			d.riskAssessment.violenceRisk === 'high' || d.riskAssessment.violenceRisk === 'imminent'
	},
	{
		id: 'RA-007',
		domain: 'Risk Assessment',
		description: 'Moderate violence risk',
		scoreImpact: 20,
		evaluate: (d) => d.riskAssessment.violenceRisk === 'moderate'
	},

	// ─── MOOD & ANXIETY ─────────────────────────────────────
	{
		id: 'MA-001',
		domain: 'Mood & Anxiety',
		description: 'PHQ-9 score 10-14 (moderate depression)',
		scoreImpact: 15,
		evaluate: (d) =>
			d.moodAndAnxiety.phq9Score !== null &&
			d.moodAndAnxiety.phq9Score >= 10 &&
			d.moodAndAnxiety.phq9Score < 15
	},
	{
		id: 'MA-002',
		domain: 'Mood & Anxiety',
		description: 'PHQ-9 score 15-19 (moderately severe depression)',
		scoreImpact: 25,
		evaluate: (d) =>
			d.moodAndAnxiety.phq9Score !== null &&
			d.moodAndAnxiety.phq9Score >= 15 &&
			d.moodAndAnxiety.phq9Score < 20
	},
	{
		id: 'MA-003',
		domain: 'Mood & Anxiety',
		description: 'PHQ-9 score 20-27 (severe depression)',
		scoreImpact: 35,
		evaluate: (d) =>
			d.moodAndAnxiety.phq9Score !== null && d.moodAndAnxiety.phq9Score >= 20
	},
	{
		id: 'MA-004',
		domain: 'Mood & Anxiety',
		description: 'GAD-7 score 10-14 (moderate anxiety)',
		scoreImpact: 10,
		evaluate: (d) =>
			d.moodAndAnxiety.gad7Score !== null &&
			d.moodAndAnxiety.gad7Score >= 10 &&
			d.moodAndAnxiety.gad7Score < 15
	},
	{
		id: 'MA-005',
		domain: 'Mood & Anxiety',
		description: 'GAD-7 score 15-21 (severe anxiety)',
		scoreImpact: 20,
		evaluate: (d) =>
			d.moodAndAnxiety.gad7Score !== null && d.moodAndAnxiety.gad7Score >= 15
	},
	{
		id: 'MA-006',
		domain: 'Mood & Anxiety',
		description: 'Mania screen positive',
		scoreImpact: 25,
		evaluate: (d) => d.moodAndAnxiety.maniaScreen === 'yes'
	},
	{
		id: 'MA-007',
		domain: 'Mood & Anxiety',
		description: 'Psychotic symptoms present',
		scoreImpact: 35,
		evaluate: (d) => d.moodAndAnxiety.psychoticSymptoms === 'yes'
	},

	// ─── SUBSTANCE USE ──────────────────────────────────────
	{
		id: 'SU-001',
		domain: 'Substance Use',
		description: 'High-risk alcohol use (AUDIT >= 16)',
		scoreImpact: 15,
		evaluate: (d) =>
			d.substanceUse.alcoholAuditScore !== null && d.substanceUse.alcoholAuditScore >= 16
	},
	{
		id: 'SU-002',
		domain: 'Substance Use',
		description: 'Dependent alcohol use (AUDIT >= 20)',
		scoreImpact: 25,
		evaluate: (d) =>
			d.substanceUse.alcoholAuditScore !== null && d.substanceUse.alcoholAuditScore >= 20
	},
	{
		id: 'SU-003',
		domain: 'Substance Use',
		description: 'Active drug use',
		scoreImpact: 15,
		evaluate: (d) => d.substanceUse.drugUse === 'yes'
	},
	{
		id: 'SU-004',
		domain: 'Substance Use',
		description: 'Withdrawal risk present',
		scoreImpact: 20,
		evaluate: (d) => d.substanceUse.withdrawalRisk === 'yes'
	},

	// ─── MEDICATIONS ────────────────────────────────────────
	{
		id: 'MED-001',
		domain: 'Medications',
		description: 'Medication non-compliance',
		scoreImpact: 15,
		evaluate: (d) => d.currentMedications.compliance === 'no'
	},

	// ─── SOCIAL HISTORY ─────────────────────────────────────
	{
		id: 'SOC-001',
		domain: 'Social History',
		description: 'Homeless or temporary housing',
		scoreImpact: 15,
		evaluate: (d) =>
			d.socialHistory.housing === 'homeless' || d.socialHistory.housing === 'temporary'
	},
	{
		id: 'SOC-002',
		domain: 'Social History',
		description: 'Active legal issues',
		scoreImpact: 10,
		evaluate: (d) => d.socialHistory.legalIssues === 'yes'
	},
	{
		id: 'SOC-003',
		domain: 'Social History',
		description: 'Financial difficulties',
		scoreImpact: 5,
		evaluate: (d) => d.socialHistory.financialDifficulties === 'yes'
	},

	// ─── CAPACITY & CONSENT ─────────────────────────────────
	{
		id: 'CC-001',
		domain: 'Capacity & Consent',
		description: 'Lacks decision-making capacity',
		scoreImpact: 25,
		evaluate: (d) => d.capacityAndConsent.decisionMakingCapacity === 'lacks-capacity'
	},
	{
		id: 'CC-002',
		domain: 'Capacity & Consent',
		description: 'Fluctuating decision-making capacity',
		scoreImpact: 15,
		evaluate: (d) => d.capacityAndConsent.decisionMakingCapacity === 'fluctuating'
	},

	// ─── LEGAL STATUS ───────────────────────────────────────
	{
		id: 'LS-001',
		domain: 'Legal Status',
		description: 'Involuntary admission',
		scoreImpact: 20,
		evaluate: (d) => d.demographics.legalStatus === 'involuntary'
	}
];
