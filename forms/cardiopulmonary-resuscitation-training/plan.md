# Plan: Cardiopulmonary Resuscitation Training

## Current status

Design spec complete. Implementation pending.

## Scoring engine

The BLS grading engine applies the AHA Skills Verification Checklist, scoring each required skill as "demonstrated" or "not demonstrated" and separating critical actions from non-critical deficiencies. Critical-action failures — for example inadequate compression depth or rate, ineffective ventilation, or unsafe AED use — force an overall Fail regardless of other performance. Otherwise the engine counts non-critical deficiencies: the trainee passes with up to two and fails with three or more, with remediation guidance surfaced as flagged issues.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with BLS instructors
