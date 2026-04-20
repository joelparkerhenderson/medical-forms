// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Sex = 'male' | 'female' | 'other' | '';
export type SeverityLevel = 'none' | 'mild' | 'moderate' | 'severe' | '';

// AUDIT risk categories
export type AuditRiskCategory = 'low-risk' | 'hazardous' | 'harmful' | 'dependence-likely' | '';

// DAST-10 risk categories
export type DastRiskCategory = 'no-problems' | 'low' | 'moderate' | 'substantial' | 'severe' | '';

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	sex: Sex;
	weight: number | null;
	height: number | null;
	bmi: number | null;
}

export interface AlcoholUseAudit {
	auditQ1Frequency: number;
	auditQ2TypicalQuantity: number;
	auditQ3BingeFrequency: number;
	auditQ4ImpairedControl: number;
	auditQ5FailedExpectations: number;
	auditQ6MorningDrinking: number;
	auditQ7Guilt: number;
	auditQ8Blackout: number;
	auditQ9Injury: number;
	auditQ10Concern: number;
}

export interface DrugUseDast {
	dastQ1NonMedicalUse: YesNo;
	dastQ2PolyDrug: YesNo;
	dastQ3AbleToStop: YesNo;
	dastQ4Blackouts: YesNo;
	dastQ5Guilt: YesNo;
	dastQ6Complaints: YesNo;
	dastQ7Neglect: YesNo;
	dastQ8IllegalActivities: YesNo;
	dastQ9Withdrawal: YesNo;
	dastQ10MedicalProblems: YesNo;
}

export interface SubstanceUseHistory {
	ageFirstAlcoholUse: number | null;
	ageFirstDrugUse: number | null;
	primarySubstance: 'alcohol' | 'cannabis' | 'cocaine' | 'heroin' | 'methamphetamine' | 'benzodiazepines' | 'opioid-painkillers' | 'other' | '';
	primarySubstanceOther: string;
	secondarySubstances: string;
	routeOfAdministration: 'oral' | 'smoking' | 'snorting' | 'injecting' | 'multiple' | '';
	frequencyOfUse: 'daily' | 'several-times-week' | 'weekly' | 'monthly' | 'occasionally' | '';
	durationOfUse: 'less-1-year' | '1-5-years' | '5-10-years' | 'greater-10-years' | '';
	lastUseDate: string;
	currentUseStatus: 'actively-using' | 'in-withdrawal' | 'early-recovery' | 'sustained-recovery' | '';
	ivDrugUse: YesNo;
	needleSharing: YesNo;
}

export interface WithdrawalAssessment {
	currentlyInWithdrawal: YesNo;
	withdrawalSubstance: 'alcohol' | 'opioids' | 'benzodiazepines' | 'stimulants' | 'multiple' | 'other' | '';
	tremor: YesNo;
	sweating: YesNo;
	nauseaVomiting: YesNo;
	anxiety: SeverityLevel;
	agitation: SeverityLevel;
	seizureHistory: YesNo;
	deliriumTremensHistory: YesNo;
	hallucinations: YesNo;
	lastDrinkDrugHours: number | null;
	withdrawalSeverity: SeverityLevel;
	medicallySupervisedDetoxNeeded: YesNo;
}

export interface MentalHealthComorbidities {
	depression: YesNo;
	depressionSeverity: 'mild' | 'moderate' | 'severe' | '';
	anxietyDisorder: YesNo;
	anxietyDisorderType: 'generalised' | 'social' | 'panic' | 'ptsd' | 'ocd' | 'other' | '';
	ptsd: YesNo;
	ptsdDetails: string;
	bipolarDisorder: YesNo;
	psychosis: YesNo;
	personalityDisorder: YesNo;
	eatingDisorder: YesNo;
	adhd: YesNo;
	suicidalIdeation: YesNo;
	suicidalIdeationCurrent: YesNo;
	selfHarmHistory: YesNo;
	previousSuicideAttempts: YesNo;
	psychiatricMedication: YesNo;
	psychiatricMedicationDetails: string;
}

