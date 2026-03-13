// ──────────────────────────────────────────────
// Core types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Sex = 'male' | 'female' | 'other' | '';
export type AllergySeverity = 'mild' | 'moderate' | 'anaphylaxis' | '';

// ──────────────────────────────────────────────
// Step 1: Patient Demographics
// ──────────────────────────────────────────────

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	sex: Sex;
	nhsNumber: string;
	address: string;
	postcode: string;
	phone: string;
	email: string;
	ethnicity: string;
	preferredLanguage: string;
	interpreterRequired: YesNo;
}

// ──────────────────────────────────────────────
// Step 2: Next of Kin & GP
// ──────────────────────────────────────────────

export interface NextOfKin {
	name: string;
	relationship: string;
	phone: string;
	notified: YesNo;
}

export interface GP {
	name: string;
	practiceName: string;
	practiceAddress: string;
	practicePhone: string;
}

export interface NextOfKinGP {
	nextOfKin: NextOfKin;
	gp: GP;
}

// ──────────────────────────────────────────────
// Step 3: Arrival & Triage
// ──────────────────────────────────────────────

export type AttendanceCategory = 'first' | 'follow-up' | 'planned' | 'unplanned' | '';
export type ArrivalMode = 'ambulance' | 'walk-in' | 'helicopter' | 'police' | 'other' | '';
export type ReferralSource = 'self' | 'gp' | '999' | 'nhs111' | 'other-hospital' | 'police' | 'other' | '';
export type MTSCategory = '1-immediate' | '2-very-urgent' | '3-urgent' | '4-standard' | '5-non-urgent' | '';

export interface ArrivalTriage {
	attendanceDate: string;
	arrivalTime: string;
	attendanceCategory: AttendanceCategory;
	arrivalMode: ArrivalMode;
	referralSource: ReferralSource;
	ambulanceIncidentNumber: string;
	triageTime: string;
	triageNurse: string;
	mtsFlowchart: string;
	mtsCategory: MTSCategory;
	mtsDiscriminator: string;
}

// ──────────────────────────────────────────────
// Step 4: Presenting Complaint
// ──────────────────────────────────────────────

export interface PresentingComplaint {
	chiefComplaint: string;
	historyOfPresentingComplaint: string;
	onset: string;
	duration: string;
	character: string;
	severity: string;
	location: string;
	radiation: string;
	aggravatingFactors: string;
	relievingFactors: string;
	associatedSymptoms: string;
	previousEpisodes: string;
	treatmentPriorToArrival: string;
}

// ──────────────────────────────────────────────
// Step 5: Pain Assessment
// ──────────────────────────────────────────────

export type PainSeverityCategory = 'mild' | 'moderate' | 'severe' | '';

export interface PainAssessment {
	painPresent: YesNo;
	painScore: number | null;
	painLocation: string;
	painCharacter: string;
	painOnset: string;
	painSeverityCategory: PainSeverityCategory;
}

// ──────────────────────────────────────────────
// Step 6: Medical History
// ──────────────────────────────────────────────

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

export type TetanusStatus = 'up-to-date' | 'not-up-to-date' | 'unknown' | '';
export type SmokingStatus = 'current' | 'ex' | 'never' | '';

export interface MedicalHistory {
	pastMedicalHistory: string;
	pastSurgicalHistory: string;
	medications: Medication[];
	allergies: Allergy[];
	tetanusStatus: TetanusStatus;
	smokingStatus: SmokingStatus;
	alcoholConsumption: string;
	recreationalDrugUse: string;
	lastOralIntake: string;
}

// ──────────────────────────────────────────────
// Step 7: Vital Signs
// ──────────────────────────────────────────────

export type ConsciousnessLevel = 'alert' | 'verbal' | 'pain' | 'unresponsive' | '';

export interface VitalSigns {
	heartRate: number | null;
	systolicBP: number | null;
	diastolicBP: number | null;
	respiratoryRate: number | null;
	oxygenSaturation: number | null;
	supplementalOxygen: YesNo;
	oxygenFlowRate: number | null;
	temperature: number | null;
	bloodGlucose: number | null;
	consciousnessLevel: ConsciousnessLevel;
	pupilLeftSize: number | null;
	pupilLeftReactive: YesNo;
	pupilRightSize: number | null;
	pupilRightReactive: YesNo;
	capillaryRefillTime: number | null;
	weight: number | null;
}

// ──────────────────────────────────────────────
// Step 8: Primary Survey (ABCDE)
// ──────────────────────────────────────────────

export type AirwayStatus = 'patent' | 'compromised' | 'obstructed' | '';
export type BreathingEffort = 'normal' | 'laboured' | 'shallow' | 'absent' | '';

export interface Airway {
	status: AirwayStatus;
	adjuncts: string;
	cSpineImmobilised: YesNo;
}

export interface Breathing {
	effort: BreathingEffort;
	chestMovement: string;
	breathSounds: string;
	tracheaPosition: string;
}

export interface Circulation {
	pulseCharacter: string;
	skinColour: string;
	skinTemperature: string;
	capillaryRefill: string;
	haemorrhage: string;
	ivAccess: string;
}

export interface Disability {
	gcsEye: number | null;
	gcsVerbal: number | null;
	gcsMotor: number | null;
	gcsTotal: number | null;
	pupils: string;
	bloodGlucose: string;
	limbMovements: string;
}

