import { allergyRules } from './grading-rules.js';
import { severityWeight } from './utils.js';

/**
 * Pure function: evaluates all allergy severity rules against patient data.
 * Returns the maximum severity level among all fired rules,
 * defaulting to 'mild' for patients with only localised reactions or no fired rules.
 */
export function calculateAllergySeverity(data) {
  const firedRules = [];

  for (const rule of allergyRules) {
    try {
      if (rule.evaluate(data)) {
        firedRules.push({
          id: rule.id,
          category: rule.category,
          description: rule.description,
          severityLevel: rule.severityLevel
        });
      }
    } catch (e) {
      console.warn('Allergy rule ' + rule.id + ' evaluation failed:', e);
    }
  }

  const severityOrder = { mild: 1, moderate: 2, severe: 3 };

  let severityLevel = 'mild';
  if (firedRules.length > 0) {
    const sorted = Object.entries(severityOrder)
      .sort(([, a], [, b]) => b - a);
    for (const [level] of sorted) {
      if (firedRules.some((r) => r.severityLevel === level)) {
        severityLevel = level;
        break;
      }
    }
  }

  return { severityLevel, firedRules };
}

/**
 * Calculate Allergy Burden Score: count of confirmed allergies weighted by severity.
 */
export function calculateAllergyBurdenScore(data) {
  let score = 0;

  for (const item of data.drugAllergies.drugAllergies) {
    if (item.allergen) {
      score += severityWeight(item.severity) || 1;
    }
  }

  for (const item of data.foodAllergies.foodAllergies) {
    if (item.allergen) {
      score += severityWeight(item.severity) || 1;
    }
  }

  const envAllergies = data.environmentalAllergies;
  if (envAllergies.pollenAllergy === 'yes') score += 1;
  if (envAllergies.dustMiteAllergy === 'yes') score += 1;
  if (envAllergies.mouldAllergy === 'yes') score += 1;
  if (envAllergies.animalDanderAllergy === 'yes') score += 1;
  if (envAllergies.latexAllergy === 'yes') score += 2;
  if (envAllergies.insectStingAllergy === 'yes') {
    score += severityWeight(envAllergies.insectStingSeverity) || 1;
  }

  return score;
}

/**
 * Count total confirmed allergens across all categories.
 */
export function countAllergens(data) {
  let count = 0;

  count += data.drugAllergies.drugAllergies.filter((a) => a.allergen).length;
  count += data.foodAllergies.foodAllergies.filter((a) => a.allergen).length;

  const env = data.environmentalAllergies;
  if (env.pollenAllergy === 'yes') count++;
  if (env.dustMiteAllergy === 'yes') count++;
  if (env.mouldAllergy === 'yes') count++;
  if (env.animalDanderAllergy === 'yes') count++;
  if (env.latexAllergy === 'yes') count++;
  if (env.insectStingAllergy === 'yes') count++;

  return count;
}
