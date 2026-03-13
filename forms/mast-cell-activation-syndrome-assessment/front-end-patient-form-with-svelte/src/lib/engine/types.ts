// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Sex = 'male' | 'female' | 'other' | '';
export type SymptomSeverity = 0 | 1 | 2 | 3;
export type SymptomFrequency = 'never' | 'rarely' | 'sometimes' | 'often' | 'daily' | '';
export type QualityOfLife = 'none' | 'mild' | 'moderate' | 'severe' | '';

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	sex: Sex;
}

export interface SymptomOverview {
	onsetDate: string;
	symptomDuration: string;
	symptomFrequency: SymptomFrequency;
	qualityOfLife: QualityOfLife;
}

export interface SymptomDetail {
	severity: SymptomSeverity | null;
	frequency: SymptomFrequency;
}

export interface DermatologicalSymptoms {
	flushing: SymptomDetail;
	urticaria: SymptomDetail;
	angioedema: SymptomDetail;
	pruritus: SymptomDetail;
}

export interface GastrointestinalSymptoms {
	abdominalPain: SymptomDetail;
	nausea: SymptomDetail;
	diarrhea: SymptomDetail;
	bloating: SymptomDetail;
}

export interface CardiovascularSymptoms {
	tachycardia: SymptomDetail;
	hypotension: SymptomDetail;
	presyncope: SymptomDetail;
	syncope: SymptomDetail;
}

export interface RespiratorySymptoms {
	wheezing: SymptomDetail;
	dyspnea: SymptomDetail;
	nasalCongestion: SymptomDetail;
	throatTightening: SymptomDetail;
}

export interface NeurologicalSymptoms {
	headache: SymptomDetail;
	brainFog: SymptomDetail;
	dizziness: SymptomDetail;
	fatigue: SymptomDetail;
}

export interface TriggersPatterns {
	foodTriggers: string;
	environmentalTriggers: string;
	stressTriggers: YesNo;
	exerciseTrigger: YesNo;
	temperatureTrigger: YesNo;
	medicationTriggers: string;
}

export interface LaboratoryResults {
	serumTryptase: number | null;
	histamine: number | null;
	prostaglandinD2: number | null;
	chromograninA: number | null;
}

export interface CurrentTreatment {
	antihistamines: YesNo;
	mastCellStabilizers: YesNo;
	leukotrienInhibitors: YesNo;
	epinephrine: YesNo;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	symptomOverview: SymptomOverview;
	dermatologicalSymptoms: DermatologicalSymptoms;
	gastrointestinalSymptoms: GastrointestinalSymptoms;
	cardiovascularSymptoms: CardiovascularSymptoms;
	respiratorySymptoms: RespiratorySymptoms;
	neurologicalSymptoms: NeurologicalSymptoms;
	triggersPatterns: TriggersPatterns;
	laboratoryResults: LaboratoryResults;
	currentTreatment: CurrentTreatment;
}

// ──────────────────────────────────────────────
// MCAS grading types
// ──────────────────────────────────────────────

export interface SymptomDomainDefinition {
	id: string;
	domain: string;
	symptoms: string[];
	description: string;
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
	symptomScore: number;
	mcasCategory: string;
	organSystemsAffected: number;
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
