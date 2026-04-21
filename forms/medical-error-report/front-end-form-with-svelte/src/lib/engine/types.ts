// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type YesNoNA = 'yes' | 'no' | 'not-applicable' | '';
export type Sex = 'male' | 'female' | 'other' | '';

export type ReporterRole = 'doctor' | 'nurse' | 'pharmacist' | 'allied-health' | 'administrator' | 'patient' | 'other' | '';
export type LocationType = 'inpatient-ward' | 'outpatient-clinic' | 'emergency-department' | 'operating-theatre' | 'pharmacy' | 'laboratory' | 'radiology' | 'community' | 'other' | '';
export type ShiftType = 'day' | 'evening' | 'night' | 'weekend' | 'bank-holiday' | '';
export type StaffingLevel = 'adequate' | 'understaffed' | 'overstaffed' | 'unknown' | '';
export type ErrorType = 'medication' | 'surgical' | 'diagnostic' | 'treatment' | 'communication' | 'equipment' | 'fall' | 'infection' | 'transfusion' | 'other' | '';
export type MedicationErrorStage = 'prescribing' | 'dispensing' | 'administration' | 'monitoring' | 'other' | '';
export type WHOSeverity = 'near-miss' | 'mild' | 'moderate' | 'severe' | 'critical' | '';
export type NCCMERPCategory = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | '';
export type Preventability = 'clearly-preventable' | 'probably-preventable' | 'probably-not-preventable' | 'clearly-not-preventable' | 'unknown' | '';
export type RecurrenceLikelihood = 'very-likely' | 'likely' | 'unlikely' | 'very-unlikely' | 'unknown' | '';
export type HarmLevel = 'none' | 'low' | 'moderate' | 'severe' | 'death' | '';
export type RootCauseCategory = 'human-error' | 'system-failure' | 'process-failure' | 'communication' | 'training' | 'equipment' | 'environmental' | 'organisational' | 'multiple' | 'other' | '';
export type ActionsStatus = 'planned' | 'in-progress' | 'completed' | 'overdue' | '';
export type FinalStatus = 'open' | 'under-review' | 'closed' | '';

export interface Demographics {
	reporterFirstName: string;
	reporterLastName: string;
	reporterRole: ReporterRole;
	reporterDepartment: string;
	reporterContactPhone: string;
	reporterContactEmail: string;
	facilityName: string;
	facilityWard: string;
	reportDate: string;
	anonymousReport: YesNo;
}

export interface IncidentDetails {
	incidentDate: string;
	incidentTime: string;
	discoveryDate: string;
	discoveryTime: string;
	locationType: LocationType;
	locationDetails: string;
	incidentSummary: string;
	incidentWitnessed: YesNo;
	witnessDetails: string;
	shiftType: ShiftType;
	staffingLevel: StaffingLevel;
}

export interface PatientInvolvement {
	patientInvolved: YesNo;
	patientFirstName: string;
	patientLastName: string;
	patientNhsNumber: string;
	patientDateOfBirth: string;
	patientSex: Sex;
	patientAgeAtIncident: number | null;
	patientInformed: YesNo;
	patientInformedDate: string;
	patientInformedBy: string;
	dutyOfCandourApplies: YesNo;
	dutyOfCandourCompleted: YesNo;
}

export interface ErrorClassification {
	errorType: ErrorType;
	errorTypeDetails: string;
	medicationErrorStage: MedicationErrorStage;
	whoSeverity: WHOSeverity;
	nccMerpCategory: NCCMERPCategory;
	preventability: Preventability;
	recurrenceLikelihood: RecurrenceLikelihood;
}

export interface ContributingFactors {
	staffFatigue: YesNo;
	inadequateTraining: YesNo;
	communicationFailure: YesNo;
	communicationFailureDetails: string;
	handoverFailure: YesNo;
	equipmentFailure: YesNo;
	equipmentFailureDetails: string;
	environmentalFactors: YesNo;
	environmentalDetails: string;
	policyNotFollowed: YesNo;
	policyDetails: string;
	workloadPressure: YesNo;
	patientFactors: YesNo;
	patientFactorsDetails: string;
	otherFactors: string;
}

export interface ImmediateActions {
	patientAssessed: YesNoNA;
	treatmentProvided: YesNoNA;
	treatmentDetails: string;
	errorContained: YesNo;
	containmentDetails: string;
	seniorStaffNotified: YesNo;
	seniorStaffName: string;
	seniorStaffRole: string;
	riskTeamNotified: YesNo;
	additionalMonitoring: YesNo;
	monitoringDetails: string;
	immediateActionsSummary: string;
}

export interface PatientOutcome {
	harmReachedPatient: YesNo;
	harmLevel: HarmLevel;
	harmDescription: string;
	additionalTreatmentRequired: YesNo;
	additionalTreatmentDetails: string;
	extendedHospitalStay: YesNo;
	extraDays: number | null;
	readmissionRequired: YesNo;
	permanentDisability: YesNo;
	disabilityDetails: string;
	patientDied: YesNo;
	deathDate: string;
	outcomeNotes: string;
}

export interface RootCauseAnalysis {
	rcaConducted: 'yes' | 'no' | 'pending' | '';
	rcaDate: string;
	rcaLead: string;
	rcaTeamMembers: string;
	rootCauseCategory: RootCauseCategory;
	rootCauseDescription: string;
	fiveWhysAnalysis: string;
	fishboneFactors: string;
	systemVulnerabilities: string;
	similarIncidents: 'yes' | 'no' | 'unknown' | '';
	similarIncidentsDetails: string;
	rcaFindingsSummary: string;
}

export interface CorrectiveActions {
	immediateCorrectiveActions: string;
	longTermCorrectiveActions: string;
	policyChangeRequired: YesNo;
	policyChangeDetails: string;
	trainingRequired: YesNo;
	trainingDetails: string;
	equipmentChangeRequired: YesNo;
	equipmentChangeDetails: string;
	processRedesignRequired: YesNo;
	processRedesignDetails: string;
	responsiblePerson: string;
	targetCompletionDate: string;
	actionsStatus: ActionsStatus;
}

export interface ReportingFollowup {
	internalReference: string;
	reportedToDatix: YesNo;
	datixReference: string;
	reportedToNrls: YesNo;
	nrlsReference: string;
	reportedToCqc: YesNo;
	reportedToHsib: YesNo;
	reportedToCoroner: YesNo;
	safeguardingReferral: YesNo;
	lessonsLearned: string;
	sharedWithTeam: YesNo;
	followUpReviewDate: string;
	followUpReviewer: string;
	finalStatus: FinalStatus;
	closureDate: string;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	incidentDetails: IncidentDetails;
	patientInvolvement: PatientInvolvement;
	errorClassification: ErrorClassification;
	contributingFactors: ContributingFactors;
	immediateActions: ImmediateActions;
	patientOutcome: PatientOutcome;
	rootCauseAnalysis: RootCauseAnalysis;
	correctiveActions: CorrectiveActions;
	reportingFollowup: ReportingFollowup;
}

// ──────────────────────────────────────────────
// Error grading types
// ──────────────────────────────────────────────

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface ErrorRule {
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
	whoSeverity: WHOSeverity;
	nccMerpCategory: NCCMERPCategory;
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
