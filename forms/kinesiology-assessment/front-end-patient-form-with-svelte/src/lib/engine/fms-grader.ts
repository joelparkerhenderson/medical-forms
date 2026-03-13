import type { AssessmentData, FiredRule } from './types';
import { fmsPatterns } from './fms-rules';
import { fmsCategory } from './utils';

/**
 * Pure function: calculates the FMS score from patient movement screen data.
 * Returns the total score (0-21), its category label, and fired rules
 * for each pattern that contributed to the score.
 *
 * FMS Scoring:
 *   18-21 = Excellent
 *   14-17 = Good
 *   10-13 = Fair
 *    0-9  = Poor
 *
 * For bilateral patterns (hurdle step, in-line lunge, shoulder mobility,
 * active straight leg raise, rotary stability), the lower of the left/right
 * scores is used. If pain is present during any movement, the score is 0.
 */
export function calculateFMS(data: AssessmentData): {
	fmsScore: number;
	fmsCategoryLabel: string;
	firedRules: FiredRule[];
} {
	const firedRules: FiredRule[] = [];
	const p = data.fmsPatterns;

	const patternScores = [
		p.deepSquat,
		p.hurdleStep,
		p.inLineLunge,
		p.shoulderMobility,
		p.activeStraightLegRaise,
		p.trunkStabilityPushUp,
		p.rotaryStability
	];

	let fmsScore = 0;

	for (let i = 0; i < patternScores.length; i++) {
		const pattern = patternScores[i];
		const definition = fmsPatterns[i];

		// If pain during movement, score is 0
		if (pattern.painDuringMovement) {
			firedRules.push({
				id: definition.id,
				pattern: definition.pattern,
				description: `Pain during ${definition.pattern} - score set to 0`,
				score: 0
			});
			continue;
		}

		// For bilateral tests, use the lower of left/right scores
		let effectiveScore: number | null = pattern.score;

		if (pattern.leftScore !== null && pattern.rightScore !== null) {
			effectiveScore = Math.min(pattern.leftScore, pattern.rightScore);
		} else if (pattern.leftScore !== null || pattern.rightScore !== null) {
			effectiveScore = pattern.leftScore ?? pattern.rightScore;
		}

		if (effectiveScore !== null) {
			firedRules.push({
				id: definition.id,
				pattern: definition.pattern,
				description: definition.description,
				score: effectiveScore
			});
			fmsScore += effectiveScore;
		}
	}

	const fmsCategoryLabel = fmsCategory(fmsScore);

	return { fmsScore, fmsCategoryLabel, firedRules };
}
