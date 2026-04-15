import type { AssessmentData, FiredRule } from './types';
import { validationRules } from './validation-rules';
import { completenessPercent, validationStatus } from './utils';

/**
 * Pure function: validates the completeness of the care privacy notice form.
 */
export function validateForm(data: AssessmentData): {
	completeness: number;
	status: 'Complete' | 'Incomplete';
	firedRules: FiredRule[];
} {
	const firedRules: FiredRule[] = [];

	for (const rule of validationRules) {
		const section = data[rule.section as keyof AssessmentData];
		if (!section) continue;
		const value = (section as Record<string, unknown>)[rule.field];

		// For the 'agreed' boolean field, false counts as empty
		if (value === '' || value === null || value === undefined || value === false) {
			firedRules.push({
				id: rule.id,
				section: rule.section,
				description: rule.message,
				field: rule.field
			});
		}
	}

	const totalRequired = validationRules.length;
	const completedCount = totalRequired - firedRules.length;
	const completeness = completenessPercent(completedCount, totalRequired);
	const status = validationStatus(completeness);

	return { completeness, status, firedRules };
}
