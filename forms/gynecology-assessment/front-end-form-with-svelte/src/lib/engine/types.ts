// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Sex = 'female' | 'other' | '';
export type MenopausalStatus = 'pre-menopausal' | 'peri-menopausal' | 'post-menopausal' | 'unknown' | '';
export type FlowHeaviness = 'light' | 'moderate' | 'heavy' | 'very-heavy' | '';
export type PainSeverity = 0 | 1 | 2 | 3;
export type Regularity = 'regular' | 'irregular' | 'absent' | '';
export type SmearResult = 'normal' | 'abnormal' | 'inadequate' | 'awaiting' | 'unknown' | '';
export type HPVVaccination = 'complete' | 'partial' | 'none' | 'unknown' | '';
export type SymptomScore = 0 | 1 | 2 | 3;
export type AllergySeverity = 'mild' | 'moderate' | 'anaphylaxis' | '';

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	sex: Sex;
	menopausalStatus: MenopausalStatus;
}

export interface ChiefComplaint {
	primaryConcern: string;
	duration: string;
	progression: 'stable' | 'improving' | 'worsening' | 'fluctuating' | '';
	previousTreatments: string;
}

export interface MenstrualHistory {
	cycleLength: number | null;
	cycleDuration: number | null;
	flowHeaviness: FlowHeaviness;
	painSeverity: PainSeverity | null;
	regularity: Regularity;
	lastMenstrualPeriod: string;
}

export interface GynecologicalSymptoms {
	pelvicPain: SymptomScore | null;
	abnormalBleeding: SymptomScore | null;
	discharge: SymptomScore | null;
	urinarySymptoms: SymptomScore | null;
}

export interface CervicalScreening {
	lastSmearDate: string;
	lastSmearResult: SmearResult;
	hpvVaccination: HPVVaccination;
}

export interface ObstetricHistory {
	gravida: number | null;
	para: number | null;
	complications: string;
}

export interface SexualHealth {
	sexuallyActive: YesNo;
	contraceptionMethod: string;
	stiHistory: YesNo;
	stiDetails: string;
}

export interface MedicalHistory {
	previousGynConditions: string;
	chronicDiseases: string;
	surgicalHistory: string;
	autoimmuneDiseases: YesNo;
	autoimmuneDiseaseDetails: string;
}

export interface Medication {
	name: string;
	dose: string;
	frequency: string;
}

export interface CurrentMedications {
	hormonal: Medication[];
	nonHormonal: Medication[];
	supplements: string;
}

export interface FamilyHistory {
	breastCancer: YesNo;
	ovarianCancer: YesNo;
	cervicalCancer: YesNo;
	endometriosis: YesNo;
	pcos: YesNo;
	otherDetails: string;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	chiefComplaint: ChiefComplaint;
	menstrualHistory: MenstrualHistory;
	gynecologicalSymptoms: GynecologicalSymptoms;
	cervicalScreening: CervicalScreening;
	obstetricHistory: ObstetricHistory;
	sexualHealth: SexualHealth;
	medicalHistory: MedicalHistory;
	currentMedications: CurrentMedications;
	familyHistory: FamilyHistory;
}

// ──────────────────────────────────────────────
// Symptom grading types
// ──────────────────────────────────────────────

export interface SymptomRuleDefinition {
	id: string;
	symptomNumber: number;
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
	symptomScore: number;
	symptomCategory: string;
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
