// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Sex = 'male' | 'female' | 'other' | '';
export type AllergySeverity = 'mild' | 'moderate' | 'anaphylaxis' | '';
export type SmokingStatus = 'current' | 'ex-smoker' | 'never' | '';

// ASA Physical Status Classification (I-V)
export type ASAClass = 1 | 2 | 3 | 4 | 5;
// Wound Classification (I-IV)
export type WoundClass = 1 | 2 | 3 | 4;
// Surgical Complexity (1-4)
export type ComplexityScore = 1 | 2 | 3 | 4;

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	sex: Sex;
	weight: number | null;
	height: number | null;
	bmi: number | null;
}

export interface ReasonForReferral {
	referralType: 'reconstructive' | 'aesthetic' | 'trauma' | 'burn' | 'congenital' | 'cancer' | 'other' | '';
	referralTypeOther: string;
	urgency: 'elective' | 'urgent' | 'emergency' | '';
	primaryComplaint: string;
	affectedBodyArea: 'face' | 'head-neck' | 'breast' | 'trunk' | 'upper-limb' | 'hand' | 'lower-limb' | 'genitalia' | 'multiple' | 'other' | '';
	affectedBodyAreaOther: string;
	laterality: 'left' | 'right' | 'bilateral' | 'midline' | 'n-a' | '';
	durationOfCondition: 'acute' | 'less-1-month' | '1-6-months' | '6-12-months' | 'greater-12-months' | 'congenital' | '';
	previousConsultations: YesNo;
	previousConsultationsDetails: string;
}

export interface MedicalSurgicalHistory {
	previousPlasticSurgery: YesNo;
	previousPlasticSurgeryDetails: string;
	previousGeneralSurgery: YesNo;
	previousGeneralSurgeryDetails: string;
	woundHealingProblems: YesNo;
	woundHealingDetails: string;
	keloidScarring: YesNo;
	scarringDetails: string;
	diabetes: 'type-1' | 'type-2' | 'no' | '';
	diabetesControlled: YesNo;
	hypertension: YesNo;
	cardiacDisease: YesNo;
	cardiacDiseaseDetails: string;
	respiratoryDisease: YesNo;
	respiratoryDiseaseDetails: string;
	autoimmuneDisease: YesNo;
	autoimmuneDiseaseDetails: string;
	bleedingDisorder: YesNo;
	bleedingDisorderDetails: string;
	immunosuppressed: YesNo;
	immunosuppressedDetails: string;
	cancerHistory: YesNo;
	cancerHistoryDetails: string;
}

export interface CurrentCondition {
	conditionCategory: 'skin-lesion' | 'soft-tissue-defect' | 'skeletal-deformity' | 'burn-injury' | 'scar-contracture' | 'nerve-injury' | 'vascular-malformation' | 'breast' | 'other' | '';
	conditionDescription: string;
	lesionLengthMm: number | null;
	lesionWidthMm: number | null;
	lesionDepthMm: number | null;
	tissueLoss: YesNo;
	tissueLossPercentage: number | null;
	functionalImpairment: 'none' | 'mild' | 'moderate' | 'severe' | '';
	functionalImpairmentDetails: string;
	painLevel: number | null;
	cosmeticConcern: 'none' | 'mild' | 'moderate' | 'severe' | '';
	impactOnDailyActivities: 'none' | 'mild' | 'moderate' | 'severe' | '';
}

export interface WoundTissueAssessment {
	hasOpenWound: YesNo;
	woundClassification: 'clean' | 'clean-contaminated' | 'contaminated' | 'dirty' | '';
	woundAge: 'acute' | 'subacute' | 'chronic' | '';
	woundAetiology: 'surgical' | 'traumatic' | 'burn' | 'pressure' | 'venous' | 'arterial' | 'diabetic' | 'radiation' | 'other' | '';
	woundBedTissue: 'granulation' | 'slough' | 'necrotic' | 'epithelialising' | 'mixed' | '';
	woundExudate: 'none' | 'serous' | 'sanguineous' | 'purulent' | '';
	woundInfectionSigns: YesNo;
	woundInfectionDetails: string;
	tissueViability: 'viable' | 'compromised' | 'non-viable' | '';
	surroundingSkin: 'healthy' | 'erythematous' | 'oedematous' | 'macerated' | 'indurated' | '';
	vascularSupply: 'adequate' | 'compromised' | 'absent' | '';
	sensoryStatus: 'intact' | 'reduced' | 'absent' | '';
	previousWoundTreatments: string;
}

