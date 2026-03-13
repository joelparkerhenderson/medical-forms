import type { StatementData, CompletenessLevel, MissingSection, CompletenessResult } from './types';
import { completenessRules } from './completeness-rules';
import { detectFlaggedIssues } from './flagged-issues';

/**
 * Pure function: evaluates all completeness rules against statement data.
 * Returns a completeness level based on how many sections are filled:
 *   - Incomplete: critical required sections are missing
 *   - Partial: some sections completed but required ones missing
 *   - Complete: all required sections filled
 *   - Verified: complete + witnessed + signed by healthcare professional
 */
export function calculateCompleteness(data: StatementData): CompletenessResult {
	const missingSections: MissingSection[] = [];
	let completedCount = 0;
	const totalCount = completenessRules.length;

	for (const rule of completenessRules) {
		try {
			if (rule.evaluate(data)) {
				completedCount++;
			} else {
				missingSections.push({
					id: rule.id,
					section: rule.section,
					description: rule.description,
					required: rule.required
				});
			}
		} catch (e) {
			// Rule evaluation failed - treat as missing
			console.warn(`Completeness rule ${rule.id} evaluation failed:`, e);
			missingSections.push({
				id: rule.id,
				section: rule.section,
				description: rule.description,
				required: rule.required
			});
		}
	}

	const flaggedIssues = detectFlaggedIssues(data);
	const missingRequired = missingSections.filter((s) => s.required);
	const level = determineLevel(data, missingRequired.length, completedCount);

	return {
		level,
		missingSections,
		flaggedIssues,
		completedCount,
		totalCount,
		timestamp: new Date().toISOString()
	};
}

function determineLevel(
	data: StatementData,
	missingRequiredCount: number,
	completedCount: number
): CompletenessLevel {
	// Verified: all required complete + witnessed + healthcare professional acknowledged
	const isWitnessed =
		data.signaturesWitnesses.witnessName.trim() !== '' &&
		data.signaturesWitnesses.witnessSignature.trim() !== '';
	const isProfessionalAcknowledged =
		data.signaturesWitnesses.healthcareProfessionalName.trim() !== '' &&
		data.signaturesWitnesses.healthcareProfessionalSignature.trim() !== '';

	if (missingRequiredCount === 0 && isWitnessed && isProfessionalAcknowledged) {
		return 'verified';
	}

	// Complete: all required sections filled
	if (missingRequiredCount === 0) {
		return 'complete';
	}

	// Partial: at least some sections completed
	if (completedCount > 0) {
		return 'partial';
	}

	// Incomplete: nothing filled
	return 'incomplete';
}
