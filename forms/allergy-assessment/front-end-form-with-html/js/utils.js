/**
 * Calculate BMI from weight (kg) and height (cm). Returns null if inputs are invalid.
 */
export function calculateBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) return null;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

/**
 * Calculate age from date of birth string.
 */
export function calculateAge(dob) {
  if (!dob) return null;
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Severity level label.
 */
export function severityLabel(level) {
  switch (level) {
    case 'mild': return 'Mild - Localised reactions only';
    case 'moderate': return 'Moderate - Systemic, non-life-threatening';
    case 'severe': return 'Severe - Anaphylaxis risk';
    default: return 'Severity: ' + level;
  }
}

/**
 * Severity level colour class.
 */
export function severityColorClass(level) {
  switch (level) {
    case 'mild': return 'severity-mild';
    case 'moderate': return 'severity-moderate';
    case 'severe': return 'severity-severe';
    default: return '';
  }
}

/**
 * Numeric weight for an allergy reaction severity.
 */
export function severityWeight(severity) {
  switch (severity) {
    case 'mild': return 1;
    case 'moderate': return 2;
    case 'severe': return 3;
    case 'anaphylaxis': return 4;
    default: return 0;
  }
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
 * Get BMI category label.
 */
export function bmiCategory(bmi) {
  if (bmi === null) return '';
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  if (bmi < 35) return 'Obese Class I';
  if (bmi < 40) return 'Obese Class II';
  return 'Obese Class III (Morbid)';
}
