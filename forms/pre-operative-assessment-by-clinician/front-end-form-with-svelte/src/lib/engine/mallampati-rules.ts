import type { ClinicianAssessment, FiredRule } from './types.js';

export function applyMallampatiRules(data: ClinicianAssessment): FiredRule[] {
  const mp = data.airway.mallampatiClass;
  if (!mp) return [];
  return [
    {
      ruleId: `R-MP-${mp}`,
      instrument: 'mallampati',
      grade: mp,
      category: 'airway',
      description: `Mallampati class ${mp}`,
    },
  ];
}
