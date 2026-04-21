import type { AQ10RuleDefinition } from './types';

/**
 * The 10 AQ-10 (Autism Spectrum Quotient-10) screening questions.
 * Each question is scored 0 or 1:
 *   For questions 1, 7, 8, 10: score 1 if "Definitely agree" or "Slightly agree"
 *   For questions 2, 3, 4, 5, 6, 9: score 1 if "Definitely disagree" or "Slightly disagree"
 *
 * Total score range: 0-10
 * Threshold: score >= 6 indicates further assessment needed
 */
export const aq10Questions: AQ10RuleDefinition[] = [
	{
		id: 'AQ10-01',
		questionNumber: 1,
		domain: 'Social skills',
		text: 'I often notice small sounds when others do not.'
	},
	{
		id: 'AQ10-02',
		questionNumber: 2,
		domain: 'Attention switching',
		text: 'I usually concentrate more on the whole picture, rather than the small details.'
	},
	{
		id: 'AQ10-03',
		questionNumber: 3,
		domain: 'Attention switching',
		text: 'I find it easy to do more than one thing at once.'
	},
	{
		id: 'AQ10-04',
		questionNumber: 4,
		domain: 'Attention switching',
		text: 'If there is an interruption, I can switch back to what I was doing very quickly.'
	},
	{
		id: 'AQ10-05',
		questionNumber: 5,
		domain: 'Communication',
		text: 'I find it easy to "read between the lines" when someone is talking to me.'
	},
	{
		id: 'AQ10-06',
		questionNumber: 6,
		domain: 'Imagination',
		text: 'I know how to tell if someone listening to me is getting bored.'
	},
	{
		id: 'AQ10-07',
		questionNumber: 7,
		domain: 'Attention to detail',
		text: 'When I am reading a story, I find it difficult to work out the characters\' intentions.'
	},
	{
		id: 'AQ10-08',
		questionNumber: 8,
		domain: 'Social skills',
		text: 'I like to collect information about categories of things (e.g., types of car, bird, train, plant).'
	},
	{
		id: 'AQ10-09',
		questionNumber: 9,
		domain: 'Communication',
		text: 'I find it easy to work out what someone is thinking or feeling just by looking at their face.'
	},
	{
		id: 'AQ10-10',
		questionNumber: 10,
		domain: 'Imagination',
		text: 'I find it difficult to work out people\'s intentions.'
	}
];

/**
 * AQ-10 response options.
 * The actual scoring depends on the question direction:
 * - Questions 1, 7, 8, 10: "Agree" scores 1
 * - Questions 2, 3, 4, 5, 6, 9: "Disagree" scores 1
 */
export const aq10ResponseOptions = [
	{ value: 'definitely-agree', label: 'Definitely agree' },
	{ value: 'slightly-agree', label: 'Slightly agree' },
	{ value: 'slightly-disagree', label: 'Slightly disagree' },
	{ value: 'definitely-disagree', label: 'Definitely disagree' }
];

/**
 * Scoring direction for each question.
 * 'agree' means score 1 if the answer is "agree" (definitely or slightly)
 * 'disagree' means score 1 if the answer is "disagree" (definitely or slightly)
 */
export const aq10ScoringDirections: Record<number, 'agree' | 'disagree'> = {
	1: 'agree',
	2: 'disagree',
	3: 'disagree',
	4: 'disagree',
	5: 'disagree',
	6: 'disagree',
	7: 'agree',
	8: 'agree',
	9: 'disagree',
	10: 'agree'
};
