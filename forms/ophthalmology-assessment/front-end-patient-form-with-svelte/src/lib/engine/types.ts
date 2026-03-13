// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Sex = 'male' | 'female' | 'other' | '';
export type AffectedEye = 'left' | 'right' | 'both' | '';
export type AllergySeverity = 'mild' | 'moderate' | 'anaphylaxis' | '';

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	sex: Sex;
}

export interface ChiefComplaint {
	primaryConcern: string;
	affectedEye: AffectedEye;
	onsetType: 'sudden' | 'gradual' | '';
	durationValue: string;
	durationUnit: 'hours' | 'days' | 'weeks' | 'months' | 'years' | '';
	painPresent: YesNo;
	painSeverity: '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '';
}

export interface VisualAcuity {
	distanceVaRightUncorrected: string;
	distanceVaRightCorrected: string;
	distanceVaLeftUncorrected: string;
	distanceVaLeftCorrected: string;
	nearVaRight: string;
	nearVaLeft: string;
	pinholeRight: string;
	pinholeLeft: string;
	refractionRight: string;
	refractionLeft: string;
}

export interface OcularHistory {
	previousEyeConditions: YesNo;
	previousEyeConditionDetails: string;
	previousEyeSurgery: YesNo;
	previousEyeSurgeryDetails: string;
	laserTreatment: YesNo;
	laserTreatmentDetails: string;
	ocularTrauma: YesNo;
	ocularTraumaDetails: string;
	amblyopia: YesNo;
	amblyopiaEye: AffectedEye;
}

export interface AnteriorSegment {
	lidsNormal: YesNo;
	lidsDetails: string;
	conjunctivaNormal: YesNo;
	conjunctivaDetails: string;
	corneaNormal: YesNo;
	corneaDetails: string;
	anteriorChamberNormal: YesNo;
	anteriorChamberDetails: string;
	irisNormal: YesNo;
	irisDetails: string;
	lensNormal: YesNo;
	lensDetails: string;
	iopRight: number | null;
	iopLeft: number | null;
	iopMethod: 'goldmann' | 'tonopen' | 'icare' | 'non-contact' | '';
}

export interface PosteriorSegment {
	fundusNormal: YesNo;
	fundusDetails: string;
	opticDiscNormal: YesNo;
	opticDiscDetails: string;
	cupToDiscRatioRight: string;
	cupToDiscRatioLeft: string;
	maculaNormal: YesNo;
	maculaDetails: string;
	retinalVesselsNormal: YesNo;
	retinalVesselsDetails: string;
	vitreousNormal: YesNo;
	vitreousDetails: string;
}

export interface VisualFieldPupils {
	visualFieldTestPerformed: YesNo;
	visualFieldTestType: 'confrontation' | 'humphrey' | 'goldmann' | 'octopus' | '';
	visualFieldResultRight: 'normal' | 'abnormal' | '';
	visualFieldResultLeft: 'normal' | 'abnormal' | '';
	visualFieldDetails: string;
	pupilReactionRight: 'normal' | 'sluggish' | 'fixed' | '';
	pupilReactionLeft: 'normal' | 'sluggish' | 'fixed' | '';
	rapdPresent: YesNo;
	rapdEye: AffectedEye;
	colourVisionNormal: YesNo;
	colourVisionDetails: string;
}

export interface Medication {
	name: string;
	dose: string;
	frequency: string;
}

export interface OphthalmicAllergy {
	allergen: string;
	reaction: string;
	severity: AllergySeverity;
}

export interface CurrentMedications {
	eyeDrops: Medication[];
	oralMedications: Medication[];
	ophthalmicDrugAllergies: OphthalmicAllergy[];
}

export interface SystemicConditions {
	diabetes: YesNo;
	diabetesType: 'type1' | 'type2' | '';
	diabetesControl: 'well-controlled' | 'poorly-controlled' | '';
	diabeticRetinopathy: YesNo;
	diabeticRetinopathyStage: 'background' | 'pre-proliferative' | 'proliferative' | 'maculopathy' | '';
	hypertension: YesNo;
	hypertensionControlled: YesNo;
	autoimmune: YesNo;
	autoimmuneDetails: string;
	thyroidEyeDisease: YesNo;
	thyroidEyeDiseaseDetails: string;
	neurological: YesNo;
	neurologicalDetails: string;
}

export interface FunctionalImpact {
	drivingStatus: 'current-driver' | 'ceased-driving' | 'never-driven' | '';
	drivingConcerns: string;
	readingAbility: 'no-difficulty' | 'mild-difficulty' | 'moderate-difficulty' | 'severe-difficulty' | 'unable' | '';
	adlLimitations: YesNo;
	adlLimitationDetails: string;
	fallsRisk: YesNo;
	fallsDetails: string;
	supportNeeds: YesNo;
	supportDetails: string;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	chiefComplaint: ChiefComplaint;
	visualAcuity: VisualAcuity;
	ocularHistory: OcularHistory;
	anteriorSegment: AnteriorSegment;
	posteriorSegment: PosteriorSegment;
	visualFieldPupils: VisualFieldPupils;
	currentMedications: CurrentMedications;
	systemicConditions: SystemicConditions;
	functionalImpact: FunctionalImpact;
}

// ──────────────────────────────────────────────
// Visual acuity grading types
// ──────────────────────────────────────────────

export type VAGrade = 'normal' | 'mild' | 'moderate' | 'severe' | 'blindness';

export interface VARule {
	id: string;
	system: string;
	description: string;
	grade: VAGrade;
	evaluate: (data: AssessmentData) => boolean;
}

export interface FiredRule {
	id: string;
	system: string;
	description: string;
	grade: VAGrade;
}

export interface AdditionalFlag {
	id: string;
	category: string;
	message: string;
	priority: 'high' | 'medium' | 'low';
}

export interface GradingResult {
	vaGrade: VAGrade;
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
