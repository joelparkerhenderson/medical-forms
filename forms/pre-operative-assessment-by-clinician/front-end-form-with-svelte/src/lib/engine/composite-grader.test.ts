import { describe, it, expect } from 'vitest';
import { calculateASA } from './composite-grader.js';
import { createEmptyAssessment } from './factory.js';
import { ASA_RULES } from './asa-rules.js';

describe('calculateASA', () => {
  it('returns ASA I and low risk for a healthy adult', () => {
    const data = createEmptyAssessment();
    const r = calculateASA(data);
    expect(r.computedAsaGrade).toBe('I');
    expect(r.compositeRisk).toBe('low');
    expect(r.rcriScore).toBe(0);
    expect(r.stopbangScore).toBe(0);
    expect(r.additionalFlags).toHaveLength(0);
  });

  it('fires ASA III for poorly controlled diabetes (HbA1c > 53)', () => {
    const data = createEmptyAssessment();
    data.endocrine.hba1cMmolMol = 70;
    const r = calculateASA(data);
    expect(r.computedAsaGrade).toBe('III');
    expect(r.firedRules.some((f) => f.ruleId === 'R-ASA-III-02')).toBe(true);
  });

  it('fires ASA IV for recent MI within 3 months', () => {
    const data = createEmptyAssessment();
    data.cardiovascular.recentMiWithin3Months = 'yes';
    const r = calculateASA(data);
    expect(r.computedAsaGrade).toBe('IV');
  });

  it('takes the max grade when multiple rules fire', () => {
    const data = createEmptyAssessment();
    data.endocrine.diabetesControl = 'well-controlled';
    data.cardiovascular.recentMiWithin3Months = 'yes';
    const r = calculateASA(data);
    expect(r.computedAsaGrade).toBe('IV');
  });

  it('fires difficult-airway flag at Mallampati III', () => {
    const data = createEmptyAssessment();
    data.airway.mallampatiClass = 'III';
    const r = calculateASA(data);
    expect(r.additionalFlags.some((f) => f.category === 'difficult-airway')).toBe(true);
    expect(r.compositeRisk).toBe('high');
  });

  it('fires severe-cardiac flag at EF < 40%', () => {
    const data = createEmptyAssessment();
    data.cardiovascular.echoEfPercent = 35;
    const r = calculateASA(data);
    expect(r.additionalFlags.some((f) => f.category === 'severe-cardiac')).toBe(true);
  });

  it('fires severe-cardiac flag at EF < 30% and ASA IV', () => {
    const data = createEmptyAssessment();
    data.cardiovascular.echoEfPercent = 25;
    const r = calculateASA(data);
    expect(r.computedAsaGrade).toBe('IV');
    expect(r.additionalFlags.some((f) => f.category === 'severe-cardiac')).toBe(true);
  });

  it('fires coagulopathy flag for INR > 1.5 off anticoagulants', () => {
    const data = createEmptyAssessment();
    data.haematology.inr = 2.1;
    data.haematology.onAnticoagulant = 'no';
    const r = calculateASA(data);
    expect(r.additionalFlags.some((f) => f.category === 'coagulopathy')).toBe(true);
  });

  it('fires severe-respiratory flag at SpO2 < 92 on room air', () => {
    const data = createEmptyAssessment();
    data.vitals.spo2Percent = 88;
    data.vitals.onRoomAir = 'yes';
    const r = calculateASA(data);
    expect(r.additionalFlags.some((f) => f.category === 'severe-respiratory')).toBe(true);
  });

  it('fires severe-frailty flag at CFS 8', () => {
    const data = createEmptyAssessment();
    data.functionalCapacity.clinicalFrailtyScale = 8;
    const r = calculateASA(data);
    expect(r.computedAsaGrade).toBe('IV');
    expect(r.additionalFlags.some((f) => f.category === 'severe-frailty')).toBe(true);
  });

  it('fires recent-covid-19 flag within 7 weeks', () => {
    const data = createEmptyAssessment();
    data.respiratory.covidHistory = 'recent';
    data.respiratory.daysSinceCovid = 20;
    const r = calculateASA(data);
    expect(r.additionalFlags.some((f) => f.category === 'recent-covid-19')).toBe(true);
  });

  it('scores RCRI correctly for insulin DM + high-risk surgery + IHD', () => {
    const data = createEmptyAssessment();
    data.endocrine.diabetesOnInsulin = 'yes';
    data.surgery.surgicalSeverity = 'major';
    data.cardiovascular.historyIhd = 'yes';
    const r = calculateASA(data);
    expect(r.rcriScore).toBe(3);
    expect(r.compositeRisk).toBe('high');
  });

  it('scores STOP-BANG = 5 when five components are yes', () => {
    const data = createEmptyAssessment();
    data.airway.stopbangSnoring = 'yes';
    data.airway.stopbangTired = 'yes';
    data.airway.stopbangObservedApnoea = 'yes';
    data.airway.stopbangPressure = 'yes';
    data.airway.stopbangBmiGt35 = 'yes';
    const r = calculateASA(data);
    expect(r.stopbangScore).toBe(5);
  });

  it('emergency surgery sets the E suffix', () => {
    const data = createEmptyAssessment();
    data.surgery.urgency = 'emergency';
    const r = calculateASA(data);
    expect(r.asaEmergencySuffix).toBe('E');
  });

  it('clinician final override is carried through', () => {
    const data = createEmptyAssessment();
    data.summary.finalAsaGrade = 'II';
    data.summary.overrideReason = 'Compensated mild CKD';
    const r = calculateASA(data);
    expect(r.computedAsaGrade).toBe('I');
    expect(r.finalAsaGrade).toBe('II');
    expect(r.overrideReason).toBe('Compensated mild CKD');
  });

  it('has unique rule IDs across the ASA catalogue', () => {
    const ids = ASA_RULES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
