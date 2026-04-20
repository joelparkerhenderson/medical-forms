import type { AssessmentData, AdditionalFlag } from './types';

/**
 * Detects additional flags that should be highlighted for the safety team,
 * independent of WHO/MERP classification. These are safety-critical alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// ─── Patient death (HIGH) ──────────────────────────────────
	if (data.patientOutcome.patientDied === 'yes') {
		flags.push({
			id: 'FLAG-DEATH-001',
			category: 'Patient Safety',
			message: 'Patient death reported - IMMEDIATE INVESTIGATION REQUIRED',
			priority: 'high'
		});
	}

	// ─── Critical WHO severity (HIGH) ──────────────────────────
	if (data.errorClassification.whoSeverity === 'critical') {
		flags.push({
			id: 'FLAG-CRITICAL-001',
			category: 'Severity',
			message: 'WHO Critical severity - death or life-threatening event',
			priority: 'high'
		});
	}

	// ─── NCC MERP H or I (HIGH) ────────────────────────────────
	if (data.errorClassification.nccMerpCategory === 'H' || data.errorClassification.nccMerpCategory === 'I') {
		flags.push({
			id: 'FLAG-MERP-HIGH-001',
			category: 'NCC MERP',
			message: `NCC MERP Category ${data.errorClassification.nccMerpCategory} - ${data.errorClassification.nccMerpCategory === 'I' ? 'patient death' : 'intervention to sustain life'}`,
			priority: 'high'
		});
	}

	// ─── Permanent disability (HIGH) ───────────────────────────
	if (data.patientOutcome.permanentDisability === 'yes') {
		flags.push({
			id: 'FLAG-DISABILITY-001',
			category: 'Patient Outcome',
			message: `Permanent disability: ${data.patientOutcome.disabilityDetails || 'details not specified'}`,
			priority: 'high'
		});
	}

	// ─── Duty of candour not completed (HIGH) ──────────────────
	if (
		data.patientInvolvement.dutyOfCandourApplies === 'yes' &&
		data.patientInvolvement.dutyOfCandourCompleted === 'no'
	) {
		flags.push({
			id: 'FLAG-DOC-001',
			category: 'Duty of Candour',
			message: 'Duty of candour applies but NOT YET COMPLETED - urgent action required',
			priority: 'high'
		});
	}

	// ─── Clearly preventable (HIGH) ────────────────────────────
	if (data.errorClassification.preventability === 'clearly-preventable') {
		flags.push({
			id: 'FLAG-PREVENT-001',
			category: 'Preventability',
			message: 'Error was clearly preventable - systemic review recommended',
			priority: 'high'
		});
	}

	// ─── Recurrence very likely (HIGH) ─────────────────────────
	if (data.errorClassification.recurrenceLikelihood === 'very-likely') {
		flags.push({
			id: 'FLAG-RECUR-001',
			category: 'Recurrence',
			message: 'Recurrence assessed as very likely - immediate corrective action needed',
			priority: 'high'
		});
	}

	// ─── Similar incidents previously (MEDIUM) ─────────────────
	if (data.rootCauseAnalysis.similarIncidents === 'yes') {
		flags.push({
			id: 'FLAG-SIMILAR-001',
			category: 'Root Cause',
			message: `Similar incidents have occurred previously: ${data.rootCauseAnalysis.similarIncidentsDetails || 'details not specified'}`,
			priority: 'medium'
		});
	}

	// ─── Medication error (MEDIUM) ─────────────────────────────
	if (data.errorClassification.errorType === 'medication') {
		flags.push({
			id: 'FLAG-MED-001',
			category: 'Error Type',
			message: `Medication error at ${data.errorClassification.medicationErrorStage || 'unspecified'} stage`,
			priority: 'medium'
		});
	}

	// ─── Communication failure (MEDIUM) ────────────────────────
	if (data.contributingFactors.communicationFailure === 'yes') {
		flags.push({
			id: 'FLAG-COMM-001',
			category: 'Contributing Factors',
			message: `Communication failure: ${data.contributingFactors.communicationFailureDetails || 'details not specified'}`,
			priority: 'medium'
		});
	}

	// ─── Handover failure (MEDIUM) ─────────────────────────────
	if (data.contributingFactors.handoverFailure === 'yes') {
		flags.push({
			id: 'FLAG-HANDOVER-001',
			category: 'Contributing Factors',
			message: 'Handover failure contributed to the error',
			priority: 'medium'
		});
	}

	// ─── Policy not followed (MEDIUM) ──────────────────────────
	if (data.contributingFactors.policyNotFollowed === 'yes') {
		flags.push({
			id: 'FLAG-POLICY-001',
			category: 'Contributing Factors',
			message: `Policy/protocol not followed: ${data.contributingFactors.policyDetails || 'details not specified'}`,
			priority: 'medium'
		});
	}

	// ─── Understaffed (MEDIUM) ─────────────────────────────────
	if (data.incidentDetails.staffingLevel === 'understaffed') {
		flags.push({
			id: 'FLAG-STAFF-001',
			category: 'Staffing',
			message: 'Unit was understaffed at time of incident',
			priority: 'medium'
		});
	}

	// ─── Extended hospital stay (MEDIUM) ───────────────────────
	if (data.patientOutcome.extendedHospitalStay === 'yes') {
		flags.push({
			id: 'FLAG-STAY-001',
			category: 'Patient Outcome',
			message: `Extended hospital stay: ${data.patientOutcome.extraDays ?? '?'} extra days`,
			priority: 'medium'
		});
	}

	// ─── Safeguarding referral (MEDIUM) ────────────────────────
	if (data.reportingFollowup.safeguardingReferral === 'yes') {
		flags.push({
			id: 'FLAG-SAFEGUARD-001',
			category: 'Reporting',
			message: 'Safeguarding referral made',
			priority: 'medium'
		});
	}

	// ─── Coroner notification (MEDIUM) ─────────────────────────
	if (data.reportingFollowup.reportedToCoroner === 'yes') {
		flags.push({
			id: 'FLAG-CORONER-001',
			category: 'Reporting',
			message: 'Incident reported to coroner',
			priority: 'medium'
		});
	}

	// ─── RCA not yet conducted (MEDIUM) ────────────────────────
	if (data.rootCauseAnalysis.rcaConducted === 'pending') {
		flags.push({
			id: 'FLAG-RCA-001',
			category: 'Root Cause',
			message: 'Root cause analysis pending - schedule investigation',
			priority: 'medium'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
