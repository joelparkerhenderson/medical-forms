// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Sex = 'male' | 'female' | 'other' | '';
export type AllergySeverity = 'mild' | 'moderate' | 'anaphylaxis' | '';
export type DASHScore = 1 | 2 | 3 | 4 | 5;
export type Side = 'left' | 'right' | 'bilateral' | '';
export type OnsetType = 'acute' | 'gradual' | 'traumatic' | 'overuse' | '';
export type PainCharacter = 'sharp' | 'dull' | 'aching' | 'burning' | 'throbbing' | 'stabbing' | 'radiating' | '';
export type PainFrequency = 'constant' | 'intermittent' | 'activity-related' | 'night-only' | 'morning-stiffness' | '';

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	sex: Sex;
	occupation: string;
	dominantHand: 'left' | 'right' | 'ambidextrous' | '';
}

export interface ChiefComplaint {
	primaryConcern: string;
	affectedJoint: string;
	side: Side;
	duration: string;
	onsetType: OnsetType;
	aggravatingFactors: string[];
}

export interface PainAssessment {
	currentPainLevel: number | null;
	worstPain: number | null;
	bestPain: number | null;
	painCharacter: PainCharacter;
	painFrequency: PainFrequency;
	nightPain: YesNo;
	painWithWeightBearing: YesNo;
}

export interface DASHQuestionnaire {
	q1: DASHScore | null;
	q2: DASHScore | null;
	q3: DASHScore | null;
	q4: DASHScore | null;
	q5: DASHScore | null;
	q6: DASHScore | null;
	q7: DASHScore | null;
	q8: DASHScore | null;
	q9: DASHScore | null;
	q10: DASHScore | null;
	q11: DASHScore | null;
	q12: DASHScore | null;
	q13: DASHScore | null;
	q14: DASHScore | null;
	q15: DASHScore | null;
	q16: DASHScore | null;
	q17: DASHScore | null;
	q18: DASHScore | null;
	q19: DASHScore | null;
	q20: DASHScore | null;
	q21: DASHScore | null;
	q22: DASHScore | null;
	q23: DASHScore | null;
	q24: DASHScore | null;
	q25: DASHScore | null;
	q26: DASHScore | null;
	q27: DASHScore | null;
	q28: DASHScore | null;
	q29: DASHScore | null;
	q30: DASHScore | null;
}

export interface RangeOfMotion {
	joint: string;
	flexion: number | null;
	extension: number | null;
	abduction: number | null;
	adduction: number | null;
	internalRotation: number | null;
	externalRotation: number | null;
	notes: string;
}

export interface StrengthTesting {
	gripStrengthLeft: number | null;
	gripStrengthRight: number | null;
	manualMuscleGrade: string;
	specificWeaknesses: string;
}

export interface FunctionalLimitations {
	difficultyWithADLs: string[];
	mobilityAids: string[];
	workRestrictions: string;
	sportRestrictions: string;
}

export interface ImagingStudy {
	performed: YesNo;
	date: string;
	findings: string;
}

export interface ImagingHistory {
	xRay: ImagingStudy;
	mri: ImagingStudy;
	ctScan: ImagingStudy;
	ultrasound: ImagingStudy;
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

export interface CurrentTreatment {
	medications: Medication[];
	physicalTherapy: YesNo;
	physicalTherapyDetails: string;
	injections: YesNo;
	injectionDetails: string;
	braceOrSplint: YesNo;
	braceDetails: string;
	otherTreatments: string;
	allergies: Allergy[];
}

export interface SurgicalHistory {
	previousOrthopedicSurgery: YesNo;
	surgeries: PreviousSurgery[];
	anesthesiaComplications: YesNo;
	anesthesiaDetails: string;
	willingToConsiderSurgery: YesNo;
}

export interface PreviousSurgery {
	procedure: string;
	date: string;
	outcome: string;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	chiefComplaint: ChiefComplaint;
	painAssessment: PainAssessment;
	dashQuestionnaire: DASHQuestionnaire;
	rangeOfMotion: RangeOfMotion;
	strengthTesting: StrengthTesting;
	functionalLimitations: FunctionalLimitations;
	imagingHistory: ImagingHistory;
	currentTreatment: CurrentTreatment;
	surgicalHistory: SurgicalHistory;
}

// ──────────────────────────────────────────────
// DASH grading types
// ──────────────────────────────────────────────

export interface DASHRuleDefinition {
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
	dashScore: number | null;
	dashCategory: string;
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
