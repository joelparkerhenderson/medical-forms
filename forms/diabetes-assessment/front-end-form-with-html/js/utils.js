/** Returns a human-readable label for a control level. */
export function controlLevelLabel(level) {
  const labels = {
    wellControlled: 'Well Controlled',
    suboptimal: 'Suboptimal',
    poor: 'Poor',
    veryPoor: 'Very Poor',
    draft: 'Draft',
  };
  return labels[level] || 'Unknown';
}

/** Get the HbA1c value normalised to mmol/mol. */
export function hba1cMmolMol(data) {
  if (data.glycaemicControl.hba1cValue === null) return null;
  if (data.glycaemicControl.hba1cUnit === 'percent') {
    return (data.glycaemicControl.hba1cValue - 2.15) * 10.929;
  }
  return data.glycaemicControl.hba1cValue;
}

/** Count the number of active complications. */
export function countComplications(data) {
  let count = 0;
  if (data.complicationsScreening.retinopathyStatus !== '' && data.complicationsScreening.retinopathyStatus !== 'none') count++;
  if (data.complicationsScreening.neuropathySymptoms === 'yes') count++;
  if (data.complicationsScreening.egfr !== null && data.complicationsScreening.egfr < 60) count++;
  if (data.footAssessment.ulcerPresent === 'yes') count++;
  if (data.cardiovascularRisk.previousCvdEvent === 'yes') count++;
  if (data.footAssessment.previousAmputation === 'yes') count++;
  return count;
}

/** Calculate composite control score (0-100). */
export function calculateCompositeScore(data) {
  let score = 50;
  let factors = 0;

  if (data.glycaemicControl.hba1cValue !== null) {
    let hba1cMmol = data.glycaemicControl.hba1cUnit === 'percent'
      ? (data.glycaemicControl.hba1cValue - 2.15) * 10.929
      : data.glycaemicControl.hba1cValue;
    let hba1cScore;
    if (hba1cMmol <= 48) hba1cScore = 100;
    else if (hba1cMmol <= 53) hba1cScore = 80;
    else if (hba1cMmol <= 64) hba1cScore = 60;
    else if (hba1cMmol <= 75) hba1cScore = 40;
    else if (hba1cMmol <= 86) hba1cScore = 20;
    else hba1cScore = 0;
    score = hba1cScore;
    factors += 4;
  }

  if (data.medications.medicationAdherence !== null) {
    const s = ((data.medications.medicationAdherence - 1) / 4) * 100;
    score = (score * factors + s) / (factors + 1);
    factors += 1;
  }

  if (data.selfCareLifestyle.dietAdherence !== null) {
    const s = ((data.selfCareLifestyle.dietAdherence - 1) / 4) * 100;
    score = (score * factors + s) / (factors + 1);
    factors += 1;
  }

  if (data.glycaemicControl.timeInRange !== null) {
    score = (score * factors + data.glycaemicControl.timeInRange) / (factors + 1);
    factors += 1;
  }

  const cc = countComplications(data);
  if (cc > 0) score = Math.max(score - Math.min(cc * 5, 30), 0);

  if (factors === 0) return null;
  return Math.round(score);
}
