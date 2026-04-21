import type { DASHRuleDefinition } from './types';

/**
 * The 30 DASH (Disabilities of the Arm, Shoulder and Hand) questions.
 * Each question is scored 1-5:
 *   1 = No difficulty / None / Not at all / Not limited at all / No difficulty
 *   2 = Mild difficulty / Mild / A little bit / Slightly limited / Mild difficulty
 *   3 = Moderate difficulty / Moderate / Moderately / Moderately limited
 *   4 = Severe difficulty / Severe / Quite a bit / Very limited / Severe difficulty
 *   5 = Unable / Extreme / Extremely / Unable
 *
 * DASH Score = ((sum of n responses / n) - 1) * 25
 * Minimum 27 of 30 items must be answered.
 */
export const dashQuestions: DASHRuleDefinition[] = [
	// ─── Daily Activities (Items 1-8) ─────────────────────
	{
		id: 'DASH-01',
		questionNumber: 1,
		domain: 'Daily activities',
		text: 'Open a tight or new jar'
	},
	{
		id: 'DASH-02',
		questionNumber: 2,
		domain: 'Daily activities',
		text: 'Write'
	},
	{
		id: 'DASH-03',
		questionNumber: 3,
		domain: 'Daily activities',
		text: 'Turn a key'
	},
	{
		id: 'DASH-04',
		questionNumber: 4,
		domain: 'Daily activities',
		text: 'Prepare a meal'
	},
	{
		id: 'DASH-05',
		questionNumber: 5,
		domain: 'Daily activities',
		text: 'Push open a heavy door'
	},
	{
		id: 'DASH-06',
		questionNumber: 6,
		domain: 'Daily activities',
		text: 'Place an object on a shelf above your head'
	},
	{
		id: 'DASH-07',
		questionNumber: 7,
		domain: 'Daily activities',
		text: 'Do heavy household chores (e.g., wash walls, floors)'
	},
	{
		id: 'DASH-08',
		questionNumber: 8,
		domain: 'Daily activities',
		text: 'Garden or do yard work'
	},

	// ─── Self-care (Items 9-11) ──────────────────────────
	{
		id: 'DASH-09',
		questionNumber: 9,
		domain: 'Self-care',
		text: 'Make a bed'
	},
	{
		id: 'DASH-10',
		questionNumber: 10,
		domain: 'Self-care',
		text: 'Carry a shopping bag or briefcase'
	},
	{
		id: 'DASH-11',
		questionNumber: 11,
		domain: 'Self-care',
		text: 'Carry a heavy object (over 10 lbs)'
	},

	// ─── Arm/Shoulder/Hand function (Items 12-16) ────────
	{
		id: 'DASH-12',
		questionNumber: 12,
		domain: 'Arm/shoulder/hand function',
		text: 'Change a lightbulb overhead'
	},
	{
		id: 'DASH-13',
		questionNumber: 13,
		domain: 'Arm/shoulder/hand function',
		text: 'Wash or blow dry your hair'
	},
	{
		id: 'DASH-14',
		questionNumber: 14,
		domain: 'Arm/shoulder/hand function',
		text: 'Wash your back'
	},
	{
		id: 'DASH-15',
		questionNumber: 15,
		domain: 'Arm/shoulder/hand function',
		text: 'Put on a pullover sweater'
	},
	{
		id: 'DASH-16',
		questionNumber: 16,
		domain: 'Arm/shoulder/hand function',
		text: 'Use a knife to cut food'
	},

	// ─── Social and recreational (Items 17-21) ───────────
	{
		id: 'DASH-17',
		questionNumber: 17,
		domain: 'Social/recreational',
		text: 'Recreational activities requiring little effort (e.g., card playing, knitting)'
	},
	{
		id: 'DASH-18',
		questionNumber: 18,
		domain: 'Social/recreational',
		text: 'Recreational activities requiring force or impact (e.g., golf, hammering, tennis)'
	},
	{
		id: 'DASH-19',
		questionNumber: 19,
		domain: 'Social/recreational',
		text: 'Recreational activities in which you move your arm freely (e.g., throwing, badminton)'
	},
	{
		id: 'DASH-20',
		questionNumber: 20,
		domain: 'Social/recreational',
		text: 'Manage transportation needs (getting from one place to another)'
	},
	{
		id: 'DASH-21',
		questionNumber: 21,
		domain: 'Social/recreational',
		text: 'Sexual activities'
	},

	// ─── Impact on work/daily life (Items 22-23) ─────────
	{
		id: 'DASH-22',
		questionNumber: 22,
		domain: 'Work/daily life',
		text: 'During the past week, to what extent has your arm, shoulder or hand problem interfered with your normal social activities with family, friends, neighbours or groups?'
	},
	{
		id: 'DASH-23',
		questionNumber: 23,
		domain: 'Work/daily life',
		text: 'During the past week, were you limited in your work or other regular daily activities as a result of your arm, shoulder or hand problem?'
	},

	// ─── Pain (Items 24-26) ──────────────────────────────
	{
		id: 'DASH-24',
		questionNumber: 24,
		domain: 'Pain',
		text: 'Arm, shoulder or hand pain'
	},
	{
		id: 'DASH-25',
		questionNumber: 25,
		domain: 'Pain',
		text: 'Arm, shoulder or hand pain when you performed any specific activity'
	},
	{
		id: 'DASH-26',
		questionNumber: 26,
		domain: 'Pain',
		text: 'Tingling (pins and needles) in your arm, shoulder or hand'
	},

	// ─── Other symptoms (Items 27-30) ────────────────────
	{
		id: 'DASH-27',
		questionNumber: 27,
		domain: 'Other symptoms',
		text: 'Weakness in your arm, shoulder or hand'
	},
	{
		id: 'DASH-28',
		questionNumber: 28,
		domain: 'Other symptoms',
		text: 'Stiffness in your arm, shoulder or hand'
	},
	{
		id: 'DASH-29',
		questionNumber: 29,
		domain: 'Other symptoms',
		text: 'During the past week, how much difficulty have you had sleeping because of the pain in your arm, shoulder or hand?'
	},
	{
		id: 'DASH-30',
		questionNumber: 30,
		domain: 'Other symptoms',
		text: 'I feel less capable, less confident, or less useful because of my arm, shoulder or hand problem'
	}
];

