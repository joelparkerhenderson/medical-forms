import type { AssessmentData, GradingResult } from '$lib/engine/types';

function createDefaultAssessment(): AssessmentData {
	return {
		demographics: {
			reporterFirstName: '',
			reporterLastName: '',
			reporterRole: '',
			reporterDepartment: '',
			reporterContactPhone: '',
			reporterContactEmail: '',
			facilityName: '',
			facilityWard: '',
			reportDate: '',
			anonymousReport: ''
		},
		incidentDetails: {
			incidentDate: '',
			incidentTime: '',
			discoveryDate: '',
			discoveryTime: '',
			locationType: '',
			locationDetails: '',
			incidentSummary: '',
			incidentWitnessed: '',
			witnessDetails: '',
			shiftType: '',
			staffingLevel: ''
		},
		patientInvolvement: {
			patientInvolved: '',
			patientFirstName: '',
			patientLastName: '',
			patientNhsNumber: '',
			patientDateOfBirth: '',
			patientSex: '',
			patientAgeAtIncident: null,
			patientInformed: '',
			patientInformedDate: '',
			patientInformedBy: '',
			dutyOfCandourApplies: '',
			dutyOfCandourCompleted: ''
		},
		errorClassification: {
			errorType: '',
			errorTypeDetails: '',
			medicationErrorStage: '',
			whoSeverity: '',
			nccMerpCategory: '',
			preventability: '',
			recurrenceLikelihood: ''
		},
		contributingFactors: {
			staffFatigue: '',
			inadequateTraining: '',
			communicationFailure: '',
			communicationFailureDetails: '',
			handoverFailure: '',
			equipmentFailure: '',
			equipmentFailureDetails: '',
			environmentalFactors: '',
			environmentalDetails: '',
			policyNotFollowed: '',
			policyDetails: '',
			workloadPressure: '',
			patientFactors: '',
			patientFactorsDetails: '',
			otherFactors: ''
		},
		immediateActions: {
			patientAssessed: '',
			treatmentProvided: '',
			treatmentDetails: '',
			errorContained: '',
			containmentDetails: '',
			seniorStaffNotified: '',
			seniorStaffName: '',
			seniorStaffRole: '',
			riskTeamNotified: '',
			additionalMonitoring: '',
			monitoringDetails: '',
			immediateActionsSummary: ''
		},
		patientOutcome: {
			harmReachedPatient: '',
			harmLevel: '',
			harmDescription: '',
			additionalTreatmentRequired: '',
			additionalTreatmentDetails: '',
			extendedHospitalStay: '',
			extraDays: null,
			readmissionRequired: '',
			permanentDisability: '',
			disabilityDetails: '',
			patientDied: '',
			deathDate: '',
			outcomeNotes: ''
		},
		rootCauseAnalysis: {
			rcaConducted: '',
			rcaDate: '',
			rcaLead: '',
			rcaTeamMembers: '',
			rootCauseCategory: '',
			rootCauseDescription: '',
			fiveWhysAnalysis: '',
			fishboneFactors: '',
			systemVulnerabilities: '',
			similarIncidents: '',
			similarIncidentsDetails: '',
			rcaFindingsSummary: ''
		},
		correctiveActions: {
			immediateCorrectiveActions: '',
			longTermCorrectiveActions: '',
			policyChangeRequired: '',
			policyChangeDetails: '',
			trainingRequired: '',
			trainingDetails: '',
			equipmentChangeRequired: '',
			equipmentChangeDetails: '',
			processRedesignRequired: '',
			processRedesignDetails: '',
			responsiblePerson: '',
			targetCompletionDate: '',
			actionsStatus: ''
		},
		reportingFollowup: {
			internalReference: '',
			reportedToDatix: '',
			datixReference: '',
			reportedToNrls: '',
			nrlsReference: '',
			reportedToCqc: '',
			reportedToHsib: '',
			reportedToCoroner: '',
			safeguardingReferral: '',
			lessonsLearned: '',
			sharedWithTeam: '',
			followUpReviewDate: '',
			followUpReviewer: '',
			finalStatus: '',
			closureDate: ''
		}
	};
}

class AssessmentStore {
	data = $state<AssessmentData>(createDefaultAssessment());
	result = $state<GradingResult | null>(null);
	currentStep = $state(1);

	reset() {
		this.data = createDefaultAssessment();
		this.result = null;
		this.currentStep = 1;
	}
}

export const assessment = new AssessmentStore();
