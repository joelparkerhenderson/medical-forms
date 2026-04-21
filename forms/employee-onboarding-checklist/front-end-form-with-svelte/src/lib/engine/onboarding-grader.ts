import type { AssessmentData, RiskLevel, FiredRule, GradingResult, CompletionStatus } from './types';
import { onboardingRules } from './onboarding-rules';
import { detectAdditionalFlags } from './flagged-issues';
import { deriveCompletionStatus } from './utils';

/**
 * Pure function: evaluates all onboarding rules against employee data.
 * Returns completion percentage, status, risk level, and all fired rules.
 */
export function calculateOnboardingGrade(data: AssessmentData): GradingResult {
	const firedRules: FiredRule[] = [];

	for (const rule of onboardingRules) {
		try {
			if (rule.evaluate(data)) {
				firedRules.push({
					id: rule.id,
					category: rule.category,
					description: rule.description,
					grade: rule.grade
				});
			}
		} catch (e) {
			// Rule evaluation failed - log for debugging but continue grading
			console.warn(`Onboarding rule ${rule.id} evaluation failed:`, e);
		}
	}

	// Calculate completion percentage
	const { completed, total } = countCompletedItems(data);
	const completionPercentage = total > 0 ? Math.round((completed / total) * 1000) / 10 : 0;

	// Derive status from percentage
	const completionStatus = deriveCompletionStatus(completionPercentage);

	// Derive overall risk from worst fired rule grade
	const overallRisk = deriveOverallRisk(firedRules, completionPercentage);

	const additionalFlags = detectAdditionalFlags(data);

	return {
		completionPercentage,
		completionStatus,
		overallRisk,
		itemsCompleted: completed,
		itemsTotal: total,
		firedRules,
		additionalFlags,
		timestamp: new Date().toISOString()
	};
}

/** Count completed checklist items across all sections. */
function countCompletedItems(data: AssessmentData): { completed: number; total: number } {
	let completed = 0;
	let total = 0;

	// Pre-Employment (4 key items)
	total += 4;
	if (data.preEmploymentChecks.dbsCheckStatus === 'cleared') completed++;
	if (data.preEmploymentChecks.rightToWorkVerified === 'yes') completed++;
	if (data.preEmploymentChecks.referencesSatisfactory === 'yes') completed++;
	if (data.preEmploymentChecks.identityVerified === 'yes') completed++;

	// Occupational Health (3 key items)
	total += 3;
	if (data.occupationalHealth.ohClearanceReceived === 'yes') completed++;
	if (data.occupationalHealth.fitToWork === 'yes') completed++;
	if (data.occupationalHealth.immunisationStatus === 'complete') completed++;

	// Mandatory Training (9 key items)
	total += 9;
	if (data.mandatoryTraining.fireSafetyCompleted === 'yes') completed++;
	if (data.mandatoryTraining.manualHandlingCompleted === 'yes') completed++;
	if (data.mandatoryTraining.infectionControlCompleted === 'yes') completed++;
	if (data.mandatoryTraining.safeguardingAdultsCompleted === 'yes') completed++;
	if (data.mandatoryTraining.safeguardingChildrenCompleted === 'yes') completed++;
	if (data.mandatoryTraining.informationGovernanceCompleted === 'yes') completed++;
	if (data.mandatoryTraining.basicLifeSupportCompleted === 'yes') completed++;
	if (data.mandatoryTraining.equalityDiversityCompleted === 'yes') completed++;
	if (data.mandatoryTraining.healthSafetyCompleted === 'yes') completed++;

	// Professional Registration (1 key item, if required)
	if (data.professionalRegistration.registrationRequired === 'yes') {
		total += 1;
		if (data.professionalRegistration.registrationVerified === 'yes') completed++;
	}

	// IT Systems (3 key items)
	total += 3;
	if (data.itSystemsAccess.emailAccountCreated === 'yes') completed++;
	if (data.itSystemsAccess.networkLoginCreated === 'yes') completed++;
	if (data.itSystemsAccess.clinicalSystemAccess === 'yes') completed++;

	// Uniform & ID (2 key items)
	total += 2;
	if (data.uniformIDBadge.idBadgeIssued === 'yes') completed++;
	if (data.uniformIDBadge.accessCardIssued === 'yes') completed++;

	// Induction (2 key items)
	total += 2;
	if (data.inductionProgramme.corporateInductionCompleted === 'yes') completed++;
	if (data.inductionProgramme.localInductionCompleted === 'yes') completed++;

	// Probation (1 key item)
	total += 1;
	if (data.probationSupervision.objectivesSet === 'yes') completed++;

	// Sign-off (3 key items)
	total += 3;
	if (data.signOffCompliance.confidentialityAgreementSigned === 'yes') completed++;
	if (data.signOffCompliance.gdprTrainingCompleted === 'yes') completed++;
	if (data.signOffCompliance.managerSignedOff === 'yes') completed++;

	return { completed, total };
}

/** Derive overall risk from fired rules and completion percentage. */
function deriveOverallRisk(firedRules: FiredRule[], completionPercentage: number): RiskLevel {
	const maxGrade =
		firedRules.length > 0 ? Math.max(...firedRules.map((r) => r.grade)) : 0;

	// Critical: any grade 4 rule or very low completion
	if (maxGrade >= 4 || completionPercentage < 10) return 'critical';

	// High: any grade 3 rule or low completion
	if (maxGrade >= 3 || completionPercentage < 30) return 'high';

	// Moderate: any grade 2 rule or moderate completion
	if (maxGrade >= 2 || completionPercentage < 70) return 'moderate';

	// Low: grade 1 or no rules fired with high completion
	return 'low';
}
