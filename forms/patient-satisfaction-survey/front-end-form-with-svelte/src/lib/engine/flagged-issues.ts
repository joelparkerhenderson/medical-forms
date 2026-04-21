import type { AssessmentData, AdditionalFlag } from './types';
import { normalizeLikertScores } from './utils';

/**
 * Detects additional flags that should be highlighted for quality improvement,
 * independent of rule-based scoring. These are safety-critical and service alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// ─── Safety concern - did not feel safe (HIGH) ──────────
	if (
		data.overallExperience.feltSafe !== null &&
		data.overallExperience.feltSafe <= 2
	) {
		flags.push({
			id: 'FLAG-SAFETY-001',
			category: 'Safety',
			message: `Patient did not feel safe during visit (rated ${data.overallExperience.feltSafe}/5) - IMMEDIATE REVIEW REQUIRED`,
			priority: 'high'
		});
	}

	// ─── Formal complaint raised (HIGH) ─────────────────────
	if (data.commentsSuggestions.complaintRaised === 'yes') {
		flags.push({
			id: 'FLAG-COMPLAINT-001',
			category: 'Complaint',
			message: `Formal complaint raised: ${data.commentsSuggestions.complaintDetails || 'details not specified'}`,
			priority: 'high'
		});
	}

	// ─── Privacy concern (HIGH) ─────────────────────────────
	if (
		data.clinicalCareQuality.privacyDuringExamination !== null &&
		data.clinicalCareQuality.privacyDuringExamination === 1
	) {
		flags.push({
			id: 'FLAG-PRIVACY-001',
			category: 'Clinical Care',
			message: 'Very poor privacy during examination (rated 1/5) - CLINICAL GOVERNANCE REVIEW',
			priority: 'high'
		});
	}

	// ─── Dignity concern (HIGH) ─────────────────────────────
	if (
		data.staffAttitude.respectForDignity !== null &&
		data.staffAttitude.respectForDignity <= 2
	) {
		flags.push({
			id: 'FLAG-DIGNITY-001',
			category: 'Staff',
			message: `Lack of respect for dignity reported (rated ${data.staffAttitude.respectForDignity}/5)`,
			priority: 'high'
		});
	}

	// ─── Would not recommend (HIGH) ─────────────────────────
	if (
		data.overallExperience.wouldRecommend !== null &&
		data.overallExperience.wouldRecommend <= 2
	) {
		flags.push({
			id: 'FLAG-RECOMMEND-001',
			category: 'Overall',
			message: `Patient would not recommend this service (rated ${data.overallExperience.wouldRecommend}/5)`,
			priority: 'high'
		});
	}

	// ─── Very low NHS rating (MEDIUM) ───────────────────────
	if (
		data.overallExperience.nhsRating !== null &&
		data.overallExperience.nhsRating <= 3
	) {
		flags.push({
			id: 'FLAG-NHSRATING-001',
			category: 'Overall',
			message: `Very low NHS rating (${data.overallExperience.nhsRating}/10)`,
			priority: 'medium'
		});
	}

	// ─── Excessive wait (MEDIUM) ────────────────────────────
	if (
		data.accessWaitingTimes.actualWaitMinutes !== null &&
		data.accessWaitingTimes.actualWaitMinutes > 60
	) {
		flags.push({
			id: 'FLAG-WAIT-001',
			category: 'Access',
			message: `Excessive on-day waiting time (${data.accessWaitingTimes.actualWaitMinutes} minutes)`,
			priority: 'medium'
		});
	}

	// ─── Poor pain management (MEDIUM) ──────────────────────
	if (
		data.clinicalCareQuality.painManagement !== null &&
		data.clinicalCareQuality.painManagement <= 2
	) {
		flags.push({
			id: 'FLAG-PAIN-001',
			category: 'Clinical Care',
			message: `Poor pain management reported (rated ${data.clinicalCareQuality.painManagement}/5)`,
			priority: 'medium'
		});
	}

	// ─── Poor cleanliness (MEDIUM) ──────────────────────────
	if (
		data.environmentFacilities.cleanliness !== null &&
		data.environmentFacilities.cleanliness <= 2
	) {
		flags.push({
			id: 'FLAG-CLEAN-001',
			category: 'Environment',
			message: `Poor cleanliness reported (rated ${data.environmentFacilities.cleanliness}/5)`,
			priority: 'medium'
		});
	}

	// ─── Cultural sensitivity concern (MEDIUM) ──────────────
	if (
		data.staffAttitude.culturalSensitivity !== null &&
		data.staffAttitude.culturalSensitivity <= 2
	) {
		flags.push({
			id: 'FLAG-CULTURAL-001',
			category: 'Staff',
			message: `Cultural sensitivity concern (rated ${data.staffAttitude.culturalSensitivity}/5)`,
			priority: 'medium'
		});
	}

	// ─── Did not know who to contact (MEDIUM) ───────────────
	if (
		data.dischargeFollowUp.knewWhoToContact !== null &&
		data.dischargeFollowUp.knewWhoToContact <= 2
	) {
		flags.push({
			id: 'FLAG-CONTACT-001',
			category: 'Discharge',
			message: `Patient did not know who to contact after discharge (rated ${data.dischargeFollowUp.knewWhoToContact}/5)`,
			priority: 'medium'
		});
	}

	// ─── Not listened to (MEDIUM) ───────────────────────────
	if (
		data.communicationInformation.listenedTo !== null &&
		data.communicationInformation.listenedTo <= 2
	) {
		flags.push({
			id: 'FLAG-LISTENED-001',
			category: 'Communication',
			message: `Patient did not feel listened to (rated ${data.communicationInformation.listenedTo}/5)`,
			priority: 'medium'
		});
	}

	// ─── Specific staff praise (LOW - positive) ─────────────
	if (data.commentsSuggestions.specificStaffPraise.trim().length > 0) {
		flags.push({
			id: 'FLAG-PRAISE-001',
			category: 'Positive Feedback',
			message: `Staff praised: ${data.commentsSuggestions.specificStaffPraise}`,
			priority: 'low'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
