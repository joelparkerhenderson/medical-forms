/**
 * Vaccination level label for display.
 */
export function vaccinationLevelLabel(level) {
  switch (level) {
    case 'upToDate': return 'Up to Date';
    case 'partiallyComplete': return 'Partially Complete';
    case 'overdue': return 'Overdue';
    case 'contraindicated': return 'Contraindicated';
    case 'draft': return 'Draft';
    default: return 'Unknown';
  }
}

/**
 * Vaccination level colour class.
 */
export function vaccinationLevelColor(level) {
  switch (level) {
    case 'upToDate': return 'status-up-to-date';
    case 'partiallyComplete': return 'status-partially-complete';
    case 'overdue': return 'status-overdue';
    case 'contraindicated': return 'status-contraindicated';
    default: return 'status-draft';
  }
}

/**
 * Collect all vaccination items for scoring.
 */
export function collectVaccinationItems(data) {
  return [
    data.childhoodVaccinations.dtapIpvHibHepb,
    data.childhoodVaccinations.pneumococcal,
    data.childhoodVaccinations.rotavirus,
    data.childhoodVaccinations.meningitisB,
    data.childhoodVaccinations.mmr,
    data.childhoodVaccinations.hibMenc,
    data.childhoodVaccinations.preschoolBooster,
    data.adultVaccinations.tdIpvBooster,
    data.adultVaccinations.hpv,
    data.adultVaccinations.meningitisAcwy,
    data.adultVaccinations.influenzaAnnual,
    data.adultVaccinations.covid19,
    data.adultVaccinations.shingles,
    data.adultVaccinations.pneumococcalPpv,
    data.consentInformation.informationProvided,
    data.consentInformation.risksExplained,
    data.consentInformation.benefitsExplained,
    data.consentInformation.questionsAnswered,
    data.clinicalReview.postVaccinationObservation
  ];
}

/**
 * Calculate composite vaccination score (0-100).
 */
export function calculateCompositeScore(data) {
  const vaccineItems = [
    data.childhoodVaccinations.dtapIpvHibHepb,
    data.childhoodVaccinations.pneumococcal,
    data.childhoodVaccinations.rotavirus,
    data.childhoodVaccinations.meningitisB,
    data.childhoodVaccinations.mmr,
    data.childhoodVaccinations.hibMenc,
    data.childhoodVaccinations.preschoolBooster,
    data.adultVaccinations.tdIpvBooster,
    data.adultVaccinations.hpv,
    data.adultVaccinations.meningitisAcwy,
    data.adultVaccinations.influenzaAnnual,
    data.adultVaccinations.covid19,
    data.adultVaccinations.shingles,
    data.adultVaccinations.pneumococcalPpv
  ];

  const consentItems = [
    data.consentInformation.informationProvided,
    data.consentInformation.risksExplained,
    data.consentInformation.benefitsExplained,
    data.consentInformation.questionsAnswered
  ];

  const answeredVaccines = vaccineItems.filter(v => v !== null);
  const answeredConsent = consentItems.filter(v => v !== null);

  if (answeredVaccines.length === 0 && answeredConsent.length === 0) return null;

  const vaccineScore = answeredVaccines.length === 0 ? 0 :
    (answeredVaccines.reduce((a, b) => a + b, 0) / answeredVaccines.length / 2.0) * 100;

  const consentScore = answeredConsent.length === 0 ? 0 :
    ((answeredConsent.reduce((a, b) => a + b, 0) / answeredConsent.length - 1.0) / 4.0) * 100;

  let total;
  if (answeredVaccines.length > 0 && answeredConsent.length > 0) {
    total = vaccineScore * 0.8 + consentScore * 0.2;
  } else if (answeredVaccines.length > 0) {
    total = vaccineScore;
  } else {
    total = consentScore;
  }

  return Math.round(total);
}

/**
 * Dimension score for 0-2 scale items.
 */
export function dimensionScore02(items) {
  const answered = items.filter(v => v !== null);
  if (answered.length === 0) return null;
  return Math.round((answered.reduce((a, b) => a + b, 0) / answered.length / 2.0) * 100);
}

/**
 * Childhood vaccination score.
 */
export function childhoodScore(data) {
  return dimensionScore02([
    data.childhoodVaccinations.dtapIpvHibHepb,
    data.childhoodVaccinations.pneumococcal,
    data.childhoodVaccinations.rotavirus,
    data.childhoodVaccinations.meningitisB,
    data.childhoodVaccinations.mmr,
    data.childhoodVaccinations.hibMenc,
    data.childhoodVaccinations.preschoolBooster
  ]);
}

/**
 * Adult vaccination score.
 */
export function adultScore(data) {
  return dimensionScore02([
    data.adultVaccinations.tdIpvBooster,
    data.adultVaccinations.hpv,
    data.adultVaccinations.meningitisAcwy,
    data.adultVaccinations.influenzaAnnual,
    data.adultVaccinations.covid19,
    data.adultVaccinations.shingles,
    data.adultVaccinations.pneumococcalPpv
  ]);
}

/**
 * Consent quality score (1-5 Likert).
 */
export function consentScore(data) {
  const items = [
    data.consentInformation.informationProvided,
    data.consentInformation.risksExplained,
    data.consentInformation.benefitsExplained,
    data.consentInformation.questionsAnswered
  ];
  const answered = items.filter(v => v !== null);
  if (answered.length === 0) return null;
  const avg = answered.reduce((a, b) => a + b, 0) / answered.length;
  return Math.round(((avg - 1.0) / 4.0) * 100);
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
