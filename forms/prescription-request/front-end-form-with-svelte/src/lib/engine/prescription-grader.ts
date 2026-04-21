import type { AssessmentData, PriorityLevel, FiredRule } from './types';
import { prescriptionRules } from './prescription-rules';

/**
 * Pure function: evaluates all prescription rules against request data.
 * Returns the maximum priority level among all fired rules,
 * defaulting to Routine when no rules fire.
 */
export function calculatePriorityLevel(data: AssessmentData): {
  priorityLevel: PriorityLevel;
  firedRules: FiredRule[];
} {
  const firedRules: FiredRule[] = [];

  for (const rule of prescriptionRules) {
    try {
      if (rule.evaluate(data)) {
        firedRules.push({
          id: rule.id,
          category: rule.category,
          description: rule.description,
          priorityLevel: rule.priorityLevel
        });
      }
    } catch (e) {
      console.warn(`Prescription rule ${rule.id} evaluation failed:`, e);
    }
  }

  const priorityOrder: Record<PriorityLevel, number> = { routine: 0, urgent: 1, emergency: 2 };

  const priorityLevel: PriorityLevel =
    firedRules.length === 0
      ? 'routine'
      : firedRules.reduce<PriorityLevel>((max, r) => {
          return priorityOrder[r.priorityLevel] > priorityOrder[max] ? r.priorityLevel : max;
        }, 'routine');

  return { priorityLevel, firedRules };
}
