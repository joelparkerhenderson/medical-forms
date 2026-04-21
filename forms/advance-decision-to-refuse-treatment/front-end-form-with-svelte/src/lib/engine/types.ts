// ──────────────────────────────────────────────
// Core ADRT data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type AllergySeverity = 'mild' | 'moderate' | 'anaphylaxis' | '';

export type ValidityStatus = 'draft' | 'complete' | 'valid' | 'invalid';

// ──────────────────────────────────────────────
// Step 1: Personal Information
// ──────────────────────────────────────────────

export interface PersonalInformation {
	fullLegalName: string;
	dateOfBirth: string;
	nhsNumber: string;
	address: string;
	postcode: string;
	telephone: string;
	email: string;
	gpName: string;
	gpPractice: string;
	gpAddress: string;
	gpTelephone: string;
}

// ──────────────────────────────────────────────
// Step 2: Capacity Declaration
// ──────────────────────────────────────────────

export interface CapacityDeclaration {
	confirmsCapacity: YesNo;
	understandsConsequences: YesNo;
	noUndueInfluence: YesNo;
	professionalCapacityAssessment: YesNo;
	assessedByName: string;
	assessedByRole: string;
	assessmentDate: string;
	assessmentDetails: string;
}

// ──────────────────────────────────────────────
// Step 3: Circumstances
// ──────────────────────────────────────────────

export interface Circumstances {
	specificCircumstances: string;
	medicalConditions: string;
	situationsDescription: string;
}

// ──────────────────────────────────────────────
// Step 4: Treatments Refused - General
// ──────────────────────────────────────────────

export interface TreatmentRefusal {
	treatment: string;
	refused: YesNo;
	specification: string;
}

export interface TreatmentsRefusedGeneral {
	antibiotics: TreatmentRefusal;
	bloodTransfusion: TreatmentRefusal;
	ivFluids: TreatmentRefusal;
	tubeFeeding: TreatmentRefusal;
	dialysis: TreatmentRefusal;
	ventilation: TreatmentRefusal;
	otherTreatments: TreatmentRefusal[];
}

// ──────────────────────────────────────────────
// Step 5: Treatments Refused - Life-Sustaining
// ──────────────────────────────────────────────

export interface LifeSustainingRefusal {
	treatment: string;
	refused: YesNo;
	evenIfLifeAtRisk: YesNo;
	specification: string;
}

export interface TreatmentsRefusedLifeSustaining {
	cpr: LifeSustainingRefusal;
	mechanicalVentilation: LifeSustainingRefusal;
	artificialNutritionHydration: LifeSustainingRefusal;
	otherLifeSustaining: LifeSustainingRefusal[];
}

// ──────────────────────────────────────────────
// Step 6: Exceptions & Conditions
// ──────────────────────────────────────────────

export interface ExceptionsConditions {
	hasExceptions: YesNo;
	exceptionsDescription: string;
	hasTimeLimitations: YesNo;
	timeLimitationsDescription: string;
	invalidatingConditions: string;
}

// ──────────────────────────────────────────────
// Step 7: Other Wishes (Non-binding)
// ──────────────────────────────────────────────

export interface OtherWishes {
	preferredCareSetting: string;
	comfortMeasures: string;
	spiritualReligiousWishes: string;
	otherPreferences: string;
}

// ──────────────────────────────────────────────
// Step 8: Lasting Power of Attorney
// ──────────────────────────────────────────────

export interface LastingPowerOfAttorney {
	hasLPA: YesNo;
	lpaType: 'health-and-welfare' | 'property-and-financial' | 'both' | '';
	lpaRegistered: YesNo;
	lpaRegistrationDate: string;
	doneeNames: string;
	relationshipBetweenADRTAndLPA: string;
}

// ──────────────────────────────────────────────
// Step 9: Healthcare Professional Review
// ──────────────────────────────────────────────

export interface HealthcareProfessionalReview {
	reviewedByClinicianName: string;
	reviewedByClinicianRole: string;
	reviewDate: string;
	clinicalOpinionOnCapacity: string;
	anyConcerns: YesNo;
	concernsDetails: string;
}

// ──────────────────────────────────────────────
// Step 10: Legal Signatures
// ──────────────────────────────────────────────

export interface LegalSignatures {
	patientSignature: YesNo;
	patientStatementOfUnderstanding: YesNo;
	patientSignatureDate: string;
	witnessSignature: YesNo;
	witnessName: string;
	witnessAddress: string;
	witnessSignatureDate: string;
	lifeSustainingWrittenStatement: YesNo;
	lifeSustainingStatementText: string;
	lifeSustainingSignature: YesNo;
	lifeSustainingWitnessSignature: YesNo;
	lifeSustainingWitnessName: string;
	lifeSustainingWitnessAddress: string;
}

// ──────────────────────────────────────────────
// Shared types
// ──────────────────────────────────────────────

export interface Medication {
	name: string;
	dose: string;
	frequency: string;
}

export interface Allergy {
	allergen: string;
	reaction: string;
	severity: AllergySeverity;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	personalInformation: PersonalInformation;
	capacityDeclaration: CapacityDeclaration;
	circumstances: Circumstances;
	treatmentsRefusedGeneral: TreatmentsRefusedGeneral;
	treatmentsRefusedLifeSustaining: TreatmentsRefusedLifeSustaining;
	exceptionsConditions: ExceptionsConditions;
	otherWishes: OtherWishes;
	lastingPowerOfAttorney: LastingPowerOfAttorney;
	healthcareProfessionalReview: HealthcareProfessionalReview;
	legalSignatures: LegalSignatures;
}

// ──────────────────────────────────────────────
// Validity checking types
// ──────────────────────────────────────────────

export interface ValidityRule {
	id: string;
	category: string;
	description: string;
	severity: 'critical' | 'required' | 'recommended';
	evaluate: (data: AssessmentData) => boolean;
}

export interface FiredRule {
	id: string;
	category: string;
	description: string;
	severity: 'critical' | 'required' | 'recommended';
}

export interface AdditionalFlag {
	id: string;
	category: string;
	message: string;
	priority: 'high' | 'medium' | 'low';
}

export interface GradingResult {
	validityStatus: ValidityStatus;
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
