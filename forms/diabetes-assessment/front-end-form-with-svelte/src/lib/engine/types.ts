// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type ControlLevel = 'wellControlled' | 'suboptimal' | 'poor' | 'veryPoor' | 'draft';

// ─── Patient Information (Step 1) ───────────────────────────

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

// ─── Diabetes History (Step 2) ──────────────────────────────

export interface DiabetesHistory {
	diabetesType: string;
	ageAtDiagnosis: number | null;
	yearsDuration: number | null;
	diagnosisMethod: string;
	familyHistory: YesNo;
	autoantibodiesTested: string;
}

// ─── Glycaemic Control (Step 3) ─────────────────────────────

export interface GlycaemicControl {
	hba1cValue: number | null;
	hba1cUnit: string;
	hba1cTarget: number | null;
	fastingGlucose: number | null;
	postprandialGlucose: number | null;
	glucoseMonitoringType: string;
	hypoglycaemiaFrequency: string;
	severeHypoglycaemia: YesNo;
	timeInRange: number | null;
}

// ─── Medications (Step 4) ───────────────────────────────────

export interface Medications {
	metformin: YesNo;
	sulfonylurea: string;
	sglt2Inhibitor: string;
	glp1Agonist: string;
	dpp4Inhibitor: string;
	insulin: YesNo;
	insulinRegimen: string;
	insulinDailyDose: number | null;
	medicationAdherence: number | null;
	otherMedications: string;
}

// ─── Complications Screening (Step 5) ───────────────────────

export interface ComplicationsScreening {
	retinopathyStatus: string;
	lastEyeScreening: string;
	nephropathyStatus: string;
	egfr: number | null;
	urineAcr: number | null;
	neuropathySymptoms: YesNo;
	autonomicNeuropathy: string;
	erectileDysfunction: string;
}

// ─── Cardiovascular Risk (Step 6) ───────────────────────────

export interface CardiovascularRisk {
	systolicBp: number | null;
	diastolicBp: number | null;
	onAntihypertensive: string;
	totalCholesterol: number | null;
	ldlCholesterol: number | null;
	onStatin: string;
	smokingStatus: string;
	previousCvdEvent: YesNo;
	qriskScore: number | null;
}

// ─── Self-Care & Lifestyle (Step 7) ─────────────────────────

export interface SelfCareLifestyle {
	dietAdherence: number | null;
	carbCounting: YesNo;
	physicalActivity: string;
	bmi: number | null;
	weightChange: string;
	alcoholConsumption: string;
	smokingCessation: string;
}

// ─── Psychological Wellbeing (Step 8) ───────────────────────

export interface PsychologicalWellbeing {
	diabetesDistress: number | null;
	depressionScreening: number | null;
	anxietyScreening: number | null;
	eatingDisorder: YesNo;
	fearOfHypoglycaemia: number | null;
	copingAbility: number | null;
	needsSupport: YesNo;
}

// ─── Foot Assessment (Step 9) ───────────────────────────────

export interface FootAssessment {
	footPulses: string;
	monofilamentTest: string;
	vibrationSense: string;
	footDeformity: YesNo;
	callusPresent: YesNo;
	ulcerPresent: YesNo;
	previousAmputation: YesNo;
	footRiskCategory: string;
}

// ─── Review & Care Plan (Step 10) ───────────────────────────

export interface ReviewCarePlan {
	clinicianName: string;
	reviewDate: string;
	hba1cTargetAgreed: number | null;
	carePlanUpdated: YesNo;
	clinicalNotes: string;
	referrals: string;
	nextReviewDate: string;
}

// ─── Assessment Data (all sections) ─────────────────────────

export interface AssessmentData {
	patientInformation: PatientInformation;
	diabetesHistory: DiabetesHistory;
	glycaemicControl: GlycaemicControl;
	medications: Medications;
	complicationsScreening: ComplicationsScreening;
	cardiovascularRisk: CardiovascularRisk;
	selfCareLifestyle: SelfCareLifestyle;
	psychologicalWellbeing: PsychologicalWellbeing;
	footAssessment: FootAssessment;
	reviewCarePlan: ReviewCarePlan;
}

// ─── Grading types ──────────────────────────────────────────

export interface FiredRule {
	id: string;
	category: string;
	description: string;
	concernLevel: string;
}

export interface AdditionalFlag {
	id: string;
	category: string;
	message: string;
	priority: 'high' | 'medium' | 'low';
}

export interface GradingResult {
	controlLevel: ControlLevel;
	controlScore: number;
	firedRules: FiredRule[];
	additionalFlags: AdditionalFlag[];
	timestamp: string;
}

// ─── Step configuration ─────────────────────────────────────

export interface StepConfig {
	number: number;
	title: string;
	shortTitle: string;
	section: keyof AssessmentData;
}
