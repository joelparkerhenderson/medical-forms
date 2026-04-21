// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Sex = 'male' | 'female' | 'other' | '';
export type AllergySeverity = 'mild' | 'moderate' | 'anaphylaxis' | '';
export type DeliveryType = 'vaginal' | 'caesarean-elective' | 'caesarean-emergency' | 'assisted' | '';
export type FeedingType = 'breast' | 'formula' | 'mixed' | 'solid' | '';
export type DomainResult = 'pass' | 'concern' | 'fail' | '';
export type OverallResult = 'normal' | 'developmental-concern' | 'developmental-delay' | '';

export interface Demographics {
	childFirstName: string;
	childLastName: string;
	dateOfBirth: string;
	sex: Sex;
	weight: number | null;
	height: number | null;
	headCircumference: number | null;
	parentGuardianName: string;
	parentGuardianRelationship: string;
	parentGuardianPhone: string;
	parentGuardianEmail: string;
}

export interface BirthHistory {
	gestationalAge: number | null;
	birthWeight: number | null;
	deliveryType: DeliveryType;
	apgarOneMinute: number | null;
	apgarFiveMinutes: number | null;
	nicuStay: YesNo;
	nicuDuration: number | null;
	birthComplications: YesNo;
	birthComplicationDetails: string;
}

export interface GrowthNutrition {
	weightPercentile: number | null;
	heightPercentile: number | null;
	headCircumferencePercentile: number | null;
	feedingType: FeedingType;
	dietaryConcerns: YesNo;
	dietaryConcernDetails: string;
	failureToThrive: YesNo;
}

export interface DevelopmentalMilestones {
	grossMotor: DomainResult;
	grossMotorNotes: string;
	fineMotor: DomainResult;
	fineMotorNotes: string;
	language: DomainResult;
	languageNotes: string;
	socialEmotional: DomainResult;
	socialEmotionalNotes: string;
	cognitive: DomainResult;
	cognitiveNotes: string;
}

export interface ImmunizationStatus {
	upToDate: YesNo;
	missingVaccinations: string;
	adverseReactions: YesNo;
	adverseReactionDetails: string;
	exemptions: YesNo;
	exemptionDetails: string;
}

export interface MedicalHistory {
	chronicConditions: YesNo;
	chronicConditionDetails: string;
	previousHospitalizations: YesNo;
	hospitalizationDetails: string;
	previousSurgeries: YesNo;
	surgeryDetails: string;
	recurringInfections: YesNo;
	infectionDetails: string;
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

export interface CurrentMedications {
	prescriptions: Medication[];
	otcMedications: Medication[];
	supplements: Medication[];
	allergies: Allergy[];
}

export interface FamilyHistory {
	geneticConditions: YesNo;
	geneticConditionDetails: string;
	chronicDiseases: YesNo;
	chronicDiseaseDetails: string;
	developmentalDisorders: YesNo;
	developmentalDisorderDetails: string;
	consanguinity: YesNo;
}

export interface SocialEnvironmental {
	homeEnvironment: string;
	schoolPerformance: 'above-average' | 'average' | 'below-average' | 'not-applicable' | '';
	behaviouralConcerns: YesNo;
	behaviouralConcernDetails: string;
	safeguardingConcerns: YesNo;
	safeguardingDetails: string;
	screenTimeHoursPerDay: number | null;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	birthHistory: BirthHistory;
	growthNutrition: GrowthNutrition;
	developmentalMilestones: DevelopmentalMilestones;
	immunizationStatus: ImmunizationStatus;
	medicalHistory: MedicalHistory;
	currentMedications: CurrentMedications;
	familyHistory: FamilyHistory;
	socialEnvironmental: SocialEnvironmental;
}

// ──────────────────────────────────────────────
// Developmental screening types
// ──────────────────────────────────────────────

export interface DevScreenRule {
	id: string;
	domain: string;
	description: string;
	result: DomainResult;
	evaluate: (data: AssessmentData) => boolean;
}

export interface FiredRule {
	id: string;
	domain: string;
	description: string;
	result: DomainResult;
}

export interface AdditionalFlag {
	id: string;
	category: string;
	message: string;
	priority: 'high' | 'medium' | 'low';
}

export interface GradingResult {
	overallResult: OverallResult;
	domainResults: Record<string, DomainResult>;
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
