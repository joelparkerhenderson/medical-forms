import { describe, it, expect } from 'vitest';
import { createDefaultAssessment } from '#lib/stores/assessment.svelte.js';
import { calculateControl } from './diabetes-grader.js';
import { calculateCompositeScore, hba1cMmolMol } from './utils.js';
import { detectAdditionalFlags } from './flagged-issues.js';
import type { AssessmentData } from './types.js';

/** A blank assessment with an HbA1c filled in (unit is mmol/mol unless 'percent'). */
function withHba1c(mmolMol: number): AssessmentData {
  const data = createDefaultAssessment();
  data.glycaemicControl.hba1cValue = mmolMol;
  data.glycaemicControl.hba1cUnit = 'mmolMol';
  return data;
}

describe('hba1cMmolMol', () => {
  it('returns null when no HbA1c recorded', () => {
    expect(hba1cMmolMol(createDefaultAssessment())).toBeNull();
  });

  it('passes through a mmol/mol value unchanged', () => {
    expect(hba1cMmolMol(withHba1c(58))).toBe(58);
  });

  it('converts a percent value via the IFCC formula ((%-2.15)*10.929)', () => {
    const data = createDefaultAssessment();
    data.glycaemicControl.hba1cValue = 7.0;
    data.glycaemicControl.hba1cUnit = 'percent';
    // (7.0 - 2.15) * 10.929 ≈ 53.0
    expect(hba1cMmolMol(data)).toBeCloseTo(53.0, 1);
  });
});

describe('calculateCompositeScore', () => {
  it('maps an at-target HbA1c (<=48 mmol/mol) to 100', () => {
    expect(calculateCompositeScore(withHba1c(45))).toBe(100);
  });

  it('maps a mid-range HbA1c (54-64 mmol/mol band) to 60', () => {
    expect(calculateCompositeScore(withHba1c(60))).toBe(60);
  });

  it('maps a very high HbA1c (>86 mmol/mol) to 0', () => {
    expect(calculateCompositeScore(withHba1c(95))).toBe(0);
  });

  it('returns null when nothing scoreable is answered', () => {
    expect(calculateCompositeScore(createDefaultAssessment())).toBeNull();
  });
});

describe('calculateControl', () => {
  it('returns draft when fewer than 2 items answered and no HbA1c', () => {
    const r = calculateControl(createDefaultAssessment());
    expect(r.controlLevel).toBe('draft');
    expect(r.controlScore).toBe(0);
    expect(r.firedRules).toEqual([]);
  });

  it('grades an at-target HbA1c as wellControlled with a full score', () => {
    const r = calculateControl(withHba1c(45));
    expect(r.controlScore).toBe(100);
    expect(r.controlLevel).toBe('wellControlled');
    // DM-016: HbA1c at target (<= 53 mmol/mol)
    expect(r.firedRules.some((f) => f.id === 'DM-016')).toBe(true);
  });

  it('grades a very high HbA1c as veryPoor and fires the high-concern rule', () => {
    const data = withHba1c(95);
    data.glycaemicControl.severeHypoglycaemia = 'yes';
    const r = calculateControl(data);
    expect(r.controlScore).toBe(0);
    expect(r.controlLevel).toBe('veryPoor');
    // DM-001 (HbA1c >= 86) and DM-002 (severe hypoglycaemia) are high concern
    expect(r.firedRules.some((f) => f.id === 'DM-001')).toBe(true);
    expect(r.firedRules.some((f) => f.concernLevel === 'high')).toBe(true);
  });

  it('crosses the suboptimal boundary at a mid-range HbA1c (score < 65)', () => {
    const r = calculateControl(withHba1c(60));
    expect(r.controlScore).toBe(60);
    expect(r.controlLevel).toBe('suboptimal');
  });

  it('scores worse glycaemic control below better control', () => {
    const good = calculateControl(withHba1c(45));
    const bad = calculateControl(withHba1c(95));
    expect(bad.controlScore).toBeLessThan(good.controlScore);
  });
});

