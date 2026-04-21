import type { TinettiRuleDefinition } from './types';

/**
 * Tinetti Balance Assessment items (9 items, max 16 points).
 * Scoring varies by item: some 0-1, some 0-2.
 */
export const tinettiBalanceItems: TinettiRuleDefinition[] = [
	{
		id: 'BAL-01',
		itemNumber: 1,
		domain: 'balance',
		text: 'Sitting balance (0 = leans or slides, 1 = steady/safe)',
		maxScore: 1
	},
	{
		id: 'BAL-02',
		itemNumber: 2,
		domain: 'balance',
		text: 'Rises from chair (0 = unable without help, 1 = able using arms, 2 = able without arms)',
		maxScore: 2
	},
	{
		id: 'BAL-03',
		itemNumber: 3,
		domain: 'balance',
		text: 'Attempting to rise (0 = unable without help, 1 = able but requires >1 attempt, 2 = able on first attempt)',
		maxScore: 2
	},
	{
		id: 'BAL-04',
		itemNumber: 4,
		domain: 'balance',
		text: 'Immediate standing balance (first 5 seconds) (0 = unsteady, 1 = steady with walker/cane, 2 = steady without aid)',
		maxScore: 2
	},
	{
		id: 'BAL-05',
		itemNumber: 5,
		domain: 'balance',
		text: 'Standing balance (0 = unsteady, 1 = steady with wide stance or uses support, 2 = narrow stance without support)',
		maxScore: 2
	},
	{
		id: 'BAL-06',
		itemNumber: 6,
		domain: 'balance',
		text: 'Nudged (eyes open, feet together, examiner pushes on sternum x3) (0 = begins to fall, 1 = staggers/grabs, 2 = steady)',
		maxScore: 2
	},
	{
		id: 'BAL-07',
		itemNumber: 7,
		domain: 'balance',
		text: 'Eyes closed (same position as above) (0 = unsteady, 1 = steady)',
		maxScore: 1
	},
	{
		id: 'BAL-08',
		itemNumber: 8,
		domain: 'balance',
		text: 'Turning 360 degrees (0 = discontinuous steps, 1 = continuous steps) (0 = unsteady, 1 = steady)',
		maxScore: 2
	},
	{
		id: 'BAL-09',
		itemNumber: 9,
		domain: 'balance',
		text: 'Sitting down (0 = unsafe, 1 = uses arms or not smooth, 2 = safe/smooth)',
		maxScore: 2
	}
];

/**
 * Tinetti Gait Assessment items (8 items, max 12 points).
 * Scoring varies by item: some 0-1, some 0-2.
 */
export const tinettiGaitItems: TinettiRuleDefinition[] = [
	{
		id: 'GAIT-01',
		itemNumber: 1,
		domain: 'gait',
		text: 'Initiation of gait (0 = any hesitancy or multiple attempts, 1 = no hesitancy)',
		maxScore: 1
	},
	{
		id: 'GAIT-02',
		itemNumber: 2,
		domain: 'gait',
		text: 'Step length (right foot passes left stance foot) (0 = does not pass, 1 = passes)',
		maxScore: 1
	},
	{
		id: 'GAIT-03',
		itemNumber: 3,
		domain: 'gait',
		text: 'Step height (right foot clears floor) (0 = does not clear, 1 = clears)',
		maxScore: 1
	},
	{
		id: 'GAIT-04',
		itemNumber: 4,
		domain: 'gait',
		text: 'Step symmetry (0 = right and left step lengths unequal, 1 = equal)',
		maxScore: 1
	},
	{
		id: 'GAIT-05',
		itemNumber: 5,
		domain: 'gait',
		text: 'Step continuity (0 = stopping or discontinuity between steps, 1 = continuous)',
		maxScore: 1
	},
	{
		id: 'GAIT-06',
		itemNumber: 6,
		domain: 'gait',
		text: 'Path (observed over 10 feet) (0 = marked deviation, 1 = mild/moderate deviation or uses aid, 2 = straight without aid)',
		maxScore: 2
	},
	{
		id: 'GAIT-07',
		itemNumber: 7,
		domain: 'gait',
		text: 'Trunk (0 = marked sway or uses aid, 1 = no sway but flexion of knees/back or arms spread, 2 = no sway, flexion, or arm spread)',
		maxScore: 2
	},
	{
		id: 'GAIT-08',
		itemNumber: 8,
		domain: 'gait',
		text: 'Walking stance (0 = heels apart, 1 = heels almost touching while walking)',
		maxScore: 1
	}
];

/**
 * All Tinetti items combined.
 */
export const allTinettiItems: TinettiRuleDefinition[] = [
	...tinettiBalanceItems,
	...tinettiGaitItems
];
