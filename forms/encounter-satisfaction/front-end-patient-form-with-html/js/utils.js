/**
 * Satisfaction score category.
 *   4.5 - 5.0 = Excellent
 *   3.5 - 4.4 = Good
 *   2.5 - 3.4 = Fair
 *   1.5 - 2.4 = Poor
 *   1.0 - 1.4 = Very Poor
 */
export function satisfactionCategory(score) {
  if (score >= 4.5) return 'Excellent';
  if (score >= 3.5) return 'Good';
  if (score >= 2.5) return 'Fair';
  if (score >= 1.5) return 'Poor';
  return 'Very Poor';
}

/**
 * Satisfaction score label for display.
 */
export function satisfactionScoreLabel(score) {
  return score.toFixed(1) + '/5.0 - ' + satisfactionCategory(score);
}

/**
 * Satisfaction score CSS class.
 */
export function satisfactionScoreColor(score) {
  if (score >= 4.5) return 'score-excellent';
  if (score >= 3.5) return 'score-good';
  if (score >= 2.5) return 'score-fair';
  if (score >= 1.5) return 'score-poor';
  return 'score-very-poor';
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
