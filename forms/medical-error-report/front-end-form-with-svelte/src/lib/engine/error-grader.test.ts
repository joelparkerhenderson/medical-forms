import { describe, it, expect } from 'vitest';
import { calculateErrorGrade } from './error-grader';
import { detectAdditionalFlags } from './flagged-issues';
import { errorRules } from './error-rules';
import type { AssessmentData } from './types';

function createMinimalReport(): AssessmentData {
	return {
		demographics: {
			reporterFirstName: 'Jane',
			reporterLastName: 'Smith',
			reporterRole: 'nurse',
			reporterDepartment: 'General Medicine',
			reporterContactPhone: '',
			reporterContactEmail: '',
			facilityName: 'St Mary Hospital',
			facilityWard: 'Ward 3A',
			reportDate: '2026-04-17',
			anonymousReport: 'no'
		},
		incidentDetails: {
			incidentDate: '2026-04-16',
			incidentTime: '14:30',
			discoveryDate: '2026-04-16',
			discoveryTime: '15:00',
			locationType: 'inpatient-ward',
			locationDetails: 'Bay 2, Bed 4',
			incidentSummary: 'Near miss event - wrong medication prepared but caught before administration.',
			incidentWitnessed: 'yes',
			witnessDetails: 'Staff Nurse B. Jones',
			shiftType: 'day',
			staffingLevel: 'adequate'
		},
		patientInvolvement: {
			patientInvolved: 'no',
			patientFirstName: '',
			patientLastName: '',
			patientNhsNumber: '',
			patientDateOfBirth: '',
			patientSex: '',
			patientAgeAtIncident: null,
			patientInformed: '',
			patientInformedDate: '',
			patientInformedBy: '',
			dutyOfCandourApplies: 'no',
			dutyOfCandourCompleted: ''
		},
		errorClassification: {
			errorType: 'medication',
			errorTypeDetails: 'Wrong medication selected from drug cabinet.',
			medicationErrorStage: 'dispensing',
			whoSeverity: 'near-miss',
			nccMerpCategory: 'B',
			preventability: 'clearly-preventable',
			recurrenceLikelihood: 'unlikely'
		},
		contributingFactors: {
			staffFatigue: 'no',
			inadequateTraining: 'no',
			communicationFailure: 'no',
			communicationFailureDetails: '',
			handoverFailure: 'no',
			equipmentFailure: 'no',
			equipmentFailureDetails: '',
			environmentalFactors: 'no',
			environmentalDetails: '',
			policyNotFollowed: 'no',
			policyDetails: '',
			workloadPressure: 'no',
			patientFactors: 'no',
			patientFactorsDetails: '',
			otherFactors: ''
		},
		immediateActions: {
			patientAssessed: 'not-applicable',
			treatmentProvided: 'not-applicable',
			treatmentDetails: '',
			errorContained: 'yes',
			containmentDetails: 'Medication returned to cabinet, correct medication dispensed.',
			seniorStaffNotified: 'yes',
			seniorStaffName: 'Dr. A. Williams',
			seniorStaffRole: 'Consultant',
			riskTeamNotified: 'no',
			additionalMonitoring: 'no',
			monitoringDetails: '',
			immediateActionsSummary: 'Error caught before reaching patient. Correct medication dispensed.'
		},
		patientOutcome: {
			harmReachedPatient: 'no',
			harmLevel: 'none',
			harmDescription: '',
			additionalTreatmentRequired: 'no',
			additionalTreatmentDetails: '',
			extendedHospitalStay: 'no',
			extraDays: null,
			readmissionRequired: 'no',
			permanentDisability: 'no',
			disabilityDetails: '',
			patientDied: 'no',
			deathDate: '',
			outcomeNotes: 'No patient harm - near miss event.'
		},
		rootCauseAnalysis: {
			rcaConducted: 'no',
			rcaDate: '',
			rcaLead: '',
			rcaTeamMembers: '',
			rootCauseCategory: '',
			rootCauseDescription: '',
			fiveWhysAnalysis: '',
			fishboneFactors: '',
			systemVulnerabilities: '',
			similarIncidents: 'no',
			similarIncidentsDetails: '',
			rcaFindingsSummary: ''
		},
		correctiveActions: {
			immediateCorrectiveActions: 'Reviewed medication cabinet labelling.',
			longTermCorrectiveActions: '',
			policyChangeRequired: 'no',
			policyChangeDetails: '',
			trainingRequired: 'no',
			trainingDetails: '',
			equipmentChangeRequired: 'no',
			equipmentChangeDetails: '',
			processRedesignRequired: 'no',
			processRedesignDetails: '',
			responsiblePerson: '',
			targetCompletionDate: '',
			actionsStatus: ''
		},
		reportingFollowup: {
			internalReference: '',
			reportedToDatix: 'no',
			datixReference: '',
			reportedToNrls: 'no',
			nrlsReference: '',
			reportedToCqc: 'no',
			reportedToHsib: 'no',
			reportedToCoroner: 'no',
			safeguardingReferral: 'no',
			lessonsLearned: '',
			sharedWithTeam: 'no',
			followUpReviewDate: '',
			followUpReviewer: '',
			finalStatus: '',
			closureDate: ''
		}
	};
}

