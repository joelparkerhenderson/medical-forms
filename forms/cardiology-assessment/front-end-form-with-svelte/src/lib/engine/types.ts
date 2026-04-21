// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Sex = 'male' | 'female' | 'other' | '';
export type AllergySeverity = 'mild' | 'moderate' | 'anaphylaxis' | '';
export type SmokingStatus = 'current' | 'ex' | 'never' | '';
export type AlcoholFrequency = 'none' | 'occasional' | 'moderate' | 'heavy' | '';

// CCS Angina Classification (I-IV)
export type CCSClass = 1 | 2 | 3 | 4;
// NYHA Heart Failure Classification (I-IV)
export type NYHAClass = 1 | 2 | 3 | 4;

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	sex: Sex;
	weight: number | null;
	height: number | null;
	bmi: number | null;
}

export interface ChestPainAngina {
	chestPain: YesNo;
	painCharacter: 'crushing' | 'pressure' | 'sharp' | 'burning' | 'other' | '';
	painLocation: string;
	painRadiation: 'left-arm' | 'jaw' | 'back' | 'none' | 'other' | '';
	ccsClass: '1' | '2' | '3' | '4' | '';
	anginaFrequency: 'daily' | 'weekly' | 'monthly' | 'rarely' | '';
	anginaDuration: 'less-5-min' | '5-20-min' | 'greater-20-min' | '';
	unstableAngina: YesNo;
}

export interface HeartFailureSymptoms {
	dyspnoea: YesNo;
	dyspnoeaOnExertion: YesNo;
	orthopnoea: YesNo;
	pnd: YesNo;
	peripheralOedema: YesNo;
	nyhaClass: '1' | '2' | '3' | '4' | '';
}

export interface CardiacHistory {
	previousMI: YesNo;
	miDate: string;
	recentMI: YesNo;
	recentMIWeeks: number | null;
	pci: YesNo;
	pciDetails: string;
	cabg: YesNo;
	cabgDetails: string;
	valvularDisease: YesNo;
	valvularDetails: string;
	cardiomyopathy: YesNo;
	cardiomyopathyType: 'dilated' | 'hypertrophic' | 'restrictive' | 'other' | '';
	pericarditis: YesNo;
}

export interface ArrhythmiaConduction {
	atrialFibrillation: YesNo;
	afType: 'paroxysmal' | 'persistent' | 'permanent' | '';
	otherArrhythmia: YesNo;
	otherArrhythmiaType: string;
	pacemaker: YesNo;
	pacemakerType: 'single-chamber' | 'dual-chamber' | 'biventricular' | 'icd' | '';
	syncope: YesNo;
	syncopeDetails: string;
	palpitations: YesNo;
}

export interface RiskFactors {
	hypertension: YesNo;
	hypertensionControlled: YesNo;
	diabetes: YesNo;
	diabetesType: 'type1' | 'type2' | '';
	hyperlipidaemia: YesNo;
	familyHistory: YesNo;
	familyHistoryDetails: string;
	obesity: YesNo;
}

export interface DiagnosticResults {
	ecgFindings: string;
	ecgNormal: YesNo;
	echoPerformed: YesNo;
	echoLVEF: number | null;
	echoFindings: string;
	stressTestPerformed: YesNo;
	stressTestResult: 'normal' | 'abnormal' | 'inconclusive' | '';
	stressTestDetails: string;
	cathPerformed: YesNo;
	cathFindings: string;
}

export interface CurrentMedications {
	antiplatelets: YesNo;
	antiplateletType: string;
	anticoagulants: YesNo;
	anticoagulantType: string;
	betaBlockers: YesNo;
	betaBlockerType: string;
	aceInhibitorsARBs: YesNo;
	aceArbType: string;
	statins: YesNo;
	statinType: string;
	diuretics: YesNo;
	diureticType: string;
	otherCardiacMeds: string;
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

export interface Allergies {
	drugAllergies: YesNo;
	allergies: Allergy[];
	contrastAllergy: YesNo;
	contrastAllergyDetails: string;
}

export interface SocialFunctional {
	smoking: SmokingStatus;
	smokingPackYears: number | null;
	alcohol: AlcoholFrequency;
	alcoholUnitsPerWeek: number | null;
	exerciseTolerance: 'unable' | 'light-housework' | 'climb-stairs' | 'moderate-exercise' | 'vigorous-exercise' | '';
	estimatedMETs: number | null;
	occupation: string;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	chestPainAngina: ChestPainAngina;
	heartFailureSymptoms: HeartFailureSymptoms;
	cardiacHistory: CardiacHistory;
	arrhythmiaConduction: ArrhythmiaConduction;
	riskFactors: RiskFactors;
	diagnosticResults: DiagnosticResults;
	currentMedications: CurrentMedications;
	allergies: Allergies;
	socialFunctional: SocialFunctional;
}

// ──────────────────────────────────────────────
// Cardiology grading types
// ──────────────────────────────────────────────

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface CardioRule {
	id: string;
	system: string;
	description: string;
	grade: number;
	evaluate: (data: AssessmentData) => boolean;
}

export interface FiredRule {
	id: string;
	system: string;
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
	ccsClass: CCSClass | null;
	nyhaClass: NYHAClass | null;
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
