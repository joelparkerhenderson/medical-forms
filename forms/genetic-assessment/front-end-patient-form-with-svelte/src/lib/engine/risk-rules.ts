import type { RiskRuleDefinition } from './types';

/**
 * Risk factor definitions for genetic counseling referral.
 * Each rule has a weight that contributes to the overall risk score.
 *
 * Risk Stratification:
 *   0-2  = Low Risk
 *   3-5  = Moderate Risk
 *   6+   = High Risk
 */
export const riskRules: RiskRuleDefinition[] = [
	{
		id: 'RISK-BIRTH-001',
		category: 'Personal History',
		description: 'Birth defects present',
		weight: 2
	},
	{
		id: 'RISK-DELAY-001',
		category: 'Personal History',
		description: 'Developmental delay identified',
		weight: 2
	},
	{
		id: 'RISK-INTEL-001',
		category: 'Personal History',
		description: 'Intellectual disability present',
		weight: 2
	},
	{
		id: 'RISK-ANOM-001',
		category: 'Personal History',
		description: 'Multiple congenital anomalies',
		weight: 3
	},
	{
		id: 'RISK-CHROMO-001',
		category: 'Personal History',
		description: 'Known chromosomal condition',
		weight: 3
	},
	{
		id: 'RISK-GENETIC-001',
		category: 'Personal History',
		description: 'Known genetic condition',
		weight: 3
	},
	{
		id: 'RISK-CANCER-001',
		category: 'Cancer History',
		description: 'Personal cancer history',
		weight: 2
	},
	{
		id: 'RISK-CANCER-002',
		category: 'Cancer History',
		description: 'Early onset cancer (before age 50)',
		weight: 3
	},
	{
		id: 'RISK-CANCER-003',
		category: 'Cancer History',
		description: 'Multiple primary cancers',
		weight: 3
	},
	{
		id: 'RISK-FAMILY-001',
		category: 'Family History',
		description: 'Multiple family members with cancer',
		weight: 2
	},
	{
		id: 'RISK-FAMILY-002',
		category: 'Family History',
		description: 'Family member deceased from genetic condition',
		weight: 2
	},
	{
		id: 'RISK-CVD-001',
		category: 'Cardiovascular Genetics',
		description: 'Familial hypercholesterolemia',
		weight: 2
	},
	{
		id: 'RISK-CVD-002',
		category: 'Cardiovascular Genetics',
		description: 'Cardiomyopathy in family',
		weight: 2
	},
	{
		id: 'RISK-CVD-003',
		category: 'Cardiovascular Genetics',
		description: 'Sudden cardiac death in family',
		weight: 3
	},
	{
		id: 'RISK-NEURO-001',
		category: 'Neurogenetics',
		description: 'Huntington disease in family',
		weight: 3
	},
	{
		id: 'RISK-NEURO-002',
		category: 'Neurogenetics',
		description: 'Early-onset Alzheimer disease in family',
		weight: 2
	},
	{
		id: 'RISK-NEURO-003',
		category: 'Neurogenetics',
		description: 'Muscular dystrophy in family',
		weight: 2
	},
	{
		id: 'RISK-REPRO-001',
		category: 'Reproductive Genetics',
		description: 'Recurrent miscarriages',
		weight: 2
	},
	{
		id: 'RISK-REPRO-002',
		category: 'Reproductive Genetics',
		description: 'Previous affected child',
		weight: 3
	},
	{
		id: 'RISK-CONSANG-001',
		category: 'Consanguinity',
		description: 'Consanguineous relationship',
		weight: 3
	},
	{
		id: 'RISK-ETHNIC-001',
		category: 'Ethnic Background',
		description: 'Ashkenazi Jewish heritage with relevant conditions',
		weight: 2
	},
	{
		id: 'RISK-VUS-001',
		category: 'Genetic Testing',
		description: 'Variant of uncertain significance identified',
		weight: 1
	},
	{
		id: 'RISK-CARRIER-001',
		category: 'Genetic Testing',
		description: 'Known carrier status',
		weight: 2
	}
];
