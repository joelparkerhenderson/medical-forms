import type { ClinicianAssessment, GradingResult } from '$lib/engine/types.js';
import { createEmptyAssessment } from '$lib/engine/factory.js';
import { calculateASA } from '$lib/engine/composite-grader.js';

class AssessmentStore {
  data: ClinicianAssessment = $state(createEmptyAssessment());
  currentStep = $state(1);

  result = $derived<GradingResult>(calculateASA(this.data));

  reset() {
    this.data = createEmptyAssessment();
    this.currentStep = 1;
  }

  goto(n: number) {
    if (n >= 1 && n <= 16) this.currentStep = n;
  }
}

export const store = new AssessmentStore();
