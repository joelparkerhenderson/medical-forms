import type { AssessmentData, GoldStage, AbcdGroup, FiredRule } from './types';
import { goldRules } from './gold-rules';
import { determineAbcdGroup } from './utils';

/**
 * Pure function: evaluates all GOLD rules against patient data.
 * Returns the maximum stage among all fired rules (worst severity),
 * defaulting to GOLD I when spirometry confirms obstruction but no higher rules fire.
 * Also computes the ABCD group classification.
 */
export function calculateGold(data: AssessmentData): {
	goldStage: GoldStage;
	abcdGroup: AbcdGroup;
	firedRules: FiredRule[];
} {
	const firedRules: FiredRule[] = [];

	for (const rule of goldRules) {
		try {
			if (rule.evaluate(data)) {
				firedRules.push({
					id: rule.id,
					system: rule.system,
					description: rule.description,
					stage: rule.stage
				});
			}
		} catch (e) {
			// Rule evaluation failed - log for debugging but continue grading
			console.warn(`GOLD rule ${rule.id} evaluation failed:`, e);
		}
	}

	const goldStage: GoldStage =
		firedRules.length === 0
			? 1
			: (Math.max(...firedRules.map((r) => r.stage)) as GoldStage);

	const abcdGroup = determineAbcdGroup(
		data.symptomAssessment.catScore,
		data.symptomAssessment.mmrcDyspnoea,
		data.exacerbationHistory.exacerbationsPerYear,
		data.exacerbationHistory.hospitalizationsPerYear
	) as AbcdGroup;

	return { goldStage, abcdGroup, firedRules };
}
