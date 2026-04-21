// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Severity = 'mild' | 'moderate' | 'severe' | '';
export type Sex = 'male' | 'female' | 'other' | '';

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	sex: Sex;
	weight: number | null;
	height: number | null;
}

export interface ChiefComplaint {
	primarySymptom: string;
	onsetDate: string;
	onsetType: 'sudden' | 'gradual' | '';
	duration: string;
	progression: 'improving' | 'stable' | 'worsening' | '';
	associatedSymptoms: string;
	precipitatingEvent: string;
}

export type NIHSSConsciousness = 0 | 1 | 2 | 3 | null;
export type NIHSSGaze = 0 | 1 | 2 | null;
export type NIHSSVisual = 0 | 1 | 2 | 3 | null;
export type NIHSSFacialPalsy = 0 | 1 | 2 | 3 | null;
export type NIHSSMotor = 0 | 1 | 2 | 3 | 4 | null;
export type NIHSSAtaxia = 0 | 1 | 2 | null;
export type NIHSSSensory = 0 | 1 | 2 | null;
export type NIHSSLanguage = 0 | 1 | 2 | 3 | null;
export type NIHSSDysarthria = 0 | 1 | 2 | null;
export type NIHSSExtinction = 0 | 1 | 2 | null;

export interface NIHSSAssessment {
	consciousness: NIHSSConsciousness;
	consciousnessQuestions: NIHSSConsciousness;
	consciousnessCommands: NIHSSConsciousness;
	gaze: NIHSSGaze;
	visual: NIHSSVisual;
	facialPalsy: NIHSSFacialPalsy;
	motorLeftArm: NIHSSMotor;
	motorRightArm: NIHSSMotor;
	motorLeftLeg: NIHSSMotor;
	motorRightLeg: NIHSSMotor;
	limbAtaxia: NIHSSAtaxia;
	sensory: NIHSSSensory;
	language: NIHSSLanguage;
	dysarthria: NIHSSDysarthria;
	extinctionInattention: NIHSSExtinction;
}

export type HeadacheType = 'tension' | 'migraine' | 'cluster' | 'thunderclap' | 'other' | '';
export type HeadacheFrequency = 'daily' | 'weekly' | 'monthly' | 'occasional' | '';

export interface HeadacheAssessment {
	headachePresent: YesNo;
	headacheType: HeadacheType;
	frequency: HeadacheFrequency;
	severity: number | null;
	aura: YesNo;
	auraDescription: string;
	triggers: string;
	redFlagSuddenOnset: YesNo;
	redFlagWorstEver: YesNo;
	redFlagFever: YesNo;
	redFlagNeckStiffness: YesNo;
	redFlagNeurologicalDeficit: YesNo;
}

export type SeizureType = 'focal' | 'generalised-tonic-clonic' | 'absence' | 'myoclonic' | 'other' | '';

export interface SeizureHistory {
	seizureHistory: YesNo;
	seizureType: SeizureType;
	frequency: string;
	lastSeizureDate: string;
	triggers: string;
	aura: YesNo;
	auraDescription: string;
	postIctalState: string;
	statusEpilepticus: YesNo;
}

export type StrengthGrade = '0' | '1' | '2' | '3' | '4' | '5' | '';
export type ReflexGrade = '0' | '1' | '2' | '3' | '4' | '';
export type ToneStatus = 'normal' | 'increased' | 'decreased' | 'rigid' | '';
export type SensationType = 'normal' | 'decreased' | 'absent' | 'paraesthesia' | '';
export type GaitStatus = 'normal' | 'ataxic' | 'spastic' | 'steppage' | 'antalgic' | 'unable' | '';

export interface MotorSensoryExam {
	strengthUpperLeft: StrengthGrade;
	strengthUpperRight: StrengthGrade;
	strengthLowerLeft: StrengthGrade;
	strengthLowerRight: StrengthGrade;
	tone: ToneStatus;
	reflexes: ReflexGrade;
	plantarResponseLeft: 'flexor' | 'extensor' | '';
	plantarResponseRight: 'flexor' | 'extensor' | '';
	sensation: SensationType;
	sensationDetails: string;
	coordination: YesNo;
	coordinationDetails: string;
	gait: GaitStatus;
}

export type OrientationStatus = 'fully-oriented' | 'partially-oriented' | 'disoriented' | '';

export interface CognitiveAssessment {
	orientation: OrientationStatus;
	attentionNormal: YesNo;
	memoryShortTerm: YesNo;
	memoryLongTerm: YesNo;
	languageNormal: YesNo;
	languageDetails: string;
	visuospatialNormal: YesNo;
	executiveFunctionNormal: YesNo;
	mmseScore: number | null;
}

export interface Medication {
	name: string;
	dose: string;
	frequency: string;
}

export interface CurrentMedications {
	medications: Medication[];
	anticonvulsants: YesNo;
	anticonvulsantDetails: string;
	migraineProphylaxis: YesNo;
	migraineProphylaxisDetails: string;
	neuropathicPainMeds: YesNo;
	neuropathicPainDetails: string;
	anticoagulants: YesNo;
	anticoagulantDetails: string;
}

export type MRIFinding = 'normal' | 'infarct' | 'haemorrhage' | 'mass' | 'demyelination' | 'atrophy' | 'other' | '';
export type EEGFinding = 'normal' | 'epileptiform' | 'slow-wave' | 'focal-abnormality' | 'other' | '';

export interface DiagnosticResults {
	mriCtPerformed: YesNo;
	mriCtFinding: MRIFinding;
	mriCtDetails: string;
	eegPerformed: YesNo;
	eegFinding: EEGFinding;
	eegDetails: string;
	emgNcsPerformed: YesNo;
	emgNcsDetails: string;
	lumbarPuncturePerformed: YesNo;
	lumbarPunctureDetails: string;
}

export type MRSScore = 0 | 1 | 2 | 3 | 4 | 5 | null;
export type DrivingStatus = 'driving' | 'not-driving-medical' | 'not-driving-other' | 'not-applicable' | '';
export type EmploymentStatus = 'employed' | 'unemployed' | 'retired' | 'disability' | 'student' | '';

export interface FunctionalSocial {
	mrsScore: MRSScore;
	drivingStatus: DrivingStatus;
	drivingRestrictionDetails: string;
	employmentStatus: EmploymentStatus;
	employmentImpact: string;
	supportNeeds: string;
	livingSituation: 'independent' | 'with-family' | 'assisted-living' | 'nursing-home' | '';
	carePlanRequired: YesNo;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	chiefComplaint: ChiefComplaint;
	nihssAssessment: NIHSSAssessment;
	headacheAssessment: HeadacheAssessment;
	seizureHistory: SeizureHistory;
	motorSensoryExam: MotorSensoryExam;
	cognitiveAssessment: CognitiveAssessment;
	currentMedications: CurrentMedications;
	diagnosticResults: DiagnosticResults;
	functionalSocial: FunctionalSocial;
}

// ──────────────────────────────────────────────
// NIHSS grading types
// ──────────────────────────────────────────────

export interface NIHSSRule {
	id: string;
	category: string;
	description: string;
	field: keyof NIHSSAssessment;
	evaluate: (data: AssessmentData) => number;
}

export interface FiredRule {
	id: string;
	category: string;
	description: string;
	score: number;
}

export interface AdditionalFlag {
	id: string;
	category: string;
	message: string;
	priority: 'high' | 'medium' | 'low';
}

export interface GradingResult {
	nihssScore: number;
	nihssSeverity: string;
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
