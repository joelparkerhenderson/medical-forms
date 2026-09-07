import { hba1cMmolMol } from './types.js';

// Diabetes flagged-issue detection. Independent of the composite control
// score; raises clinician-facing alerts for HbA1c extremes, hypoglycaemia,
// foot, eye, renal, cardiovascular, psychological, and self-care risks.
//
// Mirrors `src/lib/engine/flagged-issues.ts` from the Svelte reference.
// priority is restricted to high / medium / low, matching the schema's
// grade_flag.priority CHECK constraint and the SvelteKit reference's
// FlagPriority type — this form has no "urgent" tier (unlike a handful of
// other forms in the monorepo whose own grade_flag schema does allow one).

/**
 * @typedef {import('./types.js').AssessmentData} AssessmentData
 * @typedef {import('./types.js').AdditionalFlag} AdditionalFlag
 */

/**
 * @param {AssessmentData} data
 * @returns {AdditionalFlag[]}
 */
function detectAdditionalFlags(data) {
  /** @type {AdditionalFlag[]} */
  const flags = [];

  // ─── HbA1c critically elevated ─────────────────────────
  const hba1c = hba1cMmolMol(data);
  if (hba1c !== null && hba1c >= 97) {
    flags.push({
      id: 'FLAG-HBA1C-001',
      category: 'Glycaemic Control',
      message: 'HbA1c critically elevated (>= 97 mmol/mol / >= 11%) - urgent review required',
      priority: 'high'
    });
  }

  // ─── HbA1c above agreed target ─────────────────────────
  if (
    data.glycaemicControl.hba1cValue !== null &&
    data.glycaemicControl.hba1cTarget !== null &&
    data.glycaemicControl.hba1cValue > data.glycaemicControl.hba1cTarget &&
    data.glycaemicControl.hba1cUnit !== ''
  ) {
    flags.push({
      id: 'FLAG-HBA1C-002',
      category: 'Glycaemic Control',
      message: 'HbA1c above agreed target without treatment intensification',
      priority: 'medium'
    });
  }

  // ─── Severe hypoglycaemia ──────────────────────────────
  if (data.glycaemicControl.severeHypoglycaemia === 'yes') {
    flags.push({
      id: 'FLAG-HYPO-001',
      category: 'Hypoglycaemia',
      message: 'Severe hypoglycaemia reported - review insulin/sulfonylurea dosing',
      priority: 'high'
    });
  }

  // ─── Possible hypoglycaemia unawareness ───────────────
  if (
    data.glycaemicControl.hypoglycaemiaFrequency === 'daily' &&
    data.glycaemicControl.severeHypoglycaemia === 'yes'
  ) {
    flags.push({
      id: 'FLAG-HYPO-002',
      category: 'Hypoglycaemia',
      message: 'Possible hypoglycaemia unawareness - consider specialist referral',
      priority: 'high'
    });
  }

  // ─── Active foot ulcer ────────────────────────────────
  if (data.footAssessment.ulcerPresent === 'yes') {
    flags.push({
      id: 'FLAG-FOOT-001',
      category: 'Foot',
      message: 'Active foot ulcer - urgent podiatry referral required',
      priority: 'high'
    });
  }

  // ─── High-risk foot category ──────────────────────────
  if (data.footAssessment.footRiskCategory === 'high') {
    flags.push({
      id: 'FLAG-FOOT-002',
      category: 'Foot',
      message: 'High-risk foot category - ensure annual specialist foot screening',
      priority: 'medium'
    });
  }

  // ─── Proliferative retinopathy ────────────────────────
  if (data.complicationsScreening.retinopathyStatus === 'proliferative') {
    flags.push({
      id: 'FLAG-EYE-001',
      category: 'Eye',
      message: 'Proliferative retinopathy - urgent ophthalmology referral',
      priority: 'high'
    });
  }

  // ─── Pre-proliferative retinopathy ────────────────────
  if (data.complicationsScreening.retinopathyStatus === 'preProliferative') {
    flags.push({
      id: 'FLAG-EYE-003',
      category: 'Eye',
      message: 'Pre-proliferative retinopathy - urgent ophthalmology referral',
      priority: 'high'
    });
  }

  // ─── Diabetic maculopathy ──────────────────────────────
  if (data.complicationsScreening.retinopathyStatus === 'maculopathy') {
    flags.push({
      id: 'FLAG-EYE-004',
      category: 'Eye',
      message: 'Diabetic maculopathy - urgent ophthalmology referral',
      priority: 'high'
    });
  }

  // ─── Overdue eye screening ────────────────────────────
  if (data.complicationsScreening.lastEyeScreening === '') {
    flags.push({
      id: 'FLAG-EYE-002',
      category: 'Eye',
      message: 'No eye screening date recorded - may be overdue',
      priority: 'medium'
    });
  }

  // ─── eGFR critically low ──────────────────────────────
  if (data.complicationsScreening.egfr !== null && data.complicationsScreening.egfr < 30) {
    flags.push({
      id: 'FLAG-RENAL-001',
      category: 'Renal',
      message: 'eGFR < 30 - consider nephrology referral and medication review',
      priority: 'high'
    });
  }

  // ─── Macroalbuminuria ─────────────────────────────────
  if (data.complicationsScreening.urineAcr !== null && data.complicationsScreening.urineAcr > 30) {
    flags.push({
      id: 'FLAG-RENAL-002',
      category: 'Renal',
      message: 'Macroalbuminuria detected (ACR > 30) - optimise renoprotective therapy',
      priority: 'high'
    });
  }

  // ─── Previous CVD without optimal prevention ──────────
  if (
    data.cardiovascularRisk.previousCvdEvent === 'yes' &&
    (data.cardiovascularRisk.onStatin !== 'yes' ||
      data.cardiovascularRisk.onAntihypertensive !== 'yes')
  ) {
    flags.push({
      id: 'FLAG-CVD-001',
      category: 'Cardiovascular',
      message: 'Previous CVD event without optimal secondary prevention (statin/antihypertensive)',
      priority: 'high'
    });
  }

  // ─── Severe distress / depression ─────────────────────
  if (
    data.psychologicalWellbeing.diabetesDistress === 5 ||
    (data.psychologicalWellbeing.depressionScreening !== null &&
      data.psychologicalWellbeing.depressionScreening >= 8 &&
      data.psychologicalWellbeing.depressionScreening <= 10)
  ) {
    flags.push({
      id: 'FLAG-PSYCH-001',
      category: 'Psychological',
      message: 'Severe diabetes distress or depression - consider psychological support referral',
      priority: 'high'
    });
  }

  // ─── Insulin without hypo assessment ──────────────────
  if (
    data.medications.insulin === 'yes' &&
    data.glycaemicControl.hypoglycaemiaFrequency === ''
  ) {
    flags.push({
      id: 'FLAG-MED-001',
      category: 'Medication',
      message: 'On insulin without documented hypoglycaemia assessment - review education',
      priority: 'medium'
    });
  }

  // ─── Poor self-care across multiple domains ───────────
  const poorDiet =
    data.selfCareLifestyle.dietAdherence !== null &&
    data.selfCareLifestyle.dietAdherence >= 1 &&
    data.selfCareLifestyle.dietAdherence <= 2;
  const sedentary =
    data.selfCareLifestyle.physicalActivity === 'sedentary' ||
    data.selfCareLifestyle.physicalActivity === 'minimal';
  const poorAdherence =
    data.medications.medicationAdherence !== null &&
    data.medications.medicationAdherence >= 1 &&
    data.medications.medicationAdherence <= 2;
  const poorDomains = [poorDiet, sedentary, poorAdherence].filter(Boolean).length;
  if (poorDomains >= 2) {
    flags.push({
      id: 'FLAG-SELF-001',
      category: 'Self-Care',
      message: 'Poor self-care across multiple domains - consider structured education programme',
      priority: 'medium'
    });
  }

  // ─── Active smoker ────────────────────────────────────
  if (data.cardiovascularRisk.smokingStatus === 'currentSmoker') {
    flags.push({
      id: 'FLAG-CVD-002',
      category: 'Cardiovascular',
      message: 'Current smoker - smoking cessation critical for cardiovascular risk reduction',
      priority: 'high'
    });
  }

  // ─── Hypertension reading ─────────────────────────────
  if (
    data.cardiovascularRisk.systolicBp !== null &&
    data.cardiovascularRisk.systolicBp >= 140
  ) {
    flags.push({
      id: 'FLAG-CVD-003',
      category: 'Cardiovascular',
      message: `Systolic BP ${data.cardiovascularRisk.systolicBp} mmHg - above NICE target for diabetes`,
      priority: 'medium'
    });
  }

  // Sort: high > medium > low
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return flags;
}

export { detectAdditionalFlags };
