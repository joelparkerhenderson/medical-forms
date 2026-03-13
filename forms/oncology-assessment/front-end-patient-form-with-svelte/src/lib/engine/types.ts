// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Sex = 'male' | 'female' | 'other' | '';

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	sex: Sex;
	weight: number | null;
	height: number | null;
	bmi: number | null;
	ecogPerformanceStatus: '0' | '1' | '2' | '3' | '4' | '';
}

export type CancerType =
	| 'breast'
	| 'lung'
	| 'colorectal'
	| 'prostate'
	| 'melanoma'
	| 'lymphoma'
	| 'leukaemia'
	| 'pancreatic'
	| 'ovarian'
	| 'bladder'
	| 'renal'
	| 'hepatocellular'
	| 'gastric'
	| 'oesophageal'
	| 'head-and-neck'
	| 'brain'
	| 'sarcoma'
	| 'thyroid'
	| 'cervical'
	| 'endometrial'
	| 'other'
	| '';

export interface CancerDiagnosis {
	cancerType: CancerType;
	cancerTypeOther: string;
	primarySite: string;
	histology: string;
	stageT: '0' | '1' | '2' | '3' | '4' | 'X' | '';
	stageN: '0' | '1' | '2' | '3' | 'X' | '';
	stageM: '0' | '1' | 'X' | '';
	overallStage: 'I' | 'II' | 'III' | 'IV' | '';
	grade: '1' | '2' | '3' | '4' | 'X' | '';
	dateOfDiagnosis: string;
}

export interface TreatmentHistory {
	previousSurgery: YesNo;
	surgeryDetails: string;
	previousChemotherapy: YesNo;
	chemotherapyRegimens: string;
	previousRadiation: YesNo;
	radiationDetails: string;
	previousImmunotherapy: YesNo;
	immunotherapyDetails: string;
	previousTargetedTherapy: YesNo;
	targetedTherapyDetails: string;
	clinicalTrialParticipation: YesNo;
	clinicalTrialDetails: string;
}

export type ResponseAssessment =
	| 'complete-response'
	| 'partial-response'
	| 'stable-disease'
	| 'progressive-disease'
	| 'not-yet-assessed'
	| '';

export interface CurrentTreatment {
	activeRegimen: string;
	cycleNumber: number | null;
	lastTreatmentDate: string;
	responseAssessment: ResponseAssessment;
}

export interface SymptomAssessment {
	painNRS: number | null;
	fatigue: 'none' | 'mild' | 'moderate' | 'severe' | '';
	nausea: 'none' | 'mild' | 'moderate' | 'severe' | '';
	appetite: 'normal' | 'decreased' | 'severely-decreased' | '';
	weightChange: 'stable' | 'gaining' | 'losing-less-5' | 'losing-5-10' | 'losing-more-10' | '';
	esasScore: number | null;
}

export type CTCAEGrade = '0' | '1' | '2' | '3' | '4' | '';

export interface SideEffects {
	neuropathy: CTCAEGrade;
	neuropathyDetails: string;
	mucositis: CTCAEGrade;
	skinReactions: CTCAEGrade;
	skinReactionDetails: string;
	myelosuppression: YesNo;
	neutropenia: YesNo;
	thrombocytopenia: YesNo;
	anaemia: YesNo;
	organToxicityGrade: CTCAEGrade;
	organToxicityDetails: string;
}

export interface LaboratoryResults {
	wbc: number | null;
	haemoglobin: number | null;
	platelets: number | null;
	neutrophils: number | null;
	creatinine: number | null;
	alt: number | null;
	ast: number | null;
	bilirubin: number | null;
	albumin: number | null;
	calcium: number | null;
	ldh: number | null;
	tumourMarker: string;
	tumourMarkerValue: string;
	inr: number | null;
}

export interface Medication {
	name: string;
	dose: string;
	frequency: string;
}

export interface CurrentMedications {
	chemotherapyAgents: Medication[];
	antiemetics: Medication[];
	painMedications: Medication[];
	growthFactors: Medication[];
	supportiveCare: Medication[];
}

export interface Psychosocial {
	distressThermometer: number | null;
	anxiety: 'none' | 'mild' | 'moderate' | 'severe' | '';
	depression: 'none' | 'mild' | 'moderate' | 'severe' | '';
	copingAbility: 'coping-well' | 'some-difficulty' | 'significant-difficulty' | '';
	supportSystem: 'strong' | 'moderate' | 'limited' | 'none' | '';
	advanceCarePlanning: YesNo;
	advanceCareDetails: string;
}

export interface FunctionalNutritional {
	ecogDetailed: '0' | '1' | '2' | '3' | '4' | '';
	karnofskyScore: number | null;
	nutritionalStatus: 'well-nourished' | 'at-risk' | 'malnourished' | '';
	weightTrajectory: 'stable' | 'increasing' | 'decreasing-slowly' | 'decreasing-rapidly' | '';
	dietaryIntake: 'normal' | 'reduced-mildly' | 'reduced-significantly' | 'minimal' | '';
	nutritionalSupportRequired: YesNo;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	cancerDiagnosis: CancerDiagnosis;
	treatmentHistory: TreatmentHistory;
	currentTreatment: CurrentTreatment;
	symptomAssessment: SymptomAssessment;
	sideEffects: SideEffects;
	laboratoryResults: LaboratoryResults;
	currentMedications: CurrentMedications;
	psychosocial: Psychosocial;
	functionalNutritional: FunctionalNutritional;
}

// ──────────────────────────────────────────────
// ECOG grading types
// ──────────────────────────────────────────────

export type ECOGGrade = 0 | 1 | 2 | 3 | 4;

export interface ECOGRule {
	id: string;
	system: string;
	description: string;
	grade: ECOGGrade;
	evaluate: (data: AssessmentData) => boolean;
}

export interface FiredRule {
	id: string;
	system: string;
	description: string;
	grade: ECOGGrade;
}

export interface AdditionalFlag {
	id: string;
	category: string;
	message: string;
	priority: 'high' | 'medium' | 'low';
}

export interface GradingResult {
	ecogGrade: ECOGGrade;
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
