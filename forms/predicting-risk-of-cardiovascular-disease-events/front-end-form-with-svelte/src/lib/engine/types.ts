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
	sex: string;
	ethnicity: string;
	heightCm: number | null;
	weightKg: number | null;
	zipCode: string;
}

export interface BloodPressure {
	systolicBp: number | null;
	diastolicBp: number | null;
	onAntihypertensive: string;
	numberOfBpMedications: number | null;
	bpAtTarget: string;
}

export interface CholesterolLipids {
	totalCholesterol: number | null;
	hdlCholesterol: number | null;
	ldlCholesterol: number | null;
	triglycerides: number | null;
	nonHdlCholesterol: number | null;
	onStatin: string;
	statinName: string;
}

export interface MetabolicHealth {
	hasDiabetes: string;
	diabetesType: string;
	hba1cValue: number | null;
	hba1cUnit: string;
	fastingGlucose: number | null;
	bmi: number | null;
	waistCircumferenceCm: number | null;
}

export interface RenalFunction {
	egfr: number | null;
	creatinine: number | null;
	urineAcr: number | null;
	ckdStage: string;
}

export interface SmokingHistory {
	smokingStatus: string;
	cigarettesPerDay: number | null;
	yearsSmoked: number | null;
	yearsSinceQuit: number | null;
}

export interface MedicalHistory {
	hasKnownCvd: string;
	previousMi: string;
	previousStroke: string;
	heartFailure: string;
	atrialFibrillation: string;
	peripheralArterialDisease: string;
	familyCvdHistory: string;
	familyCvdDetails: string;
}

export interface CurrentMedications {
	onAntihypertensiveDetail: string;
	onStatinDetail: string;
	onAspirin: string;
	onAnticoagulant: string;
	onDiabetesMedication: string;
	otherMedications: string;
}

export interface ReviewCalculate {
	modelType: string;
	clinicianName: string;
	reviewDate: string;
	clinicalNotes: string;
}

export interface AssessmentData {
	patientInformation: PatientInformation;
	demographics: Demographics;
	bloodPressure: BloodPressure;
	cholesterolLipids: CholesterolLipids;
	metabolicHealth: MetabolicHealth;
	renalFunction: RenalFunction;
	smokingHistory: SmokingHistory;
	medicalHistory: MedicalHistory;
	currentMedications: CurrentMedications;
	reviewCalculate: ReviewCalculate;
}

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
	priority: string;
}

export interface GradingResult {
	riskCategory: string;
	tenYearRiskPercent: number;
	thirtyYearRiskPercent: number;
	firedRules: FiredRule[];
	additionalFlags: AdditionalFlag[];
	timestamp: string;
}

export interface StepConfig {
	number: number;
	title: string;
	key: string;
}
