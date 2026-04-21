import type { AssessmentData, FiredRule, GradingResult, DomainScores } from './types';
import { satisfactionRules } from './rules';
import { detectAdditionalFlags } from './flagged-issues';
import { normalizeLikertScores, categorizeScore } from './utils';

/**
 * Pure function: evaluates all satisfaction rules against survey data.
 * Returns normalized score, satisfaction category, domain scores, and all fired rules.
 */
export function calculateSatisfactionGrade(data: AssessmentData): GradingResult {
	const firedRules: FiredRule[] = [];

	for (const rule of satisfactionRules) {
		try {
			if (rule.evaluate(data)) {
				firedRules.push({
					id: rule.id,
					domain: rule.domain,
					description: rule.description,
					severity: rule.severity
				});
			}
		} catch (e) {
			// Rule evaluation failed - log for debugging but continue grading
			console.warn(`Satisfaction rule ${rule.id} evaluation failed:`, e);
		}
	}

	// Calculate domain scores
	const domainScores = calculateDomainScores(data);

	// Calculate overall normalized score from all domains
	const normalizedScore = calculateOverallScore(domainScores);

	// Determine satisfaction category
	const satisfactionCategory = categorizeScore(normalizedScore);

	const additionalFlags = detectAdditionalFlags(data);

	return {
		normalizedScore,
		satisfactionCategory,
		domainScores,
		firedRules,
		additionalFlags,
		timestamp: new Date().toISOString()
	};
}

/** Calculate normalized scores for each domain. */
function calculateDomainScores(data: AssessmentData): DomainScores {
	return {
		access: normalizeLikertScores([
			data.accessWaitingTimes.easeOfBooking,
			data.accessWaitingTimes.waitingTimeForAppointment,
			data.accessWaitingTimes.waitingTimeOnDay,
			data.accessWaitingTimes.receptionService,
			data.accessWaitingTimes.signageWayfinding,
			data.accessWaitingTimes.parkingTransport
		]),
		communication: normalizeLikertScores([
			data.communicationInformation.explanationOfCondition,
			data.communicationInformation.explanationOfTreatment,
			data.communicationInformation.opportunityToAskQuestions,
			data.communicationInformation.listenedTo,
			data.communicationInformation.informedAboutMedication,
			data.communicationInformation.writtenInformationQuality
		]),
		clinicalCare: normalizeLikertScores([
			data.clinicalCareQuality.confidenceInClinician,
			data.clinicalCareQuality.thoroughnessOfExamination,
			data.clinicalCareQuality.painManagement,
			data.clinicalCareQuality.involvementInDecisions,
			data.clinicalCareQuality.privacyDuringExamination,
			data.clinicalCareQuality.coordinationOfCare
		]),
		staff: normalizeLikertScores([
			data.staffAttitude.doctorCourtesy,
			data.staffAttitude.nurseCourtesy,
			data.staffAttitude.receptionCourtesy,
			data.staffAttitude.respectForDignity,
			data.staffAttitude.culturalSensitivity,
			data.staffAttitude.emotionalSupport
		]),
		environment: normalizeLikertScores([
			data.environmentFacilities.cleanliness,
			data.environmentFacilities.comfort,
			data.environmentFacilities.noiseLevels,
			data.environmentFacilities.foodQuality,
			data.environmentFacilities.toiletFacilities,
			data.environmentFacilities.temperatureComfort
		]),
		discharge: normalizeLikertScores([
			data.dischargeFollowUp.dischargeInformation,
			data.dischargeFollowUp.medicationExplanation,
			data.dischargeFollowUp.followUpArrangements,
			data.dischargeFollowUp.knewWhoToContact,
			data.dischargeFollowUp.recoveryInformation,
			data.dischargeFollowUp.carePlanClarity
		]),
		overall: normalizeLikertScores([
			data.overallExperience.overallSatisfaction,
			data.overallExperience.wouldRecommend,
			data.overallExperience.metExpectations,
			data.overallExperience.feltSafe,
			data.overallExperience.wouldReturn
		])
	};
}

/** Calculate overall score as average of all domain scores. */
function calculateOverallScore(domains: DomainScores): number {
	const scores = [
		domains.access,
		domains.communication,
		domains.clinicalCare,
		domains.staff,
		domains.environment,
		domains.discharge,
		domains.overall
	].filter((s): s is number => s !== null);

	if (scores.length === 0) return 0;
	return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
}
