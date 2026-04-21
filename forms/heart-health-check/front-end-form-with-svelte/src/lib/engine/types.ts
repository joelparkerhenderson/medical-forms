// ──────────────────────────────────────────────
// Step 1: Patient Information
// ──────────────────────────────────────────────

export interface PatientInformation {
	fullName: string;
	dateOfBirth: string;
	nhsNumber: string;
	address: string;
	postcode: string;
	telephone: string;
	email: string;
	gpName: string;
	gpPractice: string;
}

// ──────────────────────────────────────────────
// Step 2: Demographics & Ethnicity
// ──────────────────────────────────────────────

export interface DemographicsEthnicity {
	age: number | null;
	sex: string;
	ethnicity: string;
	townsendDeprivation: number | null;
}

// ──────────────────────────────────────────────
// Step 3: Blood Pressure
// ──────────────────────────────────────────────

export interface BloodPressure {
	systolicBP: number | null;
	systolicBPSD: number | null;
	diastolicBP: number | null;
	onBPTreatment: string;
	numberOfBPMedications: number | null;
}

// ──────────────────────────────────────────────
// Step 4: Cholesterol
// ──────────────────────────────────────────────

export interface Cholesterol {
	totalCholesterol: number | null;
	hdlCholesterol: number | null;
	totalHDLRatio: number | null;
	onStatin: string;
}

// ──────────────────────────────────────────────
// Step 5: Medical Conditions
// ──────────────────────────────────────────────

export interface MedicalConditions {
	hasDiabetes: string;
	hasAtrialFibrillation: string;
	hasRheumatoidArthritis: string;
	hasChronicKidneyDisease: string;
	hasMigraine: string;
	hasSevereMentalIllness: string;
	hasErectileDysfunction: string;
	onAtypicalAntipsychotic: string;
	onCorticosteroids: string;
}

// ──────────────────────────────────────────────
// Step 6: Family History
// ──────────────────────────────────────────────

export interface FamilyHistory {
	familyCVDUnder60: string;
	familyCVDRelationship: string;
	familyDiabetesHistory: string;
}

// ──────────────────────────────────────────────
// Step 7: Smoking & Alcohol
// ──────────────────────────────────────────────

export interface SmokingAlcohol {
	smokingStatus: string;
	cigarettesPerDay: number | null;
	yearsSinceQuit: number | null;
	alcoholUnitsPerWeek: number | null;
	alcoholFrequency: string;
}

// ──────────────────────────────────────────────
// Step 8: Physical Activity & Diet
// ──────────────────────────────────────────────

export interface PhysicalActivityDiet {
	physicalActivityMinutesPerWeek: number | null;
	activityIntensity: string;
	fruitVegPortionsPerDay: number | null;
	dietQuality: string;
	saltIntake: string;
}

// ──────────────────────────────────────────────
// Step 9: Body Measurements
// ──────────────────────────────────────────────

export interface BodyMeasurements {
	heightCm: number | null;
	weightKg: number | null;
	bmi: number | null;
	waistCircumferenceCm: number | null;
}

// ──────────────────────────────────────────────
// Step 10: Review & Calculate
// ──────────────────────────────────────────────

export interface ReviewCalculate {
	clinicianName: string;
	reviewDate: string;
	clinicalNotes: string;
	auditScore: number | null;
}

// ──────────────────────────────────────────────
// Full Assessment Data Model
// ──────────────────────────────────────────────

export interface AssessmentData {
	patientInformation: PatientInformation;
	demographicsEthnicity: DemographicsEthnicity;
	bloodPressure: BloodPressure;
	cholesterol: Cholesterol;
	medicalConditions: MedicalConditions;
	familyHistory: FamilyHistory;
	smokingAlcohol: SmokingAlcohol;
	physicalActivityDiet: PhysicalActivityDiet;
	bodyMeasurements: BodyMeasurements;
	reviewCalculate: ReviewCalculate;
}

// ──────────────────────────────────────────────
// Risk Rules & Grading
// ──────────────────────────────────────────────

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
	heartAge: number | null;
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
	section: string;
}
