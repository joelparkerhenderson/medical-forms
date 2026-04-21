// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Sex = 'male' | 'female' | 'other' | '';
export type SmokingStatus = 'current' | 'ex' | 'never' | '';
export type AlcoholFrequency = 'none' | 'occasional' | 'moderate' | 'heavy' | '';
export type ScreenResult = 'negative' | 'positive' | 'pending' | '';
export type Eligibility = 'suitable' | 'conditionally-suitable' | 'unsuitable';

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	sex: Sex;
	weight: number | null;
	height: number | null;
	bmi: number | null;
}

export interface DonorRegistrationHlaTyping {
	donorRegistry: string;
	donorRegistryId: string;
	registrationDate: string;
	donationType: 'allogeneic' | 'autologous' | '';
	recipientRelationship: 'related' | 'unrelated' | '';
	hlaA: string;
	hlaB: string;
	hlaC: string;
	hlaDrb1: string;
	hlaDqb1: string;
	hlaDpb1: string;
	hlaMatchLevel: '10-of-10' | '9-of-10' | '8-of-10' | '7-of-10' | 'haploidentical' | '';
	crossmatchResult: 'negative' | 'positive' | 'pending' | '';
	previousDonation: YesNo;
	previousDonationDetails: string;
}

export interface MedicalHistory {
	hasAutoimmuneDisease: YesNo;
	autoimmuneDetails: string;
	hasMalignancy: YesNo;
	malignancyDetails: string;
	hasCardiovascularDisease: YesNo;
	cardiovascularDetails: string;
	hasRespiratoryDisease: YesNo;
	respiratoryDetails: string;
	hasRenalDisease: YesNo;
	renalDetails: string;
	hasHepaticDisease: YesNo;
	hepaticDetails: string;
	hasBleedingDisorder: YesNo;
	bleedingDisorderDetails: string;
	hasNeurologicalCondition: YesNo;
	neurologicalDetails: string;
	currentMedications: string;
	drugAllergies: string;
	previousSurgery: YesNo;
	surgeryDetails: string;
}

export interface PhysicalExamination {
	bpSystolic: number | null;
	bpDiastolic: number | null;
	heartRate: number | null;
	temperature: number | null;
	respiratoryRate: number | null;
	oxygenSaturation: number | null;
	generalAppearance: 'well' | 'unwell' | 'acutely-unwell' | '';
	cardiovascularExamination: 'normal' | 'abnormal' | '';
	cardiovascularFindings: string;
	respiratoryExamination: 'normal' | 'abnormal' | '';
	respiratoryFindings: string;
	abdominalExamination: 'normal' | 'abnormal' | '';
	abdominalFindings: string;
	venousAccessAssessment: 'good' | 'adequate' | 'poor' | '';
	posteriorIliacCrestAssessment: 'suitable' | 'unsuitable' | '';
}

export interface HaematologicalAssessment {
	haemoglobin: number | null;
	whiteCellCount: number | null;
	plateletCount: number | null;
	neutrophilCount: number | null;
	lymphocyteCount: number | null;
	haematocrit: number | null;
	mcv: number | null;
	bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | '';
	coagulationScreen: 'normal' | 'abnormal' | 'pending' | '';
	coagulationDetails: string;
	ferritin: number | null;
	creatinine: number | null;
	liverFunction: 'normal' | 'abnormal' | 'pending' | '';
	liverFunctionDetails: string;
}

export interface InfectiousDiseaseScreening {
	hivStatus: ScreenResult;
	hepatitisBSurfaceAntigen: ScreenResult;
	hepatitisBCoreAntibody: ScreenResult;
	hepatitisCAbntibody: ScreenResult;
	htlvStatus: ScreenResult;
	syphilisScreen: ScreenResult;
	cmvStatus: ScreenResult;
	ebvStatus: ScreenResult;
	toxoplasmaStatus: ScreenResult;
	tuberculosisScreen: ScreenResult;
	recentTravel: YesNo;
	travelDetails: string;
	recentInfection: YesNo;
	infectionDetails: string;
	vaccinationUpToDate: YesNo;
}

export interface AnaestheticAssessment {
	asaGrade: 'I' | 'II' | 'III' | 'IV' | '';
	previousAnaesthetic: YesNo;
	anaestheticComplications: YesNo;
	complicationDetails: string;
	familyAnaestheticProblems: YesNo;
	familyProblemDetails: string;
	mallampatiScore: 'I' | 'II' | 'III' | 'IV' | '';
	airwayConcerns: YesNo;
	airwayDetails: string;
	nilByMouthConfirmed: YesNo;
	smokingStatus: SmokingStatus;
	alcoholUse: AlcoholFrequency;
	anaestheticPlan: 'general' | 'regional' | 'sedation' | '';
}

export interface CollectionMethodAssessment {
	preferredMethod: 'pbsc' | 'bone-marrow' | 'either' | '';
	recipientPreference: 'pbsc' | 'bone-marrow' | 'either' | '';
	finalCollectionMethod: 'pbsc' | 'bone-marrow' | '';
	gcsfEligible: YesNo;
	gcsfContraindications: string;
	venousAccessSuitableForApheresis: YesNo;
	centralLineRequired: YesNo;
	estimatedDonorWeightKg: number | null;
	targetCd34Dose: number | null;
	estimatedCollectionDays: number | null;
	boneMarrowHarvestVolumeMl: number | null;
	autologousBloodDonation: YesNo;
}

export interface PsychologicalReadiness {
	understandsProcedure: YesNo;
	understandsRisks: YesNo;
	voluntaryDecision: YesNo;
	coercionConcerns: YesNo;
	coercionDetails: string;
	anxietyAboutProcedure: 'none' | 'mild' | 'moderate' | 'severe' | '';
	previousPsychologicalIssues: YesNo;
	psychologicalIssueDetails: string;
	supportNetwork: YesNo;
	timeOffWorkArranged: 'yes' | 'no' | 'not-applicable' | '';
	donorAdvocateConsulted: YesNo;
	willingToProceed: 'yes' | 'no' | 'undecided' | '';
}

export interface ConsentEligibility {
	informedConsentGiven: YesNo;
	consentFormSigned: YesNo;
	consentDate: string;
	witnessName: string;
	witnessRole: string;
	informationLeafletProvided: YesNo;
	questionsAnswered: YesNo;
	eligibilityDecision: 'suitable' | 'conditionally-suitable' | 'unsuitable' | '';
	eligibilityConditions: string;
	deferralReason: string;
	deferralDuration: 'temporary' | 'permanent' | '';
	assessorName: string;
	assessorRole: string;
	assessmentDate: string;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	donorRegistrationHlaTyping: DonorRegistrationHlaTyping;
	medicalHistory: MedicalHistory;
	physicalExamination: PhysicalExamination;
	haematologicalAssessment: HaematologicalAssessment;
	infectiousDiseaseScreening: InfectiousDiseaseScreening;
	anaestheticAssessment: AnaestheticAssessment;
	collectionMethodAssessment: CollectionMethodAssessment;
	psychologicalReadiness: PsychologicalReadiness;
	consentEligibility: ConsentEligibility;
}

// ──────────────────────────────────────────────
// Donor grading types
// ──────────────────────────────────────────────

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface DonorRule {
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
	eligibility: Eligibility;
	overallRisk: RiskLevel;
	hlaMatchLevel: string;
	collectionMethod: string;
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
