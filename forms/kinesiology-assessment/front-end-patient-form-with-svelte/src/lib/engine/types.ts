// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Sex = 'male' | 'female' | 'other' | '';
export type FMSScore = 0 | 1 | 2 | 3;
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'vigorous' | 'elite' | '';
export type PainLevel = 'none' | 'mild' | 'moderate' | 'severe' | '';

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	sex: Sex;
}

export interface ReferralInfo {
	referringProvider: string;
	referralReason: string;
	referralDate: string;
	sportOrActivity: string;
}

export interface MovementHistory {
	injuryHistory: string;
	activityLevel: ActivityLevel;
	sportParticipation: string;
	currentPain: PainLevel;
	currentPainDetails: string;
	previousTreatments: string;
}

export interface FMSPatternScore {
	score: FMSScore | null;
	painDuringMovement: boolean;
	leftScore: FMSScore | null;
	rightScore: FMSScore | null;
	asymmetryNotes: string;
}

export interface ClearingTest {
	shoulderClearing: YesNo;
	shoulderClearingPain: boolean;
	trunkFlexionClearing: YesNo;
	trunkFlexionClearingPain: boolean;
	trunkExtensionClearing: YesNo;
	trunkExtensionClearingPain: boolean;
}

export interface FMSPatterns {
	deepSquat: FMSPatternScore;
	hurdleStep: FMSPatternScore;
	inLineLunge: FMSPatternScore;
	shoulderMobility: FMSPatternScore;
	activeStraightLegRaise: FMSPatternScore;
	trunkStabilityPushUp: FMSPatternScore;
	rotaryStability: FMSPatternScore;
	clearingTests: ClearingTest;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	referralInfo: ReferralInfo;
	movementHistory: MovementHistory;
	fmsPatterns: FMSPatterns;
}

// ──────────────────────────────────────────────
// FMS grading types
// ──────────────────────────────────────────────

export interface FMSRuleDefinition {
	id: string;
	patternNumber: number;
	pattern: string;
	description: string;
}

export interface FiredRule {
	id: string;
	pattern: string;
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
	fmsScore: number;
	fmsCategory: string;
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
	section: keyof AssessmentData | string;
}
