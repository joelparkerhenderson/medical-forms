// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Sex = 'male' | 'female' | 'other' | '';
export type PrimaryIndication = 'type2-diabetes' | 'weight-management' | 'cardiovascular-risk-reduction' | '';
export type MotivationLevel = 'low' | 'moderate' | 'high' | '';
export type SelectedFormulation = 'subcutaneous-weekly' | 'oral-daily' | '';
export type EligibilityStatus = 'Eligible' | 'Conditional' | 'Ineligible';

export interface Demographics {
	firstName: string;
	lastName: string;
	dob: string;
	sex: Sex;
}

export interface IndicationGoals {
	primaryIndication: PrimaryIndication;
	weightLossGoalPercent: number | null;
	previousWeightLossAttempts: string;
	motivationLevel: MotivationLevel;
}

export interface BodyComposition {
	heightCm: number | null;
	weightKg: number | null;
	bmi: number | null;
	waistCircumference: number | null;
	bodyFatPercent: number | null;
	previousMaxWeight: number | null;
}

export interface MetabolicProfile {
	hba1c: number | null;
	fastingGlucose: number | null;
	insulinLevel: number | null;
	totalCholesterol: number | null;
	ldl: number | null;
	hdl: number | null;
	triglycerides: number | null;
	thyroidFunction: string;
}

export interface CardiovascularRisk {
	bloodPressureSystolic: number | null;
	bloodPressureDiastolic: number | null;
	heartRate: number | null;
	previousMI: YesNo;
	heartFailure: YesNo;
	peripheralVascularDisease: YesNo;
	cerebrovascularDisease: YesNo;
	qriskScore: number | null;
}

export interface ContraindicationsScreening {
	personalHistoryMTC: YesNo;
	familyHistoryMTC: YesNo;
	men2Syndrome: YesNo;
	pancreatitisHistory: YesNo;
	severeGIDisease: YesNo;
	pregnancyPlanned: YesNo;
	breastfeeding: YesNo;
	type1Diabetes: YesNo;
	diabeticRetinopathySevere: YesNo;
	allergySemaglutide: YesNo;
}

export interface GastrointestinalHistory {
	nauseaHistory: YesNo;
	vomitingHistory: YesNo;
	gastroparesis: YesNo;
	gallstoneHistory: YesNo;
	ibd: YesNo;
	gerdHistory: YesNo;
	previousBariatricSurgery: YesNo;
	currentGISymptoms: string;
}

export interface Medication {
	name: string;
	dose: string;
	frequency: string;
}

export interface CurrentMedications {
	insulinTherapy: YesNo;
	insulinType: string;
	sulfonylureas: YesNo;
	otherDiabetesMedications: Medication[];
	antihypertensives: Medication[];
	lipidLowering: Medication[];
	otherMedications: Medication[];
}

export interface MentalHealthScreening {
	eatingDisorderHistory: YesNo;
	eatingDisorderDetails: string;
	depressionHistory: YesNo;
	suicidalIdeation: YesNo;
	bodyDysmorphia: YesNo;
	bingeDrinkingHistory: YesNo;
	currentMentalHealthTreatment: string;
}

export interface TreatmentPlan {
	selectedFormulation: SelectedFormulation;
	startingDose: string;
	titrationSchedule: string;
	monitoringFrequency: string;
	dietaryGuidance: YesNo;
	exercisePlan: YesNo;
	followUpWeeks: number | null;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	indicationGoals: IndicationGoals;
	bodyComposition: BodyComposition;
	metabolicProfile: MetabolicProfile;
	cardiovascularRisk: CardiovascularRisk;
	contraindicationsScreening: ContraindicationsScreening;
	gastrointestinalHistory: GastrointestinalHistory;
	currentMedications: CurrentMedications;
	mentalHealthScreening: MentalHealthScreening;
	treatmentPlan: TreatmentPlan;
}

// ──────────────────────────────────────────────
// Eligibility grading types
// ──────────────────────────────────────────────

export interface EligibilityRuleDefinition {
	id: string;
	category: string;
	description: string;
	type: 'absolute' | 'relative';
}

export interface FiredRule {
	id: string;
	category: string;
	description: string;
	type: 'absolute' | 'relative';
}

export interface AdditionalFlag {
	id: string;
	category: string;
	message: string;
	priority: 'high' | 'medium' | 'low';
}

export interface GradingResult {
	eligibilityStatus: EligibilityStatus;
	bmi: number | null;
	bmiCategory: string;
	absoluteContraindications: FiredRule[];
	relativeContraindications: FiredRule[];
	monitoringFlags: AdditionalFlag[];
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
