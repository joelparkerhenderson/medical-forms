# Plan: Post-Traumatic Stress Assessment

## Current status

Design spec complete. Implementation pending.

## Scoring engine

The PCL-5 grader sums twenty 0-4 symptom ratings grouped into the four DSM-5 PTSD clusters (B intrusion, C avoidance, D negative alterations in cognition and mood, E alterations in arousal and reactivity). The engine emits a total 0-80 score plus cluster sub-scores, applies the ≥33 provisional PTSD cut-off, and can also flag provisional DSM-5 diagnosis when cluster-level symptom counts meet required thresholds (B≥1, C≥1, D≥2, E≥2 with items rated ≥2). Flagged issues include suicidality screening and recommendation for structured clinical interview.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with mental-health clinicians
