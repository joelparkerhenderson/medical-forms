import type { AsaGrade, ClinicianAssessment, FiredRule } from './types.js';
import { computeBmi } from './utils.js';

interface AsaRule {
  id: string;
  grade: AsaGrade;
  category: string;
  description: string;
  fires: (data: ClinicianAssessment) => boolean;
}

export const ASA_RULES: AsaRule[] = [
  // ASA II
  {
    id: 'R-ASA-II-01',
    grade: 'II',
    category: 'cardiovascular',
    description: 'Controlled hypertension',
    fires: (d) => {
      const sbp = d.vitals.systolicBp ?? 0;
      const dbp = d.vitals.diastolicBp ?? 0;
      return sbp >= 140 && sbp <= 160 && dbp <= 100 && dbp >= 90;
    },
  },
  {
    id: 'R-ASA-II-02',
    grade: 'II',
    category: 'endocrine',
    description: 'Well-controlled diabetes',
    fires: (d) => d.endocrine.diabetesControl === 'well-controlled',
  },
  {
    id: 'R-ASA-II-03',
    grade: 'II',
    category: 'respiratory',
    description: 'Mild, well-controlled asthma',
    fires: (d) => d.respiratory.asthma === 'controlled',
  },
  {
    id: 'R-ASA-II-04',
    grade: 'II',
    category: 'anthropometric',
    description: 'BMI 30-39.9',
    fires: (d) => {
      const bmi = computeBmi(d.patient.weightKg, d.patient.heightCm);
      return bmi !== null && bmi >= 30 && bmi < 40;
    },
  },
  {
    id: 'R-ASA-II-05',
    grade: 'II',
    category: 'social',
    description: 'Current smoker',
    fires: (d) => d.respiratory.smokingStatus === 'current',
  },
  // ASA III
  {
    id: 'R-ASA-III-01',
    grade: 'III',
    category: 'cardiovascular',
    description: 'Poorly controlled hypertension',
    fires: (d) => (d.vitals.systolicBp ?? 0) > 160 || (d.vitals.diastolicBp ?? 0) > 100,
  },
  {
    id: 'R-ASA-III-02',
    grade: 'III',
    category: 'endocrine',
    description: 'Poorly controlled diabetes (HbA1c > 53 mmol/mol or fasting glucose > 10 mmol/L)',
    fires: (d) =>
      d.endocrine.diabetesControl === 'poor' ||
      (d.endocrine.hba1cMmolMol ?? 0) > 53 ||
      (d.endocrine.fastingGlucoseMmolL ?? 0) > 10,
  },
  {
    id: 'R-ASA-III-03',
    grade: 'III',
    category: 'cardiovascular',
    description: 'History of MI > 3 months',
    fires: (d) =>
      d.cardiovascular.historyIhd === 'yes' &&
      d.cardiovascular.recentMiWithin3Months !== 'yes',
  },
  {
    id: 'R-ASA-III-04',
    grade: 'III',
    category: 'cardiovascular',
    description: 'Stroke or TIA > 3 months ago',
    fires: (d) =>
      d.cardiovascular.historyStrokeTia === 'yes' &&
      (d.neurological.recentStrokeTia !== 'yes' ||
        (d.neurological.daysSinceStrokeTia ?? 0) > 90),
  },
  {
    id: 'R-ASA-III-05',
    grade: 'III',
    category: 'cardiovascular',
    description: 'Implanted pacemaker or ICD',
    fires: (d) => d.cardiovascular.pacemakerOrIcd === 'yes',
  },
  {
    id: 'R-ASA-III-06',
    grade: 'III',
    category: 'cardiovascular',
    description: 'Moderate reduction in EF (30-40%)',
    fires: (d) => {
      const ef = d.cardiovascular.echoEfPercent;
      return ef !== null && ef >= 30 && ef <= 40;
    },
  },
  {
    id: 'R-ASA-III-07',
    grade: 'III',
    category: 'respiratory',
    description: 'COPD moderate (FEV1 50-79%)',
    fires: (d) =>
      d.respiratory.copd === 'moderate' ||
      ((d.respiratory.pftFev1PercentPredicted ?? 100) >= 50 &&
        (d.respiratory.pftFev1PercentPredicted ?? 100) < 80),
  },
  {
    id: 'R-ASA-III-08',
    grade: 'III',
    category: 'renal',
    description: 'eGFR 30-59',
    fires: (d) => {
      const e = d.renalHepatic.egfrMlMin173m2;
      return e !== null && e >= 30 && e < 60;
    },
  },
  {
    id: 'R-ASA-III-09',
    grade: 'III',
    category: 'renal',
    description: 'Regularly scheduled dialysis',
    fires: (d) => ['peritoneal', 'haemodialysis'].includes(d.renalHepatic.dialysisStatus),
  },
  {
    id: 'R-ASA-III-10',
    grade: 'III',
    category: 'hepatic',
    description: 'Chronic liver disease compensated',
    fires: (d) => d.renalHepatic.chronicLiverDisease === 'compensated',
  },
  {
    id: 'R-ASA-III-11',
    grade: 'III',
    category: 'anthropometric',
    description: 'BMI >= 40',
    fires: (d) => {
      const bmi = computeBmi(d.patient.weightKg, d.patient.heightCm);
      return bmi !== null && bmi >= 40;
    },
  },
  {
    id: 'R-ASA-III-12',
    grade: 'III',
    category: 'functional',
    description: 'Clinical Frailty Scale 5-6',
    fires: (d) => {
      const cfs = d.functionalCapacity.clinicalFrailtyScale;
      return cfs !== null && cfs >= 5 && cfs <= 6;
    },
  },
  // ASA IV
  {
    id: 'R-ASA-IV-01',
    grade: 'IV',
    category: 'cardiovascular',
    description: 'Recent MI within 3 months',
    fires: (d) => d.cardiovascular.recentMiWithin3Months === 'yes',
  },
  {
    id: 'R-ASA-IV-02',
    grade: 'IV',
    category: 'cardiovascular',
    description: 'Recent stroke or TIA within 3 months',
    fires: (d) =>
      d.neurological.recentStrokeTia === 'yes' &&
      (d.neurological.daysSinceStrokeTia ?? 999) <= 90,
  },
  {
    id: 'R-ASA-IV-03',
    grade: 'IV',
    category: 'cardiovascular',
    description: 'Active angina / ongoing ischaemia',
    fires: (d) =>
      d.cardiovascular.activeAngina === 'yes' ||
      d.cardiovascular.ecgIschaemicChanges === 'yes',
  },
  {
    id: 'R-ASA-IV-04',
    grade: 'IV',
    category: 'cardiovascular',
    description: 'Severe valve dysfunction',
    fires: (d) => d.cardiovascular.severeValveDysfunction === 'yes',
  },
  {
    id: 'R-ASA-IV-05',
    grade: 'IV',
    category: 'cardiovascular',
    description: 'Severe reduction in EF (<30%)',
    fires: (d) => {
      const ef = d.cardiovascular.echoEfPercent;
      return ef !== null && ef < 30;
    },
  },
  {
    id: 'R-ASA-IV-06',
    grade: 'IV',
    category: 'respiratory',
    description: 'Severe COPD (FEV1 < 50%) or SpO2 < 92% on room air',
    fires: (d) => {
      const fev = d.respiratory.pftFev1PercentPredicted;
      const sp = d.vitals.spo2Percent;
      return (
        d.respiratory.copd === 'severe' ||
        (fev !== null && fev < 50) ||
        (sp !== null && sp < 92 && d.vitals.onRoomAir === 'yes')
      );
    },
  },
  {
    id: 'R-ASA-IV-07',
    grade: 'IV',
    category: 'hepatic',
    description: 'Decompensated cirrhosis / Child-Pugh C',
    fires: (d) =>
      d.renalHepatic.chronicLiverDisease === 'decompensated' ||
      d.renalHepatic.childPughClass === 'C',
  },
  {
    id: 'R-ASA-IV-08',
    grade: 'IV',
    category: 'functional',
    description: 'Clinical Frailty Scale 7-8',
    fires: (d) => {
      const cfs = d.functionalCapacity.clinicalFrailtyScale;
      return cfs !== null && cfs >= 7 && cfs <= 8;
    },
  },
  // ASA V
  {
    id: 'R-ASA-V-01',
    grade: 'V',
    category: 'functional',
    description: 'Clinical Frailty Scale 9 (terminally ill)',
    fires: (d) => d.functionalCapacity.clinicalFrailtyScale === 9,
  },
];

export function applyAsaRules(data: ClinicianAssessment): FiredRule[] {
  const fired: FiredRule[] = [];
  for (const r of ASA_RULES) {
    if (r.fires(data)) {
      fired.push({
        ruleId: r.id,
        instrument: 'asa',
        grade: r.grade,
        category: r.category,
        description: r.description,
      });
    }
  }
  return fired;
}
