import type { AssessmentData, FiredRule } from './types';
import { nihssItems } from './nihss-rules';
import { nihssCategory } from './utils';

/**
 * Pure function: calculates the NIHSS score from patient assessment data.
 * Returns the total score (0-42), its category label, and fired rules
 * for each item that contributed to the score.
 *
 * NIHSS Scoring:
 *   0     = No stroke symptoms
 *   1-4   = Minor stroke
 *   5-15  = Moderate stroke
 *   16-20 = Moderate to severe stroke
 *   21-42 = Severe stroke
 */
export function calculateNIHSS(data: AssessmentData): {
	nihssScore: number;
	nihssCategoryLabel: string;
	firedRules: FiredRule[];
} {
	const firedRules: FiredRule[] = [];

	const scores: (number | null)[] = [
		data.levelOfConsciousness.loc,
		data.levelOfConsciousness.locQuestions,
		data.levelOfConsciousness.locCommands,
		data.bestGazeVisual.bestGaze,
		data.bestGazeVisual.visual,
		data.facialPalsy.facialPalsy,
		data.facialPalsy.leftArm,
		data.facialPalsy.rightArm,
		data.facialPalsy.leftLeg,
		data.facialPalsy.rightLeg,
		data.limbAtaxiaSensory.limbAtaxia,
		data.limbAtaxiaSensory.sensory,
		data.languageDysarthria.bestLanguage,
		data.languageDysarthria.dysarthria,
		data.extinctionInattention.extinctionInattention
	];

	let nihssScore = 0;

	for (let i = 0; i < scores.length; i++) {
		const score = scores[i];
		if (score !== null && score > 0) {
			const item = nihssItems[i];
			firedRules.push({
				id: item.id,
				domain: item.domain,
				description: item.text,
				score
			});
			nihssScore += score;
		} else if (score !== null) {
			nihssScore += score;
		}
	}

	const nihssCategoryLabel = nihssCategory(nihssScore);

	return { nihssScore, nihssCategoryLabel, firedRules };
}
