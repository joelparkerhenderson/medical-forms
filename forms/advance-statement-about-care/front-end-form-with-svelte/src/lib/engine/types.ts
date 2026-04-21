// ──────────────────────────────────────────────
// Core advance statement data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type AllergySeverity = 'mild' | 'moderate' | 'anaphylaxis' | '';

export interface PersonalInformation {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	nhsNumber: string;
	address: string;
	postcode: string;
	telephone: string;
	email: string;
	gpName: string;
	gpPractice: string;
	gpTelephone: string;
}

export interface StatementContext {
	reasonForStatement: string;
	currentDiagnosis: string;
	understandingOfCondition: string;
	whenStatementShouldApply: string;
	previousAdvanceStatements: YesNo;
	previousStatementDetails: string;
}

export interface ValuesBeliefs {
	religiousBeliefs: string;
	spiritualBeliefs: string;
	culturalValues: string;
	qualityOfLifePriorities: string;
	whatMakesLifeMeaningful: string;
	importantTraditions: string;
	viewsOnDying: string;
}

export interface CarePreferences {
	preferredPlaceOfCare: 'home' | 'hospital' | 'hospice' | 'care-home' | 'no-preference' | '';
	preferredPlaceOfDeath: 'home' | 'hospital' | 'hospice' | 'care-home' | 'no-preference' | '';
	personalComfortPreferences: string;
	dailyRoutinePreferences: string;
	dietaryRequirements: string;
	clothingPreferences: string;
	hygienePreferences: string;
	environmentPreferences: string;
}

export interface MedicalTreatmentWishes {
	painManagementPreferences: string;
	nutritionHydrationWishes: string;
	ventilationWishes: string;
	resuscitationWishes: string;
	antibioticsWishes: string;
	hospitalisationWishes: string;
	bloodTransfusionWishes: string;
	organDonationWishes: string;
}

export interface CommunicationPreferences {
	preferredLanguage: string;
	communicationAids: string;
	howToBeAddressed: string;
	informationSharingPreferences: string;
	interpreterNeeded: YesNo;
	interpreterLanguage: string;
}

export interface PersonImportantToMe {
	name: string;
	relationship: string;
	telephone: string;
	email: string;
	role: string;
}

export interface PeopleImportantToMe {
	people: PersonImportantToMe[];
	petsDetails: string;
	petCareArrangements: string;
}

export interface PracticalMatters {
	financialArrangements: string;
	propertyMatters: string;
	petCareInstructions: string;
	socialMediaWishes: string;
	personalBelongings: string;
	funeralWishes: string;
	willDetails: string;
	powerOfAttorneyDetails: string;
}

export interface SignaturesWitnesses {
	patientSignature: string;
	patientSignatureDate: string;
	witnessName: string;
	witnessAddress: string;
	witnessSignature: string;
	witnessSignatureDate: string;
	reviewDate: string;
	healthcareProfessionalName: string;
	healthcareProfessionalRole: string;
	healthcareProfessionalSignature: string;
	healthcareProfessionalDate: string;
}

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
// Full statement data model
// ──────────────────────────────────────────────

export interface StatementData {
	personalInformation: PersonalInformation;
	statementContext: StatementContext;
	valuesBeliefs: ValuesBeliefs;
	carePreferences: CarePreferences;
	medicalTreatmentWishes: MedicalTreatmentWishes;
	communicationPreferences: CommunicationPreferences;
	peopleImportantToMe: PeopleImportantToMe;
	practicalMatters: PracticalMatters;
	signaturesWitnesses: SignaturesWitnesses;
}

// ──────────────────────────────────────────────
// Completeness types
// ──────────────────────────────────────────────

export type CompletenessLevel = 'incomplete' | 'partial' | 'complete' | 'verified';

export interface CompletenessRule {
	id: string;
	section: string;
	description: string;
	required: boolean;
	evaluate: (data: StatementData) => boolean;
}

export interface MissingSection {
	id: string;
	section: string;
	description: string;
	required: boolean;
}

export interface FlaggedIssue {
	id: string;
	category: string;
	message: string;
	priority: 'high' | 'medium' | 'low';
}

export interface CompletenessResult {
	level: CompletenessLevel;
	missingSections: MissingSection[];
	flaggedIssues: FlaggedIssue[];
	completedCount: number;
	totalCount: number;
	timestamp: string;
}

// ──────────────────────────────────────────────
// Step configuration
// ──────────────────────────────────────────────

export interface StepConfig {
	number: number;
	title: string;
	shortTitle: string;
	section: keyof StatementData;
}
