// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Sex = 'female' | '';
export type AllergySeverity = 'mild' | 'moderate' | 'anaphylaxis' | '';
export type ConceptionMethod = 'natural' | 'ivf' | 'iui' | 'icsi' | 'donor-egg' | 'donor-embryo' | 'other' | '';
export type PlacentaLocation = 'anterior' | 'posterior' | 'fundal' | 'lateral' | 'previa' | 'low-lying' | '';
export type RhFactor = 'positive' | 'negative' | '';
export type BloodType = 'A' | 'B' | 'AB' | 'O' | '';
export type AnxietyLevel = 'none' | 'mild' | 'moderate' | 'severe' | '';
export type ExerciseLevel = 'none' | 'light' | 'moderate' | 'vigorous' | '';
export type DietQuality = 'poor' | 'fair' | 'good' | 'excellent' | '';
export type RiskLevel = 'low' | 'moderate' | 'high' | 'very-high';

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	sex: Sex;
}

export interface PregnancyDetails {
	gestationalWeeks: number | null;
	estimatedDueDate: string;
	conceptionMethod: ConceptionMethod;
	multipleGestation: YesNo;
	placentaLocation: PlacentaLocation;
}

export interface PreviousComplications {
	preeclampsia: YesNo;
	gestationalDiabetes: YesNo;
	pretermBirth: YesNo;
	cesareanSection: YesNo;
}

export interface ObstetricHistory {
	gravida: number | null;
	para: number | null;
	abortions: number | null;
	livingChildren: number | null;
	previousComplications: PreviousComplications;
}

export interface MedicalHistory {
	chronicConditions: string;
	autoimmune: YesNo;
	thyroid: YesNo;
	diabetes: YesNo;
	hypertension: YesNo;
}

export interface CurrentSymptoms {
	nausea: YesNo;
	bleeding: YesNo;
	headache: YesNo;
	visionChanges: YesNo;
	edema: YesNo;
	abdominalPain: YesNo;
	reducedFetalMovement: YesNo;
}

export interface VitalSigns {
	bloodPressureSystolic: number | null;
	bloodPressureDiastolic: number | null;
	weight: number | null;
	height: number | null;
	bmi: number | null;
	fundalHeight: number | null;
	fetalHeartRate: number | null;
}

export interface LaboratoryResults {
	bloodType: BloodType;
	rhFactor: RhFactor;
	hemoglobin: number | null;
	glucose: number | null;
	urinalysis: string;
	gbs: YesNo;
}

export interface LifestyleNutrition {
	smoking: YesNo;
	alcohol: YesNo;
	drugs: YesNo;
	exercise: ExerciseLevel;
	diet: DietQuality;
	supplements: string;
	folicAcid: YesNo;
}

export interface MentalHealthScreening {
	edinburghScore: number | null;
	anxietyLevel: AnxietyLevel;
	supportSystem: YesNo;
	domesticViolenceScreen: YesNo;
}

export interface BirthPlanPreferences {
	deliveryPreference: string;
	painManagement: string;
	feedingPlan: string;
	specialRequests: string;
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

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	pregnancyDetails: PregnancyDetails;
	obstetricHistory: ObstetricHistory;
	medicalHistory: MedicalHistory;
	currentSymptoms: CurrentSymptoms;
	vitalSigns: VitalSigns;
	laboratoryResults: LaboratoryResults;
	lifestyleNutrition: LifestyleNutrition;
	mentalHealthScreening: MentalHealthScreening;
	birthPlanPreferences: BirthPlanPreferences;
}

// ──────────────────────────────────────────────
// Risk grading types
// ──────────────────────────────────────────────

export interface RiskRuleDefinition {
	id: string;
	category: string;
	description: string;
	weight: number;
}

export interface FiredRule {
	id: string;
	category: string;
	description: string;
	weight: number;
}

export interface AdditionalFlag {
	id: string;
	category: string;
	message: string;
	priority: 'high' | 'medium' | 'low';
}

export interface GradingResult {
	riskScore: number;
	riskLevel: RiskLevel;
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
