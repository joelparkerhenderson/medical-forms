import type { AssessmentData, ScoreResult, GradingResult } from './types';
import {
	calculatePhq9Score,
	phq9Severity,
	phq9SeverityLabel,
	calculateGad7Score,
	gad7Severity,
	gad7SeverityLabel
} from './mh-rules';
import { detectAdditionalFlags } from './flagged-issues';

/**
 * Calculate the PHQ-9 depression score from assessment data.
 * Returns a ScoreResult with score, max, severity, and label.
 */
export function calculatePHQ9(data: AssessmentData): ScoreResult {
	const score = calculatePhq9Score(data.phqResponses);
	if (score === null) {
		return {
			instrument: 'PHQ-9',
			score: 0,
			maxScore: 27,
			severity: 'minimal',
			label: 'Incomplete'
		};
	}
	const severity = phq9Severity(score);
	return {
		instrument: 'PHQ-9',
		score,
		maxScore: 27,
		severity,
		label: phq9SeverityLabel(severity)
	};
}

/**
 * Calculate the GAD-7 anxiety score from assessment data.
 * Returns a ScoreResult with score, max, severity, and label.
 */
export function calculateGAD7(data: AssessmentData): ScoreResult {
	const score = calculateGad7Score(data.gadResponses);
	if (score === null) {
		return {
			instrument: 'GAD-7',
			score: 0,
			maxScore: 21,
			severity: 'minimal',
			label: 'Incomplete'
		};
	}
	const severity = gad7Severity(score);
	return {
		instrument: 'GAD-7',
		score,
		maxScore: 21,
		severity,
		label: gad7SeverityLabel(severity)
	};
}

/**
 * Pure function: evaluates PHQ-9, GAD-7, and detects additional flags.
 * Returns the complete GradingResult.
 */
export function gradeAssessment(data: AssessmentData): GradingResult {
	const phq9 = calculatePHQ9(data);
	const gad7 = calculateGAD7(data);
	const additionalFlags = detectAdditionalFlags(data);

	return {
		phq9,
		gad7,
		additionalFlags,
		timestamp: new Date().toISOString()
	};
}
