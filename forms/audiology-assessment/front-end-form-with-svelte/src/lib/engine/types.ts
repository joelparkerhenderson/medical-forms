// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Severity = 'mild' | 'moderate' | 'severe' | '';
export type Sex = 'male' | 'female' | 'other' | '';
export type AffectedEar = 'left' | 'right' | 'both' | '';
export type HearingLossType = 'conductive' | 'sensorineural' | 'mixed' | '';
export type TinnitusCharacter = 'ringing' | 'buzzing' | 'hissing' | 'pulsatile' | 'clicking' | 'roaring' | 'other' | '';
export type OnsetType = 'sudden' | 'gradual' | '';
export type Progression = 'stable' | 'worsening' | 'fluctuating' | 'improving' | '';

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	sex: Sex;
}

export interface ChiefComplaint {
	primaryConcern: string;
	affectedEar: AffectedEar;
	onset: OnsetType;
	duration: string;
	progression: Progression;
}

export interface HearingHistory {
	noiseExposure: YesNo;
	occupationalNoise: YesNo;
	occupationalNoiseDetails: string;
	recreationalNoise: YesNo;
	recreationalNoiseDetails: string;
	previousHearingTests: YesNo;
	previousTestDetails: string;
	hearingAidUse: YesNo;
	hearingAidDetails: string;
}

export interface AudiometricResults {
	pureToneAverageRight: number | null;
	pureToneAverageLeft: number | null;
	airConductionRight: string;
	airConductionLeft: string;
	boneConductionRight: string;
	boneConductionLeft: string;
	airBoneGapRight: number | null;
	airBoneGapLeft: number | null;
	speechRecognitionThresholdRight: number | null;
	speechRecognitionThresholdLeft: number | null;
	wordRecognitionScoreRight: number | null;
	wordRecognitionScoreLeft: number | null;
	hearingLossType: HearingLossType;
}

export interface TinnitusAssessment {
	presence: YesNo;
	affectedEar: AffectedEar;
	character: TinnitusCharacter;
	severity: Severity;
	duration: string;
	impactOnDailyLife: Severity;
	tinnitusHandicapInventoryScore: number | null;
}

export interface VestibularSymptoms {
	vertigo: YesNo;
	vertigoDetails: string;
	dizziness: YesNo;
	balanceProblems: YesNo;
	dixHallpike: YesNo;
	nystagmus: YesNo;
	fallsHistory: YesNo;
	fallsFrequency: string;
}

export interface OtoscopicFindings {
	earCanalRight: string;
	earCanalLeft: string;
	tympanicMembraneRight: string;
	tympanicMembraneLeft: string;
	middleEarRight: string;
	middleEarLeft: string;
	earWaxRight: YesNo;
	earWaxLeft: YesNo;
	dischargeRight: YesNo;
	dischargeLeft: YesNo;
	previousSurgery: YesNo;
	previousSurgeryDetails: string;
}

export interface MedicalHistory {
	ototoxicMedications: YesNo;
	ototoxicMedicationDetails: string;
	autoimmune: YesNo;
	autoimmuneDetails: string;
	menieres: YesNo;
	otosclerosis: YesNo;
	acousticNeuroma: YesNo;
	infections: YesNo;
	infectionDetails: string;
}

export interface FunctionalCommunication {
	communicationDifficulties: YesNo;
	communicationDetails: string;
	hearingAidCandidacy: YesNo;
	assistiveDeviceNeeds: YesNo;
	assistiveDeviceDetails: string;
	workImpact: Severity;
	socialImpact: Severity;
	hhieScore: number | null;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	chiefComplaint: ChiefComplaint;
	hearingHistory: HearingHistory;
	audiometricResults: AudiometricResults;
	tinnitusAssessment: TinnitusAssessment;
	vestibularSymptoms: VestibularSymptoms;
	otoscopicFindings: OtoscopicFindings;
	medicalHistory: MedicalHistory;
	functionalCommunication: FunctionalCommunication;
}

// ──────────────────────────────────────────────
// Hearing grading types (WHO Classification)
// ──────────────────────────────────────────────

export type HearingGrade = 'normal' | 'mild' | 'moderate' | 'severe' | 'profound';

export interface HearingRule {
	id: string;
	system: string;
	description: string;
	grade: HearingGrade;
	evaluate: (data: AssessmentData) => boolean;
}

export interface FiredRule {
	id: string;
	system: string;
	description: string;
	grade: HearingGrade;
}

export interface AdditionalFlag {
	id: string;
	category: string;
	message: string;
	priority: 'high' | 'medium' | 'low';
}

export interface GradingResult {
	hearingGrade: HearingGrade;
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
	isConditional?: boolean;
	shouldShow?: (data: AssessmentData) => boolean;
}
