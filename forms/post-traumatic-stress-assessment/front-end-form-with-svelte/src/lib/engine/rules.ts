import type { AssessmentData, FiredRule, SeverityCategory } from './types';

/**
 * Rules that fire based on the computed PCL-5 result.
 */
export function detectFiredRules(
	_data: AssessmentData,
	total: number,
	category: SeverityCategory,
	probableDsm5: boolean
): FiredRule[] {
	const firedRules: FiredRule[] = [];

	if (total >= 33) {
		firedRules.push({
			id: 'PCL-001',
			category: 'Provisional PTSD cut-off',
			description: `Total score ${total} meets or exceeds the provisional PTSD cut-off of 33`,
			severity: total >= 38 ? 'high' : 'medium'
		});
	}

	if (probableDsm5) {
		firedRules.push({
			id: 'PCL-002',
			category: 'DSM-5 symptom pattern',
			description:
				'Symptom pattern meets DSM-5 criteria for probable PTSD (B ≥ 1, C ≥ 1, D ≥ 2, E ≥ 2 items rated ≥ 2)',
			severity: 'high'
		});
	}

	if (category === 'Severe') {
		firedRules.push({
			id: 'PCL-003',
			category: 'Severe symptom burden',
			description: 'Total score ≥ 38 indicates clinically significant PTSD',
			severity: 'critical'
		});
	}

	return firedRules;
}
