// Plain-JavaScript / JSDoc type definitions mirroring the SvelteKit
// `src/lib/engine/types.ts` data model for the Diabetes Assessment form.
//
// Builds and exports the canonical empty AssessmentData shape used by the
// wizard so newly-added fields default correctly when older saved state is
// rehydrated from localStorage. Also publishes a few label helpers shared by
// the report renderer.

/**
 * @typedef {'yes' | 'no' | ''} YesNo
 * @typedef {'wellControlled' | 'suboptimal' | 'poor' | 'veryPoor' | 'draft'} ControlLevel
 */

/**
 * @typedef {Object} PatientInformation
 * @property {string} fullName
 * @property {string} dateOfBirth
 * @property {string} nhsNumber
 * @property {string} address
 * @property {string} telephone
 * @property {string} email
 * @property {string} gpName
 * @property {string} gpPractice
 */

/**
 * @typedef {Object} DiabetesHistory
 * @property {string} diabetesType
 * @property {number | null} ageAtDiagnosis
 * @property {number | null} yearsDuration
 * @property {string} diagnosisMethod
 * @property {YesNo} familyHistory
 * @property {string} autoantibodiesTested
 */

/**
 * @typedef {Object} GlycaemicControl
 * @property {number | null} hba1cValue
 * @property {string} hba1cUnit
 * @property {number | null} hba1cTarget
 * @property {number | null} fastingGlucose
 * @property {number | null} postprandialGlucose
 * @property {string} glucoseMonitoringType
 * @property {string} hypoglycaemiaFrequency
 * @property {YesNo} severeHypoglycaemia
 * @property {number | null} timeInRange
 */

/**
 * @typedef {Object} Medications
 * @property {YesNo} metformin
 * @property {string} sulfonylurea
 * @property {string} sglt2Inhibitor
 * @property {string} glp1Agonist
 * @property {string} dpp4Inhibitor
 * @property {YesNo} insulin
 * @property {string} insulinRegimen
 * @property {number | null} insulinDailyDose
 * @property {number | null} medicationAdherence
 * @property {string} otherMedications
 */

/**
 * @typedef {Object} ComplicationsScreening
 * @property {string} retinopathyStatus
 * @property {string} lastEyeScreening
 * @property {string} nephropathyStatus
 * @property {number | null} egfr
 * @property {number | null} urineAcr
 * @property {YesNo} neuropathySymptoms
 * @property {string} autonomicNeuropathy
 * @property {string} erectileDysfunction
 */

/**
 * @typedef {Object} CardiovascularRisk
 * @property {number | null} systolicBp
 * @property {number | null} diastolicBp
 * @property {string} onAntihypertensive
 * @property {number | null} totalCholesterol
 * @property {number | null} ldlCholesterol
 * @property {string} onStatin
 * @property {string} smokingStatus
 * @property {YesNo} previousCvdEvent
 * @property {number | null} qriskScore
 */

/**
 * @typedef {Object} SelfCareLifestyle
 * @property {number | null} dietAdherence
 * @property {YesNo} carbCounting
 * @property {string} physicalActivity
 * @property {number | null} bmi
 * @property {string} weightChange
 * @property {string} alcoholConsumption
 * @property {string} smokingCessation
 */

/**
 * @typedef {Object} PsychologicalWellbeing
 * @property {number | null} diabetesDistress
 * @property {number | null} depressionScreening
 * @property {number | null} anxietyScreening
 * @property {YesNo} eatingDisorder
 * @property {number | null} fearOfHypoglycaemia
 * @property {number | null} copingAbility
 * @property {YesNo} needsSupport
 */

/**
 * @typedef {Object} FootAssessment
 * @property {string} footPulses
 * @property {string} monofilamentTest
 * @property {string} vibrationSense
 * @property {YesNo} footDeformity
 * @property {YesNo} callusPresent
 * @property {YesNo} ulcerPresent
 * @property {YesNo} previousAmputation
 * @property {string} footRiskCategory
 */

/**
 * @typedef {Object} ReviewCarePlan
 * @property {string} clinicianName
 * @property {string} reviewDate
 * @property {number | null} hba1cTargetAgreed
 * @property {YesNo} carePlanUpdated
 * @property {string} clinicalNotes
 * @property {string} referrals
 * @property {string} nextReviewDate
 */

