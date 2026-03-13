# Plan: Mast Cell Activation Syndrome (MCAS) Assessment

## Current status

Implemented. Patient form, clinician dashboard, and Rust backend all created.

## Scoring engine

The MCAS Symptom Score evaluates mast cell activation symptoms across multiple organ systems including dermatological, gastrointestinal, cardiovascular, respiratory, and neurological domains. Each system is scored for symptom presence and severity, with additional analysis of trigger patterns and laboratory markers. The cumulative score helps clinicians assess disease burden and guide treatment decisions.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
