/** Returns a human-readable label for a risk category. */
export function riskCategoryLabel(level) {
  switch (level) {
    case 'low': return 'Low Risk — estimated 10-year CVD risk below 5%';
    case 'borderline': return 'Borderline Risk — estimated 10-year CVD risk 5–7.4%';
    case 'intermediate': return 'Intermediate Risk — estimated 10-year CVD risk 7.5–19.9%';
    case 'high': return 'High Risk — estimated 10-year CVD risk 20% or higher';
    case 'draft': return 'Draft — insufficient data to calculate risk';
    default: return 'Unknown';
  }
}

/** Returns a CSS class for the risk category colour. */
export function riskCategoryColor(level) {
  switch (level) {
    case 'low': return 'risk-low';
    case 'borderline': return 'risk-borderline';
    case 'intermediate': return 'risk-medium';
    case 'high': return 'risk-high';
    default: return '';
  }
}

/** Calculate BMI from height (cm) and weight (kg). */
export function calculateBmi(heightCm, weightKg) {
  if (!heightCm || !weightKg || heightCm <= 0) return null;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

/** Determine if the patient is a current smoker. */
export function isSmoker(status) {
  if (!status) return false;
  const lower = status.toLowerCase();
  return lower === 'current' || lower === 'yes' || lower === 'currentsmoker';
}

/** Check if the assessment is likely a draft (missing key required fields). */
export function isLikelyDraft(data) {
  return data.demographics.age == null && !data.demographics.sex;
}

/** Convert HbA1c from mmol/mol to percent if needed. */
export function hba1cToPercent(value, unit) {
  if (value == null) return null;
  if (unit === 'mmolMol' || unit === 'mmol/mol') {
    return (value / 10.929) + 2.15;
  }
  return value;
}

/** Estimate 10-year CVD risk using a point-based scoring system. */
export function estimateTenYearRisk(data) {
  const age = data.demographics.age;
  if (age == null) return 0;

  const isMale = (data.demographics.sex || '').toLowerCase() === 'male';

  // Age points (sex-specific)
  let points = 0;
  if (isMale) {
    if (age >= 75) points = 16;
    else if (age >= 70) points = 14;
    else if (age >= 65) points = 12;
    else if (age >= 60) points = 10;
    else if (age >= 55) points = 8;
    else if (age >= 50) points = 6;
    else if (age >= 45) points = 4;
    else if (age >= 40) points = 2;
  } else {
    if (age >= 75) points = 13;
    else if (age >= 70) points = 11;
    else if (age >= 65) points = 9;
    else if (age >= 60) points = 7;
    else if (age >= 55) points = 5;
    else if (age >= 50) points = 4;
    else if (age >= 45) points = 2;
    else if (age >= 40) points = 1;
  }

  // Total cholesterol
  const tc = data.cholesterolLipids.totalCholesterol;
  if (tc != null) {
    if (tc >= 280) points += 3;
    else if (tc >= 240) points += 2;
    else if (tc >= 200) points += 1;
  }

  // HDL cholesterol (inverse)
  const hdl = data.cholesterolLipids.hdlCholesterol;
  if (hdl != null) {
    if (hdl < 35) points += 3;
    else if (hdl < 40) points += 2;
    else if (hdl < 50) points += 1;
    else if (hdl >= 60) points -= 1;
  }

  // Systolic BP
  const sbp = data.bloodPressure.systolicBp;
  if (sbp != null) {
    if (sbp >= 180) points += 5;
    else if (sbp >= 160) points += 4;
    else if (sbp >= 140) points += 3;
    else if (sbp >= 130) points += 2;
    else if (sbp >= 120) points += 1;
  }

  // Diabetes
  if (data.metabolicHealth.hasDiabetes === 'yes') points += 3;

  // Current smoking
  if (isSmoker(data.smokingHistory.smokingStatus)) points += 3;

  // eGFR
  const egfr = data.renalFunction.egfr;
  if (egfr != null) {
    if (egfr < 30) points += 4;
    else if (egfr < 45) points += 3;
    else if (egfr < 60) points += 2;
    else if (egfr < 90) points += 1;
  }

  // BMI
  const bmi = data.metabolicHealth.bmi || calculateBmi(data.demographics.heightCm, data.demographics.weightKg);
  if (bmi != null) {
    if (bmi >= 35) points += 3;
    else if (bmi >= 30) points += 2;
    else if (bmi >= 25) points += 1;
  }

  // Antihypertensive
  if (data.bloodPressure.onAntihypertensive === 'yes') points += 1;

  // Statin
  if (data.cholesterolLipids.onStatin === 'yes') points += 0.5;

  // Convert to risk percentage
  let risk = 0.5 * Math.exp(0.18 * points);
  risk = Math.round(risk * 10) / 10;
  return Math.max(0.1, Math.min(95, risk));
}

/** Estimate 30-year risk from 10-year risk. */
export function estimateThirtyYearRisk(tenYear) {
  const thirty = Math.round(tenYear * 2.5 * 10) / 10;
  return Math.min(thirty, 95);
}
