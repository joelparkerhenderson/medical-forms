/** NEWS2 scoring engine - ported from news2-calculator.ts */

function scoreRespiratoryRate(rr) {
  if (rr === null || rr === undefined) return { parameter: 'Respiratory Rate', value: 'N/A', score: 0 };
  let score = 0;
  if (rr <= 8) score = 3;
  else if (rr <= 11) score = 1;
  else if (rr <= 20) score = 0;
  else if (rr <= 24) score = 2;
  else score = 3;
  return { parameter: 'Respiratory Rate', value: rr + ' /min', score };
}

function scoreOxygenSaturation(spo2) {
  if (spo2 === null || spo2 === undefined) return { parameter: 'SpO2 (Scale 1)', value: 'N/A', score: 0 };
  let score = 0;
  if (spo2 <= 91) score = 3;
  else if (spo2 <= 93) score = 2;
  else if (spo2 <= 95) score = 1;
  else score = 0;
  return { parameter: 'SpO2 (Scale 1)', value: spo2 + '%', score };
}

function scoreSystolicBP(sbp) {
  if (sbp === null || sbp === undefined) return { parameter: 'Systolic BP', value: 'N/A', score: 0 };
  let score = 0;
  if (sbp <= 90) score = 3;
  else if (sbp <= 100) score = 2;
  else if (sbp <= 110) score = 1;
  else if (sbp <= 219) score = 0;
  else score = 3;
  return { parameter: 'Systolic BP', value: sbp + ' mmHg', score };
}

function scorePulse(hr) {
  if (hr === null || hr === undefined) return { parameter: 'Pulse', value: 'N/A', score: 0 };
  let score = 0;
  if (hr <= 40) score = 3;
  else if (hr <= 50) score = 1;
  else if (hr <= 90) score = 0;
  else if (hr <= 110) score = 1;
  else if (hr <= 130) score = 2;
  else score = 3;
  return { parameter: 'Pulse', value: hr + ' bpm', score };
}

function scoreConsciousness(level) {
  const score = (level === 'alert' || level === '') ? 0 : 3;
  return { parameter: 'Consciousness', value: level || 'N/A', score };
}

function scoreTemperature(temp) {
  if (temp === null || temp === undefined) return { parameter: 'Temperature', value: 'N/A', score: 0 };
  let score = 0;
  if (temp <= 35.0) score = 3;
  else if (temp <= 36.0) score = 1;
  else if (temp <= 38.0) score = 0;
  else if (temp <= 39.0) score = 1;
  else score = 2;
  return { parameter: 'Temperature', value: temp + ' \u00B0C', score };
}

function scoreSupplementalOxygen(supplemental) {
  const score = supplemental === 'yes' ? 2 : 0;
  return { parameter: 'Supplemental O2', value: supplemental === 'yes' ? 'Yes' : 'No', score };
}

function determineClinicalResponse(totalScore, hasAnySingleScore3) {
  if (totalScore >= 7) return 'high';
  if (totalScore >= 5) return 'medium';
  if (hasAnySingleScore3) return 'low-medium';
  return 'low';
}

export function calculateNEWS2(vitals) {
  const parameterScores = [
    scoreRespiratoryRate(vitals.respiratoryRate),
    scoreOxygenSaturation(vitals.oxygenSaturation),
    scoreSystolicBP(vitals.systolicBP),
    scorePulse(vitals.heartRate),
    scoreConsciousness(vitals.consciousnessLevel),
    scoreTemperature(vitals.temperature),
    scoreSupplementalOxygen(vitals.supplementalOxygen)
  ];

  const totalScore = parameterScores.reduce((sum, p) => sum + p.score, 0);
  const hasAnySingleScore3 = parameterScores.some(p => p.score === 3);
  const clinicalResponse = determineClinicalResponse(totalScore, hasAnySingleScore3);

  return { totalScore, parameterScores, clinicalResponse, hasAnySingleScore3 };
}
