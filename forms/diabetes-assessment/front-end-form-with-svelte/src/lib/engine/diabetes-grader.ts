import type { AssessmentData, ControlLevel, FiredRule } from './types';
import { evaluateRules } from './diabetes-rules';
import { collectScoredItems, calculateCompositeScore } from './utils';

/**
 * Pure function: evaluates all diabetes rules against assessment data.
 * Returns the control level, composite score (0-100), and fired rules.
 * If fewer than 2 scored items are answered and no HbA1c, returns "draft" status.
 */
export function calculateControl(data: AssessmentData): {
	controlLevel: ControlLevel;
	controlScore: number;
	firedRules: FiredRule[];
} {
	// Check if enough items are answered
	const items = collectScoredItems(data);
	const answeredCount = items.filter((x) => x !== null).length;
	const hasHba1c = data.glycaemicControl.hba1cValue !== null;

	if (answeredCount < 2 && !hasHba1c) {
		return { controlLevel: 'draft', controlScore: 0, firedRules: [] };
	}

	// Calculate composite score
	const score = calculateCompositeScore(data) ?? 0;

	// Fire rules
	const firedRules = evaluateRules(data);

	// Determine control level from composite score
	let controlLevel: ControlLevel;
	if (score <= 20) {
		controlLevel = 'veryPoor';
	} else if (score <= 40) {
		controlLevel = 'poor';
	} else if (score < 65) {
		controlLevel = 'suboptimal';
	} else {
		controlLevel = 'wellControlled';
	}

	return { controlLevel, controlScore: score, firedRules };
}
