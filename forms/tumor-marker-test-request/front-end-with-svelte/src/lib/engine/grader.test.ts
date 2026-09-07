import { describe, it, expect } from 'vitest';
import { calculateGrade } from './grader';
import { detectFlags } from './flagged-issues';
import { scoreAppropriateness } from './appropriateness-rules';
import { createDefaultRequest } from './defaults';
import type { TumorMarkerRequest } from './types';

/** A complete, appropriate, routine monitoring request fixture. */
function createMonitoringRequest(): TumorMarkerRequest {
	const r = createDefaultRequest();
	r.clinician.clinicianName = 'Dr James Carter';
	r.clinician.clinicianRole = 'oncologist';
	r.clinician.referralDate = '2026-06-11';
	r.patient.firstName = 'Derek';
	r.patient.lastName = 'Mensah';
	r.patient.dateOfBirth = '1955-09-02';
	r.patient.nhsNumber = '402 118 9921';
	r.markers.carcinoembryonicAntigenCea = true;
	r.context.primaryIndication = 'recurrence-surveillance';
	r.context.clinicalDetails = 'Stage III colorectal cancer, routine surveillance.';
	r.context.knownCancerSite = 'Colorectal';
	r.context.previousMarkerValue = 2.1;
	r.context.previousMarkerDate = '2026-03-12';
	r.triage.urgency = 'routine';
	r.triage.setting = 'outpatient';
	return r;
}

/** A suspected-ovarian-cancer request: CA125 + suspected malignancy. */
function createSuspectedOvarianRequest(): TumorMarkerRequest {
	const r = createMonitoringRequest();
	r.markers.carcinoembryonicAntigenCea = false;
	r.markers.ca125 = true;
	r.context.primaryIndication = 'suspected-malignancy';
	r.context.clinicalDetails = 'Pelvic mass and abdominal distension.';
	r.context.previousMarkerValue = null;
	r.context.previousMarkerDate = '';
	r.triage.urgency = 'two-week-wait';
	return r;
}

