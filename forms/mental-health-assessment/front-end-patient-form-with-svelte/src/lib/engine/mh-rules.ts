import type { PhqResponses, GadResponses, SeverityLevel } from './types';

// ──────────────────────────────────────────────
// PHQ-9 Scoring Rules
// ──────────────────────────────────────────────

/** PHQ-9 question labels for display */
export const phq9Questions: string[] = [
	'Little interest or pleasure in doing things',
	'Feeling down, depressed, or hopeless',
	'Trouble falling or staying asleep, or sleeping too much',
	'Feeling tired or having little energy',
	'Poor appetite or overeating',
	'Feeling bad about yourself, or that you are a failure, or have let yourself or your family down',
	'Trouble concentrating on things, such as reading the newspaper or watching television',
	'Moving or speaking so slowly that other people could have noticed, or the opposite — being so fidgety or restless',
	'Thoughts that you would be better off dead, or of hurting yourself in some way'
];

/** PHQ-9 answer options */
export const phqAnswerOptions = [
	{ value: 0, label: 'Not at all' },
	{ value: 1, label: 'Several days' },
	{ value: 2, label: 'More than half the days' },
	{ value: 3, label: 'Nearly every day' }
];

/** Calculate PHQ-9 total score (0-27) from responses. Returns null if any response is null. */
export function calculatePhq9Score(responses: PhqResponses): number | null {
	const values = [
		responses.interest,
		responses.depression,
		responses.sleep,
		responses.energy,
		responses.appetite,
		responses.selfEsteem,
		responses.concentration,
		responses.psychomotor,
		responses.suicidalThoughts
	];
	if (values.some((v) => v === null)) return null;
	return values.reduce((sum, v) => sum + (v ?? 0), 0);
}

/** Map PHQ-9 total score to severity level */
export function phq9Severity(score: number): SeverityLevel {
	if (score <= 4) return 'minimal';
	if (score <= 9) return 'mild';
	if (score <= 14) return 'moderate';
	if (score <= 19) return 'moderately-severe';
	return 'severe';
}

/** Map PHQ-9 severity to human-readable label */
export function phq9SeverityLabel(severity: SeverityLevel): string {
	switch (severity) {
		case 'minimal':
			return 'Minimal Depression (0-4)';
		case 'mild':
			return 'Mild Depression (5-9)';
		case 'moderate':
			return 'Moderate Depression (10-14)';
		case 'moderately-severe':
			return 'Moderately Severe Depression (15-19)';
		case 'severe':
			return 'Severe Depression (20-27)';
	}
}

// ──────────────────────────────────────────────
// GAD-7 Scoring Rules
// ──────────────────────────────────────────────

/** GAD-7 question labels for display */
export const gad7Questions: string[] = [
	'Feeling nervous, anxious, or on edge',
	'Not being able to stop or control worrying',
	'Worrying too much about different things',
	'Trouble relaxing',
	'Being so restless that it is hard to sit still',
	'Becoming easily annoyed or irritable',
	'Feeling afraid, as if something awful might happen'
];

/** GAD-7 answer options (same scale as PHQ-9) */
export const gadAnswerOptions = [
	{ value: 0, label: 'Not at all' },
	{ value: 1, label: 'Several days' },
	{ value: 2, label: 'More than half the days' },
	{ value: 3, label: 'Nearly every day' }
];

/** Calculate GAD-7 total score (0-21) from responses. Returns null if any response is null. */
export function calculateGad7Score(responses: GadResponses): number | null {
	const values = [
		responses.nervousness,
		responses.uncontrollableWorry,
		responses.excessiveWorry,
		responses.troubleRelaxing,
		responses.restlessness,
		responses.irritability,
		responses.fearfulness
	];
	if (values.some((v) => v === null)) return null;
	return values.reduce((sum, v) => sum + (v ?? 0), 0);
}

/** Map GAD-7 total score to severity level */
export function gad7Severity(score: number): SeverityLevel {
	if (score <= 4) return 'minimal';
	if (score <= 9) return 'mild';
	if (score <= 14) return 'moderate';
	return 'severe';
}

/** Map GAD-7 severity to human-readable label */
export function gad7SeverityLabel(severity: SeverityLevel): string {
	switch (severity) {
		case 'minimal':
			return 'Minimal Anxiety (0-4)';
		case 'mild':
			return 'Mild Anxiety (5-9)';
		case 'moderate':
			return 'Moderate Anxiety (10-14)';
		case 'moderately-severe':
			return 'Moderately Severe Anxiety (15-17)';
		case 'severe':
			return 'Severe Anxiety (15-21)';
	}
}

// ──────────────────────────────────────────────
// AUDIT-C Scoring Rules
// ──────────────────────────────────────────────

/** Calculate AUDIT-C score (0-12) from substance use data.
 * Frequency: never=0, monthly-or-less=1, 2-4-per-month=2, 2-3-per-week=3, 4-or-more-per-week=4
 * Quantity: 1-2=0, 3-4=1, 5-6=2, 7-9=3, 10-or-more=4
 * Binge: never=0, less-than-monthly=1, monthly=2, weekly=3, daily-or-almost=4
 */
export function calculateAuditCScore(
	frequency: string,
	quantity: string,
	binge: string
): number | null {
	const freqScore: Record<string, number> = {
		'never': 0,
		'monthly-or-less': 1,
		'2-4-per-month': 2,
		'2-3-per-week': 3,
		'4-or-more-per-week': 4
	};
	const qtyScore: Record<string, number> = {
		'1-2': 0,
		'3-4': 1,
		'5-6': 2,
		'7-9': 3,
		'10-or-more': 4
	};
	const bingeScore: Record<string, number> = {
		'never': 0,
		'less-than-monthly': 1,
		'monthly': 2,
		'weekly': 3,
		'daily-or-almost': 4
	};

	if (!frequency || !quantity || !binge) return null;

	const f = freqScore[frequency] ?? null;
	const q = qtyScore[quantity] ?? null;
	const b = bingeScore[binge] ?? null;

	if (f === null || q === null || b === null) return null;
	return f + q + b;
}
