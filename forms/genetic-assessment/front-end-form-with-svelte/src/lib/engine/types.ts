// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Sex = 'male' | 'female' | 'other' | '';
export type Urgency = 'routine' | 'urgent' | 'emergency' | '';

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	sex: Sex;
}

export interface ReferralInformation {
	referralReason: string;
	referringClinician: string;
	urgency: Urgency;
}

export interface PersonalMedicalHistory {
	birthDefects: YesNo;
	birthDefectsDetails: string;
	developmentalDelay: YesNo;
	developmentalDelayDetails: string;
	intellectualDisability: YesNo;
	intellectualDisabilityDetails: string;
	multipleAnomalies: YesNo;
	multipleAnomaliesDetails: string;
	chromosomalCondition: YesNo;
	chromosomalConditionDetails: string;
	knownGeneticCondition: YesNo;
	knownGeneticConditionDetails: string;
}

export interface CancerHistory {
	personalCancerHistory: YesNo;
	cancerType: string;
	ageAtDiagnosis: number | null;
	multiplePrimaryCancers: YesNo;
}

export interface FamilyMember {
	conditions: string;
	cancers: string;
	ageAtDiagnosis: string;
	deceased: YesNo;
	ageAtDeath: string;
}

export interface FamilyPedigree {
	maternalGrandmother: FamilyMember;
	maternalGrandfather: FamilyMember;
	paternalGrandmother: FamilyMember;
	paternalGrandfather: FamilyMember;
	mother: FamilyMember;
	father: FamilyMember;
	siblings: string;
	children: string;
}

export interface CardiovascularGenetics {
	familialHypercholesterolemia: YesNo;
	cardiomyopathy: YesNo;
	aorticAneurysm: YesNo;
	suddenCardiacDeath: YesNo;
	earlyOnsetCVD: YesNo;
	cardiovascularDetails: string;
}

export interface Neurogenetics {
	huntington: YesNo;
	alzheimersEarly: YesNo;
	parkinson: YesNo;
	muscularDystrophy: YesNo;
	spinocerebellarAtaxia: YesNo;
	neurologicalDetails: string;
}

export interface ReproductiveGenetics {
	recurrentMiscarriages: YesNo;
	infertility: YesNo;
	previousAffectedChild: YesNo;
	previousAffectedChildDetails: string;
	consanguinity: YesNo;
	carrierStatus: YesNo;
	carrierStatusDetails: string;
}

export interface EthnicBackground {
	ethnicity: string;
	ashkenaziJewish: YesNo;
	consanguinity: YesNo;
	consanguinityDetails: string;
}

export interface GeneticTestingHistory {
	previousGeneticTests: YesNo;
	previousGeneticTestsDetails: string;
	testResults: string;
	geneticCounseling: YesNo;
	variantsOfUncertainSignificance: YesNo;
	variantsOfUncertainSignificanceDetails: string;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	referralInformation: ReferralInformation;
	personalMedicalHistory: PersonalMedicalHistory;
	cancerHistory: CancerHistory;
	familyPedigree: FamilyPedigree;
	cardiovascularGenetics: CardiovascularGenetics;
	neurogenetics: Neurogenetics;
	reproductiveGenetics: ReproductiveGenetics;
	ethnicBackground: EthnicBackground;
	geneticTestingHistory: GeneticTestingHistory;
}

// ──────────────────────────────────────────────
// Risk grading types
// ──────────────────────────────────────────────

export type RiskLevel = 'Low' | 'Moderate' | 'High';

export interface RiskRuleDefinition {
	id: string;
	category: string;
	description: string;
	weight: number;
}

export interface FiredRule {
	id: string;
	category: string;
	description: string;
	weight: number;
}

export interface AdditionalFlag {
	id: string;
	category: string;
	message: string;
	priority: 'high' | 'medium' | 'low';
}

export interface GradingResult {
	riskScore: number;
	riskLevel: RiskLevel;
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
