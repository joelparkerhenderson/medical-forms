// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Severity = 'mild' | 'moderate' | 'severe' | '';
export type Sex = 'male' | 'female' | 'other' | '';
export type LegalStatus = 'voluntary' | 'involuntary' | '';
export type MoodState = 'euthymic' | 'depressed' | 'elevated' | 'irritable' | 'anxious' | 'flat' | '';
export type AffectType = 'congruent' | 'incongruent' | 'restricted' | 'blunted' | 'flat' | 'labile' | '';
export type ThoughtProcess = 'linear' | 'circumstantial' | 'tangential' | 'loosening' | 'flight-of-ideas' | 'thought-blocking' | '';
export type InsightLevel = 'full' | 'partial' | 'none' | '';
export type JudgementLevel = 'intact' | 'impaired' | 'poor' | '';
export type RiskLevel = 'none' | 'low' | 'moderate' | 'high' | 'imminent' | '';
export type SubstanceFrequency = 'none' | 'occasional' | 'regular' | 'daily' | 'dependent' | '';
export type HousingStatus = 'stable' | 'temporary' | 'homeless' | 'supported' | 'institution' | '';
export type EmploymentStatus = 'employed' | 'unemployed' | 'retired' | 'student' | 'disability' | '';
export type CapacityDecision = 'has-capacity' | 'lacks-capacity' | 'fluctuating' | 'not-assessed' | '';

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	sex: Sex;
	emergencyContactName: string;
	emergencyContactPhone: string;
	legalStatus: LegalStatus;
}

export interface PresentingComplaint {
	chiefComplaint: string;
	onsetDate: string;
	duration: string;
	severity: Severity;
	precipitatingFactors: string;
}

export interface PsychiatricHistory {
	previousDiagnoses: string;
	previousHospitalizations: YesNo;
	hospitalizationDetails: string;
	previousSuicideAttempts: YesNo;
	suicideAttemptDetails: string;
	selfHarmHistory: YesNo;
	selfHarmDetails: string;
}

export interface MentalStatusExam {
	appearance: string;
	behaviour: string;
	speech: string;
	mood: MoodState;
	affect: AffectType;
	thoughtProcess: ThoughtProcess;
	thoughtContent: string;
	perceptualDisturbances: YesNo;
	perceptualDetails: string;
	cognitionIntact: YesNo;
	cognitionDetails: string;
	insight: InsightLevel;
	judgement: JudgementLevel;
}

export interface RiskAssessment {
	suicidalIdeation: YesNo;
	suicidalPlan: YesNo;
	suicidalIntent: YesNo;
	suicidalMeans: YesNo;
	protectiveFactors: string;
	selfHarmCurrent: YesNo;
	violenceRisk: RiskLevel;
	safeguardingConcerns: YesNo;
	safeguardingDetails: string;
}

export interface MoodAndAnxiety {
	phq9Score: number | null;
	gad7Score: number | null;
	maniaScreen: YesNo;
	maniaDetails: string;
	psychoticSymptoms: YesNo;
	psychoticDetails: string;
}

export interface SubstanceUse {
	alcoholAuditScore: number | null;
	alcoholFrequency: SubstanceFrequency;
	drugUse: YesNo;
	drugDetails: string;
	tobaccoUse: YesNo;
	tobaccoDetails: string;
	gamblingProblem: YesNo;
	withdrawalRisk: YesNo;
	withdrawalDetails: string;
}

export interface Medication {
	name: string;
	dose: string;
	frequency: string;
}

export interface CurrentMedications {
	medications: Medication[];
	sideEffects: string;
	compliance: YesNo;
	complianceDetails: string;
}

export interface MedicalHistory {
	neurologicalConditions: YesNo;
	neurologicalDetails: string;
	endocrineConditions: YesNo;
	endocrineDetails: string;
	chronicPain: YesNo;
	chronicPainDetails: string;
	pregnancy: YesNo;
	pregnancyDetails: string;
}

export interface SocialHistory {
	housing: HousingStatus;
	housingDetails: string;
	employment: EmploymentStatus;
	employmentDetails: string;
	relationships: string;
	legalIssues: YesNo;
	legalDetails: string;
	financialDifficulties: YesNo;
	supportNetwork: string;
}

export interface CapacityAndConsent {
	decisionMakingCapacity: CapacityDecision;
	capacityDetails: string;
	advanceDirectives: YesNo;
	advanceDirectiveDetails: string;
	powerOfAttorney: YesNo;
	powerOfAttorneyDetails: string;
	treatmentPreferences: string;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	presentingComplaint: PresentingComplaint;
	psychiatricHistory: PsychiatricHistory;
	mentalStatusExam: MentalStatusExam;
	riskAssessment: RiskAssessment;
	moodAndAnxiety: MoodAndAnxiety;
	substanceUse: SubstanceUse;
	currentMedications: CurrentMedications;
	medicalHistory: MedicalHistory;
	socialHistory: SocialHistory;
	capacityAndConsent: CapacityAndConsent;
}

// ──────────────────────────────────────────────
// GAF grading types
// ──────────────────────────────────────────────

export type GAFScore = number; // 1-100

export interface GAFRule {
	id: string;
	domain: string;
	description: string;
	scoreImpact: number;
	evaluate: (data: AssessmentData) => boolean;
}

export interface FiredRule {
	id: string;
	domain: string;
	description: string;
	scoreImpact: number;
}

export interface AdditionalFlag {
	id: string;
	category: string;
	message: string;
	priority: 'high' | 'medium' | 'low';
}

export interface GradingResult {
	gafScore: GAFScore;
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
