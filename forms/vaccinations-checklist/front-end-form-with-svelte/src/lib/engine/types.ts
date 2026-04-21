// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type YesNoUnknown = 'yes' | 'no' | 'unknown' | '';
export type Sex = 'male' | 'female' | 'other' | '';

export type ComplianceStatus = 'fully-immunised' | 'partially-immunised' | 'non-compliant' | 'contraindicated';
export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	sex: Sex;
	weight: number | null;
	height: number | null;
	bmi: number | null;
	occupation: string;
	occupationCategory: 'healthcare' | 'education' | 'social-care' | 'laboratory' | 'travel' | 'military' | 'other' | '';
	employer: string;
}

export interface VaccinationHistory {
	hasVaccinationRecord: YesNo;
	recordSource: 'red-book' | 'gp-records' | 'occupational-health' | 'self-reported' | 'overseas-records' | 'other' | '';
	recordSourceOther: string;
	previousAdverseReaction: YesNo;
	adverseReactionDetails: string;
	adverseReactionVaccine: string;
	adverseReactionSeverity: 'mild' | 'moderate' | 'severe' | 'anaphylaxis' | '';
	immunocompromised: YesNo;
	immunocompromisedDetails: string;
	pregnantOrPlanning: 'yes' | 'no' | 'not-applicable' | '';
}

export interface ChildhoodImmunisations {
	mmrDose1: YesNoUnknown;
	mmrDose1Date: string;
	mmrDose2: YesNoUnknown;
	mmrDose2Date: string;
	dtpPrimaryCourse: YesNoUnknown;
	dtpPrimaryDate: string;
	dtpBooster: YesNoUnknown;
	dtpBoosterDate: string;
	polioPrimaryCourse: YesNoUnknown;
	polioPrimaryDate: string;
	polioBooster: YesNoUnknown;
	polioBoosterDate: string;
	hibVaccine: YesNoUnknown;
	hibVaccineDate: string;
	menCVaccine: YesNoUnknown;
	menCVaccineDate: string;
	menACWYVaccine: YesNoUnknown;
	menACWYVaccineDate: string;
	pcvVaccine: YesNoUnknown;
	pcvVaccineDate: string;
	notes: string;
}

export interface OccupationalVaccines {
	hepatitisBCourse: YesNoUnknown;
	hepatitisBCourseDate: string;
	hepatitisBDosesReceived: number | null;
	hepatitisBAntiBodyLevel: 'adequate' | 'inadequate' | 'not-tested' | '';
	bcgVaccine: YesNoUnknown;
	bcgVaccineDate: string;
	bcgScarPresent: YesNo;
	varicellaVaccine: YesNoUnknown;
	varicellaVaccineDate: string;
	varicellaHistory: YesNoUnknown;
	hepatitisAVaccine: YesNoUnknown;
	hepatitisAVaccineDate: string;
	typhoidVaccine: YesNoUnknown;
	typhoidVaccineDate: string;
	rabiesVaccine: YesNoUnknown;
	rabiesVaccineDate: string;
	notes: string;
}

export interface TravelVaccines {
	travelPlanned: YesNo;
	travelDestination: string;
	travelDepartureDate: string;
	travelReturnDate: string;
	yellowFeverVaccine: YesNoUnknown;
	yellowFeverVaccineDate: string;
	yellowFeverCertificate: YesNo;
	japaneseEncephalitisVaccine: YesNoUnknown;
	japaneseEncephalitisDate: string;
	tickBorneEncephalitisVaccine: YesNoUnknown;
	tickBorneEncephalitisDate: string;
	choleraVaccine: YesNoUnknown;
	choleraVaccineDate: string;
	meningococcalACWYTravel: YesNoUnknown;
	meningococcalACWYTravelDate: string;
	malariaProphylaxis: 'yes' | 'no' | 'not-required' | '';
	malariaProphylaxisDrug: 'atovaquone-proguanil' | 'doxycycline' | 'mefloquine' | 'chloroquine' | 'other' | '';
	notes: string;
}

export interface Covid19Vaccination {
	covidPrimaryCourse: YesNoUnknown;
	covidPrimaryVaccineType: 'pfizer' | 'moderna' | 'astrazeneca' | 'novavax' | 'janssen' | 'other' | '';
	covidDose1Date: string;
	covidDose2Date: string;
	covidBooster1: YesNo;
	covidBooster1Date: string;
	covidBooster1Type: 'pfizer' | 'moderna' | 'astrazeneca' | 'novavax' | 'other' | '';
	covidBooster2: YesNo;
	covidBooster2Date: string;
	covidBooster2Type: 'pfizer' | 'moderna' | 'novavax' | 'other' | '';
	covidAutumnBooster: YesNo;
	covidAutumnBoosterDate: string;
	totalCovidDoses: number | null;
	covidAdverseReaction: YesNo;
	covidAdverseReactionDetails: string;
	notes: string;
}

