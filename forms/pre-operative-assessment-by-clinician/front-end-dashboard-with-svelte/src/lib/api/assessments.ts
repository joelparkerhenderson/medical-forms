import type { AssessmentRow } from '$lib/data/sample.js';
import { SAMPLE_ASSESSMENTS } from '$lib/data/sample.js';

const API_BASE = '/api/assessments';

export async function fetchAssessments(): Promise<AssessmentRow[]> {
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error(`API ${res.status}`);
    return (await res.json()) as AssessmentRow[];
  } catch {
    return SAMPLE_ASSESSMENTS;
  }
}
