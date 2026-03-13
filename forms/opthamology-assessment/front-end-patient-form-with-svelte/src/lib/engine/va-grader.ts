import type { AssessmentData, VAGrade, FiredRule } from './types';
import { vaRules } from './va-rules';

/** VA grade severity ordering for comparison. */
const gradeOrder: Record<VAGrade, number> = {
	normal: 0,
	mild: 1,
	moderate: 2,
	severe: 3,
	blindness: 4
};

/**
 * Pure function: evaluates all VA rules against patient data.
 * Returns the maximum (worst) grade among all fired rules,
 * defaulting to 'normal' for healthy eyes with no fired rules.
 */
export function calculateVisualAcuityGrade(data: AssessmentData): {
	vaGrade: VAGrade;
	firedRules: FiredRule[];
} {
	const firedRules: FiredRule[] = [];

	for (const rule of vaRules) {
		try {
			if (rule.evaluate(data)) {
				firedRules.push({
					id: rule.id,
					system: rule.system,
					description: rule.description,
					grade: rule.grade
				});
			}
		} catch (e) {
			// Rule evaluation failed - log for debugging but continue grading
			console.warn(`VA rule ${rule.id} evaluation failed:`, e);
		}
	}

	const vaGrade: VAGrade =
		firedRules.length === 0
			? 'normal'
			: firedRules.reduce<VAGrade>((worst, rule) => {
					return gradeOrder[rule.grade] > gradeOrder[worst] ? rule.grade : worst;
				}, 'normal');

	return { vaGrade, firedRules };
}
