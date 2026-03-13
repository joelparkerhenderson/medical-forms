// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type YesNoUnknown = 'yes' | 'no' | 'unknown' | '';
export type YesNoNA = 'yes' | 'no' | 'notApplicable' | '';
export type Sex = 'male' | 'female' | 'other' | '';
export type VaccinationLevel = 'upToDate' | 'partiallyComplete' | 'overdue' | 'contraindicated' | 'draft' | '';

export type RecordSource = 'redBook' | 'gpRecords' | 'nhsApp' | 'patientRecall' | 'other' | '';
export type AdministrationSite = 'leftDeltoid' | 'rightDeltoid' | 'leftThigh' | 'rightThigh' | 'oral' | 'nasal' | '';
export type AdministrationRoute = 'intramuscular' | 'subcutaneous' | 'intradermal' | 'oral' | 'nasal' | '';
export type DoseNumber = '1' | '2' | '3' | 'booster' | '';

// ─── Patient Information (Step 1) ───────────────────────────

export interface PatientInformation {
	patientName: string;
	dateOfBirth: string;
	patientSex: Sex;
	patientAge: string;
	nhsNumber: string;
	gpPractice: string;
	contactPhone: string;
	contactEmail: string;
}

// ─── Immunization History (Step 2) ──────────────────────────

export interface ImmunizationHistory {
	hasVaccinationRecord: YesNoUnknown;
	recordSource: RecordSource;
	lastReviewDate: string;
	previousAdverseReactions: YesNo;
	adverseReactionDetails: string;
	immunocompromised: YesNo;
	immunocompromisedDetails: string;
}

// ─── Childhood Vaccinations (Step 3) ────────────────────────

export interface ChildhoodVaccinations {
	dtapIpvHibHepb: number | null;
	pneumococcal: number | null;
	rotavirus: number | null;
	meningitisB: number | null;
	mmr: number | null;
	hibMenc: number | null;
	preschoolBooster: number | null;
}

// ─── Adult Vaccinations (Step 4) ────────────────────────────

export interface AdultVaccinations {
	tdIpvBooster: number | null;
	hpv: number | null;
	meningitisAcwy: number | null;
	influenzaAnnual: number | null;
	covid19: number | null;
	shingles: number | null;
	pneumococcalPpv: number | null;
}

// ─── Travel Vaccinations (Step 5) ───────────────────────────

export interface TravelVaccinations {
	travelPlanned: YesNo;
	travelDestination: string;
	hepatitisA: number | null;
	hepatitisB: number | null;
	typhoid: number | null;
	yellowFever: number | null;
	rabies: number | null;
	japaneseEncephalitis: number | null;
}

// ─── Occupational Vaccinations (Step 6) ─────────────────────

export interface OccupationalVaccinations {
	occupation: string;
	healthcareWorker: YesNo;
	hepatitisBOccupational: number | null;
	influenzaOccupational: number | null;
	varicella: number | null;
	bcgTuberculosis: number | null;
}

// ─── Contraindications & Allergies (Step 7) ─────────────────

export interface ContraindicationsAllergies {
	eggAllergy: YesNo;
	gelatinAllergy: YesNo;
	latexAllergy: YesNo;
	neomycinAllergy: YesNo;
	pregnant: YesNoNA;
	pregnancyWeeks: string;
	severeIllness: YesNo;
	previousAnaphylaxis: YesNo;
	anaphylaxisDetails: string;
}

// ─── Consent & Information (Step 8) ─────────────────────────

export interface ConsentInformation {
	informationProvided: number | null;
	risksExplained: number | null;
	benefitsExplained: number | null;
	questionsAnswered: number | null;
	consentGiven: YesNo;
	consentDate: string;
	guardianConsent: YesNoNA;
}

// ─── Administration Record (Step 9) ─────────────────────────

export interface AdministrationRecord {
	vaccineName: string;
	batchNumber: string;
	expiryDate: string;
	administrationSite: AdministrationSite;
	administrationRoute: AdministrationRoute;
	doseNumber: DoseNumber;
	administeredBy: string;
	administrationDate: string;
}

// ─── Clinical Review (Step 10) ──────────────────────────────

export interface ClinicalReview {
	postVaccinationObservation: number | null;
	immediateReaction: YesNo;
	reactionDetails: string;
	nextDoseDue: string;
	catchUpScheduleNeeded: YesNo;
	referralNeeded: YesNo;
	clinicianNotes: string;
	reviewingClinician: string;
}

// ─── Assessment Data (all sections) ─────────────────────────

export interface AssessmentData {
	patientInformation: PatientInformation;
	immunizationHistory: ImmunizationHistory;
	childhoodVaccinations: ChildhoodVaccinations;
	adultVaccinations: AdultVaccinations;
	travelVaccinations: TravelVaccinations;
	occupationalVaccinations: OccupationalVaccinations;
	contraindicationsAllergies: ContraindicationsAllergies;
	consentInformation: ConsentInformation;
	administrationRecord: AdministrationRecord;
	clinicalReview: ClinicalReview;
}

// ──────────────────────────────────────────────
// Grading types
// ──────────────────────────────────────────────

export interface FiredRule {
	id: string;
	category: string;
	description: string;
	concernLevel: 'high' | 'medium' | 'low';
}

export interface AdditionalFlag {
	id: string;
	category: string;
	message: string;
	priority: 'high' | 'medium' | 'low';
}

export interface GradingResult {
	vaccinationLevel: VaccinationLevel;
	vaccinationScore: number;
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
