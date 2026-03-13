// ──────────────────────────────────────────────
// Core consent form data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Sex = 'male' | 'female' | 'other' | '';
export type AnesthesiaType = 'general' | 'regional' | 'local' | 'sedation' | 'none' | '';

export interface PatientInformation {
	firstName: string;
	lastName: string;
	dob: string;
	sex: Sex;
	nhsNumber: string;
	address: string;
	phone: string;
	emergencyContact: string;
	emergencyContactPhone: string;
}

export interface ProcedureDetails {
	procedureName: string;
	procedureDescription: string;
	treatingClinician: string;
	department: string;
	scheduledDate: string;
	estimatedDuration: string;
	admissionRequired: YesNo;
}

export interface RisksBenefits {
	commonRisks: string;
	seriousRisks: string;
	expectedBenefits: string;
	successRate: string;
	recoveryPeriod: string;
}

export interface AlternativeTreatments {
	alternativeOptions: string;
	noTreatmentConsequences: string;
	patientPreference: string;
}

export interface AnesthesiaInformation {
	anesthesiaType: AnesthesiaType;
	anesthesiaRisks: string;
	previousAnesthesiaProblems: YesNo;
	previousAnesthesiaDetails: string;
	fastingInstructions: string;
}

export interface QuestionsUnderstanding {
	questionsAsked: string;
	understandsProcedure: YesNo;
	understandsRisks: YesNo;
	understandsAlternatives: YesNo;
	understandsRecovery: YesNo;
	additionalConcerns: string;
}

export interface PatientRights {
	rightToWithdraw: YesNo;
	rightToSecondOpinion: YesNo;
	informedVoluntarily: YesNo;
	noGuaranteeAcknowledged: YesNo;
}

export interface SignatureConsent {
	patientConsent: YesNo;
	signatureDate: string;
	witnessName: string;
	witnessRole: string;
	witnessSignatureDate: string;
	clinicianName: string;
	clinicianRole: string;
	clinicianSignatureDate: string;
	interpreterUsed: YesNo;
	interpreterName: string;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	patientInformation: PatientInformation;
	procedureDetails: ProcedureDetails;
	risksBenefits: RisksBenefits;
	alternativeTreatments: AlternativeTreatments;
	anesthesiaInformation: AnesthesiaInformation;
	questionsUnderstanding: QuestionsUnderstanding;
	patientRights: PatientRights;
	signatureConsent: SignatureConsent;
}

// ──────────────────────────────────────────────
// Validation result types
// ──────────────────────────────────────────────

export interface ValidationRule {
	id: string;
	section: string;
	field: string;
	message: string;
}

export interface FiredRule {
	id: string;
	section: string;
	description: string;
	field: string;
}

export interface AdditionalFlag {
	id: string;
	category: string;
	message: string;
	priority: 'high' | 'medium' | 'low';
}

export interface GradingResult {
	completenessPercent: number;
	status: 'Complete' | 'Incomplete';
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
