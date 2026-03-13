# Plan: Rheumatology Assessment

## Current status

Implemented. Patient form, clinician dashboard, and Rust backend all created.

## Scoring engine

The DAS28 scoring engine calculates disease activity by combining tender joint count, swollen joint count, ESR or CRP laboratory values, and patient global assessment into a composite score. The formula produces a continuous value where scores below 2.6 indicate remission, 2.6-3.2 low activity, 3.2-5.1 moderate activity, and above 5.1 high disease activity. Flagged issues are raised for high DAS28 scores, significant extra-articular manifestations, or concerning laboratory results.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
