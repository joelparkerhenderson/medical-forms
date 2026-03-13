import type { AssessmentData, FiredRule } from './types';
import { dlqiQuestions } from './dlqi-rules';
import { dlqiCategory } from './utils';

/**
 * Pure function: calculates the DLQI score from patient questionnaire data.
 * Returns the total score (0-30), its category label, and fired rules
 * for each question that contributed to the score.
 *
 * DLQI Scoring:
 *   0-1  = No effect on patient's life
 *   2-5  = Small effect on patient's life
 *   6-10 = Moderate effect on patient's life
 *   11-20 = Very large effect on patient's life
 *   21-30 = Extremely large effect on patient's life
 */
export function calculateDLQI(data: AssessmentData): {
	dlqiScore: number;
	dlqiCategoryLabel: string;
	firedRules: FiredRule[];
} {
	const firedRules: FiredRule[] = [];
	const q = data.dlqiQuestionnaire;

	const scores: (number | null)[] = [
		q.q1, q.q2, q.q3, q.q4, q.q5,
		q.q6, q.q7, q.q8, q.q9, q.q10
	];

	let dlqiScore = 0;

	for (let i = 0; i < scores.length; i++) {
		const score = scores[i];
		if (score !== null && score > 0) {
			const question = dlqiQuestions[i];
			firedRules.push({
				id: question.id,
				domain: question.domain,
				description: question.text,
				score
			});
			dlqiScore += score;
		} else if (score !== null) {
			dlqiScore += score;
		}
	}

	const dlqiCategoryLabel = dlqiCategory(dlqiScore);

	return { dlqiScore, dlqiCategoryLabel, firedRules };
}
