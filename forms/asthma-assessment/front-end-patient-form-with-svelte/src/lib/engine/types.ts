// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Severity = 'mild' | 'moderate' | 'severe' | '';
export type Sex = 'male' | 'female' | 'other' | '';
export type AllergySeverity = 'mild' | 'moderate' | 'anaphylaxis' | '';
export type SmokingStatus = 'current' | 'ex' | 'never' | '';
export type VapingStatus = 'current' | 'ex' | 'never' | '';

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	sex: Sex;
	weight: number | null;
	height: number | null;
	bmi: number | null;
}

export interface SymptomFrequency {
	daytimeSymptoms: 'not-at-all' | 'once-or-twice' | 'three-to-six' | 'once-a-day' | 'more-than-once-a-day' | '';
	nighttimeAwakening: 'not-at-all' | 'once-or-twice' | 'once-a-week' | 'two-to-three-nights' | 'four-or-more-nights' | '';
	rescueInhalerUse: 'not-at-all' | 'once-or-twice' | 'three-to-six' | 'once-a-day' | 'two-or-more-times-a-day' | '';
	activityLimitation: 'not-at-all' | 'a-little' | 'somewhat' | 'a-lot' | 'extremely' | '';
	selfRatedControl: 'completely-controlled' | 'well-controlled' | 'somewhat-controlled' | 'poorly-controlled' | 'not-controlled-at-all' | '';
}

export interface LungFunction {
	fev1Percent: number | null;
	fev1Fvc: number | null;
	peakFlowBest: number | null;
	peakFlowCurrent: number | null;
	peakFlowPercent: number | null;
	spirometryDate: string;
	spirometryNotes: string;
}

export interface Triggers {
	allergens: YesNo;
	allergenDetails: string;
	exercise: YesNo;
	weather: YesNo;
	weatherDetails: string;
	occupational: YesNo;
	occupationalDetails: string;
	infections: YesNo;
	smoke: YesNo;
	stress: YesNo;
	medications: YesNo;
	medicationDetails: string;
	otherTriggers: string;
}

export interface Medication {
	name: string;
	dose: string;
	frequency: string;
}

export interface CurrentMedications {
	controllerMedications: Medication[];
	rescueInhalers: Medication[];
	biologics: Medication[];
	oralSteroids: YesNo;
	oralSteroidDetails: string;
	inhalerTechniqueReviewed: YesNo;
	medicationAdherence: 'good' | 'partial' | 'poor' | '';
}

export interface Allergy {
	allergen: string;
	reaction: string;
	severity: AllergySeverity;
}

export interface Allergies {
	drugAllergies: Allergy[];
	environmentalAllergies: string[];
	allergyTestingDone: YesNo;
	allergyTestResults: string;
}

export interface ExacerbationHistory {
	exacerbationsLastYear: number | null;
	edVisitsLastYear: number | null;
	hospitalisationsLastYear: number | null;
	icuAdmissions: YesNo;
	icuAdmissionCount: number | null;
	intubationHistory: YesNo;
	oralSteroidCoursesLastYear: number | null;
	lastExacerbationDate: string;
}

export interface Comorbidities {
	allergicRhinitis: YesNo;
	sinusitis: YesNo;
	nasalPolyps: YesNo;
	gord: YesNo;
	obesity: YesNo;
	anxiety: YesNo;
	depression: YesNo;
	eczema: YesNo;
	sleepApnoea: YesNo;
	vocalCordDysfunction: YesNo;
	otherComorbidities: string;
}

export interface SocialHistory {
	smoking: SmokingStatus;
	smokingPackYears: number | null;
	vaping: VapingStatus;
	occupationalExposures: YesNo;
	occupationalExposureDetails: string;
	homeEnvironment: string;
	pets: YesNo;
	petDetails: string;
	carpetInBedroom: YesNo;
	moldExposure: YesNo;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	symptomFrequency: SymptomFrequency;
	lungFunction: LungFunction;
	triggers: Triggers;
	currentMedications: CurrentMedications;
	allergies: Allergies;
	exacerbationHistory: ExacerbationHistory;
	comorbidities: Comorbidities;
	socialHistory: SocialHistory;
}

// ──────────────────────────────────────────────
// ACT scoring types
// ──────────────────────────────────────────────

export type ACTScore = number; // 5-25

export type ControlLevel = 'well-controlled' | 'well-controlled-but-could-be-better' | 'not-well-controlled' | 'very-poorly-controlled';

export interface ACTRule {
	id: string;
	category: string;
	description: string;
	evaluate: (data: AssessmentData) => number; // returns 1-5
}

export interface FiredRule {
	id: string;
	category: string;
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
	actScore: ACTScore;
	controlLevel: ControlLevel;
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
