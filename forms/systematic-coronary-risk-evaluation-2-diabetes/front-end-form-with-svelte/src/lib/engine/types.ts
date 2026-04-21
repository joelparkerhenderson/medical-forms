export type RiskCategory = 'draft' | 'low' | 'moderate' | 'high' | 'veryHigh';

// Step 1: Patient Demographics
export interface PatientDemographics {
	fullName: string;
	dateOfBirth: string;
	sex: string; // "male" | "female"
	nhsNumber: string;
	heightCm: number | null;
	weightKg: number | null;
	ethnicity: string;
}

// Step 2: Diabetes History
export interface DiabetesHistory {
	diabetesType: string; // "type1" | "type2" | "gestational" | "other"
	ageAtDiagnosis: number | null;
	diabetesDurationYears: number | null;
	hba1cValue: number | null; // mmol/mol
	hba1cUnit: string; // "mmolMol" | "percent"
	fastingGlucose: number | null; // mmol/L
	diabetesTreatment: string; // "diet" | "oral" | "insulin" | "combined"
	insulinDurationYears: number | null;
}

// Step 3: Cardiovascular History
export interface CardiovascularHistory {
	previousMi: string; // "yes" | "no"
	previousStroke: string; // "yes" | "no"
	previousTia: string; // "yes" | "no"
	peripheralArterialDisease: string; // "yes" | "no"
	heartFailure: string; // "yes" | "no"
	atrialFibrillation: string; // "yes" | "no"
	familyCvdHistory: string; // "yes" | "no"
	familyCvdDetails: string;
	currentChestPain: string; // "yes" | "no"
	currentDyspnoea: string; // "yes" | "no"
}

// Step 4: Blood Pressure
export interface BloodPressure {
	systolicBp: number | null; // mmHg
	diastolicBp: number | null; // mmHg
	onAntihypertensive: string; // "yes" | "no"
	numberOfBpMedications: number | null;
	bpAtTarget: string; // "yes" | "no" | ""
	homeBpMonitoring: string; // "yes" | "no"
}

// Step 5: Lipid Profile
export interface LipidProfile {
	totalCholesterol: number | null; // mmol/L
	hdlCholesterol: number | null; // mmol/L
	ldlCholesterol: number | null; // mmol/L
	triglycerides: number | null; // mmol/L
	nonHdlCholesterol: number | null; // mmol/L
	onStatin: string; // "yes" | "no"
	statinName: string;
	onOtherLipidTherapy: string; // "yes" | "no"
}

// Step 6: Renal Function
export interface RenalFunction {
	egfr: number | null; // mL/min/1.73m2
	creatinine: number | null; // umol/L
	urineAcr: number | null; // mg/mmol
	proteinuria: string; // "none" | "microalbuminuria" | "macroalbuminuria"
	ckdStage: string; // "G1" | "G2" | "G3a" | "G3b" | "G4" | "G5" | ""
}

// Step 7: Lifestyle Factors
export interface LifestyleFactors {
	smokingStatus: string; // "never" | "former" | "current"
	cigarettesPerDay: number | null;
	yearsSinceQuit: number | null;
	alcoholUnitsPerWeek: number | null;
	physicalActivity: string; // "sedentary" | "lightlyActive" | "moderatelyActive" | "veryActive"
	dietQuality: string; // "poor" | "fair" | "good" | "excellent"
	bmi: number | null;
	waistCircumferenceCm: number | null;
}

// Step 8: Current Medications
export interface CurrentMedications {
	metformin: string; // "yes" | "no"
	sglt2Inhibitor: string; // "yes" | "no"
	glp1Agonist: string; // "yes" | "no"
	sulfonylurea: string; // "yes" | "no"
	dpp4Inhibitor: string; // "yes" | "no"
	insulin: string; // "yes" | "no"
	aceInhibitorOrArb: string; // "yes" | "no"
	antiplatelet: string; // "yes" | "no"
	anticoagulant: string; // "yes" | "no"
	otherMedications: string;
}

// Step 9: Complications Screening
export interface ComplicationsScreening {
	retinopathyStatus: string; // "none" | "background" | "preProliferative" | "proliferative" | "maculopathy" | "notScreened"
	lastEyeScreeningDate: string;
	neuropathySymptoms: string; // "yes" | "no"
	monofilamentTest: string; // "normal" | "abnormal" | "notDone"
	footPulses: string; // "normal" | "absent" | "notChecked"
	footUlcerHistory: string; // "yes" | "no"
	ankleBrachialIndex: number | null;
	erectileDysfunction: string; // "yes" | "no" | "notApplicable"
}

