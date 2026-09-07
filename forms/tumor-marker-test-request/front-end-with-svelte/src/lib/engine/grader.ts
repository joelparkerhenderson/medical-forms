// ──────────────────────────────────────────────
// Four-axis grader for the Tumor Marker Test Request
//
// Composes the rule sets and the safety flags into a single pure, deterministic
// grading result. The public entry point is `calculateGrade(data)`. The output
// shape and rule / flag IDs are identical across every front-end and the
// back-end. Ported from the HTML front-end's js/grader.js.
//
// No side effects, no network calls, no I/O.
// ──────────────────────────────────────────────

import type {
	AppropriatenessBand,
	GradingResult,
	InterpretationBand,
	Recommendation,
	TumorMarkerRequest
} from './types';
import { scoreAppropriateness } from './appropriateness-rules';
import { scoreInterpretation } from './interpretation-rules';
import { scoreCompleteness } from './completeness-rules';
import { scoreTriage } from './triage-rules';
import { detectFlags } from './flagged-issues';

/** Human-readable label for each vetting recommendation. */
export const RECOMMENDATION_LABELS: Record<string, string> = {
	accept: 'Accept and process',
	'query-referrer': 'Query the referrer',
	redirect: 'Redirect / reconsider request',
	reject: 'Reject'
};

/**
 * Derive an overall recommendation for the laboratory vetting desk from the
 * four axes. Least-alarming wins only when nothing escalates.
 */
export function deriveRecommendation(
	appropriatenessBand: AppropriatenessBand,
	interpretationBand: InterpretationBand,
	completenessPercent: number,
	appropriatenessScore: number
): Recommendation {
	// `reject`: no tumour marker was selected at all (scoreAppropriateness's
	// R-APPROP-NO-MARKER-SELECTED early-return, the only path that scores 1).
	// Distinct from a marker/indication mismatch (query-referrer) or
	// screening misuse (redirect): there is no marker choice to question or
	// reconsider — nothing was actually requested, so the lab vetting desk
	// rejects the request outright rather than querying or redirecting it.
	// Must run BEFORE the generic appropriateness check below, since a
	// no-marker-selected request also bands 'usually-not-appropriate' and
	// would otherwise always be intercepted by that broader, less specific
	// check first.
	if (appropriatenessScore === 1) return 'reject';
	// `misuse-risk` is set if and only if scoreAppropriateness's own
	// screeningMisuse flag was true, and that same flag unconditionally
	// forces appropriatenessBand to 'usually-not-appropriate' too — so this
	// check must run BEFORE the generic appropriateness check below, or
	// `redirect` can never be reached: every misuse-risk case would already
	// have returned the generic 'query-referrer' first. The generic check
	// still catches the other route to 'usually-not-appropriate' (every
	// selected marker mismatched, with no screening misuse involved).
	if (interpretationBand === 'misuse-risk') return 'redirect';
	if (appropriatenessBand === 'usually-not-appropriate') return 'query-referrer';
	if (completenessPercent < 50) return 'query-referrer';
	return 'accept';
}

/** Public entry point. Pure and deterministic. */
export function calculateGrade(data: TumorMarkerRequest): GradingResult {
	const firedRules: GradingResult['firedRules'] = [];

	// Axis A — appropriateness (marker-to-indication fit).
	const appr = scoreAppropriateness(data.markers, data.context.primaryIndication);
	for (const r of appr.firedRules) firedRules.push(r);

	// Axis B — interpretation safety.
	const interp = scoreInterpretation(data, { screeningMisuse: appr.screeningMisuse });
	for (const r of interp.firedRules) firedRules.push(r);

	// Axis C — completeness.
	const completeness = scoreCompleteness(data);
	for (const m of completeness.missing) firedRules.push(m);

	// Axis D — triage.
	const triage = scoreTriage(data);
	for (const r of triage.firedRules) firedRules.push(r);

	const recommendation = deriveRecommendation(appr.band, interp.band, completeness.percent, appr.score);

	const flags = detectFlags(data, {
		triageTier: triage.tier,
		mismatchedMarkers: appr.mismatchedMarkers,
		screeningMisuse: appr.screeningMisuse
	});

	return {
		appropriatenessScore: appr.score,
		appropriatenessBand: appr.band,
		interpretationBand: interp.band,
		completenessPercent: completeness.percent,
		triageTier: triage.tier,
		targetTimeframe: triage.targetTimeframe,
		recommendation,
		recommendationLabel: RECOMMENDATION_LABELS[recommendation] || recommendation,
		firedRules,
		flags,
		gradedAt: new Date().toISOString()
	};
}