describe('Medical Error Grading Engine', () => {
	it('returns low risk for a near-miss with no harm', () => {
		const data = createMinimalReport();
		const result = calculateErrorGrade(data);
		expect(result.overallRisk).toBe('low');
		expect(result.whoSeverity).toBe('near-miss');
		expect(result.nccMerpCategory).toBe('B');
	});

	it('returns moderate risk for moderate WHO severity', () => {
		const data = createMinimalReport();
		data.errorClassification.whoSeverity = 'moderate';
		data.errorClassification.nccMerpCategory = 'E';
		data.patientOutcome.harmReachedPatient = 'yes';
		data.patientOutcome.harmLevel = 'moderate';

		const result = calculateErrorGrade(data);
		expect(result.overallRisk).toBe('moderate');
		expect(result.firedRules.length).toBeGreaterThanOrEqual(2);
	});

	it('returns high risk for severe WHO severity with permanent harm', () => {
		const data = createMinimalReport();
		data.errorClassification.whoSeverity = 'severe';
		data.errorClassification.nccMerpCategory = 'G';
		data.patientOutcome.permanentDisability = 'yes';
		data.patientOutcome.harmLevel = 'severe';

		const result = calculateErrorGrade(data);
		expect(result.overallRisk).toBe('high');
		expect(result.firedRules.length).toBeGreaterThanOrEqual(3);
	});

	it('returns critical risk for patient death', () => {
		const data = createMinimalReport();
		data.errorClassification.whoSeverity = 'critical';
		data.errorClassification.nccMerpCategory = 'I';
		data.patientOutcome.patientDied = 'yes';
		data.patientOutcome.harmLevel = 'death';

		const result = calculateErrorGrade(data);
		expect(result.overallRisk).toBe('critical');
	});

	it('returns critical risk for NCC MERP Category H', () => {
		const data = createMinimalReport();
		data.errorClassification.nccMerpCategory = 'H';
		data.errorClassification.whoSeverity = 'critical';

		const result = calculateErrorGrade(data);
		expect(result.overallRisk).toBe('critical');
	});

	it('escalates risk when recurrence is very likely', () => {
		const data = createMinimalReport();
		data.errorClassification.whoSeverity = 'mild';
		data.errorClassification.recurrenceLikelihood = 'very-likely';

		const result = calculateErrorGrade(data);
		expect(result.overallRisk).toBe('high');
	});

	it('detects all rule IDs are unique', () => {
		const ids = errorRules.map((r) => r.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});
});

describe('Medical Error Flagged Issues Detection', () => {
	it('returns no high-priority flags for near-miss', () => {
		const data = createMinimalReport();
		const flags = detectAdditionalFlags(data);
		const highFlags = flags.filter((f) => f.priority === 'high');
		// Near miss with clearly-preventable still flags preventability
		expect(highFlags.every((f) => f.id !== 'FLAG-DEATH-001')).toBe(true);
	});

	it('flags patient death', () => {
		const data = createMinimalReport();
		data.patientOutcome.patientDied = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-DEATH-001')).toBe(true);
	});

	it('flags critical WHO severity', () => {
		const data = createMinimalReport();
		data.errorClassification.whoSeverity = 'critical';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-CRITICAL-001')).toBe(true);
	});

	it('flags NCC MERP Category I', () => {
		const data = createMinimalReport();
		data.errorClassification.nccMerpCategory = 'I';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-MERP-HIGH-001')).toBe(true);
	});

	it('flags duty of candour not completed', () => {
		const data = createMinimalReport();
		data.patientInvolvement.dutyOfCandourApplies = 'yes';
		data.patientInvolvement.dutyOfCandourCompleted = 'no';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-DOC-001')).toBe(true);
	});

	it('flags permanent disability', () => {
		const data = createMinimalReport();
		data.patientOutcome.permanentDisability = 'yes';
		data.patientOutcome.disabilityDetails = 'Loss of limb';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-DISABILITY-001')).toBe(true);
	});

	it('flags communication failure', () => {
		const data = createMinimalReport();
		data.contributingFactors.communicationFailure = 'yes';
		data.contributingFactors.communicationFailureDetails = 'Verbal order misheard';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-COMM-001')).toBe(true);
	});

	it('flags similar previous incidents', () => {
		const data = createMinimalReport();
		data.rootCauseAnalysis.similarIncidents = 'yes';
		data.rootCauseAnalysis.similarIncidentsDetails = 'Two similar events last quarter';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-SIMILAR-001')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createMinimalReport();
		data.patientOutcome.patientDied = 'yes';
		data.contributingFactors.communicationFailure = 'yes';
		const flags = detectAdditionalFlags(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
