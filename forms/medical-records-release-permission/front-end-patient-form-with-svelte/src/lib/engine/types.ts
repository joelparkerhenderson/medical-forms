// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Sex = 'male' | 'female' | 'other' | '';
export type RecordType =
	| 'complete-medical-record'
	| 'lab-results'
	| 'imaging'
	| 'prescriptions'
	| 'discharge-summaries'
	| 'mental-health'
	| 'surgical-records'
	| 'allergy-records';
export type ReleasePurpose =
	| 'continuing-care'
	| 'second-opinion'
	| 'insurance'
	| 'legal'
	| 'personal'
	| 'research'
	| 'employment'
	| 'other'
	| '';

export interface PatientInformation {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	sex: Sex;
	address: string;
	phone: string;
	email: string;
	nhsNumber: string;
	gpName: string;
	gpPractice: string;
}

export interface AuthorizedRecipient {
	recipientName: string;
	recipientOrganization: string;
	recipientAddress: string;
	recipientPhone: string;
	recipientEmail: string;
	recipientRole: string;
}

export interface RecordsToRelease {
	recordTypes: string[];
	specificDateRange: YesNo;
	dateFrom: string;
	dateTo: string;
	specificRecordDetails: string;
}

export interface PurposeOfRelease {
	purpose: ReleasePurpose;
	otherDetails: string;
}

export interface AuthorizationPeriod {
	startDate: string;
	endDate: string;
	singleUse: YesNo;
}

export interface RestrictionsLimitations {
	excludeHIV: YesNo;
	excludeSubstanceAbuse: YesNo;
	excludeMentalHealth: YesNo;
	excludeGeneticInfo: YesNo;
	excludeSTI: YesNo;
	additionalRestrictions: string;
}

export interface PatientRights {
	acknowledgedRightToRevoke: YesNo;
	acknowledgedNoChargeForAccess: YesNo;
	acknowledgedDataProtection: YesNo;
}

export interface SignatureConsent {
	patientSignatureConfirmed: YesNo;
	signatureDate: string;
	witnessName: string;
	witnessSignatureConfirmed: YesNo;
	witnessDate: string;
	parentGuardianName: string;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	patientInformation: PatientInformation;
	authorizedRecipient: AuthorizedRecipient;
	recordsToRelease: RecordsToRelease;
	purposeOfRelease: PurposeOfRelease;
	authorizationPeriod: AuthorizationPeriod;
	restrictionsLimitations: RestrictionsLimitations;
	patientRights: PatientRights;
	signatureConsent: SignatureConsent;
}

// ──────────────────────────────────────────────
// Validation / grading types
// ──────────────────────────────────────────────

export interface ValidationRuleDefinition {
	id: string;
	section: string;
	field: string;
	description: string;
}

export interface FiredRule {
	id: string;
	domain: string;
	description: string;
	score: number;
}

export interface AdditionalFlag {
	id: string;
	category: string;
	message: string;
	priority: 'high' | 'medium' | 'low';
}

export interface GradingResult {
	completenessScore: number;
	completenessStatus: string;
	validationStatus: string;
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
