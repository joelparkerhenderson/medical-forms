// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Sex = 'male' | 'female' | 'other' | '';
export type IPSSScore = 0 | 1 | 2 | 3 | 4 | 5;
export type QoLScore = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	sex: Sex;
}

export interface ChiefComplaint {
	primaryConcern: string;
	duration: string;
	urgency: 'routine' | 'urgent' | 'emergency' | '';
}

export interface IPSSQuestionnaire {
	q1: IPSSScore | null;
	q2: IPSSScore | null;
	q3: IPSSScore | null;
	q4: IPSSScore | null;
	q5: IPSSScore | null;
	q6: IPSSScore | null;
	q7: IPSSScore | null;
}

export interface QualityOfLife {
	qolScore: QoLScore | null;
	qolImpact: string;
}

export interface UrinarySymptoms {
	frequency: YesNo;
	urgency: YesNo;
	nocturia: YesNo;
	hesitancy: YesNo;
	stream: 'normal' | 'weak' | 'intermittent' | '';
	straining: YesNo;
	hematuria: YesNo;
	dysuria: YesNo;
	incontinence: 'none' | 'stress' | 'urge' | 'overflow' | 'mixed' | '';
}

export interface RenalFunction {
	creatinine: number | null;
	eGFR: number | null;
	urinalysis: string;
	psa: number | null;
	psaDate: string;
}

export interface SexualHealth {
	erectileDysfunction: YesNo;
	libidoChanges: YesNo;
	ejaculatoryProblems: YesNo;
}

export interface MedicalHistory {
	previousUrologicConditions: string;
	surgicalHistory: string;
	diabetes: YesNo;
	hypertension: YesNo;
	neurologicConditions: YesNo;
	neurologicConditionDetails: string;
}

export interface Medication {
	name: string;
	dose: string;
	frequency: string;
}

export interface CurrentMedications {
	alphaBlockers: Medication[];
	fiveAlphaReductaseInhibitors: Medication[];
	anticholinergics: Medication[];
	otherMedications: Medication[];
}

export interface FamilyHistory {
	prostateCancer: YesNo;
	bladderCancer: YesNo;
	kidneyDisease: YesNo;
	otherDetails: string;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	chiefComplaint: ChiefComplaint;
	ipssQuestionnaire: IPSSQuestionnaire;
	qualityOfLife: QualityOfLife;
	urinarySymptoms: UrinarySymptoms;
	renalFunction: RenalFunction;
	sexualHealth: SexualHealth;
	medicalHistory: MedicalHistory;
	currentMedications: CurrentMedications;
	familyHistory: FamilyHistory;
}

// ──────────────────────────────────────────────
// IPSS grading types
// ──────────────────────────────────────────────

export interface IPSSRuleDefinition {
	id: string;
	questionNumber: number;
	domain: string;
	text: string;
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
	ipssScore: number;
	ipssCategory: string;
	qolScore: number | null;
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
