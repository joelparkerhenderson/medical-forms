// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Severity = 'mild' | 'moderate' | 'severe' | '';
export type Sex = 'male' | 'female' | 'other' | '';
export type LivingSituation = 'independent' | 'with-family' | 'assisted-living' | 'nursing-home' | 'other' | '';
export type ADLIndependence = 'independent' | 'needs-assistance' | 'dependent' | '';
export type CognitiveStatus = 'normal' | 'mild-impairment' | 'moderate-impairment' | 'severe-impairment' | '';
export type GaitStatus = 'normal' | 'unsteady' | 'unable' | '';
export type BalanceStatus = 'normal' | 'impaired' | 'severely-impaired' | '';
export type AppetiteStatus = 'normal' | 'reduced' | 'poor' | '';
export type DentalStatus = 'good' | 'fair' | 'poor' | 'edentulous' | '';
export type MedicationAdherence = 'good' | 'fair' | 'poor' | '';
export type DepressionScreenResult = 'normal' | 'mild' | 'moderate' | 'severe' | '';
export type SocialIsolationLevel = 'none' | 'mild' | 'moderate' | 'severe' | '';
export type IncontinenceType = 'none' | 'stress' | 'urge' | 'mixed' | 'functional' | '';
export type IncontinenceFrequency = 'none' | 'occasional' | 'frequent' | 'continuous' | '';
export type SkinIntegrity = 'intact' | 'impaired' | 'wound-present' | '';

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	sex: Sex;
	weight: number | null;
	height: number | null;
	bmi: number | null;
	livingSituation: LivingSituation;
}

export interface FunctionalAssessment {
	bathingADL: ADLIndependence;
	dressingADL: ADLIndependence;
	toiletingADL: ADLIndependence;
	transferringADL: ADLIndependence;
	feedingADL: ADLIndependence;
	cookingIADL: ADLIndependence;
	cleaningIADL: ADLIndependence;
	shoppingIADL: ADLIndependence;
	financesIADL: ADLIndependence;
	medicationManagementIADL: ADLIndependence;
}

export interface CognitiveScreen {
	mmseScore: number | null;
	mocaScore: number | null;
	orientationIntact: YesNo;
	memoryImpairment: YesNo;
	executiveFunctionImpairment: YesNo;
	deliriumRisk: YesNo;
	cognitiveStatus: CognitiveStatus;
}

export interface MobilityFalls {
	gaitAssessment: GaitStatus;
	balanceAssessment: BalanceStatus;
	fallHistory: YesNo;
	fallsLastYear: number | null;
	fearOfFalling: YesNo;
	mobilityAids: YesNo;
	mobilityAidType: string;
	timedUpAndGo: number | null;
}

export interface Nutrition {
	weightChangeLastSixMonths: YesNo;
	weightChangeKg: number | null;
	weightChangeDirection: 'gain' | 'loss' | '';
	appetite: AppetiteStatus;
	swallowingDifficulties: YesNo;
	dentalStatus: DentalStatus;
	mnaScore: number | null;
}

export interface PolypharmacyReview {
	numberOfMedications: number | null;
	highRiskMedications: YesNo;
	highRiskMedicationDetails: string;
	beersCriteriaFlags: YesNo;
	beersCriteriaDetails: string;
	medicationAdherence: MedicationAdherence;
}

export interface Medication {
	name: string;
	dose: string;
	frequency: string;
}

export interface Comorbidities {
	cardiovascularDisease: YesNo;
	cardiovascularDetails: string;
	diabetes: YesNo;
	diabetesControl: 'well-controlled' | 'poorly-controlled' | '';
	renalDisease: YesNo;
	renalDetails: string;
	respiratoryDisease: YesNo;
	respiratoryDetails: string;
	musculoskeletalDisease: YesNo;
	musculoskeletalDetails: string;
	visualDeficit: YesNo;
	hearingDeficit: YesNo;
}

export interface Psychosocial {
	depressionScreen: DepressionScreenResult;
	gds15Score: number | null;
	socialIsolation: SocialIsolationLevel;
	hasCaregiver: YesNo;
	caregiverDetails: string;
	advanceDirectives: YesNo;
	advanceDirectiveDetails: string;
}

export interface ContinenceSkin {
	urinaryIncontinence: IncontinenceType;
	urinaryIncontinenceFrequency: IncontinenceFrequency;
	faecalIncontinence: YesNo;
	faecalIncontinenceFrequency: IncontinenceFrequency;
	bradenScale: number | null;
	pressureInjuryPresent: YesNo;
	pressureInjuryStage: '1' | '2' | '3' | '4' | '';
	skinIntegrity: SkinIntegrity;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	functionalAssessment: FunctionalAssessment;
	cognitiveScreen: CognitiveScreen;
	mobilityFalls: MobilityFalls;
	nutrition: Nutrition;
	polypharmacyReview: PolypharmacyReview;
	medications: Medication[];
	comorbidities: Comorbidities;
	psychosocial: Psychosocial;
	continenceSkin: ContinenceSkin;
}

// ──────────────────────────────────────────────
// CFS grading types
// ──────────────────────────────────────────────

export type CFSScore = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface CFSRule {
	id: string;
	domain: string;
	description: string;
	score: CFSScore;
	evaluate: (data: AssessmentData) => boolean;
}

export interface FiredRule {
	id: string;
	domain: string;
	description: string;
	score: CFSScore;
}

export interface AdditionalFlag {
	id: string;
	category: string;
	message: string;
	priority: 'high' | 'medium' | 'low';
}

export interface GradingResult {
	cfsScore: CFSScore;
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
	section: keyof AssessmentData | 'medications';
	isConditional?: boolean;
	shouldShow?: (data: AssessmentData) => boolean;
}
