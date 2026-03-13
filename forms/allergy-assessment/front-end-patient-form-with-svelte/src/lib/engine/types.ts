// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Sex = 'male' | 'female' | 'other' | '';
export type AllergyReactionSeverity = 'mild' | 'moderate' | 'severe' | 'anaphylaxis' | '';
export type SeverityLevel = 'mild' | 'moderate' | 'severe' | '';
export type SeasonalPattern = 'perennial' | 'spring' | 'summer' | 'autumn' | 'winter' | 'multiple' | '';
export type IgEType = 'IgE-mediated' | 'non-IgE-mediated' | 'mixed' | 'unknown' | '';

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	nhsNumber: string;
	sex: Sex;
	weight: number | null;
	height: number | null;
	bmi: number | null;
}

export interface AllergyHistory {
	ageOfOnset: number | null;
	knownAllergens: string;
	familyHistoryOfAtopy: YesNo;
	familyAtopyDetails: string;
	familyHistoryOfAllergy: YesNo;
	familyAllergyDetails: string;
}

export interface AllergyItem {
	allergen: string;
	reactionType: string;
	severity: AllergyReactionSeverity;
	timing: string;
	alternativesTolerated: string;
}

export interface DrugAllergies {
	hasDrugAllergies: YesNo;
	drugAllergies: AllergyItem[];
	crossReactivityConcerns: string;
}

export interface FoodAllergies {
	hasFoodAllergies: YesNo;
	foodAllergies: AllergyItem[];
	igeType: IgEType;
	oralAllergySyndrome: YesNo;
	dietaryRestrictions: string;
}

export interface EnvironmentalAllergies {
	pollenAllergy: YesNo;
	dustMiteAllergy: YesNo;
	mouldAllergy: YesNo;
	animalDanderAllergy: YesNo;
	latexAllergy: YesNo;
	insectStingAllergy: YesNo;
	insectStingSeverity: AllergyReactionSeverity;
	seasonalPattern: SeasonalPattern;
	otherEnvironmentalAllergens: string;
}

export interface AnaphylaxisEpisode {
	trigger: string;
	symptoms: string;
	treatmentRequired: string;
}

export interface AnaphylaxisHistory {
	hasAnaphylaxisHistory: YesNo;
	numberOfEpisodes: number | null;
	episodes: AnaphylaxisEpisode[];
	adrenalineAutoInjectorPrescribed: YesNo;
	actionPlanInPlace: YesNo;
}

export interface TestResult {
	testType: string;
	allergen: string;
	result: string;
}

export interface TestingResults {
	skinPrickTestsDone: YesNo;
	specificIgEDone: YesNo;
	componentResolvedDiagnosticsDone: YesNo;
	challengeTestsDone: YesNo;
	patchTestsDone: YesNo;
	testResults: TestResult[];
}

export interface Medication {
	name: string;
	dose: string;
	frequency: string;
}

export interface CurrentManagement {
	antihistamines: YesNo;
	antihistamineDetails: string;
	nasalSteroids: YesNo;
	adrenalineAutoInjector: YesNo;
	immunotherapy: YesNo;
	immunotherapyDetails: string;
	biologics: YesNo;
	biologicDetails: string;
	allergenAvoidanceStrategies: string;
	otherMedications: Medication[];
}

export interface Comorbidities {
	asthma: YesNo;
	asthmaSeverity: SeverityLevel;
	eczema: YesNo;
	eczemaSeverity: SeverityLevel;
	rhinitis: YesNo;
	rhinitisSeverity: SeverityLevel;
	eosinophilicOesophagitis: YesNo;
	mastCellDisorders: YesNo;
	mastCellDetails: string;
	mentalHealthImpact: YesNo;
	mentalHealthDetails: string;
}

export interface ImpactActionPlan {
	qualityOfLifeScore: number | null;
	schoolWorkImpact: YesNo;
	schoolWorkImpactDetails: string;
	emergencyActionPlanStatus: 'in-place' | 'not-in-place' | 'needs-update' | '';
	trainingProvided: YesNo;
	trainingDetails: string;
	followUpSchedule: string;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	allergyHistory: AllergyHistory;
	drugAllergies: DrugAllergies;
	foodAllergies: FoodAllergies;
	environmentalAllergies: EnvironmentalAllergies;
	anaphylaxisHistory: AnaphylaxisHistory;
	testingResults: TestingResults;
	currentManagement: CurrentManagement;
	comorbidities: Comorbidities;
	impactActionPlan: ImpactActionPlan;
}

// ──────────────────────────────────────────────
// Allergy severity classification types
// ──────────────────────────────────────────────

export interface AllergyRule {
	id: string;
	category: string;
	description: string;
	severityLevel: SeverityLevel;
	evaluate: (data: AssessmentData) => boolean;
}

export interface FiredRule {
	id: string;
	category: string;
	description: string;
	severityLevel: SeverityLevel;
}

export interface AdditionalFlag {
	id: string;
	category: string;
	message: string;
	priority: 'high' | 'medium' | 'low';
}

export interface GradingResult {
	severityLevel: SeverityLevel;
	allergyBurdenScore: number;
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
