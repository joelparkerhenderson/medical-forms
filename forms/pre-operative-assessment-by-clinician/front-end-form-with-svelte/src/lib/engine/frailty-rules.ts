import type { ClinicianAssessment, FiredRule } from './types.js';

export function applyFrailtyRules(data: ClinicianAssessment): FiredRule[] {
  const cfs = data.functionalCapacity.clinicalFrailtyScale;
  if (cfs === null) return [];
  return [
    {
      ruleId: `R-CFS-${cfs}`,
      instrument: 'frailty',
      grade: String(cfs),
      category: 'functional',
      description: `Clinical Frailty Scale ${cfs}`,
    },
  ];
}
