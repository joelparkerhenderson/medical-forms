// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Sex = 'male' | 'female' | 'other' | '';
export type HHIESScore = 0 | 2 | 4;
export type OnsetType = 'sudden' | 'gradual' | '';
export type AffectedEar = 'left' | 'right' | 'both' | '';
export type HearingLossType = 'sensorineural' | 'conductive' | 'mixed' | 'unknown' | '';
export type DifficultyLevel = 'none' | 'slight' | 'moderate' | 'severe' | '';
export type SatisfactionLevel = 'very-satisfied' | 'satisfied' | 'neutral' | 'dissatisfied' | 'very-dissatisfied' | '';
export type TechnologyComfort = 'very-comfortable' | 'comfortable' | 'somewhat-comfortable' | 'uncomfortable' | '';
export type DexterityLevel = 'good' | 'fair' | 'poor' | '';
export type VisionStatus = 'good' | 'fair' | 'poor' | '';
export type WillingnessLevel = 'very-willing' | 'willing' | 'uncertain' | 'reluctant' | '';
export type ConcernLevel = 'none' | 'mild' | 'moderate' | 'significant' | '';

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	sex: Sex;
}

export interface HearingHistory {
	onsetType: OnsetType;
	duration: string;
	affectedEar: AffectedEar;
	familyHistory: YesNo;
	noiseExposure: YesNo;
	tinnitus: YesNo;
	vertigo: YesNo;
	earSurgery: YesNo;
	ototoxicMedications: YesNo;
}

export interface HHIESQuestion {
	id: string;
	text: string;
	domain: string;
	score: HHIESScore | null;
}

export interface HHIESQuestionnaire {
	q1: HHIESScore | null;
	q2: HHIESScore | null;
	q3: HHIESScore | null;
	q4: HHIESScore | null;
	q5: HHIESScore | null;
	q6: HHIESScore | null;
	q7: HHIESScore | null;
	q8: HHIESScore | null;
	q9: HHIESScore | null;
	q10: HHIESScore | null;
}

export interface CommunicationDifficulties {
	quietConversation: DifficultyLevel;
	groupConversation: DifficultyLevel;
	telephone: DifficultyLevel;
	television: DifficultyLevel;
	publicPlaces: DifficultyLevel;
	workDifficulty: DifficultyLevel;
}

export interface CurrentHearingAids {
	hasHearingAids: YesNo;
	leftAidType: string;
	rightAidType: string;
	aidAge: string;
	satisfaction: SatisfactionLevel;
	dailyUseHours: number | null;
	difficulties: string;
}

export interface EarExamination {
	leftExternalEar: string;
	rightExternalEar: string;
	leftTympanicMembrane: string;
	rightTympanicMembrane: string;
	cerumenLeft: YesNo;
	cerumenRight: YesNo;
	abnormalities: string;
}

export interface AudiogramResults {
	leftPTA: number | null;
	rightPTA: number | null;
	leftSRT: number | null;
	rightSRT: number | null;
	leftWordRecognition: number | null;
	rightWordRecognition: number | null;
	hearingLossType: HearingLossType;
}

export interface LifestyleNeeds {
	socialActivity: string;
	occupationRequirements: string;
	hobbies: string;
	technologyComfort: TechnologyComfort;
	dexterity: DexterityLevel;
	visionStatus: VisionStatus;
}

export interface ExpectationsGoals {
	primaryGoal: string;
	realisticExpectations: YesNo;
	willingnessToWear: WillingnessLevel;
	budgetConcerns: ConcernLevel;
	cosmeticConcerns: ConcernLevel;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	hearingHistory: HearingHistory;
	hhiesQuestionnaire: HHIESQuestionnaire;
	communicationDifficulties: CommunicationDifficulties;
	currentHearingAids: CurrentHearingAids;
	earExamination: EarExamination;
	audiogramResults: AudiogramResults;
	lifestyleNeeds: LifestyleNeeds;
	expectationsGoals: ExpectationsGoals;
}

// ──────────────────────────────────────────────
// HHIE-S grading types
// ──────────────────────────────────────────────

export interface HHIESRuleDefinition {
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
	hhiesScore: number;
	hhiesCategory: string;
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
