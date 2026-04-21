// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	email: string;
	phone: string;
	jobTitle: string;
	department: string;
	startDate: string;
	emergencyContactName: string;
	emergencyContactPhone: string;
	emergencyContactRelationship: string;
}

export interface PreEmploymentChecks {
	dbsCheckStatus: 'not-started' | 'applied' | 'received' | 'cleared' | '';
	dbsCertificateNumber: string;
	dbsCheckDate: string;
	dbsUpdateServiceRegistered: YesNo;
	rightToWorkVerified: YesNo;
	rightToWorkDocumentType: string;
	rightToWorkExpiryDate: string;
	referencesReceived: number | null;
	referencesRequired: number | null;
	referencesSatisfactory: YesNo;
	identityVerified: YesNo;
	preEmploymentNotes: string;
}

export interface OccupationalHealth {
	ohQuestionnaireSubmitted: YesNo;
	ohClearanceReceived: YesNo;
	ohClearanceDate: string;
	ohRestrictions: YesNo;
	ohRestrictionDetails: string;
	hepatitisBStatus: 'immune' | 'non-immune' | 'vaccinating' | 'declined' | '';
	tbScreeningStatus: 'not-required' | 'required' | 'completed' | 'referred' | '';
	immunisationStatus: 'complete' | 'incomplete' | 'in-progress' | '';
	fitToWork: YesNo;
	occupationalHealthNotes: string;
}

export interface MandatoryTraining {
	fireSafetyCompleted: YesNo;
	fireSafetyDate: string;
	manualHandlingCompleted: YesNo;
	manualHandlingDate: string;
	infectionControlCompleted: YesNo;
	infectionControlDate: string;
	safeguardingAdultsCompleted: YesNo;
	safeguardingAdultsLevel: 'level-1' | 'level-2' | 'level-3' | '';
	safeguardingChildrenCompleted: YesNo;
	safeguardingChildrenLevel: 'level-1' | 'level-2' | 'level-3' | '';
	informationGovernanceCompleted: YesNo;
	informationGovernanceDate: string;
	basicLifeSupportCompleted: YesNo;
	basicLifeSupportDate: string;
	equalityDiversityCompleted: YesNo;
	healthSafetyCompleted: YesNo;
	conflictResolutionCompleted: YesNo;
	mandatoryTrainingNotes: string;
}

export interface ProfessionalRegistration {
	registrationRequired: YesNo;
	regulatoryBody: 'nmc' | 'gmc' | 'hcpc' | 'gdc' | 'gphc' | 'other' | '';
	regulatoryBodyOther: string;
	registrationNumber: string;
	registrationVerified: YesNo;
	registrationExpiryDate: string;
	registrationConditions: YesNo;
	registrationConditionDetails: string;
	revalidationDate: string;
	indemnityInsurance: 'yes' | 'no' | 'na' | '';
	professionalRegistrationNotes: string;
}

export interface ITSystemsAccess {
	nhsSmartcardIssued: YesNo;
	nhsSmartcardNumber: string;
	emailAccountCreated: YesNo;
	networkLoginCreated: YesNo;
	clinicalSystemAccess: YesNo;
	clinicalSystemName: string;
	clinicalSystemTrainingCompleted: YesNo;
	rosteringSystemAccess: YesNo;
	phoneExtension: string;
	bleepNumber: string;
	itAccessNotes: string;
}

export interface UniformIDBadge {
	uniformRequired: YesNo;
	uniformOrdered: YesNo;
	uniformReceived: YesNo;
	uniformSize: string;
	idBadgePhotoTaken: YesNo;
	idBadgeIssued: YesNo;
	idBadgeNumber: string;
	accessCardIssued: YesNo;
	accessCardAreas: string;
	lockerAllocated: YesNo;
	lockerNumber: string;
	uniformIdNotes: string;
}

export interface InductionProgramme {
	corporateInductionCompleted: YesNo;
	corporateInductionDate: string;
	localInductionCompleted: YesNo;
	localInductionDate: string;
	departmentTourCompleted: YesNo;
	introducedToTeam: YesNo;
	emergencyProceduresBriefed: YesNo;
	policiesHandbookReceived: YesNo;
	buddyAssigned: YesNo;
	buddyName: string;
	inductionProgrammeNotes: string;
}

export interface ProbationSupervision {
	probationPeriodMonths: number | null;
	probationStartDate: string;
	probationEndDate: string;
	lineManagerName: string;
	lineManagerEmail: string;
	supervisorName: string;
	supervisionFrequency: 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | '';
	firstSupervisionDate: string;
	objectivesSet: YesNo;
	appraisalDateAgreed: YesNo;
	appraisalDate: string;
	probationSupervisionNotes: string;
}

export interface SignOffCompliance {
	confidentialityAgreementSigned: YesNo;
	codeOfConductSigned: YesNo;
	socialMediaPolicyAcknowledged: YesNo;
	itAcceptableUseSigned: YesNo;
	gdprTrainingCompleted: YesNo;
	dutyOfCandourBriefed: YesNo;
	whistleblowingPolicyBriefed: YesNo;
	employeeSignedOff: YesNo;
	employeeSignOffDate: string;
	managerSignedOff: YesNo;
	managerSignOffDate: string;
	managerSignOffName: string;
	signOffComplianceNotes: string;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	preEmploymentChecks: PreEmploymentChecks;
	occupationalHealth: OccupationalHealth;
	mandatoryTraining: MandatoryTraining;
	professionalRegistration: ProfessionalRegistration;
	itSystemsAccess: ITSystemsAccess;
	uniformIDBadge: UniformIDBadge;
	inductionProgramme: InductionProgramme;
	probationSupervision: ProbationSupervision;
	signOffCompliance: SignOffCompliance;
}

// ──────────────────────────────────────────────
// Onboarding grading types
// ──────────────────────────────────────────────

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';
export type CompletionStatus = 'not-started' | 'in-progress' | 'mostly-complete' | 'complete';

export interface OnboardingRule {
	id: string;
	category: string;
	description: string;
	grade: number;
	evaluate: (data: AssessmentData) => boolean;
}

export interface FiredRule {
	id: string;
	category: string;
	description: string;
	grade: number;
}

export interface AdditionalFlag {
	id: string;
	category: string;
	message: string;
	priority: 'high' | 'medium' | 'low';
}

export interface GradingResult {
	completionPercentage: number;
	completionStatus: CompletionStatus;
	overallRisk: RiskLevel;
	itemsCompleted: number;
	itemsTotal: number;
	firedRules: FiredRule[];
	additionalFlags: AdditionalFlag[];
	timestamp: string;
}

// ──────────────────────────────────────────────
// Step configuration
// ──────────────────────────────────────────────

export interface StepConfig {
	number: number;
	title: string;
	shortTitle: string;
	section: keyof AssessmentData;
}