describe('Retinopathy rules and flags', () => {
  // Pre-proliferative retinopathy and maculopathy used to raise no
  // eye-specific rule or flag at all, unlike 'background' (DM-008) and
  // 'proliferative' (DM-004/FLAG-EYE-001) -- a real, verified gap. Both are
  // graded 'high' concern, matching DM-004/proliferative: per the National
  // Diabetic Eye Screening Programme's R1/R2/R3 grading and NICE NG28, both
  // warrant the same urgent ophthalmology referral pathway as proliferative
  // retinopathy, not the routine annual re-screening 'background' warrants.
  it('fires DM-021 (high concern) for pre-proliferative retinopathy', () => {
    const data = withHba1c(45);
    data.complicationsScreening.retinopathyStatus = 'preProliferative';
    const r = calculateControl(data);
    expect(r.firedRules.some((f) => f.id === 'DM-021' && f.concernLevel === 'high')).toBe(true);
  });

  it('fires DM-022 (high concern) for diabetic maculopathy', () => {
    const data = withHba1c(45);
    data.complicationsScreening.retinopathyStatus = 'maculopathy';
    const r = calculateControl(data);
    expect(r.firedRules.some((f) => f.id === 'DM-022' && f.concernLevel === 'high')).toBe(true);
  });

  it('raises FLAG-EYE-003 for pre-proliferative retinopathy', () => {
    const data = createDefaultAssessment();
    data.complicationsScreening.retinopathyStatus = 'preProliferative';
    const flags = detectAdditionalFlags(data);
    expect(flags.some((f) => f.id === 'FLAG-EYE-003' && f.priority === 'high')).toBe(true);
  });

  it('raises FLAG-EYE-004 for diabetic maculopathy', () => {
    const data = createDefaultAssessment();
    data.complicationsScreening.retinopathyStatus = 'maculopathy';
    const flags = detectAdditionalFlags(data);
    expect(flags.some((f) => f.id === 'FLAG-EYE-004' && f.priority === 'high')).toBe(true);
  });
});

describe('Cardiovascular flags (ported from the HTML reference)', () => {
  // FLAG-CVD-002 and FLAG-CVD-003 existed in front-end-with-html's
  // flagged-issues.js but had never been ported to this Svelte reference --
  // a real, verified stack-parity gap found while fixing the HTML side's
  // out-of-schema 'urgent' priority values below.
  it('raises FLAG-CVD-002 (high) for a current smoker', () => {
    const data = createDefaultAssessment();
    data.cardiovascularRisk.smokingStatus = 'currentSmoker';
    const flags = detectAdditionalFlags(data);
    expect(flags.some((f) => f.id === 'FLAG-CVD-002' && f.priority === 'high')).toBe(true);
  });

  it('raises FLAG-CVD-003 (medium) for systolic BP at or above 140', () => {
    const data = createDefaultAssessment();
    data.cardiovascularRisk.systolicBp = 150;
    const flags = detectAdditionalFlags(data);
    expect(flags.some((f) => f.id === 'FLAG-CVD-003' && f.priority === 'medium')).toBe(true);
  });

  it('does not raise FLAG-CVD-003 below the 140 mmHg threshold', () => {
    const data = createDefaultAssessment();
    data.cardiovascularRisk.systolicBp = 130;
    const flags = detectAdditionalFlags(data);
    expect(flags.some((f) => f.id === 'FLAG-CVD-003')).toBe(false);
  });
});

describe('Flag priority is always schema-valid', () => {
  // grade_flag.priority's SQL CHECK constraint (and this file's own
  // AdditionalFlag.priority type) only allow high/medium/low -- the HTML
  // reference's flagged-issues.js used an out-of-schema 'urgent' for 4 of
  // its flags until this was fixed; assert every flag this engine can raise
  // stays in schema, across every rule at once.
  it('never raises a flag outside high/medium/low', () => {
    const data = createDefaultAssessment();
    data.glycaemicControl.hba1cValue = 100;
    data.glycaemicControl.hba1cUnit = 'mmolMol';
    data.glycaemicControl.severeHypoglycaemia = 'yes';
    data.glycaemicControl.hypoglycaemiaFrequency = 'daily';
    data.footAssessment.ulcerPresent = 'yes';
    data.complicationsScreening.retinopathyStatus = 'proliferative';
    data.cardiovascularRisk.smokingStatus = 'currentSmoker';
    data.cardiovascularRisk.systolicBp = 150;
    const flags = detectAdditionalFlags(data);
    expect(flags.length).toBeGreaterThan(0);
    for (const f of flags) {
      expect(['high', 'medium', 'low']).toContain(f.priority);
    }
  });
});
