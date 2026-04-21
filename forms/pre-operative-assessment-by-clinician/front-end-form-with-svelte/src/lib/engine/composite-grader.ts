import type { AsaGrade, ClinicianAssessment, CompositeRisk, GradingResult } from './types.js';
import { applyAsaRules } from './asa-rules.js';
import { applyMallampatiRules } from './mallampati-rules.js';
import { applyRcriRules } from './rcri-rules.js';
import { applyStopBangRules } from './stopbang-rules.js';
import { applyFrailtyRules } from './frailty-rules.js';
import { detectAdditionalFlags } from './flagged-issues.js';
import { maxAsa } from './utils.js';

function computeCompositeRisk(
  asa: AsaGrade,
  mallampati: string,
  rcri: number,
  stopbang: number,
  frailty: number | null,
  hasHighPriorityFlag: boolean,
): CompositeRisk {
  if (asa === 'V' || asa === 'VI' || frailty === 9 || (asa === 'IV' && hasHighPriorityFlag)) {
    return 'critical';
  }
  if (
    asa === 'IV' ||
    asa === 'III' ||
    mallampati === 'III' ||
    mallampati === 'IV' ||
    rcri >= 2 ||
    stopbang >= 5 ||
    (frailty !== null && frailty >= 5)
  ) {
    return 'high';
  }
  if (
    asa === 'II' ||
    mallampati === 'II' ||
    rcri === 1 ||
    (stopbang >= 3 && stopbang <= 4) ||
    (frailty !== null && frailty >= 4)
  ) {
    return 'moderate';
  }
  return 'low';
}

export function calculateASA(data: ClinicianAssessment): GradingResult {
  const asaFired = applyAsaRules(data);
  const computedAsaGrade: AsaGrade = asaFired.reduce<AsaGrade>(
    (acc, r) => maxAsa(acc, r.grade as AsaGrade),
    'I',
  );

  const mallampatiFired = applyMallampatiRules(data);
  const { score: rcriScore, firedRules: rcriFired } = applyRcriRules(data);
  const { score: stopbangScore, firedRules: stopbangFired } = applyStopBangRules(data);
  const frailtyFired = applyFrailtyRules(data);
  const additionalFlags = detectAdditionalFlags(data);

  const hasHighFlag = additionalFlags.some((f) => f.priority === 'high');
  const compositeRisk = computeCompositeRisk(
    computedAsaGrade,
    data.airway.mallampatiClass || '',
    rcriScore,
    stopbangScore,
    data.functionalCapacity.clinicalFrailtyScale,
    hasHighFlag,
  );

  const asaEmergencySuffix: 'E' | '' =
    data.surgery.urgency === 'emergency' || data.surgery.urgency === 'immediate' ? 'E' : '';

  return {
    computedAsaGrade,
    finalAsaGrade: data.summary.finalAsaGrade || computedAsaGrade,
    asaEmergencySuffix,
    overrideReason: data.summary.overrideReason,
    mallampatiClass: data.airway.mallampatiClass,
    rcriScore,
    stopbangScore,
    frailtyScale: data.functionalCapacity.clinicalFrailtyScale,
    compositeRisk,
    firedRules: [...asaFired, ...mallampatiFired, ...rcriFired, ...stopbangFired, ...frailtyFired],
    additionalFlags,
  };
}
