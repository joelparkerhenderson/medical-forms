// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Sex = 'male' | 'female' | 'other' | '';

export type SmokingStatus = 'never' | 'former' | 'current-light' | 'current-heavy' | '';
export type AlcoholUse = 'none' | 'occasional' | 'moderate' | 'heavy' | '';
export type DrugUse = 'none' | 'cannabis' | 'recreational' | 'iv-drug-use' | '';
export type FlowHeaviness = 'light' | 'moderate' | 'heavy' | 'very-heavy' | '';
export type Dysmenorrhea = 'none' | 'mild' | 'moderate' | 'severe' | '';
export type EfficacyPriority = 'low' | 'moderate' | 'high' | 'very-high' | '';
export type ConveniencePriority = 'low' | 'moderate' | 'high' | 'very-high' | '';
export type PeriodControlPriority = 'low' | 'moderate' | 'high' | 'very-high' | '';
export type FertilityReturnPriority = 'low' | 'moderate' | 'high' | 'very-high' | '';
export type HormoneFreePreference = 'no-preference' | 'prefer-hormone-free' | 'prefer-hormonal' | '';
export type DesireForChildren = 'yes-soon' | 'yes-future' | 'unsure' | 'no' | '';
export type Timeframe = 'within-1-year' | '1-3-years' | '3-5-years' | '5-plus-years' | 'not-applicable' | '';
export type PartnerInvolvement = 'involved' | 'not-involved' | 'not-applicable' | '';
export type HPVVaccination = 'completed' | 'partial' | 'none' | 'unsure' | '';
export type UKMECCategory = 1 | 2 | 3 | 4;

export type ContraceptiveMethod =
	| 'combined-oral'
	| 'progestogen-only-pill'
	| 'injectable'
	| 'implant'
	| 'copper-iud'
	| 'lng-ius'
	| 'patch'
	| 'vaginal-ring'
	| 'barrier'
	| 'natural-methods'
	| 'sterilisation'
	| 'none'
	| '';

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	sex: Sex;
}

export interface ReproductiveHistory {
	gravida: number | null;
	para: number | null;
	lastDeliveryDate: string;
	breastfeeding: YesNo;
	pregnancyIntention: string;
}

export interface MenstrualHistory {
	cycleLength: number | null;
	cycleDuration: number | null;
	flowHeaviness: FlowHeaviness;
	dysmenorrhea: Dysmenorrhea;
	lastMenstrualPeriod: string;
}

export interface CurrentContraception {
	currentMethod: ContraceptiveMethod;
	durationOfUse: string;
	reasonForChange: string;
	sideEffects: string;
}

export interface MedicalHistory {
	hypertension: YesNo;
	migraineWithAura: YesNo;
	dvtHistory: YesNo;
	breastCancer: YesNo;
	liverDisease: YesNo;
	diabetes: YesNo;
	epilepsy: YesNo;
	hiv: YesNo;
	stiHistory: YesNo;
}

export interface CardiovascularRisk {
	bmi: number | null;
	smoking: SmokingStatus;
	bloodPressureSystolic: number | null;
	bloodPressureDiastolic: number | null;
	familyHistoryCVD: YesNo;
	lipidDisorders: YesNo;
}

export interface LifestyleFactors {
	smokingStatus: SmokingStatus;
	alcoholUse: AlcoholUse;
	drugUse: DrugUse;
	occupation: string;
	travelPlans: string;
}

export interface PreferencesPriorities {
	preferredMethod: ContraceptiveMethod;
	efficacyPriority: EfficacyPriority;
	conveniencePriority: ConveniencePriority;
	periodControlPriority: PeriodControlPriority;
	fertilityReturnPriority: FertilityReturnPriority;
	hormoneFreePreference: HormoneFreePreference;
}

export interface BreastCervicalScreening {
	lastBreastScreening: string;
	lastCervicalScreening: string;
	hpvVaccination: HPVVaccination;
}

export interface FamilyPlanningGoals {
	desireForChildren: DesireForChildren;
	timeframe: Timeframe;
	partnerInvolvement: PartnerInvolvement;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	reproductiveHistory: ReproductiveHistory;
	menstrualHistory: MenstrualHistory;
	currentContraception: CurrentContraception;
	medicalHistory: MedicalHistory;
	cardiovascularRisk: CardiovascularRisk;
	lifestyleFactors: LifestyleFactors;
	preferencesPriorities: PreferencesPriorities;
	breastCervicalScreening: BreastCervicalScreening;
	familyPlanningGoals: FamilyPlanningGoals;
}

// ──────────────────────────────────────────────
// UKMEC grading types
// ──────────────────────────────────────────────

export interface UKMECMethodResult {
	method: string;
	methodLabel: string;
	category: UKMECCategory;
	reasons: string[];
}

export interface FiredRule {
	id: string;
	domain: string;
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
	ukmecResults: UKMECMethodResult[];
	overallHighestCategory: UKMECCategory;
	preferredMethodCategory: UKMECCategory | null;
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
