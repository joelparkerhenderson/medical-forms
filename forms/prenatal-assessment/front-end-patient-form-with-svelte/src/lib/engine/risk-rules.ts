import type { RiskRuleDefinition } from './types';

/**
 * Prenatal risk factors with associated weights.
 * Higher weight = greater clinical significance.
 *
 * Risk score is cumulative:
 *   0-2  = Low risk
 *   3-5  = Moderate risk
 *   6-9  = High risk
 *   10+  = Very high risk
 */
export const riskRules: RiskRuleDefinition[] = [
	// ─── Obstetric history ────────────────────────────
	{
		id: 'RISK-OB-001',
		category: 'Obstetric History',
		description: 'Previous preeclampsia',
		weight: 3
	},
	{
		id: 'RISK-OB-002',
		category: 'Obstetric History',
		description: 'Previous gestational diabetes',
		weight: 2
	},
	{
		id: 'RISK-OB-003',
		category: 'Obstetric History',
		description: 'Previous preterm birth',
		weight: 3
	},
	{
		id: 'RISK-OB-004',
		category: 'Obstetric History',
		description: 'Previous cesarean section',
		weight: 1
	},

	// ─── Medical conditions ──────────────────────────
	{
		id: 'RISK-MED-001',
		category: 'Medical History',
		description: 'Pre-existing hypertension',
		weight: 3
	},
	{
		id: 'RISK-MED-002',
		category: 'Medical History',
		description: 'Pre-existing diabetes',
		weight: 3
	},
	{
		id: 'RISK-MED-003',
		category: 'Medical History',
		description: 'Autoimmune disease',
		weight: 2
	},
	{
		id: 'RISK-MED-004',
		category: 'Medical History',
		description: 'Thyroid disorder',
		weight: 2
	},

	// ─── Pregnancy-specific ──────────────────────────
	{
		id: 'RISK-PREG-001',
		category: 'Pregnancy Details',
		description: 'Multiple gestation (twins, triplets, etc.)',
		weight: 3
	},
	{
		id: 'RISK-PREG-002',
		category: 'Pregnancy Details',
		description: 'Placenta previa or low-lying placenta',
		weight: 4
	},
	{
		id: 'RISK-PREG-003',
		category: 'Pregnancy Details',
		description: 'Assisted conception (IVF/ICSI)',
		weight: 1
	},

	// ─── Vital signs ────────────────────────────────
	{
		id: 'RISK-VITAL-001',
		category: 'Vital Signs',
		description: 'Elevated blood pressure (systolic >= 140 or diastolic >= 90)',
		weight: 3
	},
	{
		id: 'RISK-VITAL-002',
		category: 'Vital Signs',
		description: 'BMI >= 30 (obese)',
		weight: 2
	},
	{
		id: 'RISK-VITAL-003',
		category: 'Vital Signs',
		description: 'Abnormal fetal heart rate (< 110 or > 160 bpm)',
		weight: 3
	},

	// ─── Laboratory ─────────────────────────────────
	{
		id: 'RISK-LAB-001',
		category: 'Laboratory Results',
		description: 'Rh-negative mother',
		weight: 2
	},
	{
		id: 'RISK-LAB-002',
		category: 'Laboratory Results',
		description: 'Low hemoglobin (anemia, < 11 g/dL)',
		weight: 1
	},
	{
		id: 'RISK-LAB-003',
		category: 'Laboratory Results',
		description: 'Elevated glucose (> 7.8 mmol/L)',
		weight: 2
	},
	{
		id: 'RISK-LAB-004',
		category: 'Laboratory Results',
		description: 'GBS positive',
		weight: 1
	},

	// ─── Lifestyle ──────────────────────────────────
	{
		id: 'RISK-LIFE-001',
		category: 'Lifestyle',
		description: 'Active smoking during pregnancy',
		weight: 2
	},
	{
		id: 'RISK-LIFE-002',
		category: 'Lifestyle',
		description: 'Alcohol use during pregnancy',
		weight: 3
	},
	{
		id: 'RISK-LIFE-003',
		category: 'Lifestyle',
		description: 'Drug use during pregnancy',
		weight: 3
	},
	{
		id: 'RISK-LIFE-004',
		category: 'Lifestyle',
		description: 'No folic acid supplementation',
		weight: 1
	},

	// ─── Mental health ──────────────────────────────
	{
		id: 'RISK-MH-001',
		category: 'Mental Health',
		description: 'Edinburgh Postnatal Depression Scale score >= 13 (probable depression)',
		weight: 2
	},
	{
		id: 'RISK-MH-002',
		category: 'Mental Health',
		description: 'Severe anxiety',
		weight: 2
	},
	{
		id: 'RISK-MH-003',
		category: 'Mental Health',
		description: 'Positive domestic violence screen',
		weight: 4
	},

	// ─── Current symptoms ───────────────────────────
	{
		id: 'RISK-SX-001',
		category: 'Current Symptoms',
		description: 'Vaginal bleeding',
		weight: 4
	},
	{
		id: 'RISK-SX-002',
		category: 'Current Symptoms',
		description: 'Reduced fetal movement',
		weight: 3
	},
	{
		id: 'RISK-SX-003',
		category: 'Current Symptoms',
		description: 'Vision changes',
		weight: 2
	},
	{
		id: 'RISK-SX-004',
		category: 'Current Symptoms',
		description: 'Severe headache',
		weight: 2
	}
];
