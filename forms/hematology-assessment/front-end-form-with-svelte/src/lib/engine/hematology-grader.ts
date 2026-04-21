import type { AssessmentData, AbnormalityLevel, FiredRule } from './types';
import { evaluateRules } from './hematology-rules';
import { calculateAbnormalityScore, collectNumericItems } from './utils';

/**
 * Pure function: evaluates all hematology rules against assessment data.
 * Returns the abnormality level, composite score (0-100), and fired rules.
 * If fewer than 3 numeric items are answered, returns "draft" status.
 */
export function calculateAbnormality(data: AssessmentData): {
	abnormalityLevel: AbnormalityLevel;
	abnormalityScore: number;
	firedRules: FiredRule[];
} {
	// Check if enough items are answered
	const items = collectNumericItems(data);
	const answeredCount = items.filter((x) => x !== null).length;

	if (answeredCount < 3) {
		return {
			abnormalityLevel: 'draft',
			abnormalityScore: 0,
			firedRules: []
		};
	}

	// Calculate composite abnormality score
	const score = calculateAbnormalityScore(data) ?? 0;

	// Fire rules
	const firedRules = evaluateRules(data);

	// Determine abnormality level from composite score
	let level: AbnormalityLevel;
	if (score === 0) {
		level = 'normal';
	} else if (score <= 20) {
		level = 'mildAbnormality';
	} else if (score <= 50) {
		level = 'moderateAbnormality';
	} else if (score <= 75) {
		level = 'severeAbnormality';
	} else {
		level = 'critical';
	}

	return {
		abnormalityLevel: level,
		abnormalityScore: score,
		firedRules
	};
}