export interface PsychologicalAssessment {
	bodyDysmorphicConcern: YesNo;
	bodyDysmorphicDetails: string;
	realisticExpectations: 'yes' | 'partly' | 'no' | '';
	expectationsDetails: string;
	motivation: 'functional-improvement' | 'cosmetic-improvement' | 'pain-relief' | 'cancer-treatment' | 'trauma-repair' | 'other' | '';
	motivationOther: string;
	previousMentalHealth: YesNo;
	mentalHealthDetails: string;
	anxietyLevel: 'none' | 'mild' | 'moderate' | 'severe' | '';
	depressionScreen: YesNo;
	socialImpact: 'none' | 'mild' | 'moderate' | 'severe' | '';
	socialImpactDetails: string;
	psychologicalReferralNeeded: YesNo;
}

export interface AnaestheticRisk {
	asaClass: '1' | '2' | '3' | '4' | '5' | '';
	previousAnaesthetic: YesNo;
	anaestheticComplications: YesNo;
	anaestheticComplicationsDetails: string;
	difficultAirway: YesNo;
	difficultAirwayDetails: string;
	malignantHyperthermiaRisk: YesNo;
	familyAnaestheticProblems: YesNo;
	familyAnaestheticDetails: string;
	smokingStatus: SmokingStatus;
	packYears: number | null;
	alcoholConsumption: 'none' | 'within-guidelines' | 'above-guidelines' | '';
	recreationalDrugs: YesNo;
	recreationalDrugsDetails: string;
	obstructiveSleepApnoea: YesNo;
	anaestheticPreference: 'local' | 'regional' | 'general' | 'sedation' | 'no-preference' | '';
}

export interface PhotographyDocumentation {
	clinicalPhotosTaken: YesNo;
	photoConsentObtained: YesNo;
	numberOfPhotos: number | null;
	photoViewsTaken: string;
	standardisedViews: YesNo;
	measurementsRecorded: YesNo;
	measurementDetails: string;
	diagramsDrawn: YesNo;
	diagramNotes: string;
	previousImaging: YesNo;
	previousImagingType: 'ct' | 'mri' | 'ultrasound' | 'x-ray' | 'angiography' | 'other' | '';
	previousImagingFindings: string;
}

export interface Allergy {
	allergen: string;
	reaction: string;
	severity: AllergySeverity;
}

export interface MedicationsAllergies {
	onAnticoagulants: YesNo;
	anticoagulantDetails: string;
	onAntiplatelets: YesNo;
	antiplateletDetails: string;
	onSteroids: YesNo;
	steroidDetails: string;
	onImmunosuppressants: YesNo;
	immunosuppressantDetails: string;
	onChemotherapy: YesNo;
	chemotherapyDetails: string;
	onHormoneTherapy: YesNo;
	hormoneTherapyDetails: string;
	otherMedications: string;
	hasDrugAllergies: YesNo;
	allergies: Allergy[];
	latexAllergy: YesNo;
	adhesiveAllergy: YesNo;
	otherAllergies: string;
}

export interface ProcedurePlanningConsent {
	proposedProcedure: string;
	procedureComplexity: '1' | '2' | '3' | '4' | '';
	surgicalApproach: 'open' | 'endoscopic' | 'microsurgical' | 'minimally-invasive' | 'combined' | '';
	expectedDurationMinutes: number | null;
	expectedHospitalStay: 'day-case' | 'overnight' | '2-3-days' | '4-7-days' | 'greater-7-days' | '';
	flapType: 'local' | 'regional' | 'distant' | 'free' | 'skin-graft' | 'tissue-expansion' | 'implant' | 'n-a' | '';
	implantRequired: YesNo;
	implantDetails: string;
	vteRisk: 'low' | 'moderate' | 'high' | '';
	antibioticProphylaxis: YesNo;
	anticipatedRisks: string;
	alternativeTreatments: string;
	consentDiscussion: YesNo;
	consentFormSigned: YesNo;
	coolingOffPeriodOffered: 'yes' | 'no' | 'n-a' | '';
	followUpPlan: string;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	reasonForReferral: ReasonForReferral;
	medicalSurgicalHistory: MedicalSurgicalHistory;
	currentCondition: CurrentCondition;
	woundTissueAssessment: WoundTissueAssessment;
	psychologicalAssessment: PsychologicalAssessment;
	anaestheticRisk: AnaestheticRisk;
	photographyDocumentation: PhotographyDocumentation;
	medicationsAllergies: MedicationsAllergies;
	procedurePlanningConsent: ProcedurePlanningConsent;
}

// ──────────────────────────────────────────────
// Plastic surgery grading types
// ──────────────────────────────────────────────

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface PlasticsRule {
	id: string;
	category: string;
	description: string;
	grade: number;
	evaluate: (data: AssessmentData) => boolean;
}

export interface FiredRule {
	id: string;
	category: string;
	description: string;
	grade: number;
}

export interface AdditionalFlag {
	id: string;
	category: string;
	message: string;
	priority: 'high' | 'medium' | 'low';
}

export interface GradingResult {
	asaClass: ASAClass | null;
	woundClass: WoundClass | null;
	complexityScore: ComplexityScore | null;
	overallRisk: RiskLevel;
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
