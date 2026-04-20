// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Sex = 'female' | 'male' | 'other' | '';
export type SmokingStatus = 'current' | 'ex-smoker' | 'never' | '';
export type AlcoholConsumption = 'none' | 'within-guidelines' | 'above-guidelines' | '';

// UK MEC Category (1-4)
export type MECCategory = 1 | 2 | 3 | 4;

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
	menarcheAge: number | null;
	cycleRegularity: 'regular' | 'irregular' | 'absent' | '';
	cycleLengthDays: number | null;
	periodDurationDays: number | null;
	flowHeaviness: 'light' | 'moderate' | 'heavy' | '';
	intermenstrualBleeding: YesNo;
	postcoitalBleeding: YesNo;
	dysmenorrhoea: 'none' | 'mild' | 'moderate' | 'severe' | '';
	lastMenstrualPeriod: string;
	amenorrhoea: YesNo;
	amenorrhoeaDurationMonths: number | null;
}

export interface ContraceptiveHistory {
	previousContraception: YesNo;
	previousCOC: YesNo;
	cocDetails: string;
	previousPOP: YesNo;
	popDetails: string;
	previousImplant: YesNo;
	implantDetails: string;
	previousInjection: YesNo;
	injectionDetails: string;
	previousIUD: YesNo;
	iudDetails: string;
	previousIUS: YesNo;
	iusDetails: string;
	previousPatchRing: YesNo;
	patchRingDetails: string;
	previousBarrier: YesNo;
	reasonForChange: string;
	adverseEffects: string;
}

export interface MedicalHistory {
	migraine: YesNo;
	migraineWithAura: YesNo;
	migraineFrequency: 'rare' | 'monthly' | 'weekly' | '';
	breastCancer: 'current' | 'past-5-years' | 'past-over-5-years' | 'no' | '';
	cervicalCancer: YesNo;
	liverDisease: 'active-hepatitis' | 'cirrhosis' | 'liver-tumour' | 'no' | '';
	gallbladderDisease: YesNo;
	inflammatoryBowelDisease: YesNo;
	sle: YesNo;
	sleAntiphospholipid: YesNo;
	epilepsy: YesNo;
	diabetes: 'type-1' | 'type-2' | 'gestational' | 'no' | '';
	diabetesComplications: YesNo;
	sti: YesNo;
	stiDetails: string;
	pid: YesNo;
}

export interface CardiovascularRisk {
	hypertension: YesNo;
	systolicBP: number | null;
	diastolicBP: number | null;
	bpControlled: YesNo;
	ischaemicHeartDisease: YesNo;
	strokeHistory: YesNo;
	valvularHeartDisease: YesNo;
	valvularComplications: YesNo;
	hyperlipidaemia: YesNo;
	familyHistoryVTE: YesNo;
	familyHistoryCVD: YesNo;
	familyCVDDetails: string;
}

export interface ThromboembolismRisk {
	previousDVT: YesNo;
	dvtDetails: string;
	previousPE: YesNo;
	peDetails: string;
	knownThrombophilia: YesNo;
	thrombophiliaType: 'factor-v-leiden' | 'prothrombin-mutation' | 'protein-c-deficiency' | 'protein-s-deficiency' | 'antithrombin-deficiency' | 'antiphospholipid' | 'other' | '';
	immobilityRisk: YesNo;
	immobilityDetails: string;
	recentMajorSurgery: YesNo;
	surgeryDetails: string;
	longHaulTravel: YesNo;
}

export interface CurrentMedications {
	enzymeInducingDrugs: YesNo;
	enzymeInducingDetails: string;
	anticoagulants: YesNo;
	anticoagulantDetails: string;
	antiepileptics: YesNo;
	antiepilepticDetails: string;
	antiretrovirals: YesNo;
	antiretroviralDetails: string;
	antibiotics: YesNo;
	antibioticDetails: string;
	ssriSnri: YesNo;
	ssriSnriDetails: string;
	herbalRemedies: YesNo;
	herbalDetails: string;
	otherMedications: string;
	drugAllergies: YesNo;
	drugAllergyDetails: string;
}

export interface LifestyleAssessment {
	smoking: SmokingStatus;
	cigarettesPerDay: number | null;
	ageOver35Smoker: YesNo;
	alcohol: AlcoholConsumption;
	alcoholUnitsPerWeek: number | null;
	recreationalDrugUse: YesNo;
	recreationalDrugDetails: string;
	exerciseFrequency: 'none' | 'occasional' | 'regular' | 'daily' | '';
	sexualActivity: YesNo;
	numberOfPartners: 'one' | 'multiple' | '';
}

export interface ContraceptivePreferences {
	preferredMethod: 'coc' | 'pop' | 'implant' | 'injection' | 'iud' | 'ius' | 'patch' | 'ring' | 'barrier' | 'natural' | 'unsure' | '';
	hormonalAcceptable: YesNo;
	longActingAcceptable: YesNo;
	dailyPillAcceptable: YesNo;
	intrauterineAcceptable: YesNo;
	fertilityPlans: 'within-1-year' | '1-5-years' | 'no-plans' | 'completed-family' | '';
	breastfeeding: YesNo;
	postpartumWeeks: number | null;
	concerns: string;
}

export interface ClinicalRecommendation {
	clinicalNotes: string;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	menstrualHistory: MenstrualHistory;
	contraceptiveHistory: ContraceptiveHistory;
	medicalHistory: MedicalHistory;
	cardiovascularRisk: CardiovascularRisk;
	thromboembolismRisk: ThromboembolismRisk;
	currentMedications: CurrentMedications;
	lifestyleAssessment: LifestyleAssessment;
	contraceptivePreferences: ContraceptivePreferences;
	clinicalRecommendation: ClinicalRecommendation;
}

// ──────────────────────────────────────────────
// MEC grading types
// ──────────────────────────────────────────────

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface MECRule {
	id: string;
	category: string;
	description: string;
	mecCategory: number;
	affectedMethods: string[];
	evaluate: (data: AssessmentData) => boolean;
}

export interface FiredRule {
	id: string;
	category: string;
	description: string;
	mecCategory: number;
	affectedMethods: string[];
}

export interface AdditionalFlag {
	id: string;
	category: string;
	message: string;
	priority: 'high' | 'medium' | 'low';
}

export interface MethodMEC {
	coc: MECCategory;
	pop: MECCategory;
	implant: MECCategory;
	injection: MECCategory;
	iud: MECCategory;
	ius: MECCategory;
}

export interface GradingResult {
	methodMEC: MethodMEC;
	overallRisk: RiskLevel;
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
