import type { AssessmentData, AdditionalFlag } from './types';
import { calculatePhq9Score, calculateGad7Score, calculateAuditCScore } from './mh-rules';

/**
 * Detects additional flags that should be highlighted for the clinician,
 * independent of PHQ-9/GAD-7 scores. These are safety-critical alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// ─── Suicidal ideation alerts ────────────────────────────
	if (data.riskAssessment.suicidalIdeation === 'active-with-plan') {
		flags.push({
			id: 'FLAG-SI-001',
			category: 'Suicidal Ideation',
			message: 'ACTIVE suicidal ideation WITH PLAN - immediate safety assessment required',
			priority: 'high'
		});
	} else if (data.riskAssessment.suicidalIdeation === 'active-no-plan') {
		flags.push({
			id: 'FLAG-SI-002',
			category: 'Suicidal Ideation',
			message: 'Active suicidal ideation without plan - safety assessment required',
			priority: 'high'
		});
	} else if (data.riskAssessment.suicidalIdeation === 'passive') {
		flags.push({
			id: 'FLAG-SI-003',
			category: 'Suicidal Ideation',
			message: 'Passive suicidal ideation reported - monitor closely',
			priority: 'high'
		});
	}

	// ─── PHQ-9 item 9 (suicidal thoughts) ───────────────────
	if (data.phqResponses.suicidalThoughts !== null && data.phqResponses.suicidalThoughts > 0) {
		flags.push({
			id: 'FLAG-PHQ9-SI',
			category: 'Suicidal Ideation',
			message: `PHQ-9 Item 9 (thoughts of self-harm) scored ${data.phqResponses.suicidalThoughts}/3 - requires follow-up`,
			priority: 'high'
		});
	}

	// ─── Self-harm alerts ───────────────────────────────────
	if (data.riskAssessment.selfHarm === 'current') {
		flags.push({
			id: 'FLAG-SH-001',
			category: 'Self-Harm',
			message: 'CURRENT self-harm reported - immediate intervention needed',
			priority: 'high'
		});
	} else if (data.riskAssessment.selfHarm === 'past') {
		flags.push({
			id: 'FLAG-SH-002',
			category: 'Self-Harm',
			message: 'History of self-harm reported',
			priority: 'medium'
		});
	}

	// ─── Harm to others ─────────────────────────────────────
	if (data.riskAssessment.harmToOthers === 'intent') {
		flags.push({
			id: 'FLAG-HO-001',
			category: 'Harm to Others',
			message: 'Intent to harm others reported - duty to warn assessment required',
			priority: 'high'
		});
	} else if (data.riskAssessment.harmToOthers === 'thoughts') {
		flags.push({
			id: 'FLAG-HO-002',
			category: 'Harm to Others',
			message: 'Thoughts of harm to others reported - clinical assessment required',
			priority: 'high'
		});
	}

	// ─── Severe depression ──────────────────────────────────
	const phq9Score = calculatePhq9Score(data.phqResponses);
	if (phq9Score !== null && phq9Score >= 20) {
		flags.push({
			id: 'FLAG-DEP-001',
			category: 'Depression',
			message: `Severe depression (PHQ-9: ${phq9Score}/27) - urgent clinical review recommended`,
			priority: 'high'
		});
	} else if (phq9Score !== null && phq9Score >= 15) {
		flags.push({
			id: 'FLAG-DEP-002',
			category: 'Depression',
			message: `Moderately severe depression (PHQ-9: ${phq9Score}/27) - treatment adjustment may be needed`,
			priority: 'medium'
		});
	}

	// ─── Severe anxiety ─────────────────────────────────────
	const gad7Score = calculateGad7Score(data.gadResponses);
	if (gad7Score !== null && gad7Score >= 15) {
		flags.push({
			id: 'FLAG-ANX-001',
			category: 'Anxiety',
			message: `Severe anxiety (GAD-7: ${gad7Score}/21) - clinical review recommended`,
			priority: 'medium'
		});
	}

	// ─── Substance abuse ────────────────────────────────────
	const auditC = calculateAuditCScore(
		data.substanceUse.alcoholFrequency,
		data.substanceUse.alcoholQuantity,
		data.substanceUse.bingeDrinking
	);
	if (auditC !== null && auditC >= 4) {
		flags.push({
			id: 'FLAG-SUB-001',
			category: 'Substance Use',
			message: `Elevated AUDIT-C score (${auditC}/12) - hazardous drinking screen positive`,
			priority: 'high'
		});
	}

	if (data.substanceUse.drugUse === 'regular') {
		flags.push({
			id: 'FLAG-SUB-002',
			category: 'Substance Use',
			message: 'Regular drug use reported - substance use assessment recommended',
			priority: 'high'
		});
	} else if (data.substanceUse.drugUse === 'occasional') {
		flags.push({
			id: 'FLAG-SUB-003',
			category: 'Substance Use',
			message: 'Occasional drug use reported',
			priority: 'medium'
		});
	}

	// ─── No safety plan ─────────────────────────────────────
	if (
		data.riskAssessment.suicidalIdeation !== '' &&
		data.riskAssessment.suicidalIdeation !== 'none' &&
		data.riskAssessment.hasSafetyPlan === 'no'
	) {
		flags.push({
			id: 'FLAG-SAFETY-001',
			category: 'Safety Planning',
			message: 'Suicidal ideation present but NO safety plan in place',
			priority: 'high'
		});
	}

	// ─── Housing instability ────────────────────────────────
	if (data.socialFunctional.housingStatus === 'homeless') {
		flags.push({
			id: 'FLAG-SOCIAL-001',
			category: 'Social',
			message: 'Patient is homeless - social services referral recommended',
			priority: 'high'
		});
	} else if (data.socialFunctional.housingStatus === 'unstable') {
		flags.push({
			id: 'FLAG-SOCIAL-002',
			category: 'Social',
			message: 'Unstable housing reported - may affect treatment adherence',
			priority: 'medium'
		});
	}

	// ─── No support system ──────────────────────────────────
	if (data.socialFunctional.supportSystem === 'none') {
		flags.push({
			id: 'FLAG-SOCIAL-003',
			category: 'Social',
			message: 'No support system identified - increased isolation risk',
			priority: 'medium'
		});
	}

	// ─── Severe functional impairment ───────────────────────
	if (data.socialFunctional.functionalImpairment === 'severe') {
		flags.push({
			id: 'FLAG-FUNC-001',
			category: 'Functional',
			message: 'Severe functional impairment reported',
			priority: 'medium'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