describe('Tumor marker request four-axis vetting engine', () => {
	it('grades a complete, appropriate, routine monitoring request as accept / routine', () => {
		const g = calculateGrade(createMonitoringRequest());
		expect(g.appropriatenessBand).toBe('usually-appropriate');
		expect(g.appropriatenessScore).toBe(8);
		expect(g.interpretationBand).toBe('ok');
		expect(g.completenessPercent).toBe(100);
		expect(g.triageTier).toBe('routine');
		expect(g.recommendation).toBe('accept');
		expect(g.flags).toHaveLength(0);
	});

	it('escalates CA125 for suspected malignancy to two-week-wait', () => {
		const g = calculateGrade(createSuspectedOvarianRequest());
		expect(g.triageTier).toBe('two-week-wait');
		expect(g.firedRules.some((r) => r.ruleId === 'R-TRIAGE-CA125-SUSPECTED-OVARIAN')).toBe(true);
		expect(g.flags.some((f) => f.category === 'suspected-cancer-2ww')).toBe(true);
	});

	it('forces misuse-risk + usually-not-appropriate for broad screening, recommending redirect', () => {
		const r = createMonitoringRequest();
		r.context.primaryIndication = 'screening-high-risk';
		const g = calculateGrade(r);
		expect(g.appropriatenessBand).toBe('usually-not-appropriate');
		expect(g.interpretationBand).toBe('misuse-risk');
		// misuse-risk must be checked before the generic usually-not-appropriate
		// branch in deriveRecommendation, or redirect can never be reached:
		// screeningMisuse forces both bands together, so the generic branch
		// would otherwise always intercept first.
		expect(g.recommendation).toBe('redirect');
		expect(g.flags.some((f) => f.category === 'inappropriate-screening-use')).toBe(true);
		expect(g.firedRules.some((r) => r.ruleId === 'R-APPROP-SCREENING-MISUSE')).toBe(true);
	});

	it('still recommends query-referrer for usually-not-appropriate without screening misuse', () => {
		// The only selected marker (CEA) does not match this indication in
		// MARKER_INDICATION_MAP, so every selected marker mismatches:
		// usually-not-appropriate via the "all mismatched" branch, not via
		// screening misuse, so interpretationBand stays 'ok' and the generic
		// query-referrer branch must still be reachable.
		const r = createMonitoringRequest();
		r.context.primaryIndication = 'suspected-malignancy';
		const g = calculateGrade(r);
		expect(g.appropriatenessBand).toBe('usually-not-appropriate');
		expect(g.interpretationBand).not.toBe('misuse-risk');
		expect(g.recommendation).toBe('query-referrer');
	});

	it('drops to may-be-appropriate when a marker mismatches the indication', () => {
		const r = createMonitoringRequest();
		r.markers.carcinoembryonicAntigenCea = true;
		r.markers.ca125 = true;
		r.context.primaryIndication = 'suspected-malignancy';
		// CEA does NOT cover suspected-malignancy; CA125 does → partial mismatch.
		const g = calculateGrade(r);
		expect(g.appropriatenessBand).toBe('may-be-appropriate');
		expect(g.flags.some((f) => f.category === 'marker-indication-mismatch')).toBe(true);
	});

	it('flags no marker selected as high priority, usually-not-appropriate, and rejects', () => {
		const r = createMonitoringRequest();
		r.markers.carcinoembryonicAntigenCea = false;
		const g = calculateGrade(r);
		expect(g.appropriatenessScore).toBe(1);
		expect(g.appropriatenessBand).toBe('usually-not-appropriate');
		expect(g.flags.some((f) => f.category === 'no-marker-selected')).toBe(true);
		expect(g.firedRules.some((r) => r.ruleId === 'R-APPROP-NO-MARKER-SELECTED')).toBe(true);
		// No marker was requested at all -- nothing to query or redirect, so
		// the vetting desk rejects the request outright. Distinct from the
		// "all selected markers mismatched" and "screening misuse" routes to
		// the same usually-not-appropriate band, which stay query-referrer /
		// redirect respectively (see the tests below).
		expect(g.recommendation).toBe('reject');
	});

	it('still recommends redirect (not reject) for screening misuse', () => {
		const r = createMonitoringRequest();
		r.context.primaryIndication = 'screening-high-risk';
		const g = calculateGrade(r);
		expect(g.appropriatenessScore).toBe(3);
		expect(g.recommendation).toBe('redirect');
	});

	it('still recommends query-referrer (not reject) when every selected marker mismatches', () => {
		const r = createMonitoringRequest();
		r.context.primaryIndication = 'suspected-malignancy';
		const g = calculateGrade(r);
		expect(g.appropriatenessScore).toBe(2);
		expect(g.recommendation).toBe('query-referrer');
	});

	it('computes weighted partial completeness when high-weight fields are missing', () => {
		const r = createMonitoringRequest();
		r.context.clinicalDetails = '';
		const g = calculateGrade(r);
		// clinical details (weight 3) of 15 total missing → 12/15 = 80%.
		expect(g.completenessPercent).toBe(80);
		expect(g.firedRules.some((r) => r.ruleId === 'R-COMPLETE-CLINICAL-DETAILS')).toBe(true);
	});

	it('raises caution for an on-treatment monitoring request without a baseline', () => {
		const r = createMonitoringRequest();
		r.context.onTreatment = true;
		r.context.previousMarkerValue = null;
		r.context.previousMarkerDate = '';
		const g = calculateGrade(r);
		expect(g.interpretationBand).toBe('caution');
		expect(g.firedRules.some((r) => r.ruleId === 'R-INTERP-ON-TREATMENT')).toBe(true);
		expect(g.firedRules.some((r) => r.ruleId === 'R-INTERP-NO-BASELINE')).toBe(true);
	});

	it('produces stable, unique rule IDs', () => {
		const g = calculateGrade(createSuspectedOvarianRequest());
		const ids = g.firedRules.map((r) => r.ruleId);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('returns a provisional band when no indication is recorded', () => {
		const appr = scoreAppropriateness({ ...createDefaultRequest().markers, ca125: true }, '');
		expect(appr.band).toBe('may-be-appropriate');
		expect(appr.firedRules.some((r) => r.ruleId === 'R-APPROP-INDICATION-UNSPECIFIED')).toBe(true);
	});
});

describe('Tumor marker request flag detection', () => {
	it('flags missing indication and missing clinical details', () => {
		const r = createMonitoringRequest();
		r.context.primaryIndication = '';
		r.context.clinicalDetails = '';
		const appr = scoreAppropriateness(r.markers, r.context.primaryIndication);
		const flags = detectFlags(r, {
			triageTier: 'routine',
			mismatchedMarkers: appr.mismatchedMarkers,
			screeningMisuse: appr.screeningMisuse
		});
		expect(flags.some((f) => f.category === 'missing-indication')).toBe(true);
		expect(flags.some((f) => f.category === 'missing-clinical-details')).toBe(true);
	});

	it('returns no flags for a complete, appropriate monitoring request', () => {
		const r = createMonitoringRequest();
		const appr = scoreAppropriateness(r.markers, r.context.primaryIndication);
		const flags = detectFlags(r, {
			triageTier: 'routine',
			mismatchedMarkers: appr.mismatchedMarkers,
			screeningMisuse: appr.screeningMisuse
		});
		expect(flags).toHaveLength(0);
	});
});