/**
 * @typedef {Object} AssessmentData
 * @property {PatientInformation} patientInformation
 * @property {DiabetesHistory} diabetesHistory
 * @property {GlycaemicControl} glycaemicControl
 * @property {Medications} medications
 * @property {ComplicationsScreening} complicationsScreening
 * @property {CardiovascularRisk} cardiovascularRisk
 * @property {SelfCareLifestyle} selfCareLifestyle
 * @property {PsychologicalWellbeing} psychologicalWellbeing
 * @property {FootAssessment} footAssessment
 * @property {ReviewCarePlan} reviewCarePlan
 */

/**
 * @typedef {Object} FiredRule
 * @property {string} id
 * @property {string} category
 * @property {string} description
 * @property {string} concernLevel
 */

/**
 * @typedef {Object} AdditionalFlag
 * @property {string} id
 * @property {string} category
 * @property {string} message
 * @property {'high' | 'medium' | 'low'} priority
 */

/**
 * @typedef {Object} GradingResult
 * @property {ControlLevel} controlLevel
 * @property {number} controlScore
 * @property {FiredRule[]} firedRules
 * @property {AdditionalFlag[]} additionalFlags
 * @property {string} timestamp
 */

/**
 * Build a fresh, fully-blank assessment.
 * Strings default to `''`; numeric fields default to `null`.
 * @returns {AssessmentData}
 */
function emptyAssessment() {
  return {
    patientInformation: {
      fullName: '',
      dateOfBirth: '',
      nhsNumber: '',
      address: '',
      telephone: '',
      email: '',
      gpName: '',
      gpPractice: ''
    },
    diabetesHistory: {
      diabetesType: '',
      ageAtDiagnosis: null,
      yearsDuration: null,
      diagnosisMethod: '',
      familyHistory: '',
      autoantibodiesTested: ''
    },
    glycaemicControl: {
      hba1cValue: null,
      hba1cUnit: '',
      hba1cTarget: null,
      fastingGlucose: null,
      postprandialGlucose: null,
      glucoseMonitoringType: '',
      hypoglycaemiaFrequency: '',
      severeHypoglycaemia: '',
      timeInRange: null
    },
    medications: {
      metformin: '',
      sulfonylurea: '',
      sglt2Inhibitor: '',
      glp1Agonist: '',
      dpp4Inhibitor: '',
      insulin: '',
      insulinRegimen: '',
      insulinDailyDose: null,
      medicationAdherence: null,
      otherMedications: ''
    },
    complicationsScreening: {
      retinopathyStatus: '',
      lastEyeScreening: '',
      nephropathyStatus: '',
      egfr: null,
      urineAcr: null,
      neuropathySymptoms: '',
      autonomicNeuropathy: '',
      erectileDysfunction: ''
    },
    cardiovascularRisk: {
      systolicBp: null,
      diastolicBp: null,
      onAntihypertensive: '',
      totalCholesterol: null,
      ldlCholesterol: null,
      onStatin: '',
      smokingStatus: '',
      previousCvdEvent: '',
      qriskScore: null
    },
    selfCareLifestyle: {
      dietAdherence: null,
      carbCounting: '',
      physicalActivity: '',
      bmi: null,
      weightChange: '',
      alcoholConsumption: '',
      smokingCessation: ''
    },
    psychologicalWellbeing: {
      diabetesDistress: null,
      depressionScreening: null,
      anxietyScreening: null,
      eatingDisorder: '',
      fearOfHypoglycaemia: null,
      copingAbility: null,
      needsSupport: ''
    },
    footAssessment: {
      footPulses: '',
      monofilamentTest: '',
      vibrationSense: '',
      footDeformity: '',
      callusPresent: '',
      ulcerPresent: '',
      previousAmputation: '',
      footRiskCategory: ''
    },
    reviewCarePlan: {
      clinicianName: '',
      reviewDate: '',
      hba1cTargetAgreed: null,
      carePlanUpdated: '',
      clinicalNotes: '',
      referrals: '',
      nextReviewDate: ''
    }
  };
}

/**
 * Convert HbA1c to mmol/mol regardless of the unit the patient supplied.
 * The IFCC->DCCT conversion formula is: mmol/mol = (% - 2.15) * 10.929.
 * @param {AssessmentData} data
 * @returns {number | null}
 */
function hba1cMmolMol(data) {
  if (data.glycaemicControl.hba1cValue === null) return null;
  if (data.glycaemicControl.hba1cUnit === 'percent') {
    return (data.glycaemicControl.hba1cValue - 2.15) * 10.929;
  }
  return data.glycaemicControl.hba1cValue;
}

