import type { ErrorRule } from './types';
import { countContributingFactors } from './utils';

/**
 * Declarative medical error grading rules.
 * Each rule evaluates report data and returns true if the condition is present.
 * Grade 1 = minimal, 2 = mild, 3 = moderate, 4 = severe, 5 = critical.
 */
export const errorRules: ErrorRule[] = [
	// ─── WHO SEVERITY ──────────────────────────────────────────
	{
		id: 'SEV-001',
		category: 'Severity',
		description: 'Near miss - error did not reach patient',
		grade: 1,
		evaluate: (d) => d.errorClassification.whoSeverity === 'near-miss'
	},
	{
		id: 'SEV-002',
		category: 'Severity',
		description: 'Mild severity - temporary minor harm',
		grade: 2,
		evaluate: (d) => d.errorClassification.whoSeverity === 'mild'
	},
	{
		id: 'SEV-003',
		category: 'Severity',
		description: 'Moderate severity - temporary significant harm',
		grade: 3,
		evaluate: (d) => d.errorClassification.whoSeverity === 'moderate'
	},
	{
		id: 'SEV-004',
		category: 'Severity',
		description: 'Severe - permanent harm to patient',
		grade: 4,
		evaluate: (d) => d.errorClassification.whoSeverity === 'severe'
	},
	{
		id: 'SEV-005',
		category: 'Severity',
		description: 'Critical - death or life-threatening event',
		grade: 5,
		evaluate: (d) => d.errorClassification.whoSeverity === 'critical'
	},

	// ─── NCC MERP CATEGORIES ───────────────────────────────────
	{
		id: 'MERP-001',
		category: 'NCC MERP',
		description: 'NCC MERP Category E - temporary harm requiring intervention',
		grade: 3,
		evaluate: (d) => d.errorClassification.nccMerpCategory === 'E'
	},
	{
		id: 'MERP-002',
		category: 'NCC MERP',
		description: 'NCC MERP Category F - temporary harm requiring hospitalisation',
		grade: 3,
		evaluate: (d) => d.errorClassification.nccMerpCategory === 'F'
	},
	{
		id: 'MERP-003',
		category: 'NCC MERP',
		description: 'NCC MERP Category G - permanent harm',
		grade: 4,
		evaluate: (d) => d.errorClassification.nccMerpCategory === 'G'
	},
	{
		id: 'MERP-004',
		category: 'NCC MERP',
		description: 'NCC MERP Category H - intervention to sustain life',
		grade: 5,
		evaluate: (d) => d.errorClassification.nccMerpCategory === 'H'
	},
	{
		id: 'MERP-005',
		category: 'NCC MERP',
		description: 'NCC MERP Category I - patient death',
		grade: 5,
		evaluate: (d) => d.errorClassification.nccMerpCategory === 'I'
	},

	// ─── PATIENT OUTCOME ───────────────────────────────────────
	{
		id: 'OUT-001',
		category: 'Outcome',
		description: 'Patient died as a result of the error',
		grade: 5,
		evaluate: (d) => d.patientOutcome.patientDied === 'yes'
	},
	{
		id: 'OUT-002',
		category: 'Outcome',
		description: 'Permanent disability resulted from error',
		grade: 4,
		evaluate: (d) => d.patientOutcome.permanentDisability === 'yes'
	},
	{
		id: 'OUT-003',
		category: 'Outcome',
		description: 'Extended hospital stay required',
		grade: 3,
		evaluate: (d) => d.patientOutcome.extendedHospitalStay === 'yes'
	},
	{
		id: 'OUT-004',
		category: 'Outcome',
		description: 'Readmission required',
		grade: 3,
		evaluate: (d) => d.patientOutcome.readmissionRequired === 'yes'
	},
	{
		id: 'OUT-005',
		category: 'Outcome',
		description: 'Additional treatment required due to error',
		grade: 2,
		evaluate: (d) => d.patientOutcome.additionalTreatmentRequired === 'yes'
	},
	{
		id: 'OUT-006',
		category: 'Outcome',
		description: 'Severe harm level reported',
		grade: 4,
		evaluate: (d) => d.patientOutcome.harmLevel === 'severe'
	},
	{
		id: 'OUT-007',
		category: 'Outcome',
		description: 'Death reported as harm level',
		grade: 5,
		evaluate: (d) => d.patientOutcome.harmLevel === 'death'
	},

	// ─── ERROR TYPE ────────────────────────────────────────────
	{
		id: 'ET-001',
		category: 'Error Type',
		description: 'Medication error',
		grade: 2,
		evaluate: (d) => d.errorClassification.errorType === 'medication'
	},
	{
		id: 'ET-002',
		category: 'Error Type',
		description: 'Surgical error',
		grade: 3,
		evaluate: (d) => d.errorClassification.errorType === 'surgical'
	},
	{
		id: 'ET-003',
		category: 'Error Type',
		description: 'Transfusion error',
		grade: 3,
		evaluate: (d) => d.errorClassification.errorType === 'transfusion'
	},
	{
		id: 'ET-004',
		category: 'Error Type',
		description: 'Diagnostic error',
		grade: 2,
		evaluate: (d) => d.errorClassification.errorType === 'diagnostic'
	},

	// ─── CONTRIBUTING FACTORS ──────────────────────────────────
	{
		id: 'CF-001',
		category: 'Contributing Factors',
		description: 'Multiple contributing factors identified (3+)',
		grade: 3,
		evaluate: (d) => countContributingFactors(d.contributingFactors) >= 3
	},
	{
		id: 'CF-002',
		category: 'Contributing Factors',
		description: 'Communication failure contributed to error',
		grade: 2,
		evaluate: (d) => d.contributingFactors.communicationFailure === 'yes'
	},
	{
		id: 'CF-003',
		category: 'Contributing Factors',
		description: 'Policy or protocol not followed',
		grade: 2,
		evaluate: (d) => d.contributingFactors.policyNotFollowed === 'yes'
	},
	{
		id: 'CF-004',
		category: 'Contributing Factors',
		description: 'Equipment failure contributed',
		grade: 2,
		evaluate: (d) => d.contributingFactors.equipmentFailure === 'yes'
	},
	{
		id: 'CF-005',
		category: 'Contributing Factors',
		description: 'Handover failure contributed',
		grade: 2,
		evaluate: (d) => d.contributingFactors.handoverFailure === 'yes'
	},

	// ─── PREVENTABILITY ────────────────────────────────────────
	{
		id: 'PRV-001',
		category: 'Preventability',
		description: 'Error was clearly preventable',
		grade: 3,
		evaluate: (d) => d.errorClassification.preventability === 'clearly-preventable'
	},
	{
		id: 'PRV-002',
		category: 'Preventability',
		description: 'Error was probably preventable',
		grade: 2,
		evaluate: (d) => d.errorClassification.preventability === 'probably-preventable'
	},

	// ─── RECURRENCE ────────────────────────────────────────────
	{
		id: 'REC-001',
		category: 'Recurrence',
		description: 'Recurrence very likely',
		grade: 4,
		evaluate: (d) => d.errorClassification.recurrenceLikelihood === 'very-likely'
	},
	{
		id: 'REC-002',
		category: 'Recurrence',
		description: 'Recurrence likely',
		grade: 3,
		evaluate: (d) => d.errorClassification.recurrenceLikelihood === 'likely'
	},

	// ─── SIMILAR INCIDENTS ─────────────────────────────────────
	{
		id: 'SIM-001',
		category: 'Root Cause',
		description: 'Similar incidents have occurred previously',
		grade: 3,
		evaluate: (d) => d.rootCauseAnalysis.similarIncidents === 'yes'
	},

	// ─── STAFFING ──────────────────────────────────────────────
	{
		id: 'STF-001',
		category: 'Staffing',
		description: 'Unit was understaffed at time of incident',
		grade: 2,
		evaluate: (d) => d.incidentDetails.staffingLevel === 'understaffed'
	},

	// ─── DUTY OF CANDOUR ───────────────────────────────────────
	{
		id: 'DOC-001',
		category: 'Duty of Candour',
		description: 'Duty of candour applies but not yet completed',
		grade: 3,
		evaluate: (d) =>
			d.patientInvolvement.dutyOfCandourApplies === 'yes' &&
			d.patientInvolvement.dutyOfCandourCompleted === 'no'
	}
];
