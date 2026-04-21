import type { DLQIRuleDefinition } from './types';

/**
 * The 10 DLQI (Dermatology Life Quality Index) questions.
 * Each question is scored 0-3:
 *   0 = Not at all / Not relevant
 *   1 = A little
 *   2 = A lot
 *   3 = Very much
 *
 * Total score range: 0-30
 */
export const dlqiQuestions: DLQIRuleDefinition[] = [
	{
		id: 'DLQI-01',
		questionNumber: 1,
		domain: 'Symptoms and feelings',
		text: 'Over the last week, how itchy, sore, painful or stinging has your skin been?'
	},
	{
		id: 'DLQI-02',
		questionNumber: 2,
		domain: 'Symptoms and feelings',
		text: 'Over the last week, how embarrassed or self-conscious have you been because of your skin?'
	},
	{
		id: 'DLQI-03',
		questionNumber: 3,
		domain: 'Daily activities',
		text: 'Over the last week, how much has your skin interfered with you going shopping or looking after your home or garden?'
	},
	{
		id: 'DLQI-04',
		questionNumber: 4,
		domain: 'Daily activities',
		text: 'Over the last week, how much has your skin influenced the clothes you wear?'
	},
	{
		id: 'DLQI-05',
		questionNumber: 5,
		domain: 'Leisure',
		text: 'Over the last week, how much has your skin affected any social or leisure activities?'
	},
	{
		id: 'DLQI-06',
		questionNumber: 6,
		domain: 'Leisure',
		text: 'Over the last week, how much has your skin made it difficult for you to do any sport?'
	},
	{
		id: 'DLQI-07',
		questionNumber: 7,
		domain: 'Work and school',
		text: 'Over the last week, has your skin prevented you from working or studying? If "No", over the last week how much has your skin been a problem at work or studying?'
	},
	{
		id: 'DLQI-08',
		questionNumber: 8,
		domain: 'Relationships',
		text: 'Over the last week, how much has your skin created problems with your partner or any of your close friends or relatives?'
	},
	{
		id: 'DLQI-09',
		questionNumber: 9,
		domain: 'Relationships',
		text: 'Over the last week, how much has your skin caused any sexual difficulties?'
	},
	{
		id: 'DLQI-10',
		questionNumber: 10,
		domain: 'Treatment',
		text: 'Over the last week, how much of a problem has the treatment for your skin been, for example by making your home messy, or by taking up time?'
	}
];

/**
 * DLQI score response options.
 */
export const dlqiResponseOptions = [
	{ value: 0, label: 'Not at all / Not relevant' },
	{ value: 1, label: 'A little' },
	{ value: 2, label: 'A lot' },
	{ value: 3, label: 'Very much' }
];
