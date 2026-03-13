import type { AssessmentData, FiredRule } from './types';
import { copmActivities } from './copm-rules';
import { copmPerformanceCategory } from './utils';

/**
 * Pure function: calculates the COPM scores from patient assessment data.
 * Returns the average performance score (1-10), average satisfaction score (1-10),
 * their category labels, and fired rules for each activity that contributed.
 *
 * COPM Scoring:
 *   Average Performance Score (1-10):
 *     < 5  = Significant issues
 *     5-7  = Moderate concerns
 *     > 7  = Good performance
 *
 *   Average Satisfaction Score (1-10):
 *     < 5  = Significant issues
 *     5-7  = Moderate concerns
 *     > 7  = Good satisfaction
 */
export function calculateCOPM(data: AssessmentData): {
	performanceScore: number;
	satisfactionScore: number;
	performanceCategoryLabel: string;
	satisfactionCategoryLabel: string;
	firedRules: FiredRule[];
} {
	const firedRules: FiredRule[] = [];
	const perf = data.performanceRatings;
	const sat = data.satisfactionRatings;

	const performanceScores: (number | null)[] = [
		perf.activity1.performanceScore,
		perf.activity2.performanceScore,
		perf.activity3.performanceScore,
		perf.activity4.performanceScore,
		perf.activity5.performanceScore
	];

	const satisfactionScores: (number | null)[] = [
		sat.activity1.satisfactionScore,
		sat.activity2.satisfactionScore,
		sat.activity3.satisfactionScore,
		sat.activity4.satisfactionScore,
		sat.activity5.satisfactionScore
	];

	let perfTotal = 0;
	let perfCount = 0;

	for (let i = 0; i < performanceScores.length; i++) {
		const score = performanceScores[i];
		if (score !== null) {
			const activity = copmActivities[i];
			const activityName = [
				perf.activity1.name,
				perf.activity2.name,
				perf.activity3.name,
				perf.activity4.name,
				perf.activity5.name
			][i];
			firedRules.push({
				id: activity.id,
				domain: 'Performance',
				description: activityName || activity.text,
				score
			});
			perfTotal += score;
			perfCount++;
		}
	}

	let satTotal = 0;
	let satCount = 0;

	for (let i = 0; i < satisfactionScores.length; i++) {
		const score = satisfactionScores[i];
		if (score !== null) {
			const activityName = [
				sat.activity1.name,
				sat.activity2.name,
				sat.activity3.name,
				sat.activity4.name,
				sat.activity5.name
			][i];
			firedRules.push({
				id: `COPM-SAT-0${i + 1}`,
				domain: 'Satisfaction',
				description: activityName || `Activity ${i + 1} satisfaction`,
				score
			});
			satTotal += score;
			satCount++;
		}
	}

	const performanceScore = perfCount > 0 ? Math.round((perfTotal / perfCount) * 10) / 10 : 0;
	const satisfactionScore = satCount > 0 ? Math.round((satTotal / satCount) * 10) / 10 : 0;

	const performanceCategoryLabel = copmPerformanceCategory(performanceScore);
	const satisfactionCategoryLabel = copmPerformanceCategory(satisfactionScore);

	return { performanceScore, satisfactionScore, performanceCategoryLabel, satisfactionCategoryLabel, firedRules };
}
