import { describe, it, expect } from 'vitest';
import { calculateOnboardingGrade } from './onboarding-grader';
import { detectAdditionalFlags } from './flagged-issues';
import { onboardingRules } from './onboarding-rules';
import type { AssessmentData } from './types';

function createCompleteEmployee(): AssessmentData {
	return {
		demographics: {
			firstName: 'Jane',
			lastName: 'Smith',
			dateOfBirth: '1990-03-15',
			email: 'jane.smith@nhs.net',
			phone: '07700 900123',
			jobTitle: 'Staff Nurse',
			department: 'Cardiology Ward',
			startDate: '2026-05-01',
			emergencyContactName: 'John Smith',
			emergencyContactPhone: '07700 900456',
			emergencyContactRelationship: 'Spouse'
		},
		preEmploymentChecks: {
			dbsCheckStatus: 'cleared',
			dbsCertificateNumber: 'DBS-001234567',
			dbsCheckDate: '2026-03-01',
			dbsUpdateServiceRegistered: 'yes',
			rightToWorkVerified: 'yes',
			rightToWorkDocumentType: 'British Passport',
			rightToWorkExpiryDate: '',
			referencesReceived: 2,
			referencesRequired: 2,
			referencesSatisfactory: 'yes',
			identityVerified: 'yes',
			preEmploymentNotes: ''
		},
		occupationalHealth: {
			ohQuestionnaireSubmitted: 'yes',
			ohClearanceReceived: 'yes',
			ohClearanceDate: '2026-03-15',
			ohRestrictions: 'no',
			ohRestrictionDetails: '',
			hepatitisBStatus: 'immune',
			tbScreeningStatus: 'not-required',
			immunisationStatus: 'complete',
			fitToWork: 'yes',
			occupationalHealthNotes: ''
		},
		mandatoryTraining: {
			fireSafetyCompleted: 'yes',
			fireSafetyDate: '2026-04-01',
			manualHandlingCompleted: 'yes',
			manualHandlingDate: '2026-04-01',
			infectionControlCompleted: 'yes',
			infectionControlDate: '2026-04-02',
			safeguardingAdultsCompleted: 'yes',
			safeguardingAdultsLevel: 'level-2',
			safeguardingChildrenCompleted: 'yes',
			safeguardingChildrenLevel: 'level-2',
			informationGovernanceCompleted: 'yes',
			informationGovernanceDate: '2026-04-03',
			basicLifeSupportCompleted: 'yes',
			basicLifeSupportDate: '2026-04-04',
			equalityDiversityCompleted: 'yes',
			healthSafetyCompleted: 'yes',
			conflictResolutionCompleted: 'yes',
			mandatoryTrainingNotes: ''
		},
		professionalRegistration: {
			registrationRequired: 'yes',
			regulatoryBody: 'nmc',
			regulatoryBodyOther: '',
			registrationNumber: '12A3456B',
			registrationVerified: 'yes',
			registrationExpiryDate: '2027-03-31',
			registrationConditions: 'no',
			registrationConditionDetails: '',
			revalidationDate: '2027-03-31',
			indemnityInsurance: 'yes',
			professionalRegistrationNotes: ''
		},
		itSystemsAccess: {
			nhsSmartcardIssued: 'yes',
			nhsSmartcardNumber: 'SC-987654',
			emailAccountCreated: 'yes',
			networkLoginCreated: 'yes',
			clinicalSystemAccess: 'yes',
			clinicalSystemName: 'EMIS Web',
			clinicalSystemTrainingCompleted: 'yes',
			rosteringSystemAccess: 'yes',
			phoneExtension: '4521',
			bleepNumber: '321',
			itAccessNotes: ''
		},
		uniformIDBadge: {
			uniformRequired: 'yes',
			uniformOrdered: 'yes',
			uniformReceived: 'yes',
			uniformSize: 'Medium',
			idBadgePhotoTaken: 'yes',
			idBadgeIssued: 'yes',
			idBadgeNumber: 'ID-00789',
			accessCardIssued: 'yes',
			accessCardAreas: 'Cardiology Ward, Staff Areas, Canteen',
			lockerAllocated: 'yes',
			lockerNumber: 'L-42',
			uniformIdNotes: ''
		},
		inductionProgramme: {
			corporateInductionCompleted: 'yes',
			corporateInductionDate: '2026-04-28',
			localInductionCompleted: 'yes',
			localInductionDate: '2026-04-29',
			departmentTourCompleted: 'yes',
			introducedToTeam: 'yes',
			emergencyProceduresBriefed: 'yes',
			policiesHandbookReceived: 'yes',
			buddyAssigned: 'yes',
			buddyName: 'Sarah Jones',
			inductionProgrammeNotes: ''
		},
		probationSupervision: {
			probationPeriodMonths: 6,
			probationStartDate: '2026-05-01',
			probationEndDate: '2026-10-31',
			lineManagerName: 'Dr Claire Wilson',
			lineManagerEmail: 'claire.wilson@nhs.net',
			supervisorName: 'Sister Mary Brown',
			supervisionFrequency: 'monthly',
			firstSupervisionDate: '2026-05-15',
			objectivesSet: 'yes',
			appraisalDateAgreed: 'yes',
			appraisalDate: '2026-08-01',
			probationSupervisionNotes: ''
		},
		signOffCompliance: {
			confidentialityAgreementSigned: 'yes',
			codeOfConductSigned: 'yes',
			socialMediaPolicyAcknowledged: 'yes',
			itAcceptableUseSigned: 'yes',
			gdprTrainingCompleted: 'yes',
			dutyOfCandourBriefed: 'yes',
			whistleblowingPolicyBriefed: 'yes',
			employeeSignedOff: 'yes',
			employeeSignOffDate: '2026-04-30',
			managerSignedOff: 'yes',
			managerSignOffDate: '2026-04-30',
			managerSignOffName: 'Dr Claire Wilson',
			signOffComplianceNotes: ''
		}
	};
}

