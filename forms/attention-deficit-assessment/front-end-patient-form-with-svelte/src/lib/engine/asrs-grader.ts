import type { AssessmentData, ADHDClassification, ADHDSubtype, FiredRule, GradingResult } from './types';
import { asrsRules } from './asrs-rules';
import { sumScores, countPartAShadedItems, classifyFromTotal, determineSubtype } from './utils';
import { detectAdditionalFlags } from './flagged-issues';

/**
 * Pure function: evaluates all ASRS rules against patient data.
 * Returns the ASRS scores, classification, subtype, fired rules, and flags.
 */
export function calculateASRS(data: AssessmentData): GradingResult {
	// Calculate Part A score (6 items, 0-24)
	const partAScores = [
		data.asrsPartA.focusDifficulty,
		data.asrsPartA.organizationDifficulty,
		data.asrsPartA.rememberingDifficulty,
		data.asrsPartA.avoidingTasks,
		data.asrsPartA.fidgeting,
		data.asrsPartA.overlyActive
	];
	const partAScore = sumScores(partAScores);

	// Calculate Part B score (12 items, 0-48)
	const partBScores = [
		data.asrsPartB.carelessMistakes,
		data.asrsPartB.attentionDifficulty,
		data.asrsPartB.concentrationDifficulty,
		data.asrsPartB.misplacingThings,
		data.asrsPartB.distractedByNoise,
		data.asrsPartB.leavingSeat,
		data.asrsPartB.restlessness,
		data.asrsPartB.difficultyRelaxing,
		data.asrsPartB.talkingTooMuch,
		data.asrsPartB.finishingSentences,
		data.asrsPartB.difficultyWaiting,
		data.asrsPartB.interruptingOthers
	];
	const partBScore = sumScores(partBScores);

	// Total ASRS score (0-72)
	const asrsTotal = partAScore + partBScore;

	// Part A Screener: count items in shaded range
	const shadedCount = countPartAShadedItems(
		data.asrsPartA.focusDifficulty,
		data.asrsPartA.organizationDifficulty,
		data.asrsPartA.rememberingDifficulty,
		data.asrsPartA.avoidingTasks,
		data.asrsPartA.fidgeting,
		data.asrsPartA.overlyActive
	);
	const partAScreenerPositive = shadedCount >= 4;

	// Inattentive subscore (Part A Q1-3 + Part B Q7-11): 8 items
	const inattentiveSubscore = sumScores([
		data.asrsPartA.focusDifficulty,
		data.asrsPartA.organizationDifficulty,
		data.asrsPartA.rememberingDifficulty,
		data.asrsPartB.carelessMistakes,
		data.asrsPartB.attentionDifficulty,
		data.asrsPartB.concentrationDifficulty,
		data.asrsPartB.misplacingThings,
		data.asrsPartB.distractedByNoise
	]);

	// Hyperactive-Impulsive subscore (Part A Q4-6 + Part B Q12-18): 10 items
	const hyperactiveImpulsiveSubscore = sumScores([
		data.asrsPartA.avoidingTasks,
		data.asrsPartA.fidgeting,
		data.asrsPartA.overlyActive,
		data.asrsPartB.leavingSeat,
		data.asrsPartB.restlessness,
		data.asrsPartB.difficultyRelaxing,
		data.asrsPartB.talkingTooMuch,
		data.asrsPartB.finishingSentences,
		data.asrsPartB.difficultyWaiting,
		data.asrsPartB.interruptingOthers
	]);

	// Determine classification
	const classification: ADHDClassification = classifyFromTotal(asrsTotal, partAScreenerPositive);

	// Determine subtype
	const subtype: ADHDSubtype = determineSubtype(
		inattentiveSubscore,
		hyperactiveImpulsiveSubscore,
		classification
	);

	// Evaluate declarative rules
	const firedRules: FiredRule[] = [];
	for (const rule of asrsRules) {
		try {
			if (rule.evaluate(data)) {
				firedRules.push({
					id: rule.id,
					domain: rule.domain,
					description: rule.description,
					classification: rule.classification
				});
			}
		} catch (e) {
			console.warn(`ASRS rule ${rule.id} evaluation failed:`, e);
		}
	}

	// Detect flags
	const additionalFlags = detectAdditionalFlags(data);

	return {
		asrsTotal,
		partAScore,
		partBScore,
		inattentiveSubscore,
		hyperactiveImpulsiveSubscore,
		partAScreenerPositive,
		classification,
		subtype,
		firedRules,
		additionalFlags,
		timestamp: new Date().toISOString()
	};
}
