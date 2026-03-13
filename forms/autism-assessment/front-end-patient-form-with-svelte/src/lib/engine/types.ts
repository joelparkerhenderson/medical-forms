// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Sex = 'male' | 'female' | 'other' | '';
export type AllergySeverity = 'mild' | 'moderate' | 'anaphylaxis' | '';
export type AgeGroup = 'child' | 'adolescent' | 'adult' | '';
export type AQ10Score = 0 | 1;
export type AQ10Domain = 'social-skills' | 'attention-switching' | 'attention-to-detail' | 'communication' | 'imagination';
export type SensoryLevel = 'none' | 'mild' | 'moderate' | 'severe' | '';
export type ReferralSource = 'self' | 'gp' | 'school' | 'employer' | 'family' | 'other' | '';
export type FrequencyLevel = 'never' | 'rarely' | 'sometimes' | 'often' | 'always' | '';

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	sex: Sex;
	ageGroup: AgeGroup;
}

export interface ScreeningPurpose {
	referralSource: ReferralSource;
	referralSourceOther: string;
	reasonForScreening: string;
	previousAssessments: YesNo;
	previousAssessmentDetails: string;
}

export interface AQ10Question {
	id: string;
	text: string;
	domain: AQ10Domain;
	scoringDirection: 'agree' | 'disagree';
}

export interface AQ10Questionnaire {
	q1: AQ10Score | null;
	q2: AQ10Score | null;
	q3: AQ10Score | null;
	q4: AQ10Score | null;
	q5: AQ10Score | null;
	q6: AQ10Score | null;
	q7: AQ10Score | null;
	q8: AQ10Score | null;
	q9: AQ10Score | null;
	q10: AQ10Score | null;
}

export interface SocialCommunication {
	eyeContact: FrequencyLevel;
	socialReciprocity: FrequencyLevel;
	conversationSkills: FrequencyLevel;
	friendshipPatterns: string;
	socialDifficultiesDetails: string;
}

export interface RepetitiveBehaviors {
	routineAdherence: FrequencyLevel;
	specialInterests: string;
	repetitiveMovements: YesNo;
	repetitiveMovementsDetails: string;
	resistanceToChange: FrequencyLevel;
}

export interface SensoryProfile {
	visualSensitivity: SensoryLevel;
	auditorySensitivity: SensoryLevel;
	tactileSensitivity: SensoryLevel;
	olfactorySensitivity: SensoryLevel;
	gustatorySensitivity: SensoryLevel;
	sensorySeekingBehaviors: string;
}

export interface DevelopmentalHistory {
	languageMilestones: string;
	motorMilestones: string;
	earlySocialBehavior: string;
	developmentalConcerns: string;
}

export interface CurrentSupport {
	currentAccommodations: string;
	currentTherapies: string[];
	educationalSupport: string;
	medications: Medication[];
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

export interface FamilyHistory {
	autismFamily: YesNo;
	autismFamilyDetails: string;
	adhdFamily: YesNo;
	adhdFamilyDetails: string;
	learningDisabilities: YesNo;
	learningDisabilitiesDetails: string;
	mentalHealthFamily: YesNo;
	mentalHealthFamilyDetails: string;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	screeningPurpose: ScreeningPurpose;
	aq10Questionnaire: AQ10Questionnaire;
	socialCommunication: SocialCommunication;
	repetitiveBehaviors: RepetitiveBehaviors;
	sensoryProfile: SensoryProfile;
	developmentalHistory: DevelopmentalHistory;
	currentSupport: CurrentSupport;
	familyHistory: FamilyHistory;
}

// ──────────────────────────────────────────────
// AQ-10 grading types
// ──────────────────────────────────────────────

export interface AQ10RuleDefinition {
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
	aq10Score: number;
	aq10Category: string;
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
