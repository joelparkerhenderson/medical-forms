import type { AssessmentData, AdditionalFlag } from './types';

/**
 * Detects additional flags that should be highlighted for the clinician,
 * independent of AQ-10 score. These are clinically significant alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// ─── High AQ-10 score ────────────────────────────────────
	const aq10Scores = [
		data.aq10Questionnaire.q1, data.aq10Questionnaire.q2,
		data.aq10Questionnaire.q3, data.aq10Questionnaire.q4,
		data.aq10Questionnaire.q5, data.aq10Questionnaire.q6,
		data.aq10Questionnaire.q7, data.aq10Questionnaire.q8,
		data.aq10Questionnaire.q9, data.aq10Questionnaire.q10
	];
	const totalAQ10 = aq10Scores.reduce((sum, s) => sum + (s ?? 0), 0);

	if (totalAQ10 >= 6) {
		flags.push({
			id: 'FLAG-AQ10-HIGH-001',
			category: 'AQ-10 Score',
			message: `AQ-10 score ${totalAQ10}/10 meets threshold (>=6) - refer for comprehensive autism assessment`,
			priority: 'high'
		});
	}

	// ─── Severe sensory issues ──────────────────────────────
	const sensoryFields = [
		data.sensoryProfile.visualSensitivity,
		data.sensoryProfile.auditorySensitivity,
		data.sensoryProfile.tactileSensitivity,
		data.sensoryProfile.olfactorySensitivity,
		data.sensoryProfile.gustatorySensitivity
	];
	const severeSensoryCount = sensoryFields.filter((s) => s === 'severe').length;

	if (severeSensoryCount >= 2) {
		flags.push({
			id: 'FLAG-SENSORY-001',
			category: 'Sensory Profile',
			message: `${severeSensoryCount} severe sensory sensitivities reported - consider occupational therapy referral`,
			priority: 'high'
		});
	}

	if (severeSensoryCount === 1) {
		flags.push({
			id: 'FLAG-SENSORY-002',
			category: 'Sensory Profile',
			message: 'Severe sensory sensitivity reported in one modality - monitor and assess further',
			priority: 'medium'
		});
	}

	// ─── Social communication difficulties ──────────────────
	if (
		data.socialCommunication.eyeContact === 'never' ||
		data.socialCommunication.eyeContact === 'rarely'
	) {
		flags.push({
			id: 'FLAG-SOCIAL-001',
			category: 'Social Communication',
			message: 'Significant eye contact difficulties reported - assess for social communication disorder',
			priority: 'medium'
		});
	}

	if (
		data.socialCommunication.socialReciprocity === 'never' ||
		data.socialCommunication.socialReciprocity === 'rarely'
	) {
		flags.push({
			id: 'FLAG-SOCIAL-002',
			category: 'Social Communication',
			message: 'Significant difficulties with social reciprocity - further evaluation recommended',
			priority: 'medium'
		});
	}

	if (
		data.socialCommunication.conversationSkills === 'never' ||
		data.socialCommunication.conversationSkills === 'rarely'
	) {
		flags.push({
			id: 'FLAG-SOCIAL-003',
			category: 'Social Communication',
			message: 'Significant conversation difficulties reported - assess communication support needs',
			priority: 'medium'
		});
	}

	// ─── Repetitive behaviors ───────────────────────────────
	if (data.repetitiveBehaviors.repetitiveMovements === 'yes') {
		flags.push({
			id: 'FLAG-REPETITIVE-001',
			category: 'Repetitive Behaviors',
			message: `Repetitive movements reported: ${data.repetitiveBehaviors.repetitiveMovementsDetails || 'details not specified'}`,
			priority: 'medium'
		});
	}

	if (data.repetitiveBehaviors.resistanceToChange === 'always') {
		flags.push({
			id: 'FLAG-REPETITIVE-002',
			category: 'Repetitive Behaviors',
			message: 'Extreme resistance to change reported - may indicate inflexible behavioral patterns',
			priority: 'medium'
		});
	}

	if (
		data.repetitiveBehaviors.routineAdherence === 'always' &&
		data.repetitiveBehaviors.resistanceToChange === 'always'
	) {
		flags.push({
			id: 'FLAG-REPETITIVE-003',
			category: 'Repetitive Behaviors',
			message: 'Strict routine adherence combined with extreme resistance to change - high likelihood of restrictive behavior pattern',
			priority: 'high'
		});
	}

	// ─── Developmental delays ───────────────────────────────
	if (data.developmentalHistory.languageMilestones.toLowerCase().includes('delay') ||
		data.developmentalHistory.languageMilestones.toLowerCase().includes('late')) {
		flags.push({
			id: 'FLAG-DEV-001',
			category: 'Developmental History',
			message: 'Language developmental delays noted - consider speech and language assessment',
			priority: 'medium'
		});
	}

	if (data.developmentalHistory.motorMilestones.toLowerCase().includes('delay') ||
		data.developmentalHistory.motorMilestones.toLowerCase().includes('late')) {
		flags.push({
			id: 'FLAG-DEV-002',
			category: 'Developmental History',
			message: 'Motor developmental delays noted - consider occupational therapy assessment',
			priority: 'medium'
		});
	}

	// ─── Family history of autism ───────────────────────────
	if (data.familyHistory.autismFamily === 'yes') {
		flags.push({
			id: 'FLAG-FAMILY-ASD-001',
			category: 'Family History',
			message: `Family history of autism: ${data.familyHistory.autismFamilyDetails || 'details not specified'} - increased genetic predisposition`,
			priority: 'high'
		});
	}

	// ─── Family history of ADHD ─────────────────────────────
	if (data.familyHistory.adhdFamily === 'yes') {
		flags.push({
			id: 'FLAG-FAMILY-ADHD-001',
			category: 'Family History',
			message: `Family history of ADHD: ${data.familyHistory.adhdFamilyDetails || 'details not specified'} - consider comorbid assessment`,
			priority: 'medium'
		});
	}

	// ─── Family history of learning disabilities ─────────────
	if (data.familyHistory.learningDisabilities === 'yes') {
		flags.push({
			id: 'FLAG-FAMILY-LD-001',
			category: 'Family History',
			message: `Family history of learning disabilities: ${data.familyHistory.learningDisabilitiesDetails || 'details not specified'}`,
			priority: 'low'
		});
	}

	// ─── Family history of mental health conditions ──────────
	if (data.familyHistory.mentalHealthFamily === 'yes') {
		flags.push({
			id: 'FLAG-FAMILY-MH-001',
			category: 'Family History',
			message: `Family history of mental health conditions: ${data.familyHistory.mentalHealthFamilyDetails || 'details not specified'}`,
			priority: 'low'
		});
	}

	// ─── Previous assessments ───────────────────────────────
	if (data.screeningPurpose.previousAssessments === 'yes') {
		flags.push({
			id: 'FLAG-PREV-001',
			category: 'Previous Assessment',
			message: `Previous autism assessments noted: ${data.screeningPurpose.previousAssessmentDetails || 'details not specified'} - review prior findings`,
			priority: 'medium'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