export interface PhysicalHealthImpact {
	liverDisease: YesNo;
	liverDiseaseType: 'fatty-liver' | 'hepatitis' | 'cirrhosis' | 'other' | '';
	hepatitisB: 'yes' | 'no' | 'unknown' | '';
	hepatitisC: 'yes' | 'no' | 'unknown' | '';
	hivStatus: 'positive' | 'negative' | 'unknown' | '';
	cardiovascularIssues: YesNo;
	cardiovascularDetails: string;
	respiratoryIssues: YesNo;
	respiratoryDetails: string;
	gastrointestinalIssues: YesNo;
	gastrointestinalDetails: string;
	neurologicalIssues: YesNo;
	neurologicalDetails: string;
	nutritionalDeficiency: YesNo;
	chronicPain: YesNo;
	chronicPainDetails: string;
	overdoseHistory: YesNo;
	overdoseCount: number | null;
	lastOverdoseDate: string;
}

export interface SocialLegalImpact {
	employmentStatus: 'employed' | 'unemployed' | 'retired' | 'sick-leave' | 'student' | 'other' | '';
	occupation: string;
	employmentAffected: YesNo;
	housingStatus: 'stable' | 'unstable' | 'homeless' | 'temporary' | 'supported' | '';
	relationshipStatus: 'single' | 'partnered' | 'married' | 'separated' | 'divorced' | 'widowed' | '';
	relationshipImpact: 'none' | 'mild' | 'moderate' | 'severe' | '';
	dependents: number | null;
	childrenSafeguardingConcerns: YesNo;
	socialSupport: 'good' | 'limited' | 'none' | '';
	criminalRecord: YesNo;
	criminalRecordDetails: string;
	currentLegalIssues: YesNo;
	currentLegalDetails: string;
	duiDwiHistory: YesNo;
	financialDifficulties: YesNo;
	domesticViolence: YesNo;
	domesticViolenceDetails: string;
}

export interface PreviousTreatmentHistory {
	previousTreatment: YesNo;
	numberOfTreatmentEpisodes: number | null;
	previousDetox: YesNo;
	detoxSetting: 'inpatient' | 'outpatient' | 'community' | '';
	previousRehab: YesNo;
	rehabType: 'residential' | 'day-programme' | 'outpatient' | '';
	previousCounselling: YesNo;
	counsellingType: 'cbt' | 'motivational-interviewing' | 'group-therapy' | '12-step' | 'other' | '';
	previousMedicationAssisted: YesNo;
	matMedication: 'methadone' | 'buprenorphine' | 'naltrexone' | 'acamprosate' | 'disulfiram' | 'other' | '';
	selfHelpGroups: YesNo;
	selfHelpGroupType: 'aa' | 'na' | 'smart-recovery' | 'other' | '';
	longestPeriodAbstinent: 'less-1-month' | '1-3-months' | '3-6-months' | '6-12-months' | 'greater-1-year' | '';
	relapseTriggers: string;
}

export interface TreatmentPlanningGoals {
	treatmentGoal: 'abstinence' | 'harm-reduction' | 'controlled-use' | 'unsure' | '';
	readinessToChange: 'pre-contemplation' | 'contemplation' | 'preparation' | 'action' | 'maintenance' | '';
	motivationLevel: 'low' | 'moderate' | 'high' | '';
	preferredTreatmentSetting: 'inpatient' | 'residential' | 'day-programme' | 'outpatient' | 'community' | '';
	interestedInCounselling: YesNo;
	interestedInMedication: YesNo;
	interestedInSelfHelp: YesNo;
	barriersToTreatment: string;
	supportNetworkAvailable: YesNo;
	supportNetworkDetails: string;
	riskOfRelapse: 'low' | 'moderate' | 'high' | '';
	safetyPlanNeeded: YesNo;
	naloxoneProvided: 'yes' | 'no' | 'not-applicable' | '';
	followUpPlan: string;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	alcoholUseAudit: AlcoholUseAudit;
	drugUseDast: DrugUseDast;
	substanceUseHistory: SubstanceUseHistory;
	withdrawalAssessment: WithdrawalAssessment;
	mentalHealthComorbidities: MentalHealthComorbidities;
	physicalHealthImpact: PhysicalHealthImpact;
	socialLegalImpact: SocialLegalImpact;
	previousTreatmentHistory: PreviousTreatmentHistory;
	treatmentPlanningGoals: TreatmentPlanningGoals;
}

// ──────────────────────────────────────────────
// Substance abuse grading types
// ──────────────────────────────────────────────

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface SubstanceRule {
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
	auditScore: number;
	auditRiskCategory: AuditRiskCategory;
	dastScore: number;
	dastRiskCategory: DastRiskCategory;
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