export interface Exposure {
	skinExamination: string;
	injuriesIdentified: string;
	logRollFindings: string;
}

export interface PrimarySurvey {
	airway: Airway;
	breathing: Breathing;
	circulation: Circulation;
	disability: Disability;
	exposure: Exposure;
}

// ──────────────────────────────────────────────
// Step 9: Clinical Examination
// ──────────────────────────────────────────────

export interface ClinicalExamination {
	generalAppearance: string;
	headAndFace: string;
	neck: string;
	chestCardiovascular: string;
	chestRespiratory: string;
	abdomen: string;
	pelvis: string;
	musculoskeletalLimbs: string;
	neurological: string;
	skin: string;
	mentalState: string;
	bodyDiagramNotes: string;
}

// ──────────────────────────────────────────────
// Step 10: Investigations
// ──────────────────────────────────────────────

export interface ImagingStudy {
	type: string;
	site: string;
	findings: string;
}

export interface Investigations {
	bloodTests: string[];
	urinalysis: string;
	pregnancyTest: string;
	imaging: ImagingStudy[];
	ecgPerformed: YesNo;
	ecgFindings: string;
	otherInvestigations: string;
}

// ──────────────────────────────────────────────
// Step 11: Treatment & Interventions
// ──────────────────────────────────────────────

export interface MedicationAdministered {
	drug: string;
	dose: string;
	route: string;
	time: string;
	givenBy: string;
}

export interface FluidTherapy {
	type: string;
	volume: string;
	rate: string;
	timeStarted: string;
}

export interface Procedure {
	description: string;
	time: string;
}

export type TetanusProphylaxis = 'given' | 'not-indicated' | 'status-checked' | '';

export interface Treatment {
	medicationsAdministered: MedicationAdministered[];
	fluidTherapy: FluidTherapy[];
	procedures: Procedure[];
	oxygenTherapyDevice: string;
	oxygenTherapyFlowRate: string;
	tetanusProphylaxis: TetanusProphylaxis;
}

// ──────────────────────────────────────────────
// Step 12: Assessment & Plan
// ──────────────────────────────────────────────

export interface AssessmentPlan {
	workingDiagnosis: string;
	differentialDiagnoses: string;
	clinicalImpression: string;
	riskStratification: string;
}

// ──────────────────────────────────────────────
// Step 13: Disposition
// ──────────────────────────────────────────────

export type DispositionType = 'admitted' | 'discharged' | 'transferred' | 'left-before-seen' | 'self-discharged' | '';

export interface Disposition {
	disposition: DispositionType;
	admittingSpecialty: string;
	admittingConsultant: string;
	ward: string;
	levelOfCare: string;
	dischargeDiagnosis: string;
	dischargeMedications: string;
	dischargeInstructions: string;
	followUp: string;
	returnPrecautions: string;
	receivingHospital: string;
	reasonForTransfer: string;
	modeOfTransfer: string;
	dischargeTime: string;
	totalTimeInDepartment: string;
}

// ──────────────────────────────────────────────
// Step 14: Safeguarding & Consent
// ──────────────────────────────────────────────

export type ConsentType = 'verbal' | 'written' | 'lacks-capacity' | '';

export interface SafeguardingConsent {
	safeguardingConcern: YesNo;
	safeguardingType: string;
	referralMade: YesNo;
	mentalCapacityAssessment: string;
	mentalHealthActStatus: string;
	consentForTreatment: ConsentType;
	completedByName: string;
	completedByRole: string;
	completedByGmcNumber: string;
	seniorReviewingClinician: string;
}

// ──────────────────────────────────────────────
// Full Casualty Card Data Model
// ──────────────────────────────────────────────

export interface CasualtyCardData {
	demographics: Demographics;
	nextOfKinGP: NextOfKinGP;
	arrivalTriage: ArrivalTriage;
	presentingComplaint: PresentingComplaint;
	painAssessment: PainAssessment;
	medicalHistory: MedicalHistory;
	vitalSigns: VitalSigns;
	primarySurvey: PrimarySurvey;
	clinicalExamination: ClinicalExamination;
	investigations: Investigations;
	treatment: Treatment;
	assessmentPlan: AssessmentPlan;
	disposition: Disposition;
	safeguardingConsent: SafeguardingConsent;
}

// ──────────────────────────────────────────────
// NEWS2 Scoring Types
// ──────────────────────────────────────────────

export type NEWS2ClinicalResponse = 'low' | 'low-medium' | 'medium' | 'high';

export interface NEWS2ParameterScore {
	parameter: string;
	value: string;
	score: number;
}

export interface NEWS2Result {
	totalScore: number;
	parameterScores: NEWS2ParameterScore[];
	clinicalResponse: NEWS2ClinicalResponse;
	hasAnySingleScore3: boolean;
}

// ──────────────────────────────────────────────
// Flagged Issues
// ──────────────────────────────────────────────

export interface FlaggedIssue {
	id: string;
	category: string;
	message: string;
	priority: 'high' | 'medium' | 'low';
}

// ──────────────────────────────────────────────
// Grading Result
// ──────────────────────────────────────────────

export interface GradingResult {
	news2: NEWS2Result;
	flaggedIssues: FlaggedIssue[];
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
