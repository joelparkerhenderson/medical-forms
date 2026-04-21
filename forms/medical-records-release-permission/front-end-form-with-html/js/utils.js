/**
 * Completeness score label for display.
 */
export function completenessLabel(score) {
  if (score === 100) return score + '% Complete';
  if (score >= 75) return score + '% Nearly Complete';
  if (score >= 50) return score + '% Partially Complete';
  return score + '% Incomplete';
}

/**
 * Completeness status colour class.
 */
export function completenessColor(score) {
  if (score === 100) return 'status-complete';
  if (score >= 75) return 'status-nearly';
  if (score >= 50) return 'status-partial';
  return 'status-incomplete';
}

/**
 * Validation status label based on issue count.
 */
export function validationStatus(issueCount) {
  if (issueCount === 0) return 'Valid';
  if (issueCount <= 3) return 'Minor Issues';
  return 'Needs Attention';
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