// Step 10: Risk Assessment Summary
export interface RiskAssessmentSummary {
	riskRegion: string; // "low" | "moderate" | "high" | "veryHigh"
	additionalRiskFactors: string;
	clinicalNotes: string;
	agreedTreatmentTargets: string;
	followUpInterval: string; // "3months" | "6months" | "12months" | ""
}

// Complete assessment data
export interface AssessmentData {
	patientDemographics: PatientDemographics;
	diabetesHistory: DiabetesHistory;
	cardiovascularHistory: CardiovascularHistory;
	bloodPressure: BloodPressure;
	lipidProfile: LipidProfile;
	renalFunction: RenalFunction;
	lifestyleFactors: LifestyleFactors;
	currentMedications: CurrentMedications;
	complicationsScreening: ComplicationsScreening;
	riskAssessmentSummary: RiskAssessmentSummary;
}

// Grading types
export interface FiredRule {
	id: string;
	category: string;
	description: string;
	riskLevel: string; // "high" | "medium" | "low"
}

export interface AdditionalFlag {
	id: string;
	category: string;
	message: string;
	priority: string; // "high" | "medium" | "low"
}

export interface GradingResult {
	riskCategory: RiskCategory;
	firedRules: FiredRule[];
	additionalFlags: AdditionalFlag[];
	timestamp: string;
}

// Factory function
export function createDefaultAssessmentData(): AssessmentData {
	return {
		patientDemographics: {
			fullName: '',
			dateOfBirth: '',
			sex: '',
			nhsNumber: '',
			heightCm: null,
			weightKg: null,
			ethnicity: ''
		},
		diabetesHistory: {
			diabetesType: '',
			ageAtDiagnosis: null,
			diabetesDurationYears: null,
			hba1cValue: null,
			hba1cUnit: '',
			fastingGlucose: null,
			diabetesTreatment: '',
			insulinDurationYears: null
		},
		cardiovascularHistory: {
			previousMi: '',
			previousStroke: '',
			previousTia: '',
			peripheralArterialDisease: '',
			heartFailure: '',
			atrialFibrillation: '',
			familyCvdHistory: '',
			familyCvdDetails: '',
			currentChestPain: '',
			currentDyspnoea: ''
		},
		bloodPressure: {
			systolicBp: null,
			diastolicBp: null,
			onAntihypertensive: '',
			numberOfBpMedications: null,
			bpAtTarget: '',
			homeBpMonitoring: ''
		},
		lipidProfile: {
			totalCholesterol: null,
			hdlCholesterol: null,
			ldlCholesterol: null,
			triglycerides: null,
			nonHdlCholesterol: null,
			onStatin: '',
			statinName: '',
			onOtherLipidTherapy: ''
		},
		renalFunction: {
			egfr: null,
			creatinine: null,
			urineAcr: null,
			proteinuria: '',
			ckdStage: ''
		},
		lifestyleFactors: {
			smokingStatus: '',
			cigarettesPerDay: null,
			yearsSinceQuit: null,
			alcoholUnitsPerWeek: null,
			physicalActivity: '',
			dietQuality: '',
			bmi: null,
			waistCircumferenceCm: null
		},
		currentMedications: {
			metformin: '',
			sglt2Inhibitor: '',
			glp1Agonist: '',
			sulfonylurea: '',
			dpp4Inhibitor: '',
			insulin: '',
			aceInhibitorOrArb: '',
			antiplatelet: '',
			anticoagulant: '',
			otherMedications: ''
		},
		complicationsScreening: {
			retinopathyStatus: '',
			lastEyeScreeningDate: '',
			neuropathySymptoms: '',
			monofilamentTest: '',
			footPulses: '',
			footUlcerHistory: '',
			ankleBrachialIndex: null,
			erectileDysfunction: ''
		},
		riskAssessmentSummary: {
			riskRegion: '',
			additionalRiskFactors: '',
			clinicalNotes: '',
			agreedTreatmentTargets: '',
			followUpInterval: ''
		}
	};
}
