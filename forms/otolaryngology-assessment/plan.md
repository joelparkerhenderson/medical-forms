# Plan: Otolaryngology Assessment

## Current status

Design spec complete. Implementation pending.

## Scoring engine

The ENT grader computes a SNOT-22 total from twenty-two patient-rated items scored 0-5 and categorises the outcome as Mild, Moderate, or Severe impact. Clinician-captured examination findings are mapped against red-flag rules (unilateral nasal obstruction with bleeding, neck mass > 3 weeks, unilateral hearing loss with vertigo, hoarseness > 3 weeks in smokers) and any hit escalates the case to two-week-wait suspected-cancer referral. Flagged issues summarise both symptom severity and red-flag triggers in a single clinician view.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with ENT clinicians
