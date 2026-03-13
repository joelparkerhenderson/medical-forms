import type { AssessmentData, GradingResult } from '$lib/engine/types';

function createDefaultAssessment(): AssessmentData {
	return {
		patientInformation: {
			firstName: '',
			lastName: '',
			dob: '',
			sex: '',
			nhsNumber: '',
			address: '',
			phone: '',
			emergencyContact: '',
			emergencyContactPhone: ''
		},
		procedureDetails: {
			procedureName: '',
			procedureDescription: '',
			treatingClinician: '',
			department: '',
			scheduledDate: '',
			estimatedDuration: '',
			admissionRequired: ''
		},
		risksBenefits: {
			commonRisks: '',
			seriousRisks: '',
			expectedBenefits: '',
			successRate: '',
			recoveryPeriod: ''
		},
		alternativeTreatments: {
			alternativeOptions: '',
			noTreatmentConsequences: '',
			patientPreference: ''
		},
		anesthesiaInformation: {
			anesthesiaType: '',
			anesthesiaRisks: '',
			previousAnesthesiaProblems: '',
			previousAnesthesiaDetails: '',
			fastingInstructions: ''
		},
		questionsUnderstanding: {
			questionsAsked: '',
			understandsProcedure: '',
			understandsRisks: '',
			understandsAlternatives: '',
			understandsRecovery: '',
			additionalConcerns: ''
		},
		patientRights: {
			rightToWithdraw: '',
			rightToSecondOpinion: '',
			informedVoluntarily: '',
			noGuaranteeAcknowledged: ''
		},
		signatureConsent: {
			patientConsent: '',
			signatureDate: '',
			witnessName: '',
			witnessRole: '',
			witnessSignatureDate: '',
			clinicianName: '',
			clinicianRole: '',
			clinicianSignatureDate: '',
			interpreterUsed: '',
			interpreterName: ''
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
