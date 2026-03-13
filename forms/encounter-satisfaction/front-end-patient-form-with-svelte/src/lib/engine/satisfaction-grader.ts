import type { AssessmentData, DomainScore, LikertScore } from './types';
import { satisfactionQuestions } from './satisfaction-questions';
import { satisfactionCategory } from './utils';

/**
 * Pure function: calculates the Encounter Satisfaction Score (ESS).
 * Returns the composite mean score (1.0-5.0), its category, and per-domain breakdowns.
 *
 * Composite Score = mean of all answered Likert questions.
 *
 * Categories:
 *   4.5 - 5.0 = Excellent
 *   3.5 - 4.4 = Good
 *   2.5 - 3.4 = Fair
 *   1.5 - 2.4 = Poor
 *   1.0 - 1.4 = Very Poor
 */
export function calculateSatisfaction(data: AssessmentData): {
	compositeScore: number;
	category: string;
	domainScores: DomainScore[];
	answeredCount: number;
} {
	const domainMap = new Map<string, DomainScore>();
	let totalSum = 0;
	let totalCount = 0;

	for (const question of satisfactionQuestions) {
		const score = getScoreForQuestion(data, question.domain, question.field);
		if (score === null) continue;

		totalSum += score;
		totalCount++;

		if (!domainMap.has(question.domain)) {
			domainMap.set(question.domain, {
				domain: question.domain,
				mean: 0,
				count: 0,
				questions: []
			});
		}

		const domain = domainMap.get(question.domain)!;
		domain.count++;
		domain.questions.push({ id: question.id, text: question.text, score });
	}

	// Calculate domain means
	for (const domain of domainMap.values()) {
		const sum = domain.questions.reduce((acc, q) => acc + q.score, 0);
		domain.mean = parseFloat((sum / domain.count).toFixed(2));
	}

	const compositeScore = totalCount > 0
		? parseFloat((totalSum / totalCount).toFixed(2))
		: 0;

	const category = totalCount > 0 ? satisfactionCategory(compositeScore) : 'No responses';

	return {
		compositeScore,
		category,
		domainScores: Array.from(domainMap.values()),
		answeredCount: totalCount
	};
}

function getScoreForQuestion(
	data: AssessmentData,
	domain: string,
	field: string
): LikertScore | null {
	switch (domain) {
		case 'Access & Scheduling':
			return data.accessScheduling[field as keyof typeof data.accessScheduling] as LikertScore | null;
		case 'Communication':
			return data.communication[field as keyof typeof data.communication] as LikertScore | null;
		case 'Staff & Professionalism':
			return data.staffProfessionalism[field as keyof typeof data.staffProfessionalism] as LikertScore | null;
		case 'Care Quality':
			return data.careQuality[field as keyof typeof data.careQuality] as LikertScore | null;
		case 'Environment':
			return data.environment[field as keyof typeof data.environment] as LikertScore | null;
		case 'Overall Satisfaction': {
			if (field === 'comments') return null;
			return data.overallSatisfaction[field as keyof typeof data.overallSatisfaction] as LikertScore | null;
		}
		default:
			return null;
	}
}
