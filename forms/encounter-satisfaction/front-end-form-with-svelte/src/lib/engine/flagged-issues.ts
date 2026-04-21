import type { AssessmentData, AdditionalFlag, LikertScore } from './types';

/**
 * Detects flagged issues based on satisfaction responses.
 *
 * High priority: Any question rated 1 (Very Dissatisfied); any communication question rated ≤ 2
 * Medium priority: Any question rated 2 (Dissatisfied); overall mean ≤ 2.4 (Poor)
 * Low priority: First-time patient with fair satisfaction (mean 2.5-3.4)
 */
export function detectAdditionalFlags(
	data: AssessmentData,
	compositeScore: number
): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// ─── High priority: Any question rated 1 (Very Dissatisfied) ────
	const allScores = getAllLikertScores(data);

	for (const { field, label, score } of allScores) {
		if (score === 1) {
			flags.push({
				id: `FLAG-VDIS-${field}`,
				category: 'Very Dissatisfied Response',
				message: `Patient rated "${label}" as Very Dissatisfied (1/5)`,
				priority: 'high'
			});
		}
	}

	// ─── High priority: Communication questions rated ≤ 2 ───────────
	const commFields: { field: keyof typeof data.communication; label: string }[] = [
		{ field: 'listening', label: 'Provider listening' },
		{ field: 'explainingCondition', label: 'Explaining condition' },
		{ field: 'answeringQuestions', label: 'Answering questions' },
		{ field: 'timeSpent', label: 'Time spent with patient' }
	];

	for (const { field, label } of commFields) {
		const score = data.communication[field] as LikertScore | null;
		if (score !== null && score <= 2 && score !== 1) {
			// Score of 1 already flagged above; flag score of 2 for communication as high
			flags.push({
				id: `FLAG-COMM-${field}`,
				category: 'Communication Concern',
				message: `Patient rated "${label}" as Dissatisfied (${score}/5) - communication improvement needed`,
				priority: 'high'
			});
		}
	}

	// ─── Medium priority: Any question rated 2 (Dissatisfied) ───────
	for (const { field, label, score } of allScores) {
		if (score === 2) {
			// Skip communication fields already flagged as high
			const isComm = commFields.some((c) => c.field === field);
			if (!isComm) {
				flags.push({
					id: `FLAG-DIS-${field}`,
					category: 'Dissatisfied Response',
					message: `Patient rated "${label}" as Dissatisfied (2/5)`,
					priority: 'medium'
				});
			}
		}
	}

	// ─── Medium priority: Overall mean ≤ 2.4 (Poor) ────────────────
	if (compositeScore > 0 && compositeScore <= 2.4) {
		flags.push({
			id: 'FLAG-POOR-OVERALL',
			category: 'Poor Overall Satisfaction',
			message: `Composite satisfaction score is ${compositeScore.toFixed(1)}/5.0 (Poor) - review required`,
			priority: 'medium'
		});
	}

	// ─── Low priority: First-time patient with fair satisfaction ────
	if (
		data.visitInformation.firstVisit === 'yes' &&
		compositeScore >= 2.5 &&
		compositeScore <= 3.4
	) {
		flags.push({
			id: 'FLAG-FIRST-VISIT-FAIR',
			category: 'First Visit Feedback',
			message: `First-time patient rated experience as Fair (${compositeScore.toFixed(1)}/5.0) - follow up to improve retention`,
			priority: 'low'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}

interface ScoredField {
	field: string;
	label: string;
	score: LikertScore;
}

function getAllLikertScores(data: AssessmentData): ScoredField[] {
	const scores: ScoredField[] = [];

	const sections: { obj: Record<string, unknown>; labels: Record<string, string> }[] = [
		{
			obj: data.accessScheduling,
			labels: {
				easeOfScheduling: 'Ease of scheduling',
				waitForAppointment: 'Wait for appointment',
				waitInWaitingRoom: 'Wait in waiting room'
			}
		},
		{
			obj: data.communication,
			labels: {
				listening: 'Provider listening',
				explainingCondition: 'Explaining condition',
				answeringQuestions: 'Answering questions',
				timeSpent: 'Time spent with patient'
			}
		},
		{
			obj: data.staffProfessionalism,
			labels: {
				receptionCourtesy: 'Reception staff courtesy',
				nursingCourtesy: 'Nursing staff courtesy',
				respectShown: 'Respect shown'
			}
		},
		{
			obj: data.careQuality,
			labels: {
				involvementInDecisions: 'Involvement in decisions',
				treatmentPlanExplanation: 'Treatment plan explanation',
				confidenceInCare: 'Confidence in care'
			}
		},
		{
			obj: data.environment,
			labels: {
				cleanliness: 'Cleanliness',
				waitingAreaComfort: 'Waiting area comfort',
				privacy: 'Privacy'
			}
		},
		{
			obj: data.overallSatisfaction,
			labels: {
				overallRating: 'Overall rating',
				likelyToRecommend: 'Likely to recommend',
				likelyToReturn: 'Likely to return'
			}
		}
	];

	for (const { obj, labels } of sections) {
		for (const [field, label] of Object.entries(labels)) {
			const val = obj[field];
			if (typeof val === 'number' && val >= 1 && val <= 5) {
				scores.push({ field, label, score: val as LikertScore });
			}
		}
	}

	return scores;
}
