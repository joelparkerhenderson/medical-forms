// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Sex = 'male' | 'female' | 'other' | '';
export type AlcoholFrequency = 'none' | 'occasional' | 'moderate' | 'heavy' | '';
export type SmokingStatus = 'current' | 'ex' | 'never' | '';
export type BristolStoolType = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '';
export type PainCharacter = 'cramping' | 'burning' | 'sharp' | 'dull' | 'colicky' | '';
export type PainFrequency = 'constant' | 'intermittent' | 'episodic' | '';
export type AbdominalLocation =
	| 'epigastric'
	| 'right-upper-quadrant'
	| 'left-upper-quadrant'
	| 'periumbilical'
	| 'right-lower-quadrant'
	| 'left-lower-quadrant'
	| 'suprapubic'
	| 'diffuse'
	| '';

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
	symptomLocation: AbdominalLocation;
	symptomOnset: string;
	symptomDuration: string;
	severityScore: number | null;
}

export interface UpperGISymptoms {
	dysphagia: YesNo;
	dysphagiaDetails: string;
	odynophagia: YesNo;
	heartburn: YesNo;
	heartburnFrequency: string;
	nausea: YesNo;
	vomiting: YesNo;
	vomitingDetails: string;
	earlySatiety: YesNo;
}

export interface LowerGISymptoms {
	bowelHabitChange: YesNo;
	bowelHabitDetails: string;
	diarrhoea: YesNo;
	diarrhoeaFrequency: string;
	constipation: YesNo;
	constipationDetails: string;
	rectalBleeding: YesNo;
	rectalBleedingDetails: string;
	tenesmus: YesNo;
	bristolStoolType: BristolStoolType;
}

export interface AbdominalPainAssessment {
	painLocation: AbdominalLocation;
	painCharacter: PainCharacter;
	painRadiation: string;
	aggravatingFactors: string;
	relievingFactors: string;
	painFrequency: PainFrequency;
}

export interface LiverPancreas {
	jaundice: YesNo;
	darkUrine: YesNo;
	paleStools: YesNo;
	alcoholIntake: AlcoholFrequency;
	alcoholUnitsPerWeek: number | null;
	hepatitisExposure: YesNo;
	hepatitisDetails: string;
}

export interface PreviousGIHistory {
	previousEndoscopy: YesNo;
	endoscopyDetails: string;
	previousColonoscopy: YesNo;
	colonoscopyDetails: string;
	previousGISurgery: YesNo;
	surgeryDetails: string;
	ibd: YesNo;
	ibdType: 'crohns' | 'ulcerative-colitis' | '';
	ibs: YesNo;
	celiacDisease: YesNo;
	polyps: YesNo;
	polypDetails: string;
	giCancer: YesNo;
	giCancerDetails: string;
}

export interface Medication {
	name: string;
	dose: string;
	frequency: string;
}

export interface CurrentMedications {
	ppis: YesNo;
	ppiDetails: string;
	antacids: YesNo;
	laxatives: YesNo;
	laxativeDetails: string;
	antiDiarrhoeals: YesNo;
	biologics: YesNo;
	biologicDetails: string;
	steroids: YesNo;
	steroidDetails: string;
	nsaids: YesNo;
	nsaidDetails: string;
	otherMedications: Medication[];
}

export interface Allergy {
	allergen: string;
	reaction: string;
	severity: 'mild' | 'moderate' | 'severe' | '';
}

export interface AllergiesDiet {
	drugAllergies: Allergy[];
	foodIntolerances: string;
	dietaryRestrictions: string;
	glutenIntolerance: YesNo;
	lactoseIntolerance: YesNo;
}

export interface RedFlagsSocial {
	unexplainedWeightLoss: YesNo;
	weightLossAmount: string;
	appetiteChange: YesNo;
	appetiteDetails: string;
	familyGICancer: YesNo;
	familyCancerDetails: string;
	smoking: SmokingStatus;
	smokingPackYears: number | null;
	alcoholUse: AlcoholFrequency;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	chiefComplaint: ChiefComplaint;
	upperGISymptoms: UpperGISymptoms;
	lowerGISymptoms: LowerGISymptoms;
	abdominalPainAssessment: AbdominalPainAssessment;
	liverPancreas: LiverPancreas;
	previousGIHistory: PreviousGIHistory;
	currentMedications: CurrentMedications;
	allergiesDiet: AllergiesDiet;
	redFlagsSocial: RedFlagsSocial;
}

// ──────────────────────────────────────────────
// GI severity scoring types
// ──────────────────────────────────────────────

export type SeverityLevel = 'minimal' | 'mild' | 'moderate' | 'severe' | 'very-severe';

export interface GIScoringRule {
	id: string;
	category: string;
	description: string;
	points: number;
	evaluate: (data: AssessmentData) => boolean;
}

export interface FiredRule {
	id: string;
	category: string;
	description: string;
	points: number;
}

export interface AdditionalFlag {
	id: string;
	category: string;
	message: string;
	priority: 'high' | 'medium' | 'low';
}

export interface GradingResult {
	severityScore: number;
	severityLevel: SeverityLevel;
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
