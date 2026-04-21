import type { AssessmentData, FiredRule } from './types';
import { tinettiBalanceItems, tinettiGaitItems } from './tinetti-rules';
import { tinettiCategory } from './utils';

/**
 * Pure function: calculates the Tinetti score from patient assessment data.
 * Returns the total score (0-28), balance subscore (0-16), gait subscore (0-12),
 * its category label, and fired rules for each item that contributed to the score.
 *
 * Tinetti Total Score (0-28):
 *   25-28 = Low fall risk
 *   19-24 = Moderate fall risk
 *   0-18  = High fall risk
 */
export function calculateTinetti(data: AssessmentData): {
	tinettiTotal: number;
	balanceScore: number;
	gaitScore: number;
	tinettiCategoryLabel: string;
	firedRules: FiredRule[];
} {
	const firedRules: FiredRule[] = [];
	const bal = data.balanceAssessment;
	const gait = data.gaitAssessment;

	const balanceScores: (number | null)[] = [
		bal.sittingBalance,
		bal.risesFromChair,
		bal.attemptingToRise,
		bal.immediateStandingBalance,
		bal.standingBalance,
		bal.nudgedBalance,
		bal.eyesClosed,
		bal.turning360,
		bal.sittingDown
	];

	const gaitScores: (number | null)[] = [
		gait.initiationOfGait,
		gait.stepLength,
		gait.stepHeight,
		gait.stepSymmetry,
		gait.stepContinuity,
		gait.path,
		gait.trunk,
		gait.walkingStance
	];

	let balanceScore = 0;
	for (let i = 0; i < balanceScores.length; i++) {
		const score = balanceScores[i];
		if (score !== null) {
			const item = tinettiBalanceItems[i];
			if (score > 0) {
				firedRules.push({
					id: item.id,
					domain: 'Balance',
					description: item.text,
					score
				});
			}
			balanceScore += score;
		}
	}

	let gaitScore = 0;
	for (let i = 0; i < gaitScores.length; i++) {
		const score = gaitScores[i];
		if (score !== null) {
			const item = tinettiGaitItems[i];
			if (score > 0) {
				firedRules.push({
					id: item.id,
					domain: 'Gait',
					description: item.text,
					score
				});
			}
			gaitScore += score;
		}
	}

	const tinettiTotal = balanceScore + gaitScore;
	const tinettiCategoryLabel = tinettiCategory(tinettiTotal);

	return { tinettiTotal, balanceScore, gaitScore, tinettiCategoryLabel, firedRules };
}
