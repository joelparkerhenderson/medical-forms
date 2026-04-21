import type { COPMRuleDefinition } from './types';

/**
 * The COPM (Canadian Occupational Performance Measure) scoring definitions.
 *
 * Performance and Satisfaction are each rated on a 1-10 scale:
 *   1 = Not able to do it / Not satisfied at all
 *   10 = Able to do it extremely well / Extremely satisfied
 *
 * Average scores are calculated across all rated activities.
 *
 * Categories:
 *   < 5  = Significant issues
 *   5-7  = Moderate concerns
 *   > 7  = Good performance / satisfaction
 */
export const copmActivities: COPMRuleDefinition[] = [
	{
		id: 'COPM-PERF-01',
		activityNumber: 1,
		domain: 'Performance',
		text: 'Activity 1 - Self-identified occupational performance problem'
	},
	{
		id: 'COPM-PERF-02',
		activityNumber: 2,
		domain: 'Performance',
		text: 'Activity 2 - Self-identified occupational performance problem'
	},
	{
		id: 'COPM-PERF-03',
		activityNumber: 3,
		domain: 'Performance',
		text: 'Activity 3 - Self-identified occupational performance problem'
	},
	{
		id: 'COPM-PERF-04',
		activityNumber: 4,
		domain: 'Performance',
		text: 'Activity 4 - Self-identified occupational performance problem'
	},
	{
		id: 'COPM-PERF-05',
		activityNumber: 5,
		domain: 'Performance',
		text: 'Activity 5 - Self-identified occupational performance problem'
	}
];

/**
 * COPM performance score response options (1-10).
 */
export const copmScoreOptions = [
	{ value: 1, label: '1 - Not able to do it at all' },
	{ value: 2, label: '2' },
	{ value: 3, label: '3' },
	{ value: 4, label: '4' },
	{ value: 5, label: '5 - Moderate' },
	{ value: 6, label: '6' },
	{ value: 7, label: '7' },
	{ value: 8, label: '8' },
	{ value: 9, label: '9' },
	{ value: 10, label: '10 - Able to do it extremely well' }
];

/**
 * COPM satisfaction score response options (1-10).
 */
export const copmSatisfactionOptions = [
	{ value: 1, label: '1 - Not satisfied at all' },
	{ value: 2, label: '2' },
	{ value: 3, label: '3' },
	{ value: 4, label: '4' },
	{ value: 5, label: '5 - Moderate' },
	{ value: 6, label: '6' },
	{ value: 7, label: '7' },
	{ value: 8, label: '8' },
	{ value: 9, label: '9' },
	{ value: 10, label: '10 - Extremely satisfied' }
];

/**
 * COPM importance rating options (1-10).
 */
export const copmImportanceOptions = [
	{ value: 1, label: '1 - Not important at all' },
	{ value: 2, label: '2' },
	{ value: 3, label: '3' },
	{ value: 4, label: '4' },
	{ value: 5, label: '5 - Moderate importance' },
	{ value: 6, label: '6' },
	{ value: 7, label: '7' },
	{ value: 8, label: '8' },
	{ value: 9, label: '9' },
	{ value: 10, label: '10 - Extremely important' }
];
