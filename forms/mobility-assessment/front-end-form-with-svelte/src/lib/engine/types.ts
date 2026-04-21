// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Sex = 'male' | 'female' | 'other' | '';
export type AllergySeverity = 'mild' | 'moderate' | 'anaphylaxis' | '';
export type FearOfFalling = 'none' | 'mild' | 'moderate' | 'severe' | '';
export type TinettiScore = 0 | 1 | 2;
export type ROMStatus = 'normal' | 'mildly-limited' | 'moderately-limited' | 'severely-limited' | '';
export type IndependenceLevel = 'independent' | 'modified-independent' | 'supervision' | 'minimal-assist' | 'moderate-assist' | 'maximal-assist' | 'dependent' | '';

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	sex: Sex;
	height: string;
	weight: string;
}

export interface ReferralInfo {
	referringProvider: string;
	referralReason: string;
	referralDate: string;
	primaryDiagnosis: string;
	secondaryDiagnoses: string;
}

export interface FallHistory {
	fallsLastYear: number | null;
	lastFallDate: string;
	fallCircumstances: string;
	injuriesFromFalls: string;
	fearOfFalling: FearOfFalling;
	fallRiskFactors: string[];
}

export interface BalanceAssessment {
	sittingBalance: TinettiScore | null;
	risesFromChair: TinettiScore | null;
	attemptingToRise: TinettiScore | null;
	immediateStandingBalance: TinettiScore | null;
	standingBalance: TinettiScore | null;
	nudgedBalance: TinettiScore | null;
	eyesClosed: TinettiScore | null;
	turning360: TinettiScore | null;
	sittingDown: TinettiScore | null;
}

export interface GaitAssessment {
	initiationOfGait: TinettiScore | null;
	stepLength: TinettiScore | null;
	stepHeight: TinettiScore | null;
	stepSymmetry: TinettiScore | null;
	stepContinuity: TinettiScore | null;
	path: TinettiScore | null;
	trunk: TinettiScore | null;
	walkingStance: TinettiScore | null;
}

export interface TimedUpAndGo {
	timeSeconds: number | null;
	usedAssistiveDevice: YesNo;
	deviceType: string;
}

export interface RangeOfMotion {
	hipFlexion: ROMStatus;
	hipExtension: ROMStatus;
	kneeFlexion: ROMStatus;
	kneeExtension: ROMStatus;
	ankleFlexion: ROMStatus;
	ankleExtension: ROMStatus;
	notes: string;
}

export interface AssistiveDevices {
	currentDevices: string[];
	deviceFitAdequate: YesNo;
	deviceCondition: string;
	recommendedDevices: string;
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
	fallRiskMedications: string[];
	recentMedicationChanges: string;
}

export interface FunctionalIndependence {
	transfers: IndependenceLevel;
	ambulation: IndependenceLevel;
	stairs: IndependenceLevel;
	bathing: IndependenceLevel;
	dressing: IndependenceLevel;
	additionalNotes: string;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	referralInfo: ReferralInfo;
	fallHistory: FallHistory;
	balanceAssessment: BalanceAssessment;
	gaitAssessment: GaitAssessment;
	timedUpAndGo: TimedUpAndGo;
	rangeOfMotion: RangeOfMotion;
	assistiveDevices: AssistiveDevices;
	currentMedications: CurrentMedications;
	functionalIndependence: FunctionalIndependence;
}

// ──────────────────────────────────────────────
// Tinetti grading types
// ──────────────────────────────────────────────

export interface TinettiRuleDefinition {
	id: string;
	itemNumber: number;
	domain: 'balance' | 'gait';
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
	tinettiTotal: number;
	balanceScore: number;
	gaitScore: number;
	tinettiCategory: string;
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
