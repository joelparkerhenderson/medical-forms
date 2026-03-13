import type { SymptomRuleDefinition } from './types';

/**
 * Menstrual Symptom Severity Score definitions.
 * Each symptom is scored 0-3:
 *   0 = No symptoms / Not relevant
 *   1 = Mild
 *   2 = Moderate
 *   3 = Severe
 *
 * Total score range: 0-30
 */
export const symptomDefinitions: SymptomRuleDefinition[] = [
	{
		id: 'SYM-01',
		symptomNumber: 1,
		domain: 'Menstrual pain',
		text: 'How severe is your menstrual pain (dysmenorrhoea)?'
	},
	{
		id: 'SYM-02',
		symptomNumber: 2,
		domain: 'Bleeding',
		text: 'How heavy is your menstrual flow?'
	},
	{
		id: 'SYM-03',
		symptomNumber: 3,
		domain: 'Pelvic pain',
		text: 'Do you experience pelvic pain outside of menstruation?'
	},
	{
		id: 'SYM-04',
		symptomNumber: 4,
		domain: 'Abnormal bleeding',
		text: 'Do you experience bleeding between periods or after intercourse?'
	},
	{
		id: 'SYM-05',
		symptomNumber: 5,
		domain: 'Vaginal discharge',
		text: 'Do you experience abnormal vaginal discharge?'
	},
	{
		id: 'SYM-06',
		symptomNumber: 6,
		domain: 'Urinary symptoms',
		text: 'Do you experience urinary frequency, urgency, or incontinence?'
	},
	{
		id: 'SYM-07',
		symptomNumber: 7,
		domain: 'Daily activities',
		text: 'How much do your gynaecological symptoms interfere with daily activities?'
	},
	{
		id: 'SYM-08',
		symptomNumber: 8,
		domain: 'Work and school',
		text: 'How much do your symptoms affect your ability to work or study?'
	},
	{
		id: 'SYM-09',
		symptomNumber: 9,
		domain: 'Relationships',
		text: 'How much do your symptoms affect your relationships or sexual life?'
	},
	{
		id: 'SYM-10',
		symptomNumber: 10,
		domain: 'Emotional wellbeing',
		text: 'How much do your symptoms affect your emotional wellbeing or mood?'
	}
];

/**
 * Symptom score response options.
 */
export const symptomResponseOptions = [
	{ value: 0, label: 'Not at all / Not relevant' },
	{ value: 1, label: 'Mild' },
	{ value: 2, label: 'Moderate' },
	{ value: 3, label: 'Severe' }
];
