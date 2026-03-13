import type { AssessmentData, VaccinationLevel, FiredRule } from './types';
import { evaluateRules } from './vaccination-rules';
import { calculateCompositeScore, collectVaccinationItems } from './utils';

/**
 * Pure function: evaluates all vaccination rules against assessment data.
 * Returns the vaccination level, composite score (0-100), and fired rules.
 * If fewer than 5 items are answered, returns "draft" status.
 */
export function calculateVaccinationStatus(
	data: AssessmentData
): { level: VaccinationLevel; score: number; firedRules: FiredRule[] } {
	// Check if enough items are answered
	const items = collectVaccinationItems(data);
	const answeredCount = items.filter((x) => x !== null).length;

	if (answeredCount < 5) {
		return { level: 'draft', score: 0, firedRules: [] };
	}

	// Check for contraindications first
	const hasAnaphylaxis = data.contraindicationsAllergies.previousAnaphylaxis === 'yes';
	const isPregnant = data.contraindicationsAllergies.pregnant === 'yes';
	const isImmunocompromised = data.immunizationHistory.immunocompromised === 'yes';

	if (hasAnaphylaxis && (isPregnant || isImmunocompromised)) {
		const score = calculateCompositeScore(data) ?? 0;
		const firedRules = evaluateRules(data);
		return { level: 'contraindicated', score, firedRules };
	}

	// Calculate composite score
	const score = calculateCompositeScore(data) ?? 0;

	// Fire rules
	const firedRules = evaluateRules(data);

	// Determine vaccination level from composite score
	let level: VaccinationLevel;
	if (hasAnaphylaxis) {
		level = 'contraindicated';
	} else if (score >= 80) {
		level = 'upToDate';
	} else if (score >= 40) {
		level = 'partiallyComplete';
	} else {
		level = 'overdue';
	}

	return { level, score, firedRules };
}
