import { calculateCompositeScore } from './utils.js';
import { evaluateRules } from './grading-rules.js';

/** Calculate diabetes control level, score, and fired rules. */
export function calculateControl(data) {
  const hasHba1c = data.glycaemicControl.hba1cValue !== null;
  const answered = [
    data.medications.medicationAdherence,
    data.selfCareLifestyle.dietAdherence,
    data.psychologicalWellbeing.diabetesDistress,
    data.psychologicalWellbeing.copingAbility,
    data.psychologicalWellbeing.fearOfHypoglycaemia,
    data.psychologicalWellbeing.depressionScreening,
    data.psychologicalWellbeing.anxietyScreening,
    data.glycaemicControl.timeInRange,
  ].filter(x => x !== null).length;

  if (answered < 2 && !hasHba1c) {
    return { controlLevel: 'draft', controlScore: 0, firedRules: [] };
  }

  const score = calculateCompositeScore(data) || 0;
  const firedRules = evaluateRules(data);

  let controlLevel;
  if (score <= 20) controlLevel = 'veryPoor';
  else if (score <= 40) controlLevel = 'poor';
  else if (score < 65) controlLevel = 'suboptimal';
  else controlLevel = 'wellControlled';

  return { controlLevel, controlScore: score, firedRules };
}
