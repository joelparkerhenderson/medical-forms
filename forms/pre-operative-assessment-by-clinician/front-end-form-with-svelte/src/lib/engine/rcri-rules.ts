import type { ClinicianAssessment, FiredRule } from './types.js';
import { isHighRiskSurgery } from './utils.js';

interface RcriComponent {
  id: string;
  description: string;
  fires: (d: ClinicianAssessment) => boolean;
}

const COMPONENTS: RcriComponent[] = [
  {
    id: 'R-RCRI-01',
    description: 'High-risk surgery (major or major-plus)',
    fires: (d) => isHighRiskSurgery(d.surgery.surgicalSeverity),
  },
  {
    id: 'R-RCRI-02',
    description: 'History of ischaemic heart disease',
    fires: (d) => d.cardiovascular.historyIhd === 'yes',
  },
  {
    id: 'R-RCRI-03',
    description: 'History of congestive heart failure',
    fires: (d) => d.cardiovascular.historyChf === 'yes',
  },
  {
    id: 'R-RCRI-04',
    description: 'History of cerebrovascular disease',
    fires: (d) => d.cardiovascular.historyStrokeTia === 'yes',
  },
  {
    id: 'R-RCRI-05',
    description: 'Insulin-requiring diabetes',
    fires: (d) => d.endocrine.diabetesOnInsulin === 'yes',
  },
  {
    id: 'R-RCRI-06',
    description: 'Pre-operative creatinine > 177 µmol/L',
    fires: (d) => (d.renalHepatic.creatinineUmolL ?? 0) > 177,
  },
];

export function applyRcriRules(data: ClinicianAssessment): {
  score: number;
  firedRules: FiredRule[];
} {
  const firedRules: FiredRule[] = [];
  let score = 0;
  for (const c of COMPONENTS) {
    if (c.fires(data)) {
      score += 1;
      firedRules.push({
        ruleId: c.id,
        instrument: 'rcri',
        grade: 'component',
        category: 'cardiovascular',
        description: c.description,
      });
    }
  }
  return { score, firedRules };
}
