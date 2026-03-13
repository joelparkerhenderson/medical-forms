// ──────────────────────────────────────────────
// Core assessment data types
// Mirrors Rust engine types.rs with camelCase
// ──────────────────────────────────────────────

export interface PatientInformation {
	fullName: string;
	dateOfBirth: string;
	nhsNumber: string;
	address: string;
	telephone: string;
	email: string;
	gpName: string;
	gpPractice: string;
}

export interface Demographics {
	age: number | null;
	sex: string; // 'male' | 'female' | ''
	ethnicity: string;
	heightCm: number | null;
	weightKg: number | null;
}

export interface SmokingHistory {
	smokingStatus: string; // 'current' | 'former' | 'never' | ''
	cigarettesPerDay: number | null;
	yearsSmoked: number | null;
	yearsSinceQuit: number | null;
}

export interface BloodPressure {
	systolicBp: number | null;
	diastolicBp: number | null;
	onBpTreatment: string; // 'yes' | 'no' | ''
	bpMedicationName: string;
	bpMeasurementMethod: string;
}

export interface Cholesterol {
	totalCholesterol: number | null; // mg/dL
	hdlCholesterol: number | null; // mg/dL
	ldlCholesterol: number | null; // mg/dL
	triglycerides: number | null;
	cholesterolUnit: string; // 'mgDl' | 'mmolL'
	fastingSample: string; // 'yes' | 'no' | ''
}

export interface MedicalHistory {
	hasDiabetes: string; // 'yes' | 'no' | ''
	hasPriorChd: string;
	hasPeripheralVascularDisease: string;
	hasCerebrovascularDisease: string;
	hasHeartFailure: string;
	hasAtrialFibrillation: string;
	otherConditions: string;
}

export interface FamilyHistory {
	familyChdHistory: string; // 'yes' | 'no' | ''
	familyChdAgeOnset: string; // 'under55' | '55to65' | 'over65' | ''
	familyChdRelationship: string;
	familyStrokeHistory: string;
	familyDiabetesHistory: string;
}

export interface LifestyleFactors {
	physicalActivity: string; // 'sedentary' | 'light' | 'moderate' | 'vigorous' | ''
	alcoholConsumption: string; // 'none' | 'moderate' | 'heavy' | ''
	dietQuality: string; // 'poor' | 'average' | 'good' | 'excellent' | ''
	bmi: number | null;
	waistCircumferenceCm: number | null;
	stressLevel: string; // 'low' | 'moderate' | 'high' | ''
}

export interface CurrentMedications {
	onStatin: string; // 'yes' | 'no' | ''
	statinName: string;
	onAspirin: string;
	onAntihypertensive: string;
	antihypertensiveName: string;
	otherMedications: string;
}

export interface ReviewCalculate {
	clinicianName: string;
	reviewDate: string;
	clinicalNotes: string;
	patientConsent: string; // 'yes' | 'no' | ''
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	patientInformation: PatientInformation;
	demographics: Demographics;
	smokingHistory: SmokingHistory;
	bloodPressure: BloodPressure;
	cholesterol: Cholesterol;
	medicalHistory: MedicalHistory;
	familyHistory: FamilyHistory;
	lifestyleFactors: LifestyleFactors;
	currentMedications: CurrentMedications;
	reviewCalculate: ReviewCalculate;
}

// ──────────────────────────────────────────────
// Grading result types
// ──────────────────────────────────────────────

export type RiskLevel = 'draft' | 'low' | 'intermediate' | 'high';

export interface FiredRule {
	id: string;
	category: string;
	description: string;
	riskLevel: string;
}

export interface AdditionalFlag {
	id: string;
	category: string;
	message: string;
	priority: 'high' | 'medium' | 'low';
}

export interface GradingResult {
	riskCategory: string;
	tenYearRiskPercent: number;
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
