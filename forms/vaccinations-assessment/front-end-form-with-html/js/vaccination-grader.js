import { evaluateRules } from './vaccination-rules.js';
import { calculateCompositeScore, collectVaccinationItems } from './utils.js';

/**
 * Calculate vaccination status from assessment data.
 * Returns { level, score, firedRules }.
 */
export function calculateVaccinationStatus(data) {
  const items = collectVaccinationItems(data);
  const answeredCount = items.filter(x => x !== null).length;

  if (answeredCount < 5) {
    return { level: 'draft', score: 0, firedRules: [] };
  }

  const hasAnaphylaxis = data.contraindicationsAllergies.previousAnaphylaxis === 'yes';
  const isPregnant = data.contraindicationsAllergies.pregnant === 'yes';
  const isImmunocompromised = data.immunizationHistory.immunocompromised === 'yes';

  if (hasAnaphylaxis && (isPregnant || isImmunocompromised)) {
    const score = calculateCompositeScore(data) || 0;
    const firedRules = evaluateRules(data);
    return { level: 'contraindicated', score, firedRules };
  }

  const score = calculateCompositeScore(data) || 0;
  const firedRules = evaluateRules(data);

  let level;
  if (hasAnaphylaxis) {
    level = 'contraindicated';
  } else if (score >= 80) {
    level = 'upToDate';
  } else if (score >= 40) {
    level = 'partiallyComplete';
  } else {
    level = 'overdue';
  }

  return { level, score, firedRules };
}
