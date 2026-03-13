# Plan: Advance Statement About Care

## Current status

Implemented. Patient form, clinician dashboard, and Rust backend all created.

## Scoring engine

The completeness grader evaluates how thoroughly a patient has documented their future care wishes and preferences. It assesses whether all key sections have been meaningfully addressed, including personal values and beliefs, care setting preferences, medical treatment wishes, communication needs, important contacts, and practical arrangements. The result is categorised as Complete (all sections substantively filled), Partial (some sections addressed but gaps remain), or Incomplete (significant sections left blank or insufficiently detailed).

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
