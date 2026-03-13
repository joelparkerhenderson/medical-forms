import { hba1cMmolMol } from './utils.js';

/** Detect additional clinical flags. */
export function detectAdditionalFlags(data) {
  const flags = [];

  const hba1c = hba1cMmolMol(data);
  if (hba1c !== null && hba1c >= 97) {
    flags.push({ id: 'FLAG-HBA1C-001', category: 'Glycaemic Control', message: 'HbA1c critically elevated (>= 97 mmol/mol / >= 11%) - urgent review required', priority: 'high' });
  }

  if (data.glycaemicControl.hba1cValue !== null && data.glycaemicControl.hba1cTarget !== null && data.glycaemicControl.hba1cValue > data.glycaemicControl.hba1cTarget && data.glycaemicControl.hba1cUnit !== '') {
    flags.push({ id: 'FLAG-HBA1C-002', category: 'Glycaemic Control', message: 'HbA1c above agreed target without treatment intensification', priority: 'medium' });
  }

  if (data.glycaemicControl.severeHypoglycaemia === 'yes') {
    flags.push({ id: 'FLAG-HYPO-001', category: 'Hypoglycaemia', message: 'Severe hypoglycaemia reported - review insulin/sulfonylurea dosing', priority: 'high' });
  }

  if (data.glycaemicControl.hypoglycaemiaFrequency === 'daily' && data.glycaemicControl.severeHypoglycaemia === 'yes') {
    flags.push({ id: 'FLAG-HYPO-002', category: 'Hypoglycaemia', message: 'Possible hypoglycaemia unawareness - consider specialist referral', priority: 'high' });
  }

  if (data.footAssessment.ulcerPresent === 'yes') {
    flags.push({ id: 'FLAG-FOOT-001', category: 'Foot', message: 'Active foot ulcer - urgent podiatry referral required', priority: 'high' });
  }

  if (data.footAssessment.footRiskCategory === 'high') {
    flags.push({ id: 'FLAG-FOOT-002', category: 'Foot', message: 'High-risk foot category - ensure annual specialist foot screening', priority: 'medium' });
  }

  if (data.complicationsScreening.retinopathyStatus === 'proliferative') {
    flags.push({ id: 'FLAG-EYE-001', category: 'Eye', message: 'Proliferative retinopathy - urgent ophthalmology referral', priority: 'high' });
  }

  if (data.complicationsScreening.lastEyeScreening === '') {
    flags.push({ id: 'FLAG-EYE-002', category: 'Eye', message: 'No eye screening date recorded - may be overdue', priority: 'medium' });
  }

  if (data.complicationsScreening.egfr !== null && data.complicationsScreening.egfr < 30) {
    flags.push({ id: 'FLAG-RENAL-001', category: 'Renal', message: 'eGFR < 30 - consider nephrology referral and medication review', priority: 'high' });
  }

  if (data.complicationsScreening.urineAcr !== null && data.complicationsScreening.urineAcr > 30) {
    flags.push({ id: 'FLAG-RENAL-002', category: 'Renal', message: 'Macroalbuminuria detected (ACR > 30) - optimise renoprotective therapy', priority: 'high' });
  }

  if (data.cardiovascularRisk.previousCvdEvent === 'yes' && (data.cardiovascularRisk.onStatin !== 'yes' || data.cardiovascularRisk.onAntihypertensive !== 'yes')) {
    flags.push({ id: 'FLAG-CVD-001', category: 'Cardiovascular', message: 'Previous CVD event without optimal secondary prevention (statin/antihypertensive)', priority: 'high' });
  }

  if (data.psychologicalWellbeing.diabetesDistress === 5 || (data.psychologicalWellbeing.depressionScreening !== null && data.psychologicalWellbeing.depressionScreening >= 8)) {
    flags.push({ id: 'FLAG-PSYCH-001', category: 'Psychological', message: 'Severe diabetes distress or depression - consider psychological support referral', priority: 'high' });
  }

  if (data.medications.insulin === 'yes' && data.glycaemicControl.hypoglycaemiaFrequency === '') {
    flags.push({ id: 'FLAG-MED-001', category: 'Medication', message: 'On insulin without documented hypoglycaemia assessment - review education', priority: 'medium' });
  }

  const poorDiet = data.selfCareLifestyle.dietAdherence !== null && data.selfCareLifestyle.dietAdherence <= 2;
  const sedentary = data.selfCareLifestyle.physicalActivity === 'sedentary' || data.selfCareLifestyle.physicalActivity === 'minimal';
  const poorAdherence = data.medications.medicationAdherence !== null && data.medications.medicationAdherence <= 2;
  if ([poorDiet, sedentary, poorAdherence].filter(Boolean).length >= 2) {
    flags.push({ id: 'FLAG-SELF-001', category: 'Self-Care', message: 'Poor self-care across multiple domains - consider structured education programme', priority: 'medium' });
  }

  const order = { high: 0, medium: 1, low: 2 };
  flags.sort((a, b) => order[a.priority] - order[b.priority]);
  return flags;
}
