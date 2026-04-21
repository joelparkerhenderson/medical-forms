// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Sex = 'male' | 'female' | 'other' | '';
export type Severity = 'none' | 'mild' | 'moderate' | 'severe' | '';
export type AnxietyLevel = 'none' | 'mild' | 'moderate' | 'severe' | '';
export type VisitFrequency = 'every-6-months' | 'annually' | 'rarely' | 'never' | '';
export type BrushingFrequency = 'twice-daily' | 'once-daily' | 'occasionally' | 'rarely' | '';
export type FlossingFrequency = 'daily' | 'occasionally' | 'rarely' | 'never' | '';
export type BoneLossPattern = 'none' | 'horizontal' | 'vertical' | 'combined' | '';
export type OcclusionClass = 'class-I' | 'class-II' | 'class-III' | '';
export type OralHygieneIndex = 'good' | 'fair' | 'poor' | '';
export type AllergySeverity = 'mild' | 'moderate' | 'anaphylaxis' | '';

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	sex: Sex;
	emergencyContactName: string;
	emergencyContactPhone: string;
}

export interface ChiefComplaint {
	primaryConcern: string;
	painLocation: string;
	painSeverity: number | null;
	painOnset: string;
	painDuration: string;
}

export interface DentalHistory {
	lastDentalVisit: string;
	visitFrequency: VisitFrequency;
	brushingFrequency: BrushingFrequency;
	flossingFrequency: FlossingFrequency;
	dentalAnxietyLevel: AnxietyLevel;
}

export interface DMFTAssessment {
	decayedTeeth: number | null;
	missingTeeth: number | null;
	filledTeeth: number | null;
	toothChartNotes: string;
}

export interface PeriodontalAssessment {
	gumBleeding: YesNo;
	pocketDepthsAboveNormal: YesNo;
	pocketDepthDetails: string;
	gumRecession: YesNo;
	gumRecessionDetails: string;
	toothMobility: YesNo;
	mobilityDetails: string;
	furcationInvolvement: YesNo;
	furcationDetails: string;
}

export interface OralExamination {
	softTissueFindings: string;
	tmjPain: YesNo;
	tmjClicking: YesNo;
	tmjLimitedOpening: YesNo;
	occlusion: OcclusionClass;
	oralHygieneIndex: OralHygieneIndex;
}

export interface MedicalHistory {
	cardiovascularDisease: YesNo;
	cardiovascularDetails: string;
	diabetes: YesNo;
	diabetesType: 'type1' | 'type2' | '';
	diabetesControlled: YesNo;
	bleedingDisorder: YesNo;
	bleedingDetails: string;
	bisphosphonateUse: YesNo;
	bisphosphonateDetails: string;
	radiationTherapyHeadNeck: YesNo;
	radiationDetails: string;
	immunosuppression: YesNo;
	immunosuppressionDetails: string;
}

export interface CurrentMedications {
	anticoagulantUse: YesNo;
	anticoagulantType: string;
	bisphosphonateCurrentUse: YesNo;
	bisphosphonateName: string;
	immunosuppressantUse: YesNo;
	immunosuppressantName: string;
	allergyToAnaesthetics: YesNo;
	anaestheticAllergyDetails: string;
	otherMedications: string;
}

export interface RadiographicFindings {
	panoramicFindings: string;
	periapicalFindings: string;
	bitewingFindings: string;
	boneLossPattern: BoneLossPattern;
	boneLossDetails: string;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	chiefComplaint: ChiefComplaint;
	dentalHistory: DentalHistory;
	dmftAssessment: DMFTAssessment;
	periodontalAssessment: PeriodontalAssessment;
	oralExamination: OralExamination;
	medicalHistory: MedicalHistory;
	currentMedications: CurrentMedications;
	radiographicFindings: RadiographicFindings;
}

// ──────────────────────────────────────────────
// DMFT grading types
// ──────────────────────────────────────────────

export type DMFTCategory = 'caries-free' | 'very-low' | 'low' | 'moderate' | 'high' | 'very-high';

export interface DMFTRule {
	id: string;
	system: string;
	description: string;
	category: DMFTCategory;
	evaluate: (data: AssessmentData) => boolean;
}

export interface FiredRule {
	id: string;
	system: string;
	description: string;
	category: DMFTCategory;
}

export interface AdditionalFlag {
	id: string;
	category: string;
	message: string;
	priority: 'high' | 'medium' | 'low';
}

export interface GradingResult {
	dmftScore: number;
	dmftCategory: DMFTCategory;
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
