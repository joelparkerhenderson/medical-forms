// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Severity = 'mild' | 'moderate' | 'severe' | '';
export type SmokingStatus = 'current' | 'ex' | 'never' | '';
export type DiabetesType = 'type1' | 'type2' | 'gestational' | 'none' | '';
export type DiabetesControl = 'well-controlled' | 'poorly-controlled' | '';
export type AlcoholFrequency = 'none' | 'occasional' | 'moderate' | 'heavy' | '';
export type Sex = 'male' | 'female' | 'other' | '';
export type AllergySeverity = 'mild' | 'moderate' | 'anaphylaxis' | '';

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	sex: Sex;
	weight: number | null;
	height: number | null;
	bmi: number | null;
	plannedProcedure: string;
	procedureUrgency: 'elective' | 'urgent' | 'emergency' | '';
}

export interface Cardiovascular {
	hypertension: YesNo;
	hypertensionControlled: YesNo;
	ischemicHeartDisease: YesNo;
	ihdDetails: string;
	heartFailure: YesNo;
	heartFailureNYHA: '1' | '2' | '3' | '4' | '';
	valvularDisease: YesNo;
	valvularDetails: string;
	arrhythmia: YesNo;
	arrhythmiaType: string;
	pacemaker: YesNo;
	recentMI: YesNo;
	recentMIWeeks: number | null;
}

export interface Respiratory {
	asthma: YesNo;
	asthmaFrequency: 'intermittent' | 'mild-persistent' | 'moderate-persistent' | 'severe-persistent' | '';
	copd: YesNo;
	copdSeverity: Severity;
	osa: YesNo;
	osaCPAP: YesNo;
	smoking: SmokingStatus;
	smokingPackYears: number | null;
	recentURTI: YesNo;
}

export interface Renal {
	ckd: YesNo;
	ckdStage: '1' | '2' | '3' | '4' | '5' | '';
	dialysis: YesNo;
	dialysisType: 'haemodialysis' | 'peritoneal' | '';
}

export interface Hepatic {
	liverDisease: YesNo;
	cirrhosis: YesNo;
	childPughScore: 'A' | 'B' | 'C' | '';
	hepatitis: YesNo;
	hepatitisType: string;
}

export interface Endocrine {
	diabetes: DiabetesType;
	diabetesControl: DiabetesControl;
	diabetesOnInsulin: YesNo;
	thyroidDisease: YesNo;
	thyroidType: 'hypothyroid' | 'hyperthyroid' | '';
	adrenalInsufficiency: YesNo;
}

export interface Neurological {
	strokeOrTIA: YesNo;
	strokeDetails: string;
	epilepsy: YesNo;
	epilepsyControlled: YesNo;
	neuromuscularDisease: YesNo;
	neuromuscularDetails: string;
	raisedICP: YesNo;
}

export interface Haematological {
	bleedingDisorder: YesNo;
	bleedingDetails: string;
	onAnticoagulants: YesNo;
	anticoagulantType: string;
	sickleCellDisease: YesNo;
	sickleCellTrait: YesNo;
	anaemia: YesNo;
}

export interface MusculoskeletalAirway {
	rheumatoidArthritis: YesNo;
	cervicalSpineIssues: YesNo;
	limitedNeckMovement: YesNo;
	limitedMouthOpening: YesNo;
	dentalIssues: YesNo;
	dentalDetails: string;
	previousDifficultAirway: YesNo;
	mallampatiScore: '1' | '2' | '3' | '4' | '';
}

export interface Gastrointestinal {
	gord: YesNo;
	hiatusHernia: YesNo;
	nausea: YesNo;
}

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

export interface PreviousAnaesthesia {
	previousAnaesthesia: YesNo;
	anaesthesiaProblems: YesNo;
	anaesthesiaProblemDetails: string;
	familyMHHistory: YesNo;
	familyMHDetails: string;
	ponv: YesNo;
}

export interface SocialHistory {
	alcohol: AlcoholFrequency;
	alcoholUnitsPerWeek: number | null;
	recreationalDrugs: YesNo;
	drugDetails: string;
}

export interface FunctionalCapacity {
	exerciseTolerance: 'unable' | 'light-housework' | 'climb-stairs' | 'moderate-exercise' | 'vigorous-exercise' | '';
	estimatedMETs: number | null;
	mobilityAids: YesNo;
	recentDecline: YesNo;
}

export interface Pregnancy {
	possiblyPregnant: YesNo;
	pregnancyConfirmed: YesNo;
	gestationWeeks: number | null;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	cardiovascular: Cardiovascular;
	respiratory: Respiratory;
	renal: Renal;
	hepatic: Hepatic;
	endocrine: Endocrine;
	neurological: Neurological;
	haematological: Haematological;
	musculoskeletalAirway: MusculoskeletalAirway;
	gastrointestinal: Gastrointestinal;
	medications: Medication[];
	allergies: Allergy[];
	previousAnaesthesia: PreviousAnaesthesia;
	socialHistory: SocialHistory;
	functionalCapacity: FunctionalCapacity;
	pregnancy: Pregnancy;
}

// ──────────────────────────────────────────────
// ASA grading types
// ──────────────────────────────────────────────

export type ASAGrade = 1 | 2 | 3 | 4 | 5;

export interface ASARule {
	id: string;
	system: string;
	description: string;
	grade: ASAGrade;
	evaluate: (data: AssessmentData) => boolean;
}

export interface FiredRule {
	id: string;
	system: string;
	description: string;
	grade: ASAGrade;
}

export interface AdditionalFlag {
	id: string;
	category: string;
	message: string;
	priority: 'high' | 'medium' | 'low';
}

export interface GradingResult {
	asaGrade: ASAGrade;
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
	section: keyof AssessmentData | 'medications' | 'allergies';
	isConditional?: boolean;
	shouldShow?: (data: AssessmentData) => boolean;
}
