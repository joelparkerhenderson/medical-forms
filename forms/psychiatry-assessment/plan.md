# Plan: Psychiatry Assessment

## Current status

Implemented. Patient form, clinician dashboard, and Rust backend all created.

## Scoring engine

The GAF (Global Assessment of Functioning) Scale scoring engine assigns a score from 1 to 100 reflecting overall psychological, social, and occupational functioning. It synthesises findings from the mental status examination, risk assessment, mood and anxiety screening, and substance use history into a single composite score. Scores are grouped into decile bands ranging from superior functioning (91-100) to persistent danger of self-harm or harm to others (1-10).

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
