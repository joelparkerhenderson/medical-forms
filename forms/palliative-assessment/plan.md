# Plan: Palliative Assessment

## Current status

Design spec complete. Implementation pending.

## Scoring engine

The palliative grader sums the ten ESAS-r item scores (pain, tiredness, drowsiness, nausea, appetite, shortness of breath, depression, anxiety, wellbeing, and a patient-nominated 'other' symptom) to a 0-100 total and assigns a category of None, Mild, Moderate, or Severe. In parallel, the engine checks for any single symptom scoring ≥ 7 and emits an urgent single-symptom flag regardless of the total. Performance-status indices (PPS, KPS, ECOG) are translated to a common prognostic band. Flagged issues include unrelieved pain, dyspnoea at rest, high depression / anxiety scores, and prognostic transitions that should prompt advance-care-planning conversations.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with palliative care teams
