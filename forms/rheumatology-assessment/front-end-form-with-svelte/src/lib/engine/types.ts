// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Sex = 'male' | 'female' | 'other' | '';
export type AllergySeverity = 'mild' | 'moderate' | 'anaphylaxis' | '';

// ──────────────────────────────────────────────
// Step 1: Demographics
// ──────────────────────────────────────────────

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	sex: Sex;
	weight: number | null;
	height: number | null;
	bmi: number | null;
}

// ──────────────────────────────────────────────
// Step 2: Chief Complaint
// ──────────────────────────────────────────────

export interface ChiefComplaint {
	primaryJointComplaint: string;
	onsetDate: string;
	durationMonths: number | null;
	morningStiffnessDurationMinutes: number | null;
	symmetricInvolvement: YesNo;
}

// ──────────────────────────────────────────────
// Step 3: Joint Assessment (28-joint count)
// ──────────────────────────────────────────────

export interface JointAssessment {
	tenderJointCount28: number | null;
	swollenJointCount28: number | null;
	painVAS: number | null;
	patientGlobalVAS: number | null;
}

// ──────────────────────────────────────────────
// Step 4: Disease History
// ──────────────────────────────────────────────

export interface DiseaseHistory {
	primaryDiagnosis: 'rheumatoid-arthritis' | 'psoriatic-arthritis' | 'ankylosing-spondylitis' | 'systemic-lupus' | 'gout' | 'osteoarthritis' | 'other' | '';
	diagnosisDate: string;
	diseaseDurationYears: number | null;
	previousDMARDs: string;
	previousBiologics: string;
	remissionPeriods: YesNo;
	remissionDetails: string;
}

// ──────────────────────────────────────────────
// Step 5: Extra-articular Features
// ──────────────────────────────────────────────

export interface ExtraArticularFeatures {
	rheumatoidNodules: YesNo;
	skinRash: YesNo;
	skinRashDetails: string;
	eyeDryness: YesNo;
	uveitis: YesNo;
	uveitisDetails: string;
	interstitialLungDisease: YesNo;
	ildDetails: string;
	cardiovascularInvolvement: YesNo;
	cardiovascularDetails: string;
}

// ──────────────────────────────────────────────
// Step 6: Laboratory Results
// ──────────────────────────────────────────────

export interface LaboratoryResults {
	esr: number | null;
	crp: number | null;
	rheumatoidFactor: YesNo;
	antiCCP: YesNo;
	ana: YesNo;
	hlaB27: YesNo;
	haemoglobin: number | null;
	whiteBloodCellCount: number | null;
	plateletCount: number | null;
	creatinine: number | null;
	egfr: number | null;
	alt: number | null;
	ast: number | null;
}

// ──────────────────────────────────────────────
// Step 7: Current Medications
// ──────────────────────────────────────────────

export interface Medication {
	name: string;
	dose: string;
	frequency: string;
}

export interface CurrentMedications {
	dmards: Medication[];
	biologics: Medication[];
	nsaids: Medication[];
	steroids: Medication[];
	painMedication: Medication[];
	supplements: Medication[];
}

// ──────────────────────────────────────────────
// Step 8: Allergies
// ──────────────────────────────────────────────

export interface Allergy {
	allergen: string;
	reaction: string;
	severity: AllergySeverity;
}

export interface Allergies {
	drugAllergies: Allergy[];
	latexAllergy: YesNo;
}

// ──────────────────────────────────────────────
// Step 9: Functional Assessment
// ──────────────────────────────────────────────

export interface FunctionalAssessment {
	haqDiScore: number | null;
	gripStrengthLeft: number | null;
	gripStrengthRight: number | null;
	walkingAbility: 'independent' | 'with-aid' | 'wheelchair' | 'bedbound' | '';
	adlLimitations: string;
	workDisability: YesNo;
	workDisabilityDetails: string;
}

// ──────────────────────────────────────────────
// Step 10: Comorbidities & Social
// ──────────────────────────────────────────────

export interface ComorbiditiesSocial {
	cardiovascularRisk: YesNo;
	cardiovascularRiskDetails: string;
	osteoporosis: YesNo;
	osteoporosisOnTreatment: YesNo;
	recentInfections: YesNo;
	recentInfectionDetails: string;
	tuberculosisScreening: YesNo;
	vaccinationStatusUpToDate: YesNo;
	vaccinationDetails: string;
	smoking: 'current' | 'ex' | 'never' | '';
	smokingPackYears: number | null;
	exerciseFrequency: 'none' | 'occasional' | 'regular' | 'daily' | '';
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	chiefComplaint: ChiefComplaint;
	jointAssessment: JointAssessment;
	diseaseHistory: DiseaseHistory;
	extraArticularFeatures: ExtraArticularFeatures;
	laboratoryResults: LaboratoryResults;
	currentMedications: CurrentMedications;
	allergies: Allergies;
	functionalAssessment: FunctionalAssessment;
	comorbiditiesSocial: ComorbiditiesSocial;
}

// ──────────────────────────────────────────────
// DAS28 grading types
// ──────────────────────────────────────────────

export type DiseaseActivity = 'remission' | 'low' | 'moderate' | 'high';

export interface DAS28Rule {
	id: string;
	category: string;
	description: string;
	evaluate: (data: AssessmentData) => boolean;
}

export interface FiredRule {
	id: string;
	category: string;
	description: string;
}

export interface AdditionalFlag {
	id: string;
	category: string;
	message: string;
	priority: 'high' | 'medium' | 'low';
}

export interface GradingResult {
	das28Score: number | null;
	diseaseActivity: DiseaseActivity | null;
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
	isConditional?: boolean;
	shouldShow?: (data: AssessmentData) => boolean;
}
