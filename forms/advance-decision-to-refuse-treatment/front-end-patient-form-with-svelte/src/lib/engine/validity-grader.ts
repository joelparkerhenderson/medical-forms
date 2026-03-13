import type { AssessmentData, ValidityStatus, FiredRule } from './types';
import { validityRules } from './validity-rules';

/**
 * Pure function: evaluates all validity rules against ADRT data.
 *
 * Determines validity status based on which rules fire:
 * - If ANY critical rule fires (life-sustaining treatment requirements not met): Invalid
 * - If ANY required rule fires (missing legal requirements): Invalid
 * - If ONLY recommended rules fire: Complete (all required sections filled but could be improved)
 * - If NO rules fire: Valid (fully legally compliant)
 *
 * A "fired rule" means the rule's condition evaluated to true, indicating
 * that something is MISSING or WRONG (i.e., the rule detects a deficiency).
 */
export function calculateValidity(data: AssessmentData): {
	validityStatus: ValidityStatus;
	firedRules: FiredRule[];
} {
	const firedRules: FiredRule[] = [];

	for (const rule of validityRules) {
		try {
			if (rule.evaluate(data)) {
				firedRules.push({
					id: rule.id,
					category: rule.category,
					description: rule.description,
					severity: rule.severity
				});
			}
		} catch (e) {
			// Rule evaluation failed - log for debugging but continue
			console.warn(`Validity rule ${rule.id} evaluation failed:`, e);
		}
	}

	const hasCritical = firedRules.some((r) => r.severity === 'critical');
	const hasRequired = firedRules.some((r) => r.severity === 'required');
	const hasRecommended = firedRules.some((r) => r.severity === 'recommended');

	let validityStatus: ValidityStatus;
	if (hasCritical || hasRequired) {
		// Check if most fields are empty (draft vs invalid)
		const isDraft = isLikelyDraft(data);
		validityStatus = isDraft ? 'draft' : 'invalid';
	} else if (hasRecommended) {
		validityStatus = 'complete';
	} else {
		validityStatus = 'valid';
	}

	return { validityStatus, firedRules };
}

/** Heuristic: if core identification fields are empty, treat as draft rather than invalid. */
function isLikelyDraft(data: AssessmentData): boolean {
	return (
		data.personalInformation.fullLegalName.trim() === '' &&
		data.personalInformation.dateOfBirth === '' &&
		data.legalSignatures.patientSignature !== 'yes'
	);
}
