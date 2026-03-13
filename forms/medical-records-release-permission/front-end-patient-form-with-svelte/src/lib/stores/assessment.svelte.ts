import type { AssessmentData, GradingResult } from '$lib/engine/types';
import { loadFromStorage, clearStorage } from './autosave';

function createDefaultAssessment(): AssessmentData {
	return {
		patientInformation: {
			firstName: '',
			lastName: '',
			dateOfBirth: '',
			sex: '',
			address: '',
			phone: '',
			email: '',
			nhsNumber: '',
			gpName: '',
			gpPractice: ''
		},
		authorizedRecipient: {
			recipientName: '',
			recipientOrganization: '',
			recipientAddress: '',
			recipientPhone: '',
			recipientEmail: '',
			recipientRole: ''
		},
		recordsToRelease: {
			recordTypes: [],
			specificDateRange: '',
			dateFrom: '',
			dateTo: '',
			specificRecordDetails: ''
		},
		purposeOfRelease: {
			purpose: '',
			otherDetails: ''
		},
		authorizationPeriod: {
			startDate: '',
			endDate: '',
			singleUse: ''
		},
		restrictionsLimitations: {
			excludeHIV: '',
			excludeSubstanceAbuse: '',
			excludeMentalHealth: '',
			excludeGeneticInfo: '',
			excludeSTI: '',
			additionalRestrictions: ''
		},
		patientRights: {
			acknowledgedRightToRevoke: '',
			acknowledgedNoChargeForAccess: '',
			acknowledgedDataProtection: ''
		},
		signatureConsent: {
			patientSignatureConfirmed: '',
			signatureDate: '',
			witnessName: '',
			witnessSignatureConfirmed: '',
			witnessDate: '',
			parentGuardianName: ''
		}
	};
}

class AssessmentStore {
	data = $state<AssessmentData>(loadFromStorage() ?? createDefaultAssessment());
	result = $state<GradingResult | null>(null);
	currentStep = $state(1);

	reset() {
		this.data = createDefaultAssessment();
		this.result = null;
		this.currentStep = 1;
		clearStorage();
	}
}

export const assessment = new AssessmentStore();