/**
 * Count active complications across the screening domains.
 * @param {AssessmentData} data
 * @returns {number}
 */
function countComplications(data) {
  let count = 0;
  if (
    data.complicationsScreening.retinopathyStatus !== '' &&
    data.complicationsScreening.retinopathyStatus !== 'none'
  ) count++;
  if (data.complicationsScreening.neuropathySymptoms === 'yes') count++;
  if (data.complicationsScreening.egfr !== null && data.complicationsScreening.egfr < 60) count++;
  if (data.footAssessment.ulcerPresent === 'yes') count++;
  if (data.cardiovascularRisk.previousCvdEvent === 'yes') count++;
  if (data.footAssessment.previousAmputation === 'yes') count++;
  return count;
}

/**
 * Composite control score (0-100) using HbA1c as primary driver with
 * modifiers for self-reported adherence, time-in-range, and a complication
 * penalty. Mirrors the SvelteKit reference engine.
 * @param {AssessmentData} data
 * @returns {number | null}
 */
function calculateCompositeScore(data) {
  let score = 50;
  let factors = 0;

  if (data.glycaemicControl.hba1cValue !== null) {
    let mmol;
    if (data.glycaemicControl.hba1cUnit === 'percent') {
      mmol = (data.glycaemicControl.hba1cValue - 2.15) * 10.929;
    } else {
      mmol = data.glycaemicControl.hba1cValue;
    }
    let hba1cScore;
    if (mmol <= 48) hba1cScore = 100;
    else if (mmol <= 53) hba1cScore = 80;
    else if (mmol <= 64) hba1cScore = 60;
    else if (mmol <= 75) hba1cScore = 40;
    else if (mmol <= 86) hba1cScore = 20;
    else hba1cScore = 0;
    score = hba1cScore;
    factors += 4;
  }

  if (data.medications.medicationAdherence !== null) {
    const adherenceScore = ((data.medications.medicationAdherence - 1) / 4) * 100;
    score = (score * factors + adherenceScore) / (factors + 1);
    factors += 1;
  }

  if (data.selfCareLifestyle.dietAdherence !== null) {
    const dietScore = ((data.selfCareLifestyle.dietAdherence - 1) / 4) * 100;
    score = (score * factors + dietScore) / (factors + 1);
    factors += 1;
  }

  if (data.glycaemicControl.timeInRange !== null) {
    const tirScore = data.glycaemicControl.timeInRange;
    score = (score * factors + tirScore) / (factors + 1);
    factors += 1;
  }

  const complicationCount = countComplications(data);
  if (complicationCount > 0) {
    const penalty = Math.min(complicationCount * 5, 30);
    score = Math.max(score - penalty, 0);
  }

  if (factors === 0) return null;

  return Math.round(score);
}

/**
 * Collect the scored Likert items used to detect "draft" submissions where
 * the user hasn't supplied enough information to grade.
 * @param {AssessmentData} data
 * @returns {(number | null)[]}
 */
function collectScoredItems(data) {
  return [
    data.medications.medicationAdherence,
    data.selfCareLifestyle.dietAdherence,
    data.psychologicalWellbeing.diabetesDistress,
    data.psychologicalWellbeing.copingAbility,
    data.psychologicalWellbeing.fearOfHypoglycaemia,
    data.psychologicalWellbeing.depressionScreening,
    data.psychologicalWellbeing.anxietyScreening,
    data.glycaemicControl.timeInRange
  ];
}

/** Friendly label for a control level. */
function controlLevelLabel(level) {
  switch (level) {
    case 'wellControlled': return 'Well Controlled';
    case 'suboptimal': return 'Suboptimal';
    case 'poor': return 'Poorly Controlled';
    case 'veryPoor': return 'Very Poor';
    case 'draft': return 'Draft';
    default: return 'Unknown';
  }
}

/** CSS class hint for the control level badge. */
function controlLevelClass(level) {
  switch (level) {
    case 'wellControlled': return 'control-well';
    case 'suboptimal': return 'control-suboptimal';
    case 'poor': return 'control-poor';
    case 'veryPoor': return 'control-very-poor';
    case 'draft': return 'control-draft';
    default: return '';
  }
}

export { emptyAssessment, hba1cMmolMol, countComplications, calculateCompositeScore, collectScoredItems, controlLevelLabel, controlLevelClass };
