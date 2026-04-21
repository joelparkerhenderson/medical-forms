import type { AssessmentData, FiredRule } from './types';
import { dashQuestions } from './dash-rules';
import { dashCategory } from './utils';

/**
 * Pure function: calculates the DASH score from patient questionnaire data.
 * Returns the total score (0-100), its category label, and fired rules
 * for each question that contributed to the score.
 *
 * DASH Scoring:
 *   DASH = ((sum of n responses / n) - 1) * 25
 *   Minimum 27 of 30 items must be answered.
 *
 * DASH Score Categories:
 *   0-20  = No disability
 *   21-40 = Mild disability
 *   41-60 = Moderate disability
 *   61-80 = Severe disability
 *   81-100 = Very severe disability
 */
export function calculateDASH(data: AssessmentData): {
	dashScore: number | null;
	dashCategoryLabel: string;
	firedRules: FiredRule[];
} {
	const firedRules: FiredRule[] = [];
	const q = data.dashQuestionnaire;

	const scores: (number | null)[] = [
		q.q1, q.q2, q.q3, q.q4, q.q5,
		q.q6, q.q7, q.q8, q.q9, q.q10,
		q.q11, q.q12, q.q13, q.q14, q.q15,
		q.q16, q.q17, q.q18, q.q19, q.q20,
		q.q21, q.q22, q.q23, q.q24, q.q25,
		q.q26, q.q27, q.q28, q.q29, q.q30
	];

	let sum = 0;
	let answeredCount = 0;

	for (let i = 0; i < scores.length; i++) {
		const score = scores[i];
		if (score !== null) {
			answeredCount++;
			sum += score;
			if (score > 1) {
				const question = dashQuestions[i];
				firedRules.push({
					id: question.id,
					domain: question.domain,
					description: question.text,
					score
				});
			}
		}
	}

	// Minimum 27 of 30 items must be answered
	if (answeredCount < 27) {
		return {
			dashScore: null,
			dashCategoryLabel: 'Insufficient responses (minimum 27 of 30 required)',
			firedRules
		};
	}

	const dashScore = Math.round(((sum / answeredCount) - 1) * 25 * 100) / 100;
	const dashCategoryLabel = dashCategory(dashScore);

	return { dashScore, dashCategoryLabel, firedRules };
}