/**
 * DASH score response options (items 1-21: difficulty scale).
 */
export const dashDifficultyOptions = [
	{ value: 1, label: 'No difficulty' },
	{ value: 2, label: 'Mild difficulty' },
	{ value: 3, label: 'Moderate difficulty' },
	{ value: 4, label: 'Severe difficulty' },
	{ value: 5, label: 'Unable' }
];

/**
 * DASH score response options (items 22-23: impact scale).
 */
export const dashImpactOptions = [
	{ value: 1, label: 'Not at all' },
	{ value: 2, label: 'Slightly' },
	{ value: 3, label: 'Moderately' },
	{ value: 4, label: 'Quite a bit' },
	{ value: 5, label: 'Extremely' }
];

/**
 * DASH score response options (items 24-26: severity scale).
 */
export const dashSeverityOptions = [
	{ value: 1, label: 'None' },
	{ value: 2, label: 'Mild' },
	{ value: 3, label: 'Moderate' },
	{ value: 4, label: 'Severe' },
	{ value: 5, label: 'Extreme' }
];

/**
 * DASH score response options (items 27-30: agreement/difficulty scale).
 */
export const dashAgreementOptions = [
	{ value: 1, label: 'None / Strongly disagree' },
	{ value: 2, label: 'Mild / Disagree' },
	{ value: 3, label: 'Moderate / Neither' },
	{ value: 4, label: 'Severe / Agree' },
	{ value: 5, label: 'Extreme / Strongly agree' }
];

/**
 * Get the appropriate response options for a question number.
 */
export function getResponseOptions(questionNumber: number) {
	if (questionNumber <= 21) return dashDifficultyOptions;
	if (questionNumber <= 23) return dashImpactOptions;
	if (questionNumber <= 26) return dashSeverityOptions;
	return dashAgreementOptions;
}
