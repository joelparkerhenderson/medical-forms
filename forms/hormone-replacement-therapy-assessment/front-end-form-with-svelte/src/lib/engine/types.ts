// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Sex = 'male' | 'female' | 'other' | '';
export type MenopauseStatus = 'pre' | 'peri' | 'post' | '';
export type MRSItemScore = 0 | 1 | 2 | 3 | 4;
export type HRTRoute = 'oral' | 'transdermal' | 'vaginal' | '';
export type HRTRiskClassification = 'Favourable' | 'Acceptable' | 'Cautious' | 'Contraindicated';

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	sex: Sex;
	weight: number | null;
	height: number | null;
	bmi: number | null;
}

export interface MenopauseStatusData {
	menopausalStatus: MenopauseStatus;
	lastMenstrualPeriod: string;
	ageAtMenopause: number | null;
	surgicalMenopause: YesNo;
	surgicalMenopauseDetails: string;
	prematureOvarianInsufficiency: YesNo;
}

export interface MRSSymptomScale {
	hotFlushes: MRSItemScore | null;
	heartDiscomfort: MRSItemScore | null;
	sleepProblems: MRSItemScore | null;
	jointPain: MRSItemScore | null;
	depressiveMood: MRSItemScore | null;
	irritability: MRSItemScore | null;
	anxiety: MRSItemScore | null;
	fatigue: MRSItemScore | null;
	sexualProblems: MRSItemScore | null;
	bladderProblems: MRSItemScore | null;
	vaginalDryness: MRSItemScore | null;
}

export interface VasomotorSymptoms {
	hotFlushFrequency: 'none' | 'occasional' | 'frequent' | 'very-frequent' | '';
	hotFlushSeverity: 'none' | 'mild' | 'moderate' | 'severe' | '';
	nightSweats: YesNo;
	nightSweatsFrequency: 'occasional' | 'most-nights' | 'every-night' | '';
	triggers: string;
}

export interface BoneHealth {
	dexaScan: YesNo;
	dexaResult: 'normal' | 'osteopenia' | 'osteoporosis' | '';
	dexaDate: string;
	fractureHistory: YesNo;
	fractureDetails: string;
	heightLoss: YesNo;
	heightLossCm: number | null;
	riskFactors: string;
	calciumIntake: 'adequate' | 'inadequate' | 'supplemented' | '';
	vitaminDIntake: 'adequate' | 'inadequate' | 'supplemented' | '';
}

export interface CardiovascularRisk {
	systolicBP: number | null;
	diastolicBP: number | null;
	totalCholesterol: number | null;
	hdlCholesterol: number | null;
	ldlCholesterol: number | null;
	triglycerides: number | null;
	familyHistoryCVD: YesNo;
	diabetes: YesNo;
	diabetesType: 'type1' | 'type2' | '';
	smoking: 'current' | 'ex' | 'never' | '';
	qriskScore: number | null;
}

export interface BreastHealth {
	lastMammogram: string;
	mammogramResult: 'normal' | 'abnormal' | 'not-done' | '';
	breastExamNormal: YesNo;
	familyHistoryBreastCancer: YesNo;
	familyHistoryOvarianCancer: YesNo;
	brcaStatus: 'positive' | 'negative' | 'not-tested' | '';
	brcaType: 'BRCA1' | 'BRCA2' | '';
}

export interface Medication {
	name: string;
	dose: string;
	frequency: string;
}

export interface CurrentMedications {
	currentHRT: YesNo;
	currentHRTDetails: string;
	currentHRTDuration: string;
	previousHRT: YesNo;
	previousHRTDetails: string;
	previousHRTReason: string;
	otherMedications: Medication[];
	supplements: string;
}

export interface ContraindicationsScreen {
	vteHistory: YesNo;
	vteDetails: string;
	breastCancerHistory: YesNo;
	breastCancerDetails: string;
	liverDisease: YesNo;
	liverDiseaseDetails: string;
	undiagnosedVaginalBleeding: YesNo;
	pregnancy: YesNo;
	activeCardiovascularDisease: YesNo;
	activeCardiovascularDetails: string;
}

export interface TreatmentPreferences {
	routePreference: HRTRoute;
	routePreferenceReason: string;
	concernsAboutHRT: string;
	lifestyleFactors: string;
	treatmentGoals: string;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	menopauseStatus: MenopauseStatusData;
	mrsSymptomScale: MRSSymptomScale;
	vasomotorSymptoms: VasomotorSymptoms;
	boneHealth: BoneHealth;
	cardiovascularRisk: CardiovascularRisk;
	breastHealth: BreastHealth;
	currentMedications: CurrentMedications;
	contraindicationsScreen: ContraindicationsScreen;
	treatmentPreferences: TreatmentPreferences;
}

// ──────────────────────────────────────────────
// MRS grading types
// ──────────────────────────────────────────────

export type MRSSeverity = 'No/Minimal' | 'Mild' | 'Moderate' | 'Severe';

export interface MRSSubscaleResult {
	somatic: number;
	psychological: number;
	urogenital: number;
}

export interface MRSResult {
	totalScore: number;
	severity: MRSSeverity;
	subscales: MRSSubscaleResult;
}

export interface FiredRule {
	id: string;
	system: string;
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
	mrsResult: MRSResult;
	riskClassification: HRTRiskClassification;
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
