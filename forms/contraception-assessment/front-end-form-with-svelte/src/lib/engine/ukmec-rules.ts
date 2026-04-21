import type { UKMECCategory } from './types';

/**
 * UKMEC (UK Medical Eligibility Criteria) for Contraceptive Use.
 *
 * Each rule maps a clinical condition to a UKMEC category (1-4) for
 * a specific contraceptive method.
 *
 * Categories:
 *   1 = No restriction (method can be used in any circumstances)
 *   2 = Advantages outweigh risks (method can generally be used)
 *   3 = Risks outweigh advantages (method not usually recommended)
 *   4 = Unacceptable health risk (method should not be used)
 */

export interface UKMECRule {
	id: string;
	condition: string;
	method: string;
	methodLabel: string;
	category: UKMECCategory;
	description: string;
}

export const ukmecRules: UKMECRule[] = [
	// ─── Combined Hormonal Contraception (CHC): COC, patch, ring ─────

	// Migraine with aura
	{
		id: 'UKMEC-CHC-MIGRAINE-AURA',
		condition: 'migraineWithAura',
		method: 'combined-oral',
		methodLabel: 'Combined Oral Contraceptive',
		category: 4,
		description: 'Migraine with aura - CHC is contraindicated due to increased stroke risk'
	},
	{
		id: 'UKMEC-PATCH-MIGRAINE-AURA',
		condition: 'migraineWithAura',
		method: 'patch',
		methodLabel: 'Contraceptive Patch',
		category: 4,
		description: 'Migraine with aura - patch is contraindicated due to increased stroke risk'
	},
	{
		id: 'UKMEC-RING-MIGRAINE-AURA',
		condition: 'migraineWithAura',
		method: 'vaginal-ring',
		methodLabel: 'Vaginal Ring',
		category: 4,
		description: 'Migraine with aura - vaginal ring is contraindicated due to increased stroke risk'
	},

	// DVT / VTE history
	{
		id: 'UKMEC-CHC-DVT',
		condition: 'dvtHistory',
		method: 'combined-oral',
		methodLabel: 'Combined Oral Contraceptive',
		category: 4,
		description: 'History of DVT/VTE - CHC is contraindicated'
	},
	{
		id: 'UKMEC-PATCH-DVT',
		condition: 'dvtHistory',
		method: 'patch',
		methodLabel: 'Contraceptive Patch',
		category: 4,
		description: 'History of DVT/VTE - patch is contraindicated'
	},
	{
		id: 'UKMEC-RING-DVT',
		condition: 'dvtHistory',
		method: 'vaginal-ring',
		methodLabel: 'Vaginal Ring',
		category: 4,
		description: 'History of DVT/VTE - vaginal ring is contraindicated'
	},

	// Breast cancer (current)
	{
		id: 'UKMEC-CHC-BREAST-CANCER',
		condition: 'breastCancer',
		method: 'combined-oral',
		methodLabel: 'Combined Oral Contraceptive',
		category: 4,
		description: 'Current or recent breast cancer - CHC is contraindicated'
	},
	{
		id: 'UKMEC-POP-BREAST-CANCER',
		condition: 'breastCancer',
		method: 'progestogen-only-pill',
		methodLabel: 'Progestogen-Only Pill',
		category: 4,
		description: 'Current or recent breast cancer - POP is contraindicated'
	},
	{
		id: 'UKMEC-INJECTABLE-BREAST-CANCER',
		condition: 'breastCancer',
		method: 'injectable',
		methodLabel: 'Injectable (DMPA)',
		category: 4,
		description: 'Current or recent breast cancer - injectable is contraindicated'
	},
	{
		id: 'UKMEC-IMPLANT-BREAST-CANCER',
		condition: 'breastCancer',
		method: 'implant',
		methodLabel: 'Subdermal Implant',
		category: 4,
		description: 'Current or recent breast cancer - implant is contraindicated'
	},
	{
		id: 'UKMEC-LNG-IUS-BREAST-CANCER',
		condition: 'breastCancer',
		method: 'lng-ius',
		methodLabel: 'LNG-IUS (Hormonal Coil)',
		category: 4,
		description: 'Current or recent breast cancer - LNG-IUS is contraindicated'
	},

	// Hypertension (uncontrolled, systolic >= 160)
	{
		id: 'UKMEC-CHC-HYPERTENSION',
		condition: 'hypertension-severe',
		method: 'combined-oral',
		methodLabel: 'Combined Oral Contraceptive',
		category: 4,
		description: 'Uncontrolled hypertension (systolic >= 160) - CHC is contraindicated'
	},
	{
		id: 'UKMEC-PATCH-HYPERTENSION',
		condition: 'hypertension-severe',
		method: 'patch',
		methodLabel: 'Contraceptive Patch',
		category: 4,
		description: 'Uncontrolled hypertension (systolic >= 160) - patch is contraindicated'
	},
	{
		id: 'UKMEC-RING-HYPERTENSION',
		condition: 'hypertension-severe',
		method: 'vaginal-ring',
		methodLabel: 'Vaginal Ring',
		category: 4,
		description: 'Uncontrolled hypertension (systolic >= 160) - vaginal ring is contraindicated'
	},

	// Hypertension (controlled, systolic 140-159)
	{
		id: 'UKMEC-CHC-HYPERTENSION-MODERATE',
		condition: 'hypertension-moderate',
		method: 'combined-oral',
		methodLabel: 'Combined Oral Contraceptive',
		category: 3,
		description: 'Hypertension (systolic 140-159) - risks of CHC outweigh advantages'
	},

	// Liver disease
	{
		id: 'UKMEC-CHC-LIVER',
		condition: 'liverDisease',
		method: 'combined-oral',
		methodLabel: 'Combined Oral Contraceptive',
		category: 3,
		description: 'Active liver disease - risks of CHC outweigh advantages'
	},

	// Smoker aged >= 35
	{
		id: 'UKMEC-CHC-SMOKER-35',
		condition: 'smoker-over-35',
		method: 'combined-oral',
		methodLabel: 'Combined Oral Contraceptive',
		category: 3,
		description: 'Smoker aged >= 35 - risks of CHC outweigh advantages'
	},
	{
		id: 'UKMEC-CHC-HEAVY-SMOKER-35',
		condition: 'heavy-smoker-over-35',
		method: 'combined-oral',
		methodLabel: 'Combined Oral Contraceptive',
		category: 4,
		description: 'Heavy smoker (>= 15/day) aged >= 35 - CHC is contraindicated'
	},

	// BMI >= 35
	{
		id: 'UKMEC-CHC-OBESITY',
		condition: 'obesity-bmi-35',
		method: 'combined-oral',
		methodLabel: 'Combined Oral Contraceptive',
		category: 3,
		description: 'BMI >= 35 - risks of CHC outweigh advantages'
	},

	// Breastfeeding < 6 weeks postpartum
	{
		id: 'UKMEC-CHC-BREASTFEEDING',
		condition: 'breastfeeding-under-6-weeks',
		method: 'combined-oral',
		methodLabel: 'Combined Oral Contraceptive',
		category: 4,
		description: 'Breastfeeding < 6 weeks postpartum - CHC is contraindicated'
	},

	// Diabetes with complications
	{
		id: 'UKMEC-CHC-DIABETES',
		condition: 'diabetes',
		method: 'combined-oral',
		methodLabel: 'Combined Oral Contraceptive',
		category: 3,
		description: 'Diabetes - risks of CHC may outweigh advantages depending on complications'
	},

	// Epilepsy (enzyme-inducing AEDs)
	{
		id: 'UKMEC-CHC-EPILEPSY',
		condition: 'epilepsy',
		method: 'combined-oral',
		methodLabel: 'Combined Oral Contraceptive',
		category: 3,
		description: 'Epilepsy on enzyme-inducing AEDs - reduced CHC efficacy'
	},

	// ─── Progestogen-only methods ────────────────────────────────

	// Liver disease affects POP
	{
		id: 'UKMEC-POP-LIVER',
		condition: 'liverDisease',
		method: 'progestogen-only-pill',
		methodLabel: 'Progestogen-Only Pill',
		category: 3,
		description: 'Active liver disease - risks of POP outweigh advantages'
	},

	// ─── Copper IUD ─────────────────────────────────────────────

	// Copper IUD is generally safe for most conditions (UKMEC 1)
	// but breast cancer is NOT a restriction for copper IUD
];

/**
 * Contraceptive method display labels.
 */
export const methodLabels: Record<string, string> = {
	'combined-oral': 'Combined Oral Contraceptive (COC)',
	'progestogen-only-pill': 'Progestogen-Only Pill (POP)',
	'injectable': 'Injectable (DMPA)',
	'implant': 'Subdermal Implant',
	'copper-iud': 'Copper IUD',
	'lng-ius': 'LNG-IUS (Hormonal Coil)',
	'patch': 'Contraceptive Patch',
	'vaginal-ring': 'Vaginal Ring',
	'barrier': 'Barrier Methods',
	'natural-methods': 'Natural Family Planning',
	'sterilisation': 'Sterilisation'
};

/**
 * All methods to evaluate.
 */
export const allMethods = [
	'combined-oral',
	'progestogen-only-pill',
	'injectable',
	'implant',
	'copper-iud',
	'lng-ius',
	'patch',
	'vaginal-ring',
	'barrier',
	'natural-methods',
	'sterilisation'
];
