import type { AssessmentData, FiredRule } from './types';
import { hhiesQuestions } from './hhies-rules';
import { hhiesCategory } from './utils';

/**
 * Pure function: calculates the HHIE-S score from patient questionnaire data.
 * Returns the total score (0-40), its category label, and fired rules
 * for each question that contributed to the score.
 *
 * HHIE-S Scoring:
 *   0-8   = No handicap
 *   10-22 = Mild to moderate handicap
 *   24-40 = Significant handicap
 */
export function calculateHHIES(data: AssessmentData): {
	hhiesScore: number;
	hhiesCategoryLabel: string;
	firedRules: FiredRule[];
} {
	const firedRules: FiredRule[] = [];
	const q = data.hhiesQuestionnaire;

	const scores: (number | null)[] = [
		q.q1, q.q2, q.q3, q.q4, q.q5,
		q.q6, q.q7, q.q8, q.q9, q.q10
	];

	let hhiesScore = 0;

	for (let i = 0; i < scores.length; i++) {
		const score = scores[i];
		if (score !== null && score > 0) {
			const question = hhiesQuestions[i];
			firedRules.push({
				id: question.id,
				domain: question.domain,
				description: question.text,
				score
			});
			hhiesScore += score;
		} else if (score !== null) {
			hhiesScore += score;
		}
	}

	const hhiesCategoryLabel = hhiesCategory(hhiesScore);

	return { hhiesScore, hhiesCategoryLabel, firedRules };
}
