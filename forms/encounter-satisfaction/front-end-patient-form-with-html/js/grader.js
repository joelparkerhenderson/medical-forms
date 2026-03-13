import { satisfactionQuestions } from './satisfaction-questions.js';
import { satisfactionCategory } from './utils.js';

/**
 * Pure function: calculates the Encounter Satisfaction Score (ESS).
 * Returns the composite mean score (1.0-5.0), its category, and per-domain breakdowns.
 *
 * Composite Score = mean of all answered Likert questions.
 *
 * Categories:
 *   4.5 - 5.0 = Excellent
 *   3.5 - 4.4 = Good
 *   2.5 - 3.4 = Fair
 *   1.5 - 2.4 = Poor
 *   1.0 - 1.4 = Very Poor
 */
export function calculateSatisfaction(data) {
  const domainMap = new Map();
  let totalSum = 0;
  let totalCount = 0;

  for (const question of satisfactionQuestions) {
    const score = getScoreForQuestion(data, question.section, question.field);
    if (score === null) continue;

    totalSum += score;
    totalCount++;

    if (!domainMap.has(question.domain)) {
      domainMap.set(question.domain, {
        domain: question.domain,
        mean: 0,
        count: 0,
        questions: []
      });
    }

    const domain = domainMap.get(question.domain);
    domain.count++;
    domain.questions.push({ id: question.id, text: question.text, score: score });
  }

  // Calculate domain means
  for (const domain of domainMap.values()) {
    const sum = domain.questions.reduce(function(acc, q) { return acc + q.score; }, 0);
    domain.mean = parseFloat((sum / domain.count).toFixed(2));
  }

  const compositeScore = totalCount > 0
    ? parseFloat((totalSum / totalCount).toFixed(2))
    : 0;

  const category = totalCount > 0 ? satisfactionCategory(compositeScore) : 'No responses';

  return {
    compositeScore: compositeScore,
    category: category,
    domainScores: Array.from(domainMap.values()),
    answeredCount: totalCount
  };
}

function getScoreForQuestion(data, section, field) {
  if (!data[section]) return null;
  const val = data[section][field];
  if (typeof val === 'number' && val >= 1 && val <= 5) return val;
  return null;
}
