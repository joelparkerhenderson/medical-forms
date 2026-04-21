import type { AssessmentData, AdditionalFlag } from './types';

/**
 * Detects additional flags that should be highlighted for the assessor,
 * independent of competency grading. These are safety-critical alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// ─── BLS not competent (HIGH) ──────────────────────────────
	if (data.clinicalSkills.basicLifeSupport === 'not-competent') {
		flags.push({
			id: 'FLAG-BLS-001',
			category: 'Clinical Skills',
			message: 'Basic life support not competent - IMMEDIATE REMEDIATION REQUIRED',
			priority: 'high'
		});
	}

	// ─── Patient assessment not competent (HIGH) ───────────────
	if (data.clinicalSkills.patientAssessment === 'not-competent') {
		flags.push({
			id: 'FLAG-PA-001',
			category: 'Clinical Skills',
			message: 'Patient assessment (ABCDE) not competent - CANNOT OPERATE INDEPENDENTLY',
			priority: 'high'
		});
	}

	// ─── Defibrillator not competent (HIGH) ────────────────────
	if (data.equipmentVehicle.defibrillatorCompetency === 'not-competent') {
		flags.push({
			id: 'FLAG-DEFIB-001',
			category: 'Equipment',
			message: 'Defibrillator competency not met - URGENT TRAINING REQUIRED',
			priority: 'high'
		});
	}

	// ─── Positive PTSD screening (HIGH) ────────────────────────
	if (
		data.psychologicalReadiness.ptsdScreening === 'yes' &&
		data.psychologicalReadiness.ptsdScreeningResult === 'positive'
	) {
		flags.push({
			id: 'FLAG-PTSD-001',
			category: 'Psychological',
			message: 'Positive PTSD screening - OCCUPATIONAL HEALTH REFERRAL REQUIRED',
			priority: 'high'
		});
	}

	// ─── Positive substance misuse screen (HIGH) ───────────────
	if (data.occupationalHealth.substanceMisuseScreen === 'positive') {
		flags.push({
			id: 'FLAG-SUBSTANCE-001',
			category: 'Occupational Health',
			message: 'Positive substance misuse screening - IMMEDIATE MANAGEMENT REFERRAL',
			priority: 'high'
		});
	}

	// ─── Unable to carry patient (HIGH) ────────────────────────
	if (data.physicalFitness.patientCarryAbility === 'no') {
		flags.push({
			id: 'FLAG-CARRY-001',
			category: 'Physical Fitness',
			message: 'Unable to carry patient on stretcher - RESTRICTED DUTIES REQUIRED',
			priority: 'high'
		});
	}

	// ─── Failed vision test (HIGH) ─────────────────────────────
	if (data.occupationalHealth.visionTest === 'fail') {
		flags.push({
			id: 'FLAG-VISION-001',
			category: 'Occupational Health',
			message: 'Failed vision test - DRIVING AND CLINICAL DUTIES MAY BE AFFECTED',
			priority: 'high'
		});
	}

	// ─── Critical incident without debrief (MEDIUM) ────────────
	if (
		data.psychologicalReadiness.criticalIncidentExposure === 'yes' &&
		data.psychologicalReadiness.criticalIncidentDebriefed === 'no'
	) {
		flags.push({
			id: 'FLAG-DEBRIEF-001',
			category: 'Psychological',
			message: `Critical incident exposure without debriefing: ${data.psychologicalReadiness.criticalIncidentDetails || 'details not specified'}`,
			priority: 'medium'
		});
	}

	// ─── High burnout risk (MEDIUM) ────────────────────────────
	if (data.psychologicalReadiness.burnoutRisk === 'high') {
		flags.push({
			id: 'FLAG-BURNOUT-001',
			category: 'Psychological',
			message: 'High burnout risk - consider workload review and wellbeing support',
			priority: 'medium'
		});
	}

	// ─── Mandatory training incomplete (MEDIUM) ────────────────
	if (data.cpdTraining.mandatoryTrainingComplete === 'no') {
		flags.push({
			id: 'FLAG-TRAINING-001',
			category: 'Training',
			message: 'Mandatory training incomplete - schedule completion urgently',
			priority: 'medium'
		});
	}

	// ─── Immunisations incomplete (MEDIUM) ─────────────────────
	if (data.occupationalHealth.immunisationStatus === 'incomplete') {
		flags.push({
			id: 'FLAG-IMMUN-001',
			category: 'Occupational Health',
			message: 'Immunisations incomplete - occupational health review required',
			priority: 'medium'
		});
	}

	// ─── Musculoskeletal issues (MEDIUM) ───────���───────────────
	if (data.occupationalHealth.musculoskeletalIssues === 'yes') {
		flags.push({
			id: 'FLAG-MSK-001',
			category: 'Occupational Health',
			message: `Musculoskeletal issues: ${data.occupationalHealth.musculoskeletalDetails || 'details not specified'}`,
			priority: 'medium'
		});
	}

	// ─── Safeguarding not competent (MEDIUM) ───────────────────
	if (data.communicationSkills.safeguardingAwareness === 'not-competent') {
		flags.push({
			id: 'FLAG-SAFEGUARD-001',
			category: 'Communication',
			message: 'Safeguarding awareness not competent - training required before patient contact',
			priority: 'medium'
		});
	}

	// ─── CPD shortfall (LOW) ───────────────────────────────────
	if (
		data.cpdTraining.cpdHoursLastYear !== null &&
		data.cpdTraining.cpdHoursRequired !== null &&
		data.cpdTraining.cpdHoursLastYear < data.cpdTraining.cpdHoursRequired
	) {
		flags.push({
			id: 'FLAG-CPD-001',
			category: 'Training',
			message: `CPD shortfall: ${data.cpdTraining.cpdHoursLastYear} of ${data.cpdTraining.cpdHoursRequired} required hours completed`,
			priority: 'low'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
