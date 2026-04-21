import type { ClinicianAssessment, FiredRule } from './types.js';

const ITEMS: Array<{
  id: string;
  description: string;
  pick: (d: ClinicianAssessment) => 'yes' | 'no' | '';
}> = [
  { id: 'R-SB-S', description: 'Loud snoring', pick: (d) => d.airway.stopbangSnoring },
  { id: 'R-SB-T', description: 'Daytime tiredness', pick: (d) => d.airway.stopbangTired },
  {
    id: 'R-SB-O',
    description: 'Observed apnoea',
    pick: (d) => d.airway.stopbangObservedApnoea,
  },
  { id: 'R-SB-P', description: 'Treated for hypertension', pick: (d) => d.airway.stopbangPressure },
  { id: 'R-SB-B', description: 'BMI > 35', pick: (d) => d.airway.stopbangBmiGt35 },
  { id: 'R-SB-A', description: 'Age > 50', pick: (d) => d.airway.stopbangAgeGt50 },
  { id: 'R-SB-N', description: 'Neck > 40 cm', pick: (d) => d.airway.stopbangNeckGt40 },
  { id: 'R-SB-G', description: 'Male gender', pick: (d) => d.airway.stopbangMale },
];

export function applyStopBangRules(data: ClinicianAssessment): {
  score: number;
  firedRules: FiredRule[];
} {
  const firedRules: FiredRule[] = [];
  let score = 0;
  for (const item of ITEMS) {
    if (item.pick(data) === 'yes') {
      score += 1;
      firedRules.push({
        ruleId: item.id,
        instrument: 'stopbang',
        grade: 'component',
        category: 'airway',
        description: item.description,
      });
    }
  }
  return { score, firedRules };
}
