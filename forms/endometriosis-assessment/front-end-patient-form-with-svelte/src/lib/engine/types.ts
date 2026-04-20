// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Sex = 'male' | 'female' | 'other' | '';
export type ImpactLevel = 'none' | 'mild' | 'moderate' | 'severe' | '';

// Revised ASRM Staging (I-IV)
export type ASRMStage = 1 | 2 | 3 | 4;
// Overall severity
export type SeverityLevel = 'mild' | 'moderate' | 'severe' | 'critical';

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	sex: Sex;
	weight: number | null;
	height: number | null;
	bmi: number | null;
}

export interface MenstrualHistory {
	ageAtMenarche: number | null;
	cycleRegularity: 'regular' | 'irregular' | 'absent' | '';
	cycleLengthDays: number | null;
	periodDurationDays: number | null;
	flowHeaviness: 'light' | 'moderate' | 'heavy' | 'very-heavy' | '';
	clotsPresent: YesNo;
	intermenstrualBleeding: YesNo;
	postcoitalBleeding: YesNo;
	dysmenorrhoeaSeverity: 'none' | 'mild' | 'moderate' | 'severe' | '';
	daysOffWorkPerCycle: number | null;
	currentContraception: 'none' | 'combined-pill' | 'progesterone-only-pill' | 'mirena-ius' | 'implant' | 'injection' | 'copper-iud' | 'condoms' | 'other' | '';
	menstrualNotes: string;
}

export interface PainAssessment {
	hasPelvicPain: YesNo;
	pelvicPainSeverity: number | null;
	pelvicPainCharacter: 'cramping' | 'stabbing' | 'burning' | 'aching' | 'dragging' | 'shooting' | 'other' | '';
	pelvicPainLocation: 'central' | 'left-sided' | 'right-sided' | 'bilateral' | 'diffuse' | 'other' | '';
	pelvicPainTiming: 'menstrual' | 'premenstrual' | 'ovulatory' | 'constant' | 'intermittent' | '';
	dyspareunia: 'none' | 'superficial' | 'deep' | 'both' | '';
	dyspareuniaSeverity: number | null;
	dyschezia: YesNo;
	dyscheziaCyclical: YesNo;
	backPain: YesNo;
	legPain: YesNo;
	painWorseWithActivity: YesNo;
	painNotes: string;
}

export interface GastrointestinalSymptoms {
	hasGiSymptoms: YesNo;
	bloating: YesNo;
	bloatingCyclical: YesNo;
	nausea: YesNo;
	constipation: YesNo;
	diarrhoea: YesNo;
	alternatingBowelHabit: YesNo;
	rectalBleeding: YesNo;
	rectalBleedingCyclical: YesNo;
	bowelObstructionSymptoms: YesNo;
	giNotes: string;
}

export interface UrinarySymptoms {
	hasUrinarySymptoms: YesNo;
	frequency: YesNo;
	urgency: YesNo;
	dysuria: YesNo;
	haematuria: YesNo;
	haematuriaCyclical: YesNo;
	flankPain: YesNo;
	urinaryObstructionSymptoms: YesNo;
	recurrentUtis: YesNo;
	urinaryNotes: string;
}

export interface FertilityAssessment {
	tryingToConceive: YesNo;
	durationTryingMonths: number | null;
	previousPregnancies: number | null;
	liveBirths: number | null;
	miscarriages: number | null;
	ectopicPregnancies: number | null;
	previousFertilityTreatment: YesNo;
	fertilityTreatmentDetails: string;
	amhLevel: number | null;
	partnerSemenAnalysis: 'normal' | 'abnormal' | 'not-done' | '';
	futureFertilityConcerns: YesNo;
	fertilityNotes: string;
}

export interface PreviousTreatments {
	nsaidsTried: YesNo;
	nsaidsEffective: 'effective' | 'partially' | 'ineffective' | '';
	paracetamolTried: YesNo;
	opioidsTried: YesNo;
	opioidsCurrent: YesNo;
	combinedPillTried: YesNo;
	combinedPillEffective: 'effective' | 'partially' | 'ineffective' | '';
	progesteroneTried: YesNo;
	progesteroneType: string;
	gnrhAgonistTried: YesNo;
	gnrhAgonistDurationMonths: number | null;
	mirenaIusTried: YesNo;
	otherTreatments: string;
	treatmentNotes: string;
}

export interface SurgicalHistory {
	previousLaparoscopy: YesNo;
	numberOfLaparoscopies: number | null;
	mostRecentLaparoscopyDate: string;
	endometriosisConfirmedSurgically: YesNo;
	histologicalConfirmation: YesNo;
	asrmStageAtSurgery: 'I' | 'II' | 'III' | 'IV' | '';
	sitesFound: string;
	excisionPerformed: YesNo;
	ablationPerformed: YesNo;
	adhesiolysisPerformed: YesNo;
	endometriomaDrained: YesNo;
	bowelSurgery: YesNo;
	bladderSurgery: YesNo;
	otherPelvicSurgery: string;
	surgicalComplications: string;
	surgicalNotes: string;
}

export interface QualityOfLife {
	painDomainScore: number | null;
	controlPowerlessnessScore: number | null;
	emotionalWellbeingScore: number | null;
	socialSupportScore: number | null;
	selfImageScore: number | null;
	workImpact: 'none' | 'mild' | 'moderate' | 'severe' | 'unable-to-work' | '';
	relationshipImpact: ImpactLevel;
	sleepImpact: ImpactLevel;
	mentalHealthImpact: ImpactLevel;
	exerciseImpact: ImpactLevel;
	qolNotes: string;
}

export interface TreatmentPlanning {
	treatmentGoals: string;
	preferredApproach: 'conservative' | 'medical' | 'surgical' | 'combined' | 'fertility-focused' | '';
	surgeryConsidered: YesNo;
	surgeryTypeConsidered: 'diagnostic-laparoscopy' | 'excision' | 'ablation' | 'hysterectomy' | 'other' | '';
	fertilityPreservationNeeded: YesNo;
	mdtReferralNeeded: YesNo;
	painManagementReferral: YesNo;
	psychologyReferral: YesNo;
	physiotherapyReferral: YesNo;
	fertilityClinicReferral: YesNo;
	imagingRequested: 'none' | 'transvaginal-us' | 'mri-pelvis' | 'both' | '';
	followUpInterval: '2-weeks' | '4-weeks' | '3-months' | '6-months' | '12-months' | '';
	planningNotes: string;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	menstrualHistory: MenstrualHistory;
	painAssessment: PainAssessment;
	gastrointestinalSymptoms: GastrointestinalSymptoms;
	urinarySymptoms: UrinarySymptoms;
	fertilityAssessment: FertilityAssessment;
	previousTreatments: PreviousTreatments;
	surgicalHistory: SurgicalHistory;
	qualityOfLife: QualityOfLife;
	treatmentPlanning: TreatmentPlanning;
}

// ──────────────────────────────────────────────
// Endometriosis grading types
// ──────────────────────────────────────────────

export interface EndoRule {
	id: string;
	category: string;
	description: string;
	grade: number;
	evaluate: (data: AssessmentData) => boolean;
}

export interface FiredRule {
	id: string;
	category: string;
	description: string;
	grade: number;
}

export interface AdditionalFlag {
	id: string;
	category: string;
	message: string;
	priority: 'high' | 'medium' | 'low';
}

export interface GradingResult {
	asrmStage: ASRMStage | null;
	asrmPoints: number;
	ehp30Score: number | null;
	overallSeverity: SeverityLevel;
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
