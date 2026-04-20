# Plan: Post-Operative Report

## Current status

Design spec complete. Implementation pending.

## Scoring engine

The post-operative grader takes the structured complications entered in Step 9 and classifies each according to the Clavien-Dindo scale, emitting the highest grade encountered as the overall complication severity. Mandatory sign-off fields — primary surgeon, anaesthetist, procedure name, and immediate post-op plan — are validated for completeness. Flagged issues include missing time-critical items (e.g., post-op vital sign handover, DVT prophylaxis plan), unexpected return to theatre, and any Grade IIIb or higher complication that should trigger morbidity-and-mortality review.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with surgical teams
