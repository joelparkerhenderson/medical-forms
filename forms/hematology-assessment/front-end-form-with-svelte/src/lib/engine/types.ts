// ─── Basic types ────────────────────────────────────────────

export type AbnormalityLevel =
	| 'critical'
	| 'severeAbnormality'
	| 'moderateAbnormality'
	| 'mildAbnormality'
	| 'normal'
	| 'draft';

// ─── Patient Information (Step 1) ──────────────────────────

export interface PatientInformation {
	patientName: string;
	dateOfBirth: string;
	medicalRecordNumber: string;
	referringPhysician: string;
	clinicalIndication: string;
	specimenDate: string;
	specimenType: string;
}

// ─── Blood Count Analysis (Step 2) ─────────────────────────

export interface BloodCountAnalysis {
	hemoglobin: number | null;
	hematocrit: number | null;
	redBloodCellCount: number | null;
	whiteBloodCellCount: number | null;
	plateletCount: number | null;
	meanCorpuscularVolume: number | null;
	meanCorpuscularHemoglobin: number | null;
	redCellDistributionWidth: number | null;
}

// ─── Coagulation Studies (Step 3) ──────────────────────────

export interface CoagulationStudies {
	prothrombinTime: number | null;
	inr: number | null;
	activatedPartialThromboplastinTime: number | null;
	fibrinogen: number | null;
	dDimer: number | null;
	bleedingTime: number | null;
}

// ─── Peripheral Blood Film (Step 4) ────────────────────────

export interface PeripheralBloodFilm {
	redCellMorphology: string;
	whiteBloodCellDifferential: string;
	plateletMorphology: string;
	abnormalCellMorphology: string;
	filmQuality: number | null;
	filmComments: string;
}

// ─── Iron Studies (Step 5) ─────────────────────────────────

export interface IronStudies {
	serumIron: number | null;
	totalIronBindingCapacity: number | null;
	transferrinSaturation: number | null;
	serumFerritin: number | null;
	reticulocyteCount: number | null;
}

// ─── Hemoglobinopathy Screening (Step 6) ───────────────────

export interface HemoglobinopathyScreening {
	hemoglobinElectrophoresis: string;
	sickleCellScreen: string;
	thalassemiaScreen: string;
	hplcResults: string;
	geneticTestingNotes: string;
}

// ─── Bone Marrow Assessment (Step 7) ───────────────────────

export interface BoneMarrowAssessment {
	aspirateFindings: string;
	biopsyFindings: string;
	cellularity: number | null;
	cytogeneticsResults: string;
	flowCytometryResults: string;
	boneMarrowComments: string;
}

// ─── Transfusion History (Step 8) ──────────────────────────

export interface TransfusionHistory {
	previousTransfusions: string;
	transfusionReactions: string;
	bloodGroupType: string;
	antibodyScreen: string;
	crossmatchResults: string;
}

// ─── Treatment & Medications (Step 9) ──────────────────────

export interface TreatmentMedications {
	currentMedications: string;
	chemotherapyRegimen: string;
	anticoagulantTherapy: string;
	ironTherapy: string;
	treatmentResponse: string;
	adverseEffects: string;
}

// ─── Clinical Review (Step 10) ─────────────────────────────

export interface ClinicalReview {
	clinicalSummary: string;
	diagnosis: string;
	followUpPlan: string;
	urgencyLevel: number | null;
	reviewerName: string;
	reviewDate: string;
	additionalNotes: string;
}

// ─── Composite assessment data ─────────────────────────────

export interface AssessmentData {
	patientInformation: PatientInformation;
	bloodCountAnalysis: BloodCountAnalysis;
	coagulationStudies: CoagulationStudies;
	peripheralBloodFilm: PeripheralBloodFilm;
	ironStudies: IronStudies;
	hemoglobinopathyScreening: HemoglobinopathyScreening;
	boneMarrowAssessment: BoneMarrowAssessment;
	transfusionHistory: TransfusionHistory;
	treatmentMedications: TreatmentMedications;
	clinicalReview: ClinicalReview;
}

// ─── Grading result types ──────────────────────────────────

export interface FiredRule {
	id: string;
	category: string;
	description: string;
	concernLevel: string;
}

export interface AdditionalFlag {
	id: string;
	category: string;
	message: string;
	priority: 'high' | 'medium' | 'low';
}

export interface GradingResult {
	abnormalityLevel: AbnormalityLevel;
	abnormalityScore: number;
	firedRules: FiredRule[];
	additionalFlags: AdditionalFlag[];
	timestamp: string;
}

// ─── Step config ───────────────────────────────────────────

export interface StepConfig {
	number: number;
	title: string;
	shortTitle: string;
	section: string;
}
