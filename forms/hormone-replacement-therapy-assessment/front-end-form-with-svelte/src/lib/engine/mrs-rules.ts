import type { AssessmentData, FiredRule, MRSItemScore } from './types';

/**
 * MRS scoring rule definition.
 * Each item in the MRS maps to one of three subscales:
 *   Somatic (items 1-3, 11): hot flushes, heart discomfort, sleep problems, joint pain
 *   Psychological (items 4-7): depressive mood, irritability, anxiety, fatigue
 *   Urogenital (items 8-10): sexual problems, bladder problems, vaginal dryness
 */
export interface MRSRule {
	id: string;
	system: string;
	description: string;
	subscale: 'somatic' | 'psychological' | 'urogenital';
	getScore: (data: AssessmentData) => MRSItemScore | null;
}

export const mrsRules: MRSRule[] = [
	// ─── SOMATIC SUBSCALE ────────────────────────────────────
	{
		id: 'MRS-01',
		system: 'Somatic',
		description: 'Hot flushes, sweating',
		subscale: 'somatic',
		getScore: (d) => d.mrsSymptomScale.hotFlushes
	},
	{
		id: 'MRS-02',
		system: 'Somatic',
		description: 'Heart discomfort (palpitations, tightness)',
		subscale: 'somatic',
		getScore: (d) => d.mrsSymptomScale.heartDiscomfort
	},
	{
		id: 'MRS-03',
		system: 'Somatic',
		description: 'Sleep problems (difficulty falling asleep, waking early)',
		subscale: 'somatic',
		getScore: (d) => d.mrsSymptomScale.sleepProblems
	},
	{
		id: 'MRS-04',
		system: 'Somatic',
		description: 'Joint and muscular discomfort',
		subscale: 'somatic',
		getScore: (d) => d.mrsSymptomScale.jointPain
	},

	// ─── PSYCHOLOGICAL SUBSCALE ──────────────────────────────
	{
		id: 'MRS-05',
		system: 'Psychological',
		description: 'Depressive mood (feeling down, sad, tearful)',
		subscale: 'psychological',
		getScore: (d) => d.mrsSymptomScale.depressiveMood
	},
	{
		id: 'MRS-06',
		system: 'Psychological',
		description: 'Irritability (nervousness, aggression)',
		subscale: 'psychological',
		getScore: (d) => d.mrsSymptomScale.irritability
	},
	{
		id: 'MRS-07',
		system: 'Psychological',
		description: 'Anxiety (inner restlessness, panic)',
		subscale: 'psychological',
		getScore: (d) => d.mrsSymptomScale.anxiety
	},
	{
		id: 'MRS-08',
		system: 'Psychological',
		description: 'Physical and mental exhaustion (fatigue)',
		subscale: 'psychological',
		getScore: (d) => d.mrsSymptomScale.fatigue
	},

	// ─── UROGENITAL SUBSCALE ─────────────────────────────────
	{
		id: 'MRS-09',
		system: 'Urogenital',
		description: 'Sexual problems (change in desire, activity, satisfaction)',
		subscale: 'urogenital',
		getScore: (d) => d.mrsSymptomScale.sexualProblems
	},
	{
		id: 'MRS-10',
		system: 'Urogenital',
		description: 'Bladder problems (difficulty urinating, increased need, incontinence)',
		subscale: 'urogenital',
		getScore: (d) => d.mrsSymptomScale.bladderProblems
	},
	{
		id: 'MRS-11',
		system: 'Urogenital',
		description: 'Dryness of vagina (sensation of dryness, burning, difficulty with intercourse)',
		subscale: 'urogenital',
		getScore: (d) => d.mrsSymptomScale.vaginalDryness
	}
];