export interface InfluenzaVaccination {
	fluVaccineCurrentSeason: YesNo;
	fluVaccineCurrentDate: string;
	fluVaccineType: 'standard' | 'adjuvanted' | 'cell-based' | 'recombinant' | 'nasal-spray' | 'other' | '';
	fluVaccinePreviousSeason: YesNoUnknown;
	fluVaccineAnnualRecipient: YesNo;
	fluHighRiskGroup: YesNo;
	fluHighRiskReason: 'age-65-plus' | 'chronic-respiratory' | 'chronic-heart' | 'chronic-kidney' | 'chronic-liver' | 'diabetes' | 'immunosuppressed' | 'pregnant' | 'healthcare-worker' | 'carer' | 'other' | '';
	fluAdverseReaction: YesNo;
	fluAdverseReactionDetails: string;
	notes: string;
}

export interface ContraindicationsAllergies {
	eggAllergy: YesNo;
	eggAllergySeverity: 'mild' | 'moderate' | 'severe' | 'anaphylaxis' | '';
	gelatinAllergy: YesNo;
	neomycinAllergy: YesNo;
	latexAllergy: YesNo;
	yeastAllergy: YesNo;
	pegPolysorbateAllergy: YesNo;
	otherVaccineAllergies: string;
	historyOfGBS: YesNo;
	gbsDetails: string;
	onImmunosuppressants: YesNo;
	immunosuppressantDetails: string;
	onBloodProductsRecent: YesNo;
	bloodProductsDetails: string;
	liveVaccineContraindicated: YesNo;
	liveVaccineContraindicationReason: string;
	notes: string;
}

export interface SerologyImmunityTesting {
	hepBSurfaceAntibody: 'positive' | 'negative' | 'not-tested' | '';
	hepBSurfaceAntibodyLevel: number | null;
	hepBSurfaceAntibodyDate: string;
	varicellaIgG: 'positive' | 'negative' | 'equivocal' | 'not-tested' | '';
	varicellaIgGDate: string;
	measlesIgG: 'positive' | 'negative' | 'equivocal' | 'not-tested' | '';
	measlesIgGDate: string;
	rubellaIgG: 'positive' | 'negative' | 'equivocal' | 'not-tested' | '';
	rubellaIgGDate: string;
	mumpsIgG: 'positive' | 'negative' | 'equivocal' | 'not-tested' | '';
	mumpsIgGDate: string;
	hepAIgG: 'positive' | 'negative' | 'not-tested' | '';
	hepAIgGDate: string;
	tetanusAntibody: 'positive' | 'negative' | 'not-tested' | '';
	tetanusAntibodyDate: string;
	tbIGRAResult: 'positive' | 'negative' | 'indeterminate' | 'not-tested' | '';
	tbIGRADate: string;
	mantouxResult: 'positive' | 'negative' | 'not-tested' | '';
	mantouxIndurationMm: number | null;
	notes: string;
}

export interface ScheduleCompliance {
	complianceStatus: ComplianceStatus | '';
	vaccinesDue: string;
	vaccinesOverdue: string;
	catchUpPlanRequired: YesNo;
	catchUpPlanDetails: string;
	nextVaccinationDate: string;
	nextVaccinationType: string;
	occupationalHealthClearance: 'yes' | 'no' | 'pending' | '';
	occupationalHealthClearanceDate: string;
	exposureRiskLevel: RiskLevel | '';
	activeExposureIncident: YesNo;
	activeExposureDetails: string;
	consentForVaccination: YesNo;
	consentDate: string;
	notes: string;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	vaccinationHistory: VaccinationHistory;
	childhoodImmunisations: ChildhoodImmunisations;
	occupationalVaccines: OccupationalVaccines;
	travelVaccines: TravelVaccines;
	covid19Vaccination: Covid19Vaccination;
	influenzaVaccination: InfluenzaVaccination;
	contraindicationsAllergies: ContraindicationsAllergies;
	serologyImmunityTesting: SerologyImmunityTesting;
	scheduleCompliance: ScheduleCompliance;
}

// ──────────────────────────────────────────────
// Vaccination grading types
// ──────────────────────────────────────────────

export interface VaccinationRule {
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
	complianceStatus: ComplianceStatus;
	overallRisk: RiskLevel;
	childhoodComplete: boolean;
	occupationalComplete: boolean;
	covidComplete: boolean;
	fluCurrent: boolean;
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
