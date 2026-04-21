import type { ACTRule } from './types';

/**
 * Asthma Control Test (ACT) scoring rules.
 * Each rule maps a questionnaire response to a score of 1-5.
 * The ACT total score is the sum of all 5 questions (range 5-25).
 *
 * ACT-001: Activity limitation (Q1)
 * ACT-002: Shortness of breath frequency (Q2)
 * ACT-003: Nighttime/early morning symptoms (Q3)
 * ACT-004: Rescue inhaler use (Q4)
 * ACT-005: Self-rated asthma control (Q5)
 */
export const actRules: ACTRule[] = [
	{
		id: 'ACT-001',
		category: 'Activity Limitation',
		description: 'How much of the time did your asthma keep you from getting as much done at work, school, or at home?',
		evaluate: (d) => {
			switch (d.symptomFrequency.activityLimitation) {
				case 'not-at-all':
					return 5;
				case 'a-little':
					return 4;
				case 'somewhat':
					return 3;
				case 'a-lot':
					return 2;
				case 'extremely':
					return 1;
				default:
					return 0;
			}
		}
	},
	{
		id: 'ACT-002',
		category: 'Daytime Symptoms',
		description: 'How often have you had shortness of breath?',
		evaluate: (d) => {
			switch (d.symptomFrequency.daytimeSymptoms) {
				case 'not-at-all':
					return 5;
				case 'once-or-twice':
					return 4;
				case 'three-to-six':
					return 3;
				case 'once-a-day':
					return 2;
				case 'more-than-once-a-day':
					return 1;
				default:
					return 0;
			}
		}
	},
	{
		id: 'ACT-003',
		category: 'Nighttime Awakening',
		description: 'How often did your asthma symptoms wake you up at night or earlier than usual?',
		evaluate: (d) => {
			switch (d.symptomFrequency.nighttimeAwakening) {
				case 'not-at-all':
					return 5;
				case 'once-or-twice':
					return 4;
				case 'once-a-week':
					return 3;
				case 'two-to-three-nights':
					return 2;
				case 'four-or-more-nights':
					return 1;
				default:
					return 0;
			}
		}
	},
	{
		id: 'ACT-004',
		category: 'Rescue Inhaler Use',
		description: 'How often have you used your rescue inhaler or nebuliser medication?',
		evaluate: (d) => {
			switch (d.symptomFrequency.rescueInhalerUse) {
				case 'not-at-all':
					return 5;
				case 'once-or-twice':
					return 4;
				case 'three-to-six':
					return 3;
				case 'once-a-day':
					return 2;
				case 'two-or-more-times-a-day':
					return 1;
				default:
					return 0;
			}
		}
	},
	{
		id: 'ACT-005',
		category: 'Self-Rated Control',
		description: 'How would you rate your asthma control?',
		evaluate: (d) => {
			switch (d.symptomFrequency.selfRatedControl) {
				case 'completely-controlled':
					return 5;
				case 'well-controlled':
					return 4;
				case 'somewhat-controlled':
					return 3;
				case 'poorly-controlled':
					return 2;
				case 'not-controlled-at-all':
					return 1;
				default:
					return 0;
			}
		}
	}
];
