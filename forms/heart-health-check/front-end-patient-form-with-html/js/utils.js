/**
 * Risk category label for display.
 */
export function riskCategoryLabel(level) {
  switch (level) {
    case 'low': return 'Low Risk';
    case 'moderate': return 'Moderate Risk';
    case 'high': return 'High Risk';
    case 'draft': return 'Draft';
    default: return 'Unknown';
  }
}

/**
 * Risk category CSS class for styling.
 */
export function riskCategoryColor(level) {
  switch (level) {
    case 'low': return 'risk-low';
    case 'moderate': return 'risk-moderate';
    case 'high': return 'risk-high';
    default: return 'risk-draft';
  }
}

/**
 * Calculate BMI from height (cm) and weight (kg).
 */
export function calculateBMI(heightCm, weightKg) {
  if (heightCm == null || weightKg == null || heightCm <= 0) return null;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

/**
 * Calculate TC/HDL ratio.
 */
export function calculateTcHdlRatio(tc, hdl) {
  if (tc == null || hdl == null || hdl <= 0) return null;
  return Math.round((tc / hdl) * 10) / 10;
}

/**
 * Whether the smoking status represents a current smoker.
 */
export function isSmoker(status) {
  return status === 'lightSmoker' || status === 'moderateSmoker' || status === 'heavySmoker';
}

/**
 * Whether the data is likely still in draft state.
 */
export function isLikelyDraft(data) {
  return data.demographicsEthnicity.age == null && data.demographicsEthnicity.sex === '';
}

/**
 * Smoking points contribution to risk.
 */
export function smokingPoints(status) {
  switch (status) {
    case 'heavySmoker': return 15;
    case 'moderateSmoker': return 10;
    case 'lightSmoker': return 5;
    case 'exSmoker': return 2;
    default: return 0;
  }
}

/**
 * BMI category label.
 */
export function bmiCategory(bmi) {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  if (bmi < 40) return 'Obese';
  return 'Morbidly Obese';
}

/**
 * Format a date string for display.
 */
export function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * Format an NHS number for display (XXX XXX XXXX).
 */
export function formatNhsNumber(nhs) {
  const digits = (nhs || '').replace(/\s/g, '');
  if (digits.length !== 10) return nhs || '';
  return digits.slice(0, 3) + ' ' + digits.slice(3, 6) + ' ' + digits.slice(6);
}

/**
 * Parse a numeric value from a form field.
 * Returns null if the value is empty or not a number.
 */
export function parseNumeric(value) {
  if (value === '' || value === null || value === undefined) return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}
