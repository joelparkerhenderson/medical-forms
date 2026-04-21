import type { AssessmentData, AdditionalFlag } from './types';

/**
 * Detects additional flags that should be highlighted for the paediatrician,
 * independent of the developmental screen result. These are safety-critical alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// ─── Failure to thrive ──────────────────────────────────
	if (data.growthNutrition.failureToThrive === 'yes') {
		flags.push({
			id: 'FLAG-FTT-001',
			category: 'Growth',
			message: 'Failure to thrive - urgent nutritional and medical assessment required',
			priority: 'high'
		});
	}

	// ─── Weight below 3rd percentile ────────────────────────
	if (
		data.growthNutrition.weightPercentile !== null &&
		data.growthNutrition.weightPercentile < 3
	) {
		flags.push({
			id: 'FLAG-GROWTH-001',
			category: 'Growth',
			message: `Weight below 3rd percentile (${data.growthNutrition.weightPercentile}th percentile)`,
			priority: 'high'
		});
	}

	// ─── Head circumference below 3rd percentile ────────────
	if (
		data.growthNutrition.headCircumferencePercentile !== null &&
		data.growthNutrition.headCircumferencePercentile < 3
	) {
		flags.push({
			id: 'FLAG-GROWTH-002',
			category: 'Growth',
			message: `Head circumference below 3rd percentile - consider neurological evaluation`,
			priority: 'high'
		});
	}

	// ─── Missed vaccinations ────────────────────────────────
	if (data.immunizationStatus.upToDate === 'no') {
		flags.push({
			id: 'FLAG-IMMUN-001',
			category: 'Immunization',
			message: `Immunizations not up to date${data.immunizationStatus.missingVaccinations ? ': ' + data.immunizationStatus.missingVaccinations : ''}`,
			priority: 'medium'
		});
	}

	// ─── Vaccine adverse reactions ──────────────────────────
	if (data.immunizationStatus.adverseReactions === 'yes') {
		flags.push({
			id: 'FLAG-IMMUN-002',
			category: 'Immunization',
			message: `Previous vaccine adverse reaction: ${data.immunizationStatus.adverseReactionDetails || 'details not specified'}`,
			priority: 'medium'
		});
	}

	// ─── Developmental delay (any fail domain) ──────────────
	const devDomains = [
		{ name: 'Gross Motor', result: data.developmentalMilestones.grossMotor },
		{ name: 'Fine Motor', result: data.developmentalMilestones.fineMotor },
		{ name: 'Language', result: data.developmentalMilestones.language },
		{ name: 'Social-Emotional', result: data.developmentalMilestones.socialEmotional },
		{ name: 'Cognitive', result: data.developmentalMilestones.cognitive }
	];

	const failedDomains = devDomains.filter((d) => d.result === 'fail');
	if (failedDomains.length > 0) {
		flags.push({
			id: 'FLAG-DEV-001',
			category: 'Developmental Delay',
			message: `Developmental delay identified in: ${failedDomains.map((d) => d.name).join(', ')}`,
			priority: 'high'
		});
	}

	const concernDomains = devDomains.filter((d) => d.result === 'concern');
	if (concernDomains.length > 0) {
		flags.push({
			id: 'FLAG-DEV-002',
			category: 'Developmental Concern',
			message: `Developmental concern noted in: ${concernDomains.map((d) => d.name).join(', ')}`,
			priority: 'medium'
		});
	}

	// ─── Safeguarding concern ───────────────────────────────
	if (data.socialEnvironmental.safeguardingConcerns === 'yes') {
		flags.push({
			id: 'FLAG-SAFEGUARD-001',
			category: 'Safeguarding',
			message: `Safeguarding concern: ${data.socialEnvironmental.safeguardingDetails || 'details not specified'} - IMMEDIATE ACTION REQUIRED`,
			priority: 'high'
		});
	}

	// ─── NICU history ───────────────────────────────────────
	if (data.birthHistory.nicuStay === 'yes') {
		flags.push({
			id: 'FLAG-NICU-001',
			category: 'Birth History',
			message: `NICU stay${data.birthHistory.nicuDuration ? ` (${data.birthHistory.nicuDuration} days)` : ''} - monitor developmental milestones closely`,
			priority: 'medium'
		});
	}

	// ─── Preterm birth ──────────────────────────────────────
	if (
		data.birthHistory.gestationalAge !== null &&
		data.birthHistory.gestationalAge < 37
	) {
		flags.push({
			id: 'FLAG-PRETERM-001',
			category: 'Birth History',
			message: `Preterm birth at ${data.birthHistory.gestationalAge} weeks gestation`,
			priority: data.birthHistory.gestationalAge < 32 ? 'high' : 'medium'
		});
	}

	// ─── Low APGAR ──────────────────────────────────────────
	if (
		data.birthHistory.apgarFiveMinutes !== null &&
		data.birthHistory.apgarFiveMinutes < 7
	) {
		flags.push({
			id: 'FLAG-APGAR-001',
			category: 'Birth History',
			message: `Low 5-minute APGAR score (${data.birthHistory.apgarFiveMinutes})`,
			priority: 'medium'
		});
	}

	// ─── Birth complications ────────────────────────────────
	if (data.birthHistory.birthComplications === 'yes') {
		flags.push({
			id: 'FLAG-BIRTH-001',
			category: 'Birth History',
			message: `Birth complications: ${data.birthHistory.birthComplicationDetails || 'details not specified'}`,
			priority: 'medium'
		});
	}

	// ─── Allergy alerts ─────────────────────────────────────
	for (const [i, allergy] of data.currentMedications.allergies.entries()) {
		if (allergy.severity === 'anaphylaxis') {
			flags.push({
				id: `FLAG-ALLERGY-ANAPH-${i}`,
				category: 'Allergy',
				message: `ANAPHYLAXIS history: ${allergy.allergen}`,
				priority: 'high'
			});
		}
	}

	if (data.currentMedications.allergies.length > 0) {
		flags.push({
			id: 'FLAG-ALLERGY-001',
			category: 'Allergy',
			message: `${data.currentMedications.allergies.length} allergy/allergies documented`,
			priority: 'medium'
		});
	}

	// ─── Chronic conditions ─────────────────────────────────
	if (data.medicalHistory.chronicConditions === 'yes') {
		flags.push({
			id: 'FLAG-CHRONIC-001',
			category: 'Medical History',
			message: `Chronic conditions: ${data.medicalHistory.chronicConditionDetails || 'details not specified'}`,
			priority: 'medium'
		});
	}

	// ─── Recurring infections ───────────────────────────────
	if (data.medicalHistory.recurringInfections === 'yes') {
		flags.push({
			id: 'FLAG-INFECTION-001',
			category: 'Medical History',
			message: `Recurring infections: ${data.medicalHistory.infectionDetails || 'details not specified'}`,
			priority: 'medium'
		});
	}

	// ─── Genetic conditions in family ───────────────────────
	if (data.familyHistory.geneticConditions === 'yes') {
		flags.push({
			id: 'FLAG-GENETIC-001',
			category: 'Family History',
			message: `Family genetic conditions: ${data.familyHistory.geneticConditionDetails || 'details not specified'}`,
			priority: 'medium'
		});
	}

	// ─── Consanguinity ──────────────────────────────────────
	if (data.familyHistory.consanguinity === 'yes') {
		flags.push({
			id: 'FLAG-CONSANG-001',
			category: 'Family History',
			message: 'Consanguinity reported - consider genetic counselling',
			priority: 'medium'
		});
	}

	// ─── Behavioural concerns ───────────────────────────────
	if (data.socialEnvironmental.behaviouralConcerns === 'yes') {
		flags.push({
			id: 'FLAG-BEHAV-001',
			category: 'Behavioural',
			message: `Behavioural concerns: ${data.socialEnvironmental.behaviouralConcernDetails || 'details not specified'}`,
			priority: 'medium'
		});
	}

	// ─── Excessive screen time ──────────────────────────────
	if (
		data.socialEnvironmental.screenTimeHoursPerDay !== null &&
		data.socialEnvironmental.screenTimeHoursPerDay > 4
	) {
		flags.push({
			id: 'FLAG-SCREEN-001',
			category: 'Social Environment',
			message: `Excessive screen time (${data.socialEnvironmental.screenTimeHoursPerDay} hours/day)`,
			priority: 'low'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
