// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Sex = 'male' | 'female' | 'other' | '';
export type AllergySeverity = 'mild' | 'moderate' | 'anaphylaxis' | '';
export type FitzpatrickType = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | '';
export type DLQIScore = 0 | 1 | 2 | 3;
export type LesionType = 'macule' | 'papule' | 'patch' | 'plaque' | 'nodule' | 'vesicle' | 'bulla' | 'pustule' | 'wheal' | 'erosion' | 'ulcer' | 'other' | '';
export type LesionColor = 'erythematous' | 'hyperpigmented' | 'hypopigmented' | 'violaceous' | 'flesh-colored' | 'other' | '';
export type LesionBorder = 'well-defined' | 'poorly-defined' | 'irregular' | 'raised' | '';
export type LesionDistribution = 'localized' | 'generalized' | 'symmetrical' | 'asymmetrical' | 'dermatomal' | 'sun-exposed' | '';
export type LesionSurface = 'smooth' | 'rough' | 'scaly' | 'crusted' | 'verrucous' | 'ulcerated' | '';
export type SunExposure = 'minimal' | 'moderate' | 'frequent' | 'excessive' | '';
export type TanningHistory = 'never' | 'occasional' | 'regular-outdoor' | 'tanning-bed' | '';

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	sex: Sex;
	skinType: FitzpatrickType;
}

export interface ChiefComplaint {
	primaryConcern: string;
	duration: string;
	location: string;
	progression: 'stable' | 'improving' | 'worsening' | 'fluctuating' | '';
	previousTreatments: string;
}

export interface DLQIQuestion {
	id: string;
	text: string;
	domain: string;
	score: DLQIScore | null;
}

export interface DLQIQuestionnaire {
	q1: DLQIScore | null;
	q2: DLQIScore | null;
	q3: DLQIScore | null;
	q4: DLQIScore | null;
	q5: DLQIScore | null;
	q6: DLQIScore | null;
	q7: DLQIScore | null;
	q8: DLQIScore | null;
	q9: DLQIScore | null;
	q10: DLQIScore | null;
}

export interface LesionCharacteristics {
	type: LesionType;
	color: LesionColor;
	border: LesionBorder;
	sizeMillimeters: number | null;
	distribution: LesionDistribution;
	number: 'single' | 'few' | 'multiple' | 'numerous' | '';
	surface: LesionSurface;
}

export interface MedicalHistory {
	previousSkinConditions: string;
	autoimmuneDiseases: YesNo;
	autoimmuneDiseaseDetails: string;
	immunosuppression: YesNo;
	immunosuppressionDetails: string;
	cancerHistory: YesNo;
	cancerHistoryDetails: string;
}

export interface Medication {
	name: string;
	dose: string;
	frequency: string;
}

export interface CurrentMedications {
	topicals: Medication[];
	systemics: Medication[];
	biologics: Medication[];
	otcProducts: string;
}

export interface Allergy {
	allergen: string;
	reaction: string;
	severity: AllergySeverity;
}

export interface Allergies {
	drugAllergies: Allergy[];
	contactAllergies: string;
	latexAllergy: YesNo;
}

export interface FamilyHistory {
	psoriasis: YesNo;
	eczema: YesNo;
	melanoma: YesNo;
	skinCancer: YesNo;
	autoimmune: YesNo;
	otherDetails: string;
}

export interface SocialHistory {
	sunExposure: SunExposure;
	tanningHistory: TanningHistory;
	occupation: string;
	cosmeticsUse: string;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	chiefComplaint: ChiefComplaint;
	dlqiQuestionnaire: DLQIQuestionnaire;
	lesionCharacteristics: LesionCharacteristics;
	medicalHistory: MedicalHistory;
	currentMedications: CurrentMedications;
	allergies: Allergies;
	familyHistory: FamilyHistory;
	socialHistory: SocialHistory;
}

// ──────────────────────────────────────────────
// DLQI grading types
// ──────────────────────────────────────────────

export interface DLQIRuleDefinition {
	id: string;
	questionNumber: number;
	domain: string;
	text: string;
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
	dlqiScore: number;
	dlqiCategory: string;
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