function createEmptyEmployee(): AssessmentData {
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

describe('Onboarding Grading Engine', () => {
	it('returns complete status for a fully onboarded employee', () => {
		const data = createCompleteEmployee();
		const result = calculateOnboardingGrade(data);
		expect(result.completionStatus).toBe('complete');
		expect(result.completionPercentage).toBe(100);
		expect(result.overallRisk).toBe('low');
		expect(result.firedRules).toHaveLength(0);
	});

	it('returns not-started status for an empty assessment', () => {
		const data = createEmptyEmployee();
		const result = calculateOnboardingGrade(data);
		expect(result.completionStatus).toBe('not-started');
		expect(result.completionPercentage).toBe(0);
	});

	it('returns critical risk when DBS not started', () => {
		const data = createCompleteEmployee();
		data.preEmploymentChecks.dbsCheckStatus = 'not-started';
		const result = calculateOnboardingGrade(data);
		expect(result.overallRisk).toBe('critical');
		expect(result.firedRules.some((r) => r.id === 'DBS-001')).toBe(true);
	});

	it('returns critical risk when right to work not verified', () => {
		const data = createCompleteEmployee();
		data.preEmploymentChecks.rightToWorkVerified = 'no';
		const result = calculateOnboardingGrade(data);
		expect(result.overallRisk).toBe('critical');
	});

	it('returns high risk when OH clearance not received', () => {
		const data = createCompleteEmployee();
		data.occupationalHealth.ohClearanceReceived = 'no';
		const result = calculateOnboardingGrade(data);
		expect(result.overallRisk).toBe('high');
	});

	it('returns critical risk when registration required but not verified', () => {
		const data = createCompleteEmployee();
		data.professionalRegistration.registrationVerified = 'no';
		const result = calculateOnboardingGrade(data);
		expect(result.overallRisk).toBe('critical');
	});

	it('calculates in-progress for partial completion', () => {
		const data = createCompleteEmployee();
		// Reset most items to incomplete
		data.mandatoryTraining.fireSafetyCompleted = 'no';
		data.mandatoryTraining.manualHandlingCompleted = 'no';
		data.mandatoryTraining.infectionControlCompleted = 'no';
		data.mandatoryTraining.safeguardingAdultsCompleted = 'no';
		data.mandatoryTraining.safeguardingChildrenCompleted = 'no';
		data.mandatoryTraining.informationGovernanceCompleted = 'no';
		data.mandatoryTraining.basicLifeSupportCompleted = 'no';
		data.mandatoryTraining.equalityDiversityCompleted = 'no';
		data.mandatoryTraining.healthSafetyCompleted = 'no';
		data.itSystemsAccess.emailAccountCreated = 'no';
		data.itSystemsAccess.networkLoginCreated = 'no';
		data.itSystemsAccess.clinicalSystemAccess = 'no';
		data.uniformIDBadge.idBadgeIssued = 'no';
		data.uniformIDBadge.accessCardIssued = 'no';
		data.inductionProgramme.corporateInductionCompleted = 'no';
		data.inductionProgramme.localInductionCompleted = 'no';
		data.signOffCompliance.confidentialityAgreementSigned = 'no';
		data.signOffCompliance.gdprTrainingCompleted = 'no';
		data.signOffCompliance.managerSignedOff = 'no';
		const result = calculateOnboardingGrade(data);
		expect(result.completionStatus).toBe('in-progress');
		expect(result.completionPercentage).toBeGreaterThan(0);
		expect(result.completionPercentage).toBeLessThan(50);
	});

	it('detects all rule IDs are unique', () => {
		const ids = onboardingRules.map((r) => r.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});
});

describe('Onboarding Flagged Issues Detection', () => {
	it('returns no flags for fully complete employee', () => {
		const data = createCompleteEmployee();
		const flags = detectAdditionalFlags(data);
		expect(flags).toHaveLength(0);
	});

	it('flags DBS not started', () => {
		const data = createCompleteEmployee();
		data.preEmploymentChecks.dbsCheckStatus = 'not-started';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-DBS-001')).toBe(true);
	});

	it('flags right to work not verified', () => {
		const data = createCompleteEmployee();
		data.preEmploymentChecks.rightToWorkVerified = 'no';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-RTW-001')).toBe(true);
	});

	it('flags OH clearance not received', () => {
		const data = createCompleteEmployee();
		data.occupationalHealth.ohClearanceReceived = 'no';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-OH-001')).toBe(true);
	});

	it('flags professional registration not verified', () => {
		const data = createCompleteEmployee();
		data.professionalRegistration.registrationVerified = 'no';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-REG-001')).toBe(true);
	});

	it('flags incomplete mandatory training', () => {
		const data = createCompleteEmployee();
		data.mandatoryTraining.fireSafetyCompleted = 'no';
		data.mandatoryTraining.infectionControlCompleted = 'no';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-TR-001')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createCompleteEmployee();
		data.preEmploymentChecks.dbsCheckStatus = 'not-started';
		data.uniformIDBadge.idBadgeIssued = 'no';
		const flags = detectAdditionalFlags(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
