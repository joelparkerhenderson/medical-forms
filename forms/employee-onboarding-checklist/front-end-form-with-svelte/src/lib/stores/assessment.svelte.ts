import type { AssessmentData, GradingResult } from '$lib/engine/types';

function createDefaultAssessment(): AssessmentData {
	return {
		demographics: {
			firstName: '',
			lastName: '',
			dateOfBirth: '',
			email: '',
			phone: '',
			jobTitle: '',
			department: '',
			startDate: '',
			emergencyContactName: '',
			emergencyContactPhone: '',
			emergencyContactRelationship: ''
		},
		preEmploymentChecks: {
			dbsCheckStatus: '',
			dbsCertificateNumber: '',
			dbsCheckDate: '',
			dbsUpdateServiceRegistered: '',
			rightToWorkVerified: '',
			rightToWorkDocumentType: '',
			rightToWorkExpiryDate: '',
			referencesReceived: null,
			referencesRequired: null,
			referencesSatisfactory: '',
			identityVerified: '',
			preEmploymentNotes: ''
		},
		occupationalHealth: {
			ohQuestionnaireSubmitted: '',
			ohClearanceReceived: '',
			ohClearanceDate: '',
			ohRestrictions: '',
			ohRestrictionDetails: '',
			hepatitisBStatus: '',
			tbScreeningStatus: '',
			immunisationStatus: '',
			fitToWork: '',
			occupationalHealthNotes: ''
		},
		mandatoryTraining: {
			fireSafetyCompleted: '',
			fireSafetyDate: '',
			manualHandlingCompleted: '',
			manualHandlingDate: '',
			infectionControlCompleted: '',
			infectionControlDate: '',
			safeguardingAdultsCompleted: '',
			safeguardingAdultsLevel: '',
			safeguardingChildrenCompleted: '',
			safeguardingChildrenLevel: '',
			informationGovernanceCompleted: '',
			informationGovernanceDate: '',
			basicLifeSupportCompleted: '',
			basicLifeSupportDate: '',
			equalityDiversityCompleted: '',
			healthSafetyCompleted: '',
			conflictResolutionCompleted: '',
			mandatoryTrainingNotes: ''
		},
		professionalRegistration: {
			registrationRequired: '',
			regulatoryBody: '',
			regulatoryBodyOther: '',
			registrationNumber: '',
			registrationVerified: '',
			registrationExpiryDate: '',
			registrationConditions: '',
			registrationConditionDetails: '',
			revalidationDate: '',
			indemnityInsurance: '',
			professionalRegistrationNotes: ''
		},
		itSystemsAccess: {
			nhsSmartcardIssued: '',
			nhsSmartcardNumber: '',
			emailAccountCreated: '',
			networkLoginCreated: '',
			clinicalSystemAccess: '',
			clinicalSystemName: '',
			clinicalSystemTrainingCompleted: '',
			rosteringSystemAccess: '',
			phoneExtension: '',
			bleepNumber: '',
			itAccessNotes: ''
		},
		uniformIDBadge: {
			uniformRequired: '',
			uniformOrdered: '',
			uniformReceived: '',
			uniformSize: '',
			idBadgePhotoTaken: '',
			idBadgeIssued: '',
			idBadgeNumber: '',
			accessCardIssued: '',
			accessCardAreas: '',
			lockerAllocated: '',
			lockerNumber: '',
			uniformIdNotes: ''
		},
		inductionProgramme: {
			corporateInductionCompleted: '',
			corporateInductionDate: '',
			localInductionCompleted: '',
			localInductionDate: '',
			departmentTourCompleted: '',
			introducedToTeam: '',
			emergencyProceduresBriefed: '',
			policiesHandbookReceived: '',
			buddyAssigned: '',
			buddyName: '',
			inductionProgrammeNotes: ''
		},
		probationSupervision: {
			probationPeriodMonths: null,
			probationStartDate: '',
			probationEndDate: '',
			lineManagerName: '',
			lineManagerEmail: '',
			supervisorName: '',
			supervisionFrequency: '',
			firstSupervisionDate: '',
			objectivesSet: '',
			appraisalDateAgreed: '',
			appraisalDate: '',
			probationSupervisionNotes: ''
		},
		signOffCompliance: {
			confidentialityAgreementSigned: '',
			codeOfConductSigned: '',
			socialMediaPolicyAcknowledged: '',
			itAcceptableUseSigned: '',
			gdprTrainingCompleted: '',
			dutyOfCandourBriefed: '',
			whistleblowingPolicyBriefed: '',
			employeeSignedOff: '',
			employeeSignOffDate: '',
			managerSignedOff: '',
			managerSignOffDate: '',
			managerSignOffName: '',
			signOffComplianceNotes: ''
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
