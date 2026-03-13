# Plan: Sleep Quality Assessment

## Current status

Implemented. Patient form, clinician dashboard, and Rust backend all created.

## Scoring engine

The PSQI scoring engine evaluates sleep quality across seven component scores: subjective sleep quality, sleep latency, sleep duration, habitual sleep efficiency, sleep disturbances, use of sleeping medication, and daytime dysfunction. Each component is scored 0-3 and summed to produce a global PSQI score ranging from 0 to 21, where higher scores indicate worse sleep quality. Flagged issues are raised for global scores above 5 (indicating poor sleep quality), very short sleep duration, low sleep efficiency, or frequent use of sleep medication.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
