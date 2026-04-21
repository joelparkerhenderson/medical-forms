import type { SatisfactionRule } from './types';
import { normalizeLikertScores } from './utils';

/**
 * Declarative satisfaction grading rules.
 * Each rule evaluates survey data and returns true if the condition is detected.
 * Severity 1 = minor concern, 2 = moderate, 3 = significant, 4 = critical.
 */
export const satisfactionRules: SatisfactionRule[] = [
	// ─── ACCESS & WAITING TIMES ────────────────────────────────
	{
		id: 'ACC-001',
		domain: 'Access',
		description: 'Difficulty booking appointment (score 1-2)',
		severity: 2,
		evaluate: (d) =>
			d.accessWaitingTimes.easeOfBooking !== null && d.accessWaitingTimes.easeOfBooking <= 2
	},
	{
		id: 'ACC-002',
		domain: 'Access',
		description: 'Long waiting time for appointment (score 1-2)',
		severity: 2,
		evaluate: (d) =>
			d.accessWaitingTimes.waitingTimeForAppointment !== null &&
			d.accessWaitingTimes.waitingTimeForAppointment <= 2
	},
	{
		id: 'ACC-003',
		domain: 'Access',
		description: 'Long waiting time on the day (score 1-2)',
		severity: 2,
		evaluate: (d) =>
			d.accessWaitingTimes.waitingTimeOnDay !== null &&
			d.accessWaitingTimes.waitingTimeOnDay <= 2
	},
	{
		id: 'ACC-004',
		domain: 'Access',
		description: 'Excessive on-day wait (>60 minutes)',
		severity: 3,
		evaluate: (d) =>
			d.accessWaitingTimes.actualWaitMinutes !== null &&
			d.accessWaitingTimes.actualWaitMinutes > 60
	},
	{
		id: 'ACC-005',
		domain: 'Access',
		description: 'Poor reception service (score 1)',
		severity: 3,
		evaluate: (d) =>
			d.accessWaitingTimes.receptionService !== null &&
			d.accessWaitingTimes.receptionService === 1
	},
	{
		id: 'ACC-006',
		domain: 'Access',
		description: 'Access domain score below 50%',
		severity: 3,
		evaluate: (d) => {
			const s = normalizeLikertScores([
				d.accessWaitingTimes.easeOfBooking,
				d.accessWaitingTimes.waitingTimeForAppointment,
				d.accessWaitingTimes.waitingTimeOnDay,
				d.accessWaitingTimes.receptionService,
				d.accessWaitingTimes.signageWayfinding,
				d.accessWaitingTimes.parkingTransport
			]);
			return s !== null && s < 50;
		}
	},

	// ─── COMMUNICATION & INFORMATION ──────────────────────────
	{
		id: 'COM-001',
		domain: 'Communication',
		description: 'Poor explanation of condition (score 1-2)',
		severity: 2,
		evaluate: (d) =>
			d.communicationInformation.explanationOfCondition !== null &&
			d.communicationInformation.explanationOfCondition <= 2
	},
	{
		id: 'COM-002',
		domain: 'Communication',
		description: 'Did not feel listened to (score 1-2)',
		severity: 3,
		evaluate: (d) =>
			d.communicationInformation.listenedTo !== null &&
			d.communicationInformation.listenedTo <= 2
	},
	{
		id: 'COM-003',
		domain: 'Communication',
		description: 'Insufficient opportunity to ask questions (score 1-2)',
		severity: 2,
		evaluate: (d) =>
			d.communicationInformation.opportunityToAskQuestions !== null &&
			d.communicationInformation.opportunityToAskQuestions <= 2
	},
	{
		id: 'COM-004',
		domain: 'Communication',
		description: 'Communication domain score below 50%',
		severity: 3,
		evaluate: (d) => {
			const s = normalizeLikertScores([
				d.communicationInformation.explanationOfCondition,
				d.communicationInformation.explanationOfTreatment,
				d.communicationInformation.opportunityToAskQuestions,
				d.communicationInformation.listenedTo,
				d.communicationInformation.informedAboutMedication,
				d.communicationInformation.writtenInformationQuality
			]);
			return s !== null && s < 50;
		}
	},

	// ─── CLINICAL CARE QUALITY ────────────────────────────────
	{
		id: 'CLN-001',
		domain: 'Clinical Care',
		description: 'Low confidence in clinician (score 1-2)',
		severity: 3,
		evaluate: (d) =>
			d.clinicalCareQuality.confidenceInClinician !== null &&
			d.clinicalCareQuality.confidenceInClinician <= 2
	},
	{
		id: 'CLN-002',
		domain: 'Clinical Care',
		description: 'Poor pain management (score 1-2)',
		severity: 3,
		evaluate: (d) =>
			d.clinicalCareQuality.painManagement !== null &&
			d.clinicalCareQuality.painManagement <= 2
	},
	{
		id: 'CLN-003',
		domain: 'Clinical Care',
		description: 'Not involved in decisions (score 1-2)',
		severity: 2,
		evaluate: (d) =>
			d.clinicalCareQuality.involvementInDecisions !== null &&
			d.clinicalCareQuality.involvementInDecisions <= 2
	},
	{
		id: 'CLN-004',
		domain: 'Clinical Care',
		description: 'Privacy concern during examination (score 1)',
		severity: 4,
		evaluate: (d) =>
			d.clinicalCareQuality.privacyDuringExamination !== null &&
			d.clinicalCareQuality.privacyDuringExamination === 1
	},
	{
		id: 'CLN-005',
		domain: 'Clinical Care',
		description: 'Clinical care domain score below 50%',
		severity: 3,
		evaluate: (d) => {
			const s = normalizeLikertScores([
				d.clinicalCareQuality.confidenceInClinician,
				d.clinicalCareQuality.thoroughnessOfExamination,
				d.clinicalCareQuality.painManagement,
				d.clinicalCareQuality.involvementInDecisions,
				d.clinicalCareQuality.privacyDuringExamination,
				d.clinicalCareQuality.coordinationOfCare
			]);
			return s !== null && s < 50;
		}
	},

	// ─── STAFF ATTITUDE ───────────────────────────────────────
	{
		id: 'STF-001',
		domain: 'Staff',
		description: 'Lack of respect for dignity (score 1-2)',
		severity: 3,
		evaluate: (d) =>
			d.staffAttitude.respectForDignity !== null &&
			d.staffAttitude.respectForDignity <= 2
	},
	{
		id: 'STF-002',
		domain: 'Staff',
		description: 'Cultural insensitivity concern (score 1-2)',
		severity: 3,
		evaluate: (d) =>
			d.staffAttitude.culturalSensitivity !== null &&
			d.staffAttitude.culturalSensitivity <= 2
	},
	{
		id: 'STF-003',
		domain: 'Staff',
		description: 'Staff domain score below 50%',
		severity: 3,
		evaluate: (d) => {
			const s = normalizeLikertScores([
				d.staffAttitude.doctorCourtesy,
				d.staffAttitude.nurseCourtesy,
				d.staffAttitude.receptionCourtesy,
				d.staffAttitude.respectForDignity,
				d.staffAttitude.culturalSensitivity,
				d.staffAttitude.emotionalSupport
			]);
			return s !== null && s < 50;
		}
	},

	// ─── ENVIRONMENT & FACILITIES ─────────────────────────────
	{
		id: 'ENV-001',
		domain: 'Environment',
		description: 'Poor cleanliness (score 1-2)',
		severity: 3,
		evaluate: (d) =>
			d.environmentFacilities.cleanliness !== null &&
			d.environmentFacilities.cleanliness <= 2
	},
	{
		id: 'ENV-002',
		domain: 'Environment',
		description: 'Environment domain score below 50%',
		severity: 2,
		evaluate: (d) => {
			const s = normalizeLikertScores([
				d.environmentFacilities.cleanliness,
				d.environmentFacilities.comfort,
				d.environmentFacilities.noiseLevels,
				d.environmentFacilities.foodQuality,
				d.environmentFacilities.toiletFacilities,
				d.environmentFacilities.temperatureComfort
			]);
			return s !== null && s < 50;
		}
	},

	// ─── DISCHARGE & FOLLOW-UP ────────────────────────────────
	{
		id: 'DIS-001',
		domain: 'Discharge',
		description: 'Did not know who to contact after discharge (score 1)',
		severity: 3,
		evaluate: (d) =>
			d.dischargeFollowUp.knewWhoToContact !== null &&
			d.dischargeFollowUp.knewWhoToContact === 1
	},
	{
		id: 'DIS-002',
		domain: 'Discharge',
		description: 'Poor discharge information (score 1-2)',
		severity: 2,
		evaluate: (d) =>
			d.dischargeFollowUp.dischargeInformation !== null &&
			d.dischargeFollowUp.dischargeInformation <= 2
	},
	{
		id: 'DIS-003',
		domain: 'Discharge',
		description: 'Discharge domain score below 50%',
		severity: 3,
		evaluate: (d) => {
			const s = normalizeLikertScores([
				d.dischargeFollowUp.dischargeInformation,
				d.dischargeFollowUp.medicationExplanation,
				d.dischargeFollowUp.followUpArrangements,
				d.dischargeFollowUp.knewWhoToContact,
				d.dischargeFollowUp.recoveryInformation,
				d.dischargeFollowUp.carePlanClarity
			]);
			return s !== null && s < 50;
		}
	},

	// ─── OVERALL EXPERIENCE ───────────────────────────────────
	{
		id: 'OVR-001',
		domain: 'Overall',
		description: 'Would not recommend service (score 1-2)',
		severity: 3,
		evaluate: (d) =>
			d.overallExperience.wouldRecommend !== null &&
			d.overallExperience.wouldRecommend <= 2
	},
	{
		id: 'OVR-002',
		domain: 'Overall',
		description: 'Did not feel safe (score 1-2)',
		severity: 4,
		evaluate: (d) =>
			d.overallExperience.feltSafe !== null &&
			d.overallExperience.feltSafe <= 2
	},
	{
		id: 'OVR-003',
		domain: 'Overall',
		description: 'Very low overall satisfaction (score 1)',
		severity: 4,
		evaluate: (d) =>
			d.overallExperience.overallSatisfaction !== null &&
			d.overallExperience.overallSatisfaction === 1
	},
	{
		id: 'OVR-004',
		domain: 'Overall',
		description: 'Very low NHS rating (1-3 out of 10)',
		severity: 3,
		evaluate: (d) =>
			d.overallExperience.nhsRating !== null &&
			d.overallExperience.nhsRating <= 3
	},

	// ─── COMMENTS ─────────────────────────────────────────────
	{
		id: 'CMT-001',
		domain: 'Comments',
		description: 'Formal complaint raised',
		severity: 4,
		evaluate: (d) => d.commentsSuggestions.complaintRaised === 'yes'
	}
];
