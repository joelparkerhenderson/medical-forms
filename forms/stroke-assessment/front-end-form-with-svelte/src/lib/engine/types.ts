// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Sex = 'male' | 'female' | 'other' | '';
export type AllergySeverity = 'mild' | 'moderate' | 'anaphylaxis' | '';

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	sex: Sex;
}

export interface SymptomOnset {
	onsetTime: string;
	lastKnownWell: string;
	symptomProgression: 'sudden' | 'gradual' | 'fluctuating' | 'improving' | '';
	modeOfArrival: 'ambulance' | 'private-vehicle' | 'walk-in' | 'transfer' | '';
}

export interface LevelOfConsciousness {
	loc: 0 | 1 | 2 | 3 | null;
	locQuestions: 0 | 1 | 2 | null;
	locCommands: 0 | 1 | 2 | null;
}

export interface BestGazeVisual {
	bestGaze: 0 | 1 | 2 | null;
	visual: 0 | 1 | 2 | 3 | null;
}

export interface FacialPalsy {
	facialPalsy: 0 | 1 | 2 | 3 | null;
	leftArm: 0 | 1 | 2 | 3 | 4 | null;
	rightArm: 0 | 1 | 2 | 3 | 4 | null;
	leftLeg: 0 | 1 | 2 | 3 | 4 | null;
	rightLeg: 0 | 1 | 2 | 3 | 4 | null;
}

export interface LimbAtaxiaSensory {
	limbAtaxia: 0 | 1 | 2 | null;
	sensory: 0 | 1 | 2 | null;
}

export interface LanguageDysarthria {
	bestLanguage: 0 | 1 | 2 | 3 | null;
	dysarthria: 0 | 1 | 2 | null;
}

export interface ExtinctionInattention {
	extinctionInattention: 0 | 1 | 2 | null;
}

export interface RiskFactors {
	hypertension: YesNo;
	diabetes: YesNo;
	atrialFibrillation: YesNo;
	previousStroke: YesNo;
	smoking: YesNo;
	hyperlipidemia: YesNo;
	familyHistory: YesNo;
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

export interface CurrentMedications {
	medications: Medication[];
	allergies: Allergy[];
	anticoagulants: YesNo;
	anticoagulantDetails: string;
	antiplatelets: YesNo;
	antiplateletDetails: string;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	symptomOnset: SymptomOnset;
	levelOfConsciousness: LevelOfConsciousness;
	bestGazeVisual: BestGazeVisual;
	facialPalsy: FacialPalsy;
	limbAtaxiaSensory: LimbAtaxiaSensory;
	languageDysarthria: LanguageDysarthria;
	extinctionInattention: ExtinctionInattention;
	riskFactors: RiskFactors;
	currentMedications: CurrentMedications;
}

// ──────────────────────────────────────────────
// NIHSS grading types
// ──────────────────────────────────────────────

export interface NIHSSRuleDefinition {
	id: string;
	itemNumber: number;
	domain: string;
	text: string;
	maxScore: number;
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
	nihssScore: number;
	nihssCategory: string;
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
