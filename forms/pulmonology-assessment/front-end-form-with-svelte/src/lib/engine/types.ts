// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Sex = 'male' | 'female' | 'other' | '';
export type AllergySeverity = 'mild' | 'moderate' | 'anaphylaxis' | '';
export type SmokingStatus = 'current' | 'ex' | 'never' | '';
export type DyspnoeaGrade = '1' | '2' | '3' | '4' | '5' | '';
export type SputumFrequency = 'none' | 'occasional' | 'daily' | 'copious' | '';

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	sex: Sex;
	weight: number | null;
	height: number | null;
	bmi: number | null;
}

export interface ChiefComplaint {
	primarySymptom: string;
	symptomDuration: string;
	dyspnoeaGradeMRC: DyspnoeaGrade;
}

export interface Spirometry {
	fev1: number | null;
	fvc: number | null;
	fev1FvcRatio: number | null;
	fev1PercentPredicted: number | null;
	bronchodilatorResponse: YesNo;
}

export interface SymptomAssessment {
	catScore: number | null;
	mmrcDyspnoea: DyspnoeaGrade;
	coughFrequency: 'none' | 'occasional' | 'daily' | 'persistent' | '';
	sputumProduction: SputumFrequency;
}

export interface ExacerbationHistory {
	exacerbationsPerYear: number | null;
	hospitalizationsPerYear: number | null;
	icuAdmissions: number | null;
	intubationHistory: YesNo;
}

export interface Medication {
	name: string;
	dose: string;
	frequency: string;
}

export interface CurrentMedications {
	saba: YesNo;
	laba: YesNo;
	lama: YesNo;
	ics: YesNo;
	oralCorticosteroids: YesNo;
	oxygenTherapy: YesNo;
	oxygenLitresPerMinute: number | null;
	nebulizers: YesNo;
	otherMedications: Medication[];
}

export interface Allergy {
	allergen: string;
	reaction: string;
	severity: AllergySeverity;
}

export interface Comorbidities {
	cardiovascularDisease: YesNo;
	cardiovascularDetails: string;
	diabetes: YesNo;
	osteoporosis: YesNo;
	depression: YesNo;
	lungCancer: YesNo;
	lungCancerDetails: string;
	otherComorbidities: string;
}

export interface SmokingExposures {
	smokingStatus: SmokingStatus;
	packYears: number | null;
	occupationalExposures: YesNo;
	occupationalDetails: string;
	biomassFuelExposure: YesNo;
}

export interface FunctionalStatus {
	exerciseTolerance: 'unable' | 'light-housework' | 'climb-stairs' | 'moderate-exercise' | 'vigorous-exercise' | '';
	sixMinuteWalkDistance: number | null;
	oxygenSaturationRest: number | null;
	oxygenSaturationExertion: number | null;
	adlLimitations: YesNo;
	adlDetails: string;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	chiefComplaint: ChiefComplaint;
	spirometry: Spirometry;
	symptomAssessment: SymptomAssessment;
	exacerbationHistory: ExacerbationHistory;
	currentMedications: CurrentMedications;
	allergies: Allergy[];
	comorbidities: Comorbidities;
	smokingExposures: SmokingExposures;
	functionalStatus: FunctionalStatus;
}

// ──────────────────────────────────────────────
// GOLD staging types
// ──────────────────────────────────────────────

/** GOLD Stage I-IV based on FEV1 % predicted */
export type GoldStage = 1 | 2 | 3 | 4;

/** ABCD Group classification based on symptoms and exacerbations */
export type AbcdGroup = 'A' | 'B' | 'E';

export interface GoldRule {
	id: string;
	system: string;
	description: string;
	stage: GoldStage;
	evaluate: (data: AssessmentData) => boolean;
}

export interface FiredRule {
	id: string;
	system: string;
	description: string;
	stage: GoldStage;
}

export interface AdditionalFlag {
	id: string;
	category: string;
	message: string;
	priority: 'high' | 'medium' | 'low';
}

export interface GradingResult {
	goldStage: GoldStage;
	abcdGroup: AbcdGroup;
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
	section: keyof AssessmentData | 'allergies';
	isConditional?: boolean;
	shouldShow?: (data: AssessmentData) => boolean;
}
