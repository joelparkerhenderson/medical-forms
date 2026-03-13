import type { AssessmentData, DomainResult, OverallResult, FiredRule } from './types';
import { devScreenRules } from './dev-rules';

/**
 * Pure function: evaluates all developmental screening rules against child data.
 * Returns domain-level results and an overall developmental screen result.
 *
 * Domain results: Pass / Concern / Fail per domain
 * Overall: Normal (no concerns) / Developmental Concern (any concern) / Developmental Delay (any fail)
 */
export function calculateDevelopmentalScreen(data: AssessmentData): {
	overallResult: OverallResult;
	domainResults: Record<string, DomainResult>;
	firedRules: FiredRule[];
} {
	const firedRules: FiredRule[] = [];

	for (const rule of devScreenRules) {
		try {
			if (rule.evaluate(data)) {
				firedRules.push({
					id: rule.id,
					domain: rule.domain,
					description: rule.description,
					result: rule.result
				});
			}
		} catch (e) {
			// Rule evaluation failed - log for debugging but continue screening
			console.warn(`Dev screen rule ${rule.id} evaluation failed:`, e);
		}
	}

	// Build domain results from the five core developmental domains
	const coreDomainsMap: Record<string, DomainResult> = {
		'Gross Motor': data.developmentalMilestones.grossMotor || 'pass',
		'Fine Motor': data.developmentalMilestones.fineMotor || 'pass',
		'Language': data.developmentalMilestones.language || 'pass',
		'Social-Emotional': data.developmentalMilestones.socialEmotional || 'pass',
		'Cognitive': data.developmentalMilestones.cognitive || 'pass'
	};

	// Determine overall result based on worst outcome
	const hasFail = firedRules.some((r) => r.result === 'fail');
	const hasConcern = firedRules.some((r) => r.result === 'concern');

	let overallResult: OverallResult;
	if (hasFail) {
		overallResult = 'developmental-delay';
	} else if (hasConcern) {
		overallResult = 'developmental-concern';
	} else {
		overallResult = 'normal';
	}

	return { overallResult, domainResults: coreDomainsMap, firedRules };
}
