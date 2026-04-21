// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Sex = 'male' | 'female' | 'other' | '';
export type AllergySeverity = 'mild' | 'moderate' | 'anaphylaxis' | '';
export type EducationLevel = 'none' | 'primary' | 'secondary' | 'university' | 'postgraduate' | '';
export type ReferralSource = 'gp' | 'neurologist' | 'psychiatrist' | 'geriatrician' | 'self' | 'family' | 'other' | '';
export type ReferralReason = 'memory-concern' | 'confusion' | 'behavioural-change' | 'functional-decline' | 'screening' | 'follow-up' | 'other' | '';
export type LivingArrangement = 'alone' | 'with-spouse' | 'with-family' | 'care-home' | 'assisted-living' | '';
export type ADLIndependence = 'independent' | 'needs-some-help' | 'needs-significant-help' | 'fully-dependent' | '';

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	sex: Sex;
	educationLevel: EducationLevel;
	primaryLanguage: string;
	handedness: 'right' | 'left' | 'ambidextrous' | '';
}

export interface ReferralInformation {
	referralSource: ReferralSource;
	referralReason: ReferralReason;
	referringClinician: string;
	referralDate: string;
	urgency: 'routine' | 'urgent' | 'emergency' | '';
	previousCognitiveAssessment: YesNo;
	previousAssessmentDetails: string;
}

export interface OrientationScores {
	year: 0 | 1 | null;
	season: 0 | 1 | null;
	date: 0 | 1 | null;
	day: 0 | 1 | null;
	month: 0 | 1 | null;
	country: 0 | 1 | null;
	county: 0 | 1 | null;
	town: 0 | 1 | null;
	hospital: 0 | 1 | null;
	floor: 0 | 1 | null;
}

export interface RegistrationScores {
	object1: 0 | 1 | null;
	object2: 0 | 1 | null;
	object3: 0 | 1 | null;
}

export interface AttentionScores {
	serial1: 0 | 1 | null;
	serial2: 0 | 1 | null;
	serial3: 0 | 1 | null;
	serial4: 0 | 1 | null;
	serial5: 0 | 1 | null;
}

export interface RecallScores {
	object1: 0 | 1 | null;
	object2: 0 | 1 | null;
	object3: 0 | 1 | null;
}

export interface LanguageScores {
	naming1: 0 | 1 | null;
	naming2: 0 | 1 | null;
	repetition: 0 | 1 | null;
	command1: 0 | 1 | null;
	command2: 0 | 1 | null;
	command3: 0 | 1 | null;
	reading: 0 | 1 | null;
	writing: 0 | 1 | null;
}

export interface VisuospatialScores {
	copying: 0 | 1 | null;
}

export interface FunctionalHistory {
	livingArrangement: LivingArrangement;
	adlBathing: ADLIndependence;
	adlDressing: ADLIndependence;
	adlMeals: ADLIndependence;
	adlMedications: ADLIndependence;
	adlFinances: ADLIndependence;
	adlTransport: ADLIndependence;
	recentChanges: string;
	safetyConerns: string;
	carersAvailable: YesNo;
	carerDetails: string;
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

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	referralInformation: ReferralInformation;
	orientationScores: OrientationScores;
	registrationScores: RegistrationScores;
	attentionScores: AttentionScores;
	recallScores: RecallScores;
	languageScores: LanguageScores;
	repetitionCommands: LanguageScores;
	visuospatialScores: VisuospatialScores;
	functionalHistory: FunctionalHistory;
}

// ──────────────────────────────────────────────
// MMSE grading types
// ──────────────────────────────────────────────

export interface MMSERuleDefinition {
	id: string;
	domain: string;
	item: string;
	maxScore: number;
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
	mmseScore: number;
	mmseCategory: string;
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
