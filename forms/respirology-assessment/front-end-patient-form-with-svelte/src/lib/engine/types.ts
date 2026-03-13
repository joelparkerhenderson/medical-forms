// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Severity = 'mild' | 'moderate' | 'severe' | '';
export type SmokingStatus = 'current' | 'ex' | 'never' | '';
export type Sex = 'male' | 'female' | 'other' | '';
export type AllergySeverity = 'mild' | 'moderate' | 'anaphylaxis' | '';
export type SputumColour = 'clear' | 'white' | 'yellow' | 'green' | 'brown' | 'blood-streaked' | '';
export type CoughCharacter = 'productive' | 'dry' | '';
export type OxygenDelivery = 'nasal-cannula' | 'venturi' | 'non-rebreather' | 'cpap' | 'bipap' | '';

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	sex: Sex;
	weight: number | null;
	height: number | null;
	bmi: number | null;
}

export interface ChiefComplaint {
	primarySymptom: string;
	onsetDate: string;
	duration: string;
	severityRating: number | null;
}

export interface DyspnoeaAssessment {
	mrcGrade: '1' | '2' | '3' | '4' | '5' | '';
	triggers: string;
	exerciseToleranceMetres: number | null;
	orthopnoea: YesNo;
	orthopnoeaPillows: number | null;
	pnd: YesNo;
}

export interface CoughAssessment {
	duration: string;
	character: CoughCharacter;
	sputumVolume: 'none' | 'small' | 'moderate' | 'large' | '';
	sputumColour: SputumColour;
	haemoptysis: YesNo;
	haemoptysisDetails: string;
}

export interface RespiratoryHistory {
	asthma: YesNo;
	copd: YesNo;
	copdSeverity: Severity;
	bronchiectasis: YesNo;
	interstitialLungDisease: YesNo;
	ildType: string;
	tuberculosis: YesNo;
	tbTreatmentComplete: YesNo;
	pneumonia: YesNo;
	pneumoniaRecurrent: YesNo;
	pulmonaryEmbolism: YesNo;
	peDate: string;
}

export interface PulmonaryFunction {
	fev1: number | null;
	fvc: number | null;
	fev1FvcRatio: number | null;
	dlco: number | null;
	tlc: number | null;
	oxygenSaturation: number | null;
}

export interface Medication {
	name: string;
	dose: string;
	frequency: string;
}

export interface CurrentMedications {
	inhalers: Medication[];
	nebulizers: Medication[];
	oxygenTherapy: YesNo;
	oxygenDelivery: OxygenDelivery;
	oxygenFlowRate: number | null;
	oralSteroids: YesNo;
	oralSteroidDetails: string;
	antibiotics: YesNo;
	antibioticDetails: string;
}

export interface Allergy {
	allergen: string;
	reaction: string;
	severity: AllergySeverity;
}

export interface Allergies {
	drugAllergies: Allergy[];
	environmentalAllergens: string[];
}

export interface SmokingExposures {
	smokingStatus: SmokingStatus;
	packYears: number | null;
	vaping: YesNo;
	vapingDetails: string;
	occupationalExposure: YesNo;
	occupationalDetails: string;
	asbestosExposure: YesNo;
	asbestosDetails: string;
	pets: YesNo;
	petDetails: string;
}

export interface SleepFunctional {
	sleepQuality: 'good' | 'fair' | 'poor' | '';
	osaScreenSnoring: YesNo;
	osaScreenTired: YesNo;
	osaScreenObservedApnoea: YesNo;
	osaScreenBMIOver35: YesNo;
	osaScreenAge50Plus: YesNo;
	osaScreenNeckOver40cm: YesNo;
	osaScreenMale: YesNo;
	stopBangScore: number | null;
	daytimeSomnolence: YesNo;
	epworthScore: number | null;
	functionalStatus: 'independent' | 'limited' | 'dependent' | '';
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	chiefComplaint: ChiefComplaint;
	dyspnoeaAssessment: DyspnoeaAssessment;
	coughAssessment: CoughAssessment;
	respiratoryHistory: RespiratoryHistory;
	pulmonaryFunction: PulmonaryFunction;
	currentMedications: CurrentMedications;
	allergies: Allergies;
	smokingExposures: SmokingExposures;
	sleepFunctional: SleepFunctional;
}

// ──────────────────────────────────────────────
// MRC grading types
// ──────────────────────────────────────────────

export type MRCGrade = 1 | 2 | 3 | 4 | 5;

export interface MRCRule {
	id: string;
	system: string;
	description: string;
	grade: MRCGrade;
	evaluate: (data: AssessmentData) => boolean;
}

export interface FiredRule {
	id: string;
	system: string;
	description: string;
	grade: MRCGrade;
}

export interface AdditionalFlag {
	id: string;
	category: string;
	message: string;
	priority: 'high' | 'medium' | 'low';
}

export interface GradingResult {
	mrcGrade: MRCGrade;
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
