import type { AssessmentData, FiredRule } from './types';
import { ipssQuestions } from './ipss-rules';
import { ipssCategory } from './utils';

/**
 * Pure function: calculates the IPSS score from patient questionnaire data.
 * Returns the total score (0-35), its category label, and fired rules
 * for each question that contributed to the score.
 *
 * IPSS Scoring:
 *   0-7   = Mild symptoms
 *   8-19  = Moderate symptoms
 *   20-35 = Severe symptoms
 */
export function calculateIPSS(data: AssessmentData): {
	ipssScore: number;
	ipssCategoryLabel: string;
	firedRules: FiredRule[];
} {
	const firedRules: FiredRule[] = [];
	const q = data.ipssQuestionnaire;

	const scores: (number | null)[] = [
		q.q1, q.q2, q.q3, q.q4, q.q5,
		q.q6, q.q7
	];

	let ipssScore = 0;

	for (let i = 0; i < scores.length; i++) {
		const score = scores[i];
		if (score !== null && score > 0) {
			const question = ipssQuestions[i];
			firedRules.push({
				id: question.id,
				domain: question.domain,
				description: question.text,
				score
			});
			ipssScore += score;
		} else if (score !== null) {
			ipssScore += score;
		}
	}

	const ipssCategoryLabel = ipssCategory(ipssScore);

	return { ipssScore, ipssCategoryLabel, firedRules };
}
