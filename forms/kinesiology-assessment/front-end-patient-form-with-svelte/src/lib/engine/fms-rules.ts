import type { FMSRuleDefinition } from './types';

/**
 * The 7 FMS (Functional Movement Screen) movement patterns.
 * Each pattern is scored 0-3:
 *   0 = Pain during movement
 *   1 = Unable to perform movement pattern
 *   2 = Performs movement with compensation
 *   3 = Performs movement without compensation
 *
 * For bilateral tests, the lower score is used.
 * Total score range: 0-21
 */
export const fmsPatterns: FMSRuleDefinition[] = [
	{
		id: 'FMS-01',
		patternNumber: 1,
		pattern: 'Deep Squat',
		description: 'Assesses bilateral, symmetrical, functional mobility of the hips, knees, and ankles. The dowel held overhead assesses bilateral, symmetrical mobility of the shoulders and thoracic spine.'
	},
	{
		id: 'FMS-02',
		patternNumber: 2,
		pattern: 'Hurdle Step',
		description: 'Assesses bilateral functional mobility and stability of the hips, knees, and ankles. Challenges the body\'s step and stride mechanics.'
	},
	{
		id: 'FMS-03',
		patternNumber: 3,
		pattern: 'In-Line Lunge',
		description: 'Assesses hip and trunk mobility and stability, quadriceps flexibility, and ankle and knee stability. Places the body in a position that challenges trunk and extremity mobility and stability.'
	},
	{
		id: 'FMS-04',
		patternNumber: 4,
		pattern: 'Shoulder Mobility',
		description: 'Assesses bilateral shoulder range of motion, combining internal rotation with adduction and external rotation with abduction. Requires normal scapular mobility and thoracic spine extension.'
	},
	{
		id: 'FMS-05',
		patternNumber: 5,
		pattern: 'Active Straight Leg Raise',
		description: 'Assesses active hamstring and gastroc-soleus flexibility while maintaining a stable pelvis and active extension of the opposite leg.'
	},
	{
		id: 'FMS-06',
		patternNumber: 6,
		pattern: 'Trunk Stability Push-Up',
		description: 'Assesses trunk stability in the sagittal plane while a symmetrical upper-extremity motion is performed. Tests the ability to stabilise the spine in an anterior and posterior plane during closed-chain upper body movement.'
	},
	{
		id: 'FMS-07',
		patternNumber: 7,
		pattern: 'Rotary Stability',
		description: 'Assesses multi-plane trunk stability during a combined upper and lower extremity motion. Challenges the body\'s ability to stabilise during combined movements.'
	}
];

/**
 * FMS score response options.
 */
export const fmsScoreOptions = [
	{ value: 0, label: '0 - Pain during movement' },
	{ value: 1, label: '1 - Unable to perform pattern' },
	{ value: 2, label: '2 - Performs with compensation' },
	{ value: 3, label: '3 - Performs without compensation' }
];
