import type { DevScreenRule } from './types';

/**
 * Declarative developmental screening rules.
 * Each rule evaluates the child's assessment data and returns true if a concern is present.
 * The overall result is determined by the worst domain result.
 * Normal is the default when no rules fire (healthy child).
 */
export const devScreenRules: DevScreenRule[] = [
	// ─── GROSS MOTOR ────────────────────────────────────────
	{
		id: 'GM-001',
		domain: 'Gross Motor',
		description: 'Gross motor concern reported',
		result: 'concern',
		evaluate: (d) => d.developmentalMilestones.grossMotor === 'concern'
	},
	{
		id: 'GM-002',
		domain: 'Gross Motor',
		description: 'Gross motor fail reported',
		result: 'fail',
		evaluate: (d) => d.developmentalMilestones.grossMotor === 'fail'
	},

	// ─── FINE MOTOR ─────────────────────────────────────────
	{
		id: 'FM-001',
		domain: 'Fine Motor',
		description: 'Fine motor concern reported',
		result: 'concern',
		evaluate: (d) => d.developmentalMilestones.fineMotor === 'concern'
	},
	{
		id: 'FM-002',
		domain: 'Fine Motor',
		description: 'Fine motor fail reported',
		result: 'fail',
		evaluate: (d) => d.developmentalMilestones.fineMotor === 'fail'
	},

	// ─── LANGUAGE ───────────────────────────────────────────
	{
		id: 'LG-001',
		domain: 'Language',
		description: 'Language concern reported',
		result: 'concern',
		evaluate: (d) => d.developmentalMilestones.language === 'concern'
	},
	{
		id: 'LG-002',
		domain: 'Language',
		description: 'Language fail reported',
		result: 'fail',
		evaluate: (d) => d.developmentalMilestones.language === 'fail'
	},

	// ─── SOCIAL-EMOTIONAL ───────────────────────────────────
	{
		id: 'SE-001',
		domain: 'Social-Emotional',
		description: 'Social-emotional concern reported',
		result: 'concern',
		evaluate: (d) => d.developmentalMilestones.socialEmotional === 'concern'
	},
	{
		id: 'SE-002',
		domain: 'Social-Emotional',
		description: 'Social-emotional fail reported',
		result: 'fail',
		evaluate: (d) => d.developmentalMilestones.socialEmotional === 'fail'
	},

	// ─── COGNITIVE ──────────────────────────────────────────
	{
		id: 'CG-001',
		domain: 'Cognitive',
		description: 'Cognitive concern reported',
		result: 'concern',
		evaluate: (d) => d.developmentalMilestones.cognitive === 'concern'
	},
	{
		id: 'CG-002',
		domain: 'Cognitive',
		description: 'Cognitive fail reported',
		result: 'fail',
		evaluate: (d) => d.developmentalMilestones.cognitive === 'fail'
	},

	// ─── GROWTH ─────────────────────────────────────────────
	{
		id: 'GR-001',
		domain: 'Growth',
		description: 'Failure to thrive',
		result: 'fail',
		evaluate: (d) => d.growthNutrition.failureToThrive === 'yes'
	},
	{
		id: 'GR-002',
		domain: 'Growth',
		description: 'Weight below 3rd percentile',
		result: 'concern',
		evaluate: (d) =>
			d.growthNutrition.weightPercentile !== null && d.growthNutrition.weightPercentile < 3
	},
	{
		id: 'GR-003',
		domain: 'Growth',
		description: 'Head circumference below 3rd percentile',
		result: 'concern',
		evaluate: (d) =>
			d.growthNutrition.headCircumferencePercentile !== null &&
			d.growthNutrition.headCircumferencePercentile < 3
	},

	// ─── BIRTH HISTORY ──────────────────────────────────────
	{
		id: 'BH-001',
		domain: 'Birth History',
		description: 'NICU stay',
		result: 'concern',
		evaluate: (d) => d.birthHistory.nicuStay === 'yes'
	},
	{
		id: 'BH-002',
		domain: 'Birth History',
		description: 'Preterm birth (<37 weeks)',
		result: 'concern',
		evaluate: (d) =>
			d.birthHistory.gestationalAge !== null && d.birthHistory.gestationalAge < 37
	},
	{
		id: 'BH-003',
		domain: 'Birth History',
		description: 'Very preterm birth (<32 weeks)',
		result: 'fail',
		evaluate: (d) =>
			d.birthHistory.gestationalAge !== null && d.birthHistory.gestationalAge < 32
	},
	{
		id: 'BH-004',
		domain: 'Birth History',
		description: 'Low APGAR score at 5 minutes (<7)',
		result: 'concern',
		evaluate: (d) =>
			d.birthHistory.apgarFiveMinutes !== null && d.birthHistory.apgarFiveMinutes < 7
	},

	// ─── FAMILY HISTORY ─────────────────────────────────────
	{
		id: 'FH-001',
		domain: 'Family History',
		description: 'Family history of developmental disorders',
		result: 'concern',
		evaluate: (d) => d.familyHistory.developmentalDisorders === 'yes'
	},
	{
		id: 'FH-002',
		domain: 'Family History',
		description: 'Consanguinity',
		result: 'concern',
		evaluate: (d) => d.familyHistory.consanguinity === 'yes'
	},

	// ─── IMMUNIZATION ───────────────────────────────────────
	{
		id: 'IM-001',
		domain: 'Immunization',
		description: 'Immunizations not up to date',
		result: 'concern',
		evaluate: (d) => d.immunizationStatus.upToDate === 'no'
	},

	// ─── SOCIAL/BEHAVIOURAL ─────────────────────────────────
	{
		id: 'SB-001',
		domain: 'Social-Behavioural',
		description: 'Behavioural concerns',
		result: 'concern',
		evaluate: (d) => d.socialEnvironmental.behaviouralConcerns === 'yes'
	},
	{
		id: 'SB-002',
		domain: 'Social-Behavioural',
		description: 'Below-average school performance',
		result: 'concern',
		evaluate: (d) => d.socialEnvironmental.schoolPerformance === 'below-average'
	},
	{
		id: 'SB-003',
		domain: 'Social-Behavioural',
		description: 'Excessive screen time (>4 hours/day)',
		result: 'concern',
		evaluate: (d) =>
			d.socialEnvironmental.screenTimeHoursPerDay !== null &&
			d.socialEnvironmental.screenTimeHoursPerDay > 4
	},

	// ─── MEDICAL HISTORY ────────────────────────────────────
	{
		id: 'MH-001',
		domain: 'Medical History',
		description: 'Chronic conditions present',
		result: 'concern',
		evaluate: (d) => d.medicalHistory.chronicConditions === 'yes'
	},
	{
		id: 'MH-002',
		domain: 'Medical History',
		description: 'Recurring infections',
		result: 'concern',
		evaluate: (d) => d.medicalHistory.recurringInfections === 'yes'
	}
];
