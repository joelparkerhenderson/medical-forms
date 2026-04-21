import type { AssessmentData, CompetencyLevel, FitnessDecision, RiskLevel, FiredRule, GradingResult } from './types';
import { responderRules } from './responder-rules';
import { detectAdditionalFlags } from './flagged-issues';
import { aggregateCompetency, competencyToNumber } from './utils';

/**
 * Pure function: evaluates all first responder rules against assessment data.
 * Returns domain competency levels, overall fitness decision, and all fired rules.
 */
export function calculateResponderGrade(data: AssessmentData): GradingResult {
	const firedRules: FiredRule[] = [];

	for (const rule of responderRules) {
		try {
			if (rule.evaluate(data)) {
				firedRules.push({
					id: rule.id,
					domain: rule.domain,
					description: rule.description,
					grade: rule.grade
				});
			}
		} catch (e) {
			// Rule evaluation failed - log for debugging but continue grading
			console.warn(`Responder rule ${rule.id} evaluation failed:`, e);
		}
	}

	// Determine domain competency levels
	const domainLevels = deriveDomainLevels(data);

	// Determine overall competency (worst domain)
	const overallCompetency = deriveOverallCompetency(domainLevels);

	// Determine overall fitness decision
	const overallFitness = deriveOverallFitness(data, firedRules, overallCompetency);

	// Determine overall risk from worst fired rule grade
	const overallRisk = deriveOverallRisk(firedRules, overallCompetency);

	const additionalFlags = detectAdditionalFlags(data);

	return {
		overallCompetency,
		overallFitness,
		overallRisk,
		domainLevels,
		firedRules,
		additionalFlags,
		timestamp: new Date().toISOString()
	};
}

/** Derive domain competency levels from assessment data. */
function deriveDomainLevels(data: AssessmentData): GradingResult['domainLevels'] {
	return {
		physicalFitness: aggregateCompetency([
			data.physicalFitness.cardiovascularFitness,
			data.physicalFitness.muscularStrength,
			data.physicalFitness.manualHandlingCompetency,
			data.physicalFitness.flexibilityMobility,
			data.physicalFitness.balanceCoordination
		]),
		clinicalSkills: aggregateCompetency([
			data.clinicalSkills.basicLifeSupport,
			data.clinicalSkills.advancedLifeSupport,
			data.clinicalSkills.airwayManagement,
			data.clinicalSkills.patientAssessment,
			data.clinicalSkills.traumaAssessment,
			data.clinicalSkills.triageCompetency,
			data.clinicalSkills.drugAdministration
		]),
		equipmentVehicle: aggregateCompetency([
			data.equipmentVehicle.defibrillatorCompetency,
			data.equipmentVehicle.monitorCompetency,
			data.equipmentVehicle.stretcherCompetency,
			data.equipmentVehicle.ambulanceDriving,
			data.equipmentVehicle.equipmentCheckCompetency
		]),
		communication: aggregateCompetency([
			data.communicationSkills.patientCommunication,
			data.communicationSkills.handoverCompetency,
			data.communicationSkills.documentationCompetency,
			data.communicationSkills.safeguardingAwareness
		]),
		psychological: aggregateCompetency([
			data.psychologicalReadiness.stressManagement,
			data.psychologicalReadiness.decisionMakingUnderPressure,
			data.psychologicalReadiness.emotionalRegulation
		])
	};
}

/** Derive overall competency from the worst domain level. */
function deriveOverallCompetency(domainLevels: GradingResult['domainLevels']): CompetencyLevel {
	const levels = Object.values(domainLevels).filter((l): l is CompetencyLevel => l !== '');
	if (levels.length === 0) return '';
	return aggregateCompetency(levels);
}

/** Derive overall fitness decision. */
function deriveOverallFitness(
	data: AssessmentData,
	firedRules: FiredRule[],
	overallCompetency: CompetencyLevel
): FitnessDecision {
	// If assessor has already set a decision, use it
	if (data.fitnessDecision.overallFitness !== '') {
		return data.fitnessDecision.overallFitness;
	}

	// Auto-derive based on rules and competency
	const maxGrade = firedRules.length > 0 ? Math.max(...firedRules.map((r) => r.grade)) : 0;

	// Any grade 4 rule = permanently or temporarily unfit
	if (maxGrade >= 4) return 'permanently-unfit';

	// Any grade 3 rule or not-competent = temporarily unfit
	if (maxGrade >= 3 || overallCompetency === 'not-competent') return 'temporarily-unfit';

	// Any grade 2 rule or developing = fit with restrictions
	if (maxGrade >= 2 || overallCompetency === 'developing') return 'fit-with-restrictions';

	// Otherwise = fit for duty
	return 'fit-for-duty';
}

/** Derive overall risk from fired rules and competency. */
function deriveOverallRisk(firedRules: FiredRule[], overallCompetency: CompetencyLevel): RiskLevel {
	const maxGrade = firedRules.length > 0 ? Math.max(...firedRules.map((r) => r.grade)) : 0;

	if (maxGrade >= 4 || overallCompetency === 'not-competent') return 'critical';
	if (maxGrade >= 3) return 'high';
	if (maxGrade >= 2 || overallCompetency === 'developing') return 'moderate';
	return 'low';
}
