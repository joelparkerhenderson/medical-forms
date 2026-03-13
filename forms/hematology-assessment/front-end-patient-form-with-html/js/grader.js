import { allRules } from './grading-rules.js';
import { calculateAbnormalityScore, collectNumericItems } from './utils.js';

/**
 * Calculate hematology abnormality result.
 * Returns { abnormalityLevel, abnormalityScore, firedRules }.
 */
export function calculateAbnormality(data) {
  var items = collectNumericItems(data);
  var answeredCount = items.filter(function(x) { return x !== null; }).length;

  if (answeredCount < 3) {
    return { abnormalityLevel: 'draft', abnormalityScore: 0, firedRules: [] };
  }

  var score = calculateAbnormalityScore(data) || 0;

  var firedRules = [];
  allRules().forEach(function(rule) {
    if (rule.evaluate(data)) {
      firedRules.push({
        id: rule.id,
        category: rule.category,
        description: rule.description,
        concernLevel: rule.concernLevel
      });
    }
  });

  var level;
  if (score === 0) level = 'normal';
  else if (score <= 20) level = 'mildAbnormality';
  else if (score <= 50) level = 'moderateAbnormality';
  else if (score <= 75) level = 'severeAbnormality';
  else level = 'critical';

  return { abnormalityLevel: level, abnormalityScore: score, firedRules: firedRules };
}
