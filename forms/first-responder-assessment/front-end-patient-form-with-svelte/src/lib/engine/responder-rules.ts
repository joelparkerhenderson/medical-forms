import type { ResponderRule } from './types';
import { competencyToNumber } from './utils';

/**
 * Declarative first responder grading rules.
 * Each rule evaluates assessment data and returns true if the condition is present.
 * Grade 1 = minor finding, 2 = moderate, 3 = significant, 4 = critical.
 */
export const responderRules: ResponderRule[] = [
	// ─── PHYSICAL FITNESS ──────────────────────────────────────
	{
		id: 'PF-001',
		domain: 'Physical Fitness',
		description: 'Cardiovascular fitness not competent',
		grade: 3,
		evaluate: (d) => d.physicalFitness.cardiovascularFitness === 'not-competent'
	},
	{
		id: 'PF-002',
		domain: 'Physical Fitness',
		description: 'Cardiovascular fitness developing',
		grade: 2,
		evaluate: (d) => d.physicalFitness.cardiovascularFitness === 'developing'
	},
	{
		id: 'PF-003',
		domain: 'Physical Fitness',
		description: 'Unable to carry patient on stretcher',
		grade: 4,
		evaluate: (d) => d.physicalFitness.patientCarryAbility === 'no'
	},
	{
		id: 'PF-004',
		domain: 'Physical Fitness',
		description: 'Manual handling not competent',
		grade: 3,
		evaluate: (d) => d.physicalFitness.manualHandlingCompetency === 'not-competent'
	},
	{
		id: 'PF-005',
		domain: 'Physical Fitness',
		description: 'Low VO2 max (<35 ml/kg/min)',
		grade: 2,
		evaluate: (d) => d.physicalFitness.vo2Max !== null && d.physicalFitness.vo2Max < 35
	},
	{
		id: 'PF-006',
		domain: 'Physical Fitness',
		description: 'Very low VO2 max (<25 ml/kg/min)',
		grade: 3,
		evaluate: (d) => d.physicalFitness.vo2Max !== null && d.physicalFitness.vo2Max < 25
	},

	// ─── CLINICAL SKILLS ───────────────────────────────────────
	{
		id: 'CS-001',
		domain: 'Clinical Skills',
		description: 'Basic life support not competent',
		grade: 4,
		evaluate: (d) => d.clinicalSkills.basicLifeSupport === 'not-competent'
	},
	{
		id: 'CS-002',
		domain: 'Clinical Skills',
		description: 'Advanced life support not competent',
		grade: 3,
		evaluate: (d) => d.clinicalSkills.advancedLifeSupport === 'not-competent'
	},
	{
		id: 'CS-003',
		domain: 'Clinical Skills',
		description: 'Airway management not competent',
		grade: 3,
		evaluate: (d) => d.clinicalSkills.airwayManagement === 'not-competent'
	},
	{
		id: 'CS-004',
		domain: 'Clinical Skills',
		description: 'Patient assessment not competent',
		grade: 4,
		evaluate: (d) => d.clinicalSkills.patientAssessment === 'not-competent'
	},
	{
		id: 'CS-005',
		domain: 'Clinical Skills',
		description: 'Trauma assessment not competent',
		grade: 3,
		evaluate: (d) => d.clinicalSkills.traumaAssessment === 'not-competent'
	},
	{
		id: 'CS-006',
		domain: 'Clinical Skills',
		description: 'Triage competency not competent',
		grade: 3,
		evaluate: (d) => d.clinicalSkills.triageCompetency === 'not-competent'
	},
	{
		id: 'CS-007',
		domain: 'Clinical Skills',
		description: 'Drug administration not competent',
		grade: 3,
		evaluate: (d) => d.clinicalSkills.drugAdministration === 'not-competent'
	},
	{
		id: 'CS-008',
		domain: 'Clinical Skills',
		description: 'Multiple clinical skills developing or below',
		grade: 2,
		evaluate: (d) => {
			const skills = [
				d.clinicalSkills.basicLifeSupport,
				d.clinicalSkills.advancedLifeSupport,
				d.clinicalSkills.airwayManagement,
				d.clinicalSkills.patientAssessment,
				d.clinicalSkills.traumaAssessment
			];
			const belowCompetent = skills.filter((s) => s !== '' && competencyToNumber(s) < 3);
			return belowCompetent.length >= 3;
		}
	},

	// ─── EQUIPMENT & VEHICLE ───────────────────────────────────
	{
		id: 'EQ-001',
		domain: 'Equipment',
		description: 'Defibrillator competency not competent',
		grade: 4,
		evaluate: (d) => d.equipmentVehicle.defibrillatorCompetency === 'not-competent'
	},
	{
		id: 'EQ-002',
		domain: 'Equipment',
		description: 'Emergency driving not competent',
		grade: 3,
		evaluate: (d) => d.equipmentVehicle.emergencyDriving === 'not-competent'
	},
	{
		id: 'EQ-003',
		domain: 'Equipment',
		description: 'Does not perform daily vehicle inspection',
		grade: 2,
		evaluate: (d) => d.equipmentVehicle.vehicleDailyInspection === 'no'
	},
	{
		id: 'EQ-004',
		domain: 'Equipment',
		description: 'Stretcher competency not competent',
		grade: 2,
		evaluate: (d) => d.equipmentVehicle.stretcherCompetency === 'not-competent'
	},

	// ─── COMMUNICATION ─────────────────────────────────────────
	{
		id: 'CM-001',
		domain: 'Communication',
		description: 'Handover competency not competent',
		grade: 3,
		evaluate: (d) => d.communicationSkills.handoverCompetency === 'not-competent'
	},
	{
		id: 'CM-002',
		domain: 'Communication',
		description: 'Documentation competency not competent',
		grade: 2,
		evaluate: (d) => d.communicationSkills.documentationCompetency === 'not-competent'
	},
	{
		id: 'CM-003',
		domain: 'Communication',
		description: 'Safeguarding awareness not competent',
		grade: 3,
		evaluate: (d) => d.communicationSkills.safeguardingAwareness === 'not-competent'
	},

	// ─── PSYCHOLOGICAL READINESS ───────────────────────────────
	{
		id: 'PS-001',
		domain: 'Psychological',
		description: 'Positive PTSD screening result',
		grade: 4,
		evaluate: (d) =>
			d.psychologicalReadiness.ptsdScreening === 'yes' &&
			d.psychologicalReadiness.ptsdScreeningResult === 'positive'
	},
	{
		id: 'PS-002',
		domain: 'Psychological',
		description: 'High burnout risk',
		grade: 3,
		evaluate: (d) => d.psychologicalReadiness.burnoutRisk === 'high'
	},
	{
		id: 'PS-003',
		domain: 'Psychological',
		description: 'Poor sleep quality',
		grade: 2,
		evaluate: (d) => d.psychologicalReadiness.sleepQuality === 'poor'
	},
	{
		id: 'PS-004',
		domain: 'Psychological',
		description: 'Decision making under pressure not competent',
		grade: 3,
		evaluate: (d) => d.psychologicalReadiness.decisionMakingUnderPressure === 'not-competent'
	},
	{
		id: 'PS-005',
		domain: 'Psychological',
		description: 'Critical incident exposure without debriefing',
		grade: 2,
		evaluate: (d) =>
			d.psychologicalReadiness.criticalIncidentExposure === 'yes' &&
			d.psychologicalReadiness.criticalIncidentDebriefed === 'no'
	},

	// ─── OCCUPATIONAL HEALTH ───────────────────────────────────
	{
		id: 'OH-001',
		domain: 'Occupational Health',
		description: 'Failed vision test',
		grade: 3,
		evaluate: (d) => d.occupationalHealth.visionTest === 'fail'
	},
	{
		id: 'OH-002',
		domain: 'Occupational Health',
		description: 'Failed hearing test',
		grade: 3,
		evaluate: (d) => d.occupationalHealth.hearingTest === 'fail'
	},
	{
		id: 'OH-003',
		domain: 'Occupational Health',
		description: 'Positive substance misuse screen',
		grade: 4,
		evaluate: (d) => d.occupationalHealth.substanceMisuseScreen === 'positive'
	},
	{
		id: 'OH-004',
		domain: 'Occupational Health',
		description: 'Immunisations incomplete',
		grade: 2,
		evaluate: (d) => d.occupationalHealth.immunisationStatus === 'incomplete'
	},
	{
		id: 'OH-005',
		domain: 'Occupational Health',
		description: 'Musculoskeletal issues present',
		grade: 2,
		evaluate: (d) => d.occupationalHealth.musculoskeletalIssues === 'yes'
	},
	{
		id: 'OH-006',
		domain: 'Occupational Health',
		description: 'Excessive sickness absence (>20 days)',
		grade: 2,
		evaluate: (d) =>
			d.occupationalHealth.sicknessAbsenceDays !== null &&
			d.occupationalHealth.sicknessAbsenceDays > 20
	},

	// ─── CPD & TRAINING ────────────────────────────────────────
	{
		id: 'TR-001',
		domain: 'Training',
		description: 'Mandatory training incomplete',
		grade: 3,
		evaluate: (d) => d.cpdTraining.mandatoryTrainingComplete === 'no'
	},
	{
		id: 'TR-002',
		domain: 'Training',
		description: 'CPD hours below requirement',
		grade: 2,
		evaluate: (d) =>
			d.cpdTraining.cpdHoursLastYear !== null &&
			d.cpdTraining.cpdHoursRequired !== null &&
			d.cpdTraining.cpdHoursLastYear < d.cpdTraining.cpdHoursRequired
	}
];
