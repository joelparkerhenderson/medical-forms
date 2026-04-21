import type { HHIESRuleDefinition } from './types';

/**
 * The 10 HHIE-S (Hearing Handicap Inventory for the Elderly - Screening) questions.
 * Each question is scored:
 *   0 = No
 *   2 = Sometimes
 *   4 = Yes
 *
 * 5 questions assess emotional impact, 5 assess social/situational impact.
 * Total score range: 0-40
 */
export const hhiesQuestions: HHIESRuleDefinition[] = [
	{
		id: 'HHIES-01',
		questionNumber: 1,
		domain: 'Social/Situational',
		text: 'Does a hearing problem cause you to feel embarrassed when meeting new people?'
	},
	{
		id: 'HHIES-02',
		questionNumber: 2,
		domain: 'Emotional',
		text: 'Does a hearing problem cause you to feel frustrated when talking to members of your family?'
	},
	{
		id: 'HHIES-03',
		questionNumber: 3,
		domain: 'Social/Situational',
		text: 'Do you have difficulty hearing when someone speaks in a whisper?'
	},
	{
		id: 'HHIES-04',
		questionNumber: 4,
		domain: 'Emotional',
		text: 'Do you feel handicapped by a hearing problem?'
	},
	{
		id: 'HHIES-05',
		questionNumber: 5,
		domain: 'Social/Situational',
		text: 'Does a hearing problem cause you difficulty when visiting friends, relatives, or neighbours?'
	},
	{
		id: 'HHIES-06',
		questionNumber: 6,
		domain: 'Social/Situational',
		text: 'Does a hearing problem cause you to attend religious services less often than you would like?'
	},
	{
		id: 'HHIES-07',
		questionNumber: 7,
		domain: 'Emotional',
		text: 'Does a hearing problem cause you to have arguments with family members?'
	},
	{
		id: 'HHIES-08',
		questionNumber: 8,
		domain: 'Social/Situational',
		text: 'Does a hearing problem cause you difficulty when listening to TV or radio?'
	},
	{
		id: 'HHIES-09',
		questionNumber: 9,
		domain: 'Emotional',
		text: 'Do you feel that any difficulty with your hearing limits or hampers your personal or social life?'
	},
	{
		id: 'HHIES-10',
		questionNumber: 10,
		domain: 'Emotional',
		text: 'Does a hearing problem cause you difficulty when in a restaurant with relatives or friends?'
	}
];

/**
 * HHIE-S score response options.
 */
export const hhiesResponseOptions = [
	{ value: 0, label: 'No' },
	{ value: 2, label: 'Sometimes' },
	{ value: 4, label: 'Yes' }
];
