import type { AssessmentData, FiredRule } from './types';
import { aq10Questions } from './aq10-rules';
import { aq10Category } from './utils';

/**
 * Pure function: calculates the AQ-10 score from patient questionnaire data.
 * Returns the total score (0-10), its category label, and fired rules
 * for each question that contributed to the score.
 *
 * AQ-10 Scoring:
 *   0-5  = Below threshold - autism unlikely
 *   6-10 = At or above threshold - further assessment recommended
 */
export function calculateAQ10(data: AssessmentData): {
	aq10Score: number;
	aq10CategoryLabel: string;
	firedRules: FiredRule[];
} {
	const firedRules: FiredRule[] = [];
	const q = data.aq10Questionnaire;

	const scores: (number | null)[] = [
		q.q1, q.q2, q.q3, q.q4, q.q5,
		q.q6, q.q7, q.q8, q.q9, q.q10
	];

	let aq10Score = 0;

	for (let i = 0; i < scores.length; i++) {
		const score = scores[i];
		if (score !== null && score > 0) {
			const question = aq10Questions[i];
			firedRules.push({
				id: question.id,
				domain: question.domain,
				description: question.text,
				score
			});
			aq10Score += score;
		} else if (score !== null) {
			aq10Score += score;
		}
	}

	const aq10CategoryLabel = aq10Category(aq10Score);

	return { aq10Score, aq10CategoryLabel, firedRules };
}
