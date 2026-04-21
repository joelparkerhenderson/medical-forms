import type { IPSSRuleDefinition } from './types';

/**
 * The 7 IPSS (International Prostate Symptom Score) questions.
 * Each question is scored 0-5:
 *   0 = Not at all
 *   1 = Less than 1 time in 5
 *   2 = Less than half the time
 *   3 = About half the time
 *   4 = More than half the time
 *   5 = Almost always
 *
 * Total score range: 0-35
 */
export const ipssQuestions: IPSSRuleDefinition[] = [
	{
		id: 'IPSS-01',
		questionNumber: 1,
		domain: 'Incomplete emptying',
		text: 'Over the past month, how often have you had a sensation of not emptying your bladder completely after you finished urinating?'
	},
	{
		id: 'IPSS-02',
		questionNumber: 2,
		domain: 'Frequency',
		text: 'Over the past month, how often have you had to urinate again less than two hours after you finished urinating?'
	},
	{
		id: 'IPSS-03',
		questionNumber: 3,
		domain: 'Intermittency',
		text: 'Over the past month, how often have you found you stopped and started again several times when you urinated?'
	},
	{
		id: 'IPSS-04',
		questionNumber: 4,
		domain: 'Urgency',
		text: 'Over the past month, how often have you found it difficult to postpone urination?'
	},
	{
		id: 'IPSS-05',
		questionNumber: 5,
		domain: 'Weak stream',
		text: 'Over the past month, how often have you had a weak urinary stream?'
	},
	{
		id: 'IPSS-06',
		questionNumber: 6,
		domain: 'Straining',
		text: 'Over the past month, how often have you had to push or strain to begin urination?'
	},
	{
		id: 'IPSS-07',
		questionNumber: 7,
		domain: 'Nocturia',
		text: 'Over the past month, how many times did you most typically get up to urinate from the time you went to bed at night until the time you got up in the morning?'
	}
];

/**
 * IPSS score response options.
 */
export const ipssResponseOptions = [
	{ value: 0, label: 'Not at all' },
	{ value: 1, label: 'Less than 1 time in 5' },
	{ value: 2, label: 'Less than half the time' },
	{ value: 3, label: 'About half the time' },
	{ value: 4, label: 'More than half the time' },
	{ value: 5, label: 'Almost always' }
];

/**
 * Quality of Life response options (IPSS Question 8).
 */
export const qolResponseOptions = [
	{ value: 0, label: 'Delighted' },
	{ value: 1, label: 'Pleased' },
	{ value: 2, label: 'Mostly satisfied' },
	{ value: 3, label: 'Mixed - about equally satisfied and dissatisfied' },
	{ value: 4, label: 'Mostly dissatisfied' },
	{ value: 5, label: 'Unhappy' },
	{ value: 6, label: 'Terrible' }
];
