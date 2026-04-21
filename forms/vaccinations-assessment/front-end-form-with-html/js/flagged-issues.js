/**
 * Detects additional flags that should be highlighted for the clinician.
 */
export function detectAdditionalFlags(data) {
  const flags = [];

  if (data.childhoodVaccinations.mmr === 0) {
    flags.push({ id: 'FLAG-VAX-001', category: 'Childhood', message: 'MMR vaccination not given - measles outbreak risk', priority: 'high' });
  }
  if (data.contraindicationsAllergies.previousAnaphylaxis === 'yes') {
    flags.push({ id: 'FLAG-VAX-002', category: 'Contraindication', message: 'Previous anaphylaxis to vaccine - specialist allergy review required', priority: 'high' });
  }
  if (data.immunizationHistory.immunocompromised === 'yes') {
    flags.push({ id: 'FLAG-VAX-003', category: 'Clinical', message: 'Immunocompromised patient - avoid live vaccines, specialist review needed', priority: 'high' });
  }
  if (data.clinicalReview.immediateReaction === 'yes') {
    flags.push({ id: 'FLAG-VAX-004', category: 'Clinical', message: 'Immediate adverse reaction reported - document and report via Yellow Card', priority: 'high' });
  }
  if (data.contraindicationsAllergies.pregnant === 'yes') {
    flags.push({ id: 'FLAG-VAX-005', category: 'Contraindication', message: 'Pregnant patient - live vaccines contraindicated', priority: 'high' });
  }
  if (data.immunizationHistory.hasVaccinationRecord === 'no') {
    flags.push({ id: 'FLAG-VAX-006', category: 'History', message: 'No vaccination record available - full history review needed', priority: 'medium' });
  }
  if (data.occupationalVaccinations.healthcareWorker === 'yes' && data.occupationalVaccinations.hepatitisBOccupational === 0) {
    flags.push({ id: 'FLAG-VAX-007', category: 'Occupational', message: 'Healthcare worker without hepatitis B vaccination - occupational health referral', priority: 'medium' });
  }
  if (data.contraindicationsAllergies.eggAllergy === 'yes') {
    flags.push({ id: 'FLAG-VAX-008', category: 'Allergy', message: 'Egg allergy reported - use egg-free vaccine formulations', priority: 'medium' });
  }
  if (data.travelVaccinations.travelPlanned === 'yes' && data.travelVaccinations.yellowFever === 0) {
    flags.push({ id: 'FLAG-VAX-009', category: 'Travel', message: 'Travel planned but yellow fever vaccination not given - check destination requirements', priority: 'medium' });
  }
  if (data.clinicalReview.catchUpScheduleNeeded === 'yes') {
    flags.push({ id: 'FLAG-VAX-010', category: 'Clinical', message: 'Catch-up vaccination schedule required - create individualised plan', priority: 'medium' });
  }
  if (data.consentInformation.consentGiven === 'no') {
    flags.push({ id: 'FLAG-VAX-011', category: 'Consent', message: 'Consent not given - vaccination cannot proceed', priority: 'high' });
  }
  if (data.immunizationHistory.previousAdverseReactions === 'yes') {
    flags.push({ id: 'FLAG-VAX-012', category: 'History', message: 'Previous adverse reactions documented - review before administering', priority: 'medium' });
  }
  if (data.contraindicationsAllergies.severeIllness === 'yes') {
    flags.push({ id: 'FLAG-VAX-013', category: 'Contraindication', message: 'Patient currently has severe illness - defer vaccination', priority: 'high' });
  }
  if (data.clinicalReview.referralNeeded === 'yes') {
    flags.push({ id: 'FLAG-VAX-014', category: 'Clinical', message: 'Specialist referral required - ensure referral is completed', priority: 'low' });
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return flags;
}
