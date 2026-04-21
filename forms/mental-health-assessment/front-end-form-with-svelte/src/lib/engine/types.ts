// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Sex = 'male' | 'female' | 'other' | '';
export type AllergySeverity = 'mild' | 'moderate' | 'anaphylaxis' | '';

// PHQ-9 item score: 0 = Not at all, 1 = Several days, 2 = More than half the days, 3 = Nearly every day
export type PhqScore = 0 | 1 | 2 | 3 | null;

// GAD-7 item score: same scale
export type GadScore = 0 | 1 | 2 | 3 | null;

export type MoodRating = 'very-low' | 'low' | 'neutral' | 'good' | 'very-good' | '';
export type SleepQuality = 'very-poor' | 'poor' | 'fair' | 'good' | 'very-good' | '';
export type AppetiteChange = 'significant-decrease' | 'decrease' | 'no-change' | 'increase' | 'significant-increase' | '';
export type EnergyLevel = 'very-low' | 'low' | 'moderate' | 'high' | 'very-high' | '';
export type ConcentrationLevel = 'very-poor' | 'poor' | 'fair' | 'good' | 'excellent' | '';

export type SuicidalIdeation = 'none' | 'passive' | 'active-no-plan' | 'active-with-plan' | '';
export type SelfHarmHistory = 'none' | 'past' | 'current' | '';
export type HarmToOthers = 'none' | 'thoughts' | 'intent' | '';

export type AlcoholFrequency = 'never' | 'monthly-or-less' | '2-4-per-month' | '2-3-per-week' | '4-or-more-per-week' | '';
export type AlcoholQuantity = '1-2' | '3-4' | '5-6' | '7-9' | '10-or-more' | '';
export type BingeDrinking = 'never' | 'less-than-monthly' | 'monthly' | 'weekly' | 'daily-or-almost' | '';
export type DrugUseFrequency = 'never' | 'past' | 'occasional' | 'regular' | '';
export type TobaccoUse = 'never' | 'former' | 'current' | '';

export type EmploymentStatus = 'employed-full-time' | 'employed-part-time' | 'unemployed' | 'retired' | 'disabled' | 'student' | '';
export type RelationshipStatus = 'single' | 'married' | 'partnered' | 'divorced' | 'widowed' | 'separated' | '';
export type HousingStatus = 'stable' | 'unstable' | 'homeless' | '';
export type SupportLevel = 'strong' | 'moderate' | 'limited' | 'none' | '';
export type FunctionalImpairment = 'none' | 'mild' | 'moderate' | 'severe' | '';

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	sex: Sex;
	emergencyContactName: string;
	emergencyContactPhone: string;
	emergencyContactRelationship: string;
}

export interface PhqResponses {
	interest: PhqScore;
	depression: PhqScore;
	sleep: PhqScore;
	energy: PhqScore;
	appetite: PhqScore;
	selfEsteem: PhqScore;
	concentration: PhqScore;
	psychomotor: PhqScore;
	suicidalThoughts: PhqScore;
}

export interface GadResponses {
	nervousness: GadScore;
	uncontrollableWorry: GadScore;
	excessiveWorry: GadScore;
	troubleRelaxing: GadScore;
	restlessness: GadScore;
	irritability: GadScore;
	fearfulness: GadScore;
}

export interface MoodAffect {
	currentMood: MoodRating;
	sleepQuality: SleepQuality;
	appetiteChanges: AppetiteChange;
	energyLevel: EnergyLevel;
	concentration: ConcentrationLevel;
}

export interface RiskAssessment {
	suicidalIdeation: SuicidalIdeation;
	suicidalIdeationDetails: string;
	selfHarm: SelfHarmHistory;
	selfHarmDetails: string;
	harmToOthers: HarmToOthers;
	harmToOthersDetails: string;
	hasSafetyPlan: YesNo;
	safetyPlanDetails: string;
}

export interface SubstanceUse {
	alcoholFrequency: AlcoholFrequency;
	alcoholQuantity: AlcoholQuantity;
	bingeDrinking: BingeDrinking;
	drugUse: DrugUseFrequency;
	drugDetails: string;
	tobaccoUse: TobaccoUse;
	tobaccoDetails: string;
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
	psychiatricMedications: Medication[];
	otherMedications: Medication[];
}

export interface TreatmentHistory {
	previousTherapy: YesNo;
	therapyDetails: string;
	previousHospitalizations: YesNo;
	hospitalizationDetails: string;
	currentProviders: string;
}

export interface SocialFunctional {
	employmentStatus: EmploymentStatus;
	relationshipStatus: RelationshipStatus;
	housingStatus: HousingStatus;
	supportSystem: SupportLevel;
	functionalImpairment: FunctionalImpairment;
	additionalNotes: string;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	phqResponses: PhqResponses;
	gadResponses: GadResponses;
	moodAffect: MoodAffect;
	riskAssessment: RiskAssessment;
	substanceUse: SubstanceUse;
	currentMedications: CurrentMedications;
	treatmentHistory: TreatmentHistory;
	socialFunctional: SocialFunctional;
}

// ──────────────────────────────────────────────
// Grading result types
// ──────────────────────────────────────────────

export type SeverityLevel = 'minimal' | 'mild' | 'moderate' | 'moderately-severe' | 'severe';

export interface ScoreResult {
	instrument: string;
	score: number;
	maxScore: number;
	severity: SeverityLevel;
	label: string;
}

export interface AdditionalFlag {
	id: string;
	category: string;
	message: string;
	priority: 'high' | 'medium' | 'low';
}

export interface GradingResult {
	phq9: ScoreResult;
	gad7: ScoreResult;
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
