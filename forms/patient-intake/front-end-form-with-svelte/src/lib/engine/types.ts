// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Sex = 'male' | 'female' | 'other' | '';
export type UrgencyLevel = 'routine' | 'urgent' | 'emergency' | '';
export type SmokingStatus = 'current' | 'ex' | 'never' | '';
export type AlcoholFrequency = 'none' | 'occasional' | 'moderate' | 'heavy' | '';
export type DrugUseFrequency = 'none' | 'occasional' | 'regular' | '';
export type ExerciseFrequency = 'none' | 'occasional' | 'moderate' | 'regular' | '';
export type DietQuality = 'poor' | 'average' | 'good' | 'excellent' | '';
export type AllergySeverity = 'mild' | 'moderate' | 'anaphylaxis' | '';
export type AllergyType = 'drug' | 'food' | 'environmental' | 'latex' | 'other' | '';
export type CommunicationPreference = 'phone' | 'email' | 'text' | 'post' | '';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface PersonalInformation {
	fullName: string;
	dateOfBirth: string;
	sex: Sex;
	addressLine1: string;
	addressLine2: string;
	city: string;
	postcode: string;
	phone: string;
	email: string;
	emergencyContactName: string;
	emergencyContactPhone: string;
	emergencyContactRelationship: string;
}

export interface InsuranceAndId {
	insuranceProvider: string;
	policyNumber: string;
	nhsNumber: string;
	gpName: string;
	gpPracticeName: string;
	gpPhone: string;
}

export interface ReasonForVisit {
	primaryReason: string;
	urgencyLevel: UrgencyLevel;
	referringProvider: string;
	symptomDuration: string;
	additionalDetails: string;
}

export interface MedicalHistory {
	chronicConditions: string[];
	previousSurgeries: string;
	previousHospitalizations: string;
	ongoingTreatments: string;
}

export interface Medication {
	name: string;
	dose: string;
	frequency: string;
	prescriber: string;
}

export interface Allergy {
	allergen: string;
	allergyType: AllergyType;
	reaction: string;
	severity: AllergySeverity;
}

export interface FamilyHistory {
	heartDisease: YesNo;
	heartDiseaseDetails: string;
	cancer: YesNo;
	cancerDetails: string;
	diabetes: YesNo;
	diabetesDetails: string;
	stroke: YesNo;
	strokeDetails: string;
	mentalIllness: YesNo;
	mentalIllnessDetails: string;
	geneticConditions: YesNo;
	geneticConditionsDetails: string;
}

export interface SocialHistory {
	smokingStatus: SmokingStatus;
	smokingPackYears: number | null;
	alcoholFrequency: AlcoholFrequency;
	alcoholUnitsPerWeek: number | null;
	drugUse: DrugUseFrequency;
	drugDetails: string;
	occupation: string;
	exerciseFrequency: ExerciseFrequency;
	dietQuality: DietQuality;
}

export interface ReviewOfSystems {
	constitutional: string;
	heent: string;
	cardiovascular: string;
	respiratory: string;
	gastrointestinal: string;
	genitourinary: string;
	musculoskeletal: string;
	neurological: string;
	psychiatric: string;
	skin: string;
}

export interface ConsentAndPreferences {
	consentToTreatment: YesNo;
	privacyAcknowledgement: YesNo;
	communicationPreference: CommunicationPreference;
	advanceDirectives: YesNo;
	advanceDirectiveDetails: string;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	personalInformation: PersonalInformation;
	insuranceAndId: InsuranceAndId;
	reasonForVisit: ReasonForVisit;
	medicalHistory: MedicalHistory;
	medications: Medication[];
	allergies: Allergy[];
	familyHistory: FamilyHistory;
	socialHistory: SocialHistory;
	reviewOfSystems: ReviewOfSystems;
	consentAndPreferences: ConsentAndPreferences;
}

// ──────────────────────────────────────────────
// Risk classification types
// ──────────────────────────────────────────────

export interface IntakeRule {
	id: string;
	category: string;
	description: string;
	riskLevel: RiskLevel;
	evaluate: (data: AssessmentData) => boolean;
}

export interface FiredRule {
	id: string;
	category: string;
	description: string;
	riskLevel: RiskLevel;
}

export interface AdditionalFlag {
	id: string;
	category: string;
	message: string;
	priority: 'high' | 'medium' | 'low';
}

export interface GradingResult {
	riskLevel: RiskLevel;
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
	section: keyof AssessmentData | 'medications' | 'allergies';
}
