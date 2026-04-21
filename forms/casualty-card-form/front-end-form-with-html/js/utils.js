/** NEWS2 clinical response label */
export function news2ResponseLabel(response) {
  switch (response) {
    case 'low': return 'Low (routine monitoring)';
    case 'low-medium': return 'Low-Medium (urgent ward review)';
    case 'medium': return 'Medium (urgent review)';
    case 'high': return 'High (emergency assessment)';
    default: return '';
  }
}

/** NEWS2 response color CSS class */
export function news2ResponseColor(response) {
  switch (response) {
    case 'low': return 'risk-low';
    case 'low-medium': return 'risk-low-medium';
    case 'medium': return 'risk-medium';
    case 'high': return 'risk-high';
    default: return 'risk-low';
  }
}

/** NEWS2 total score color CSS class */
export function news2ScoreColor(score) {
  if (score >= 7) return 'risk-high';
  if (score >= 5) return 'risk-medium';
  if (score >= 3) return 'risk-low-medium';
  return 'risk-low';
}

/** MTS category label */
export function mtsCategoryLabel(category) {
  switch (category) {
    case '1-immediate': return '1 - Immediate (Red)';
    case '2-very-urgent': return '2 - Very Urgent (Orange)';
    case '3-urgent': return '3 - Urgent (Yellow)';
    case '4-standard': return '4 - Standard (Green)';
    case '5-non-urgent': return '5 - Non-Urgent (Blue)';
    default: return '';
  }
}

/** Calculate age from date of birth string */
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
