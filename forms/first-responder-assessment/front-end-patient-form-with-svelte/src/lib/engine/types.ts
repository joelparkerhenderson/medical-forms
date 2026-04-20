// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Sex = 'male' | 'female' | 'other' | '';
export type CompetencyLevel = 'not-competent' | 'developing' | 'competent' | 'expert' | '';
export type FitnessDecision = 'fit-for-duty' | 'fit-with-restrictions' | 'temporarily-unfit' | 'permanently-unfit' | '';

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	sex: Sex;
	weight: number | null;
	height: number | null;
	bmi: number | null;
}

export interface RoleQualifications {
	roleType: 'paramedic' | 'emt' | 'first-aider' | 'advanced-paramedic' | 'community-responder' | 'other' | '';
	roleTypeOther: string;
	employerOrganisation: string;
	stationBase: string;
	yearsOfService: number | null;
	registrationNumber: string;
	registrationBody: 'hcpc' | 'jrcalc' | 'other' | '';
	registrationExpiryDate: string;
	highestQualification: 'certificate' | 'diploma' | 'foundation-degree' | 'bachelors' | 'masters' | 'doctorate' | 'other' | '';
	qualificationDetails: string;
	drivingLicenceCategory: 'c1' | 'c1e' | 'c' | 'ce' | 'b' | 'none' | '';
	blueLightTrained: YesNo;
}

export interface PhysicalFitness {
	cardiovascularFitness: CompetencyLevel;
	shuttleRunLevel: number | null;
	vo2Max: number | null;
	muscularStrength: CompetencyLevel;
	gripStrengthKg: number | null;
	manualHandlingCompetency: CompetencyLevel;
	patientCarryAbility: YesNo;
	flexibilityMobility: CompetencyLevel;
	balanceCoordination: CompetencyLevel;
	restingHeartRateBpm: number | null;
	bloodPressureSystolic: number | null;
	bloodPressureDiastolic: number | null;
	physicalFitnessNotes: string;
}

export interface ClinicalSkills {
	basicLifeSupport: CompetencyLevel;
	advancedLifeSupport: CompetencyLevel;
	airwayManagement: CompetencyLevel;
	ivCannulation: CompetencyLevel;
	drugAdministration: CompetencyLevel;
	traumaAssessment: CompetencyLevel;
	immobilisationSplinting: CompetencyLevel;
	ecgInterpretation: CompetencyLevel;
	patientAssessment: CompetencyLevel;
	triageCompetency: CompetencyLevel;
	paediatricCompetency: CompetencyLevel;
	obstetricCompetency: CompetencyLevel;
	clinicalSkillsNotes: string;
}

export interface EquipmentVehicle {
	defibrillatorCompetency: CompetencyLevel;
	monitorCompetency: CompetencyLevel;
	ventilatorCompetency: CompetencyLevel;
	suctionCompetency: CompetencyLevel;
	stretcherCompetency: CompetencyLevel;
	scoopCompetency: CompetencyLevel;
	ambulanceDriving: CompetencyLevel;
	emergencyDriving: CompetencyLevel;
	vehicleDailyInspection: YesNo;
	equipmentCheckCompetency: CompetencyLevel;
	radioCommunications: CompetencyLevel;
	equipmentVehicleNotes: string;
}

export interface CommunicationSkills {
	patientCommunication: CompetencyLevel;
	relativeCommunication: CompetencyLevel;
	handoverCompetency: CompetencyLevel;
	documentationCompetency: CompetencyLevel;
	multidisciplinaryTeamwork: CompetencyLevel;
	conflictResolution: CompetencyLevel;
	safeguardingAwareness: CompetencyLevel;
	breakingBadNews: CompetencyLevel;
	communicationNotes: string;
}

export interface PsychologicalReadiness {
	stressManagement: CompetencyLevel;
	resilienceLevel: 'low' | 'moderate' | 'good' | 'excellent' | '';
	ptsdScreening: YesNo;
	ptsdScreeningResult: 'negative' | 'positive' | 'inconclusive' | '';
	criticalIncidentExposure: YesNo;
	criticalIncidentDetails: string;
	criticalIncidentDebriefed: YesNo;
	sleepQuality: 'good' | 'fair' | 'poor' | '';
	burnoutRisk: 'low' | 'moderate' | 'high' | '';
	decisionMakingUnderPressure: CompetencyLevel;
	emotionalRegulation: CompetencyLevel;
	psychologicalNotes: string;
}

export interface OccupationalHealth {
	visionTest: 'pass' | 'fail' | 'refer' | '';
	visionCorrected: YesNo;
	hearingTest: 'pass' | 'fail' | 'refer' | '';
	hearingAidRequired: YesNo;
	immunisationStatus: 'up-to-date' | 'incomplete' | 'unknown' | '';
	hepatitisBImmune: YesNo;
	currentMedications: string;
	substanceMisuseScreen: 'negative' | 'positive' | 'not-done' | '';
	musculoskeletalIssues: YesNo;
	musculoskeletalDetails: string;
	respiratoryIssues: YesNo;
	respiratoryDetails: string;
	skinConditions: YesNo;
	skinConditionDetails: string;
	sicknessAbsenceDays: number | null;
	occupationalHealthNotes: string;
}

export interface CpdTraining {
	cpdHoursLastYear: number | null;
	cpdHoursRequired: number | null;
	mandatoryTrainingComplete: YesNo;
	blsRecertificationDate: string;
	alsRecertificationDate: string;
	manualHandlingRecertificationDate: string;
	safeguardingTrainingDate: string;
	infectionControlTrainingDate: string;
	majorIncidentTraining: YesNo;
	majorIncidentTrainingDate: string;
	mentoringCapability: CompetencyLevel;
	clinicalSupervisionAttendance: YesNo;
	reflectivePractice: CompetencyLevel;
	cpdTrainingNotes: string;
}

export interface FitnessDecisionData {
	overallFitness: FitnessDecision;
	restrictionsDetails: string;
	reassessmentRequired: YesNo;
	reassessmentDate: string;
	remedialActions: string;
	referralsRequired: string;
	assessorName: string;
	assessorRole: string;
	assessorRegistration: string;
	assessmentDate: string;
	countersignatureName: string;
	countersignatureDate: string;
	fitnessDecisionNotes: string;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	roleQualifications: RoleQualifications;
	physicalFitness: PhysicalFitness;
	clinicalSkills: ClinicalSkills;
	equipmentVehicle: EquipmentVehicle;
	communicationSkills: CommunicationSkills;
	psychologicalReadiness: PsychologicalReadiness;
	occupationalHealth: OccupationalHealth;
	cpdTraining: CpdTraining;
	fitnessDecision: FitnessDecisionData;
}

// ──────────────────────────────────────────────
// Grading types
// ──────────────────────────────────────────────

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface ResponderRule {
	id: string;
	domain: string;
	description: string;
	grade: number;
	evaluate: (data: AssessmentData) => boolean;
}

export interface FiredRule {
	id: string;
	domain: string;
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
	overallCompetency: CompetencyLevel;
	overallFitness: FitnessDecision;
	overallRisk: RiskLevel;
	domainLevels: {
		physicalFitness: CompetencyLevel;
		clinicalSkills: CompetencyLevel;
		equipmentVehicle: CompetencyLevel;
		communication: CompetencyLevel;
		psychological: CompetencyLevel;
	};
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
