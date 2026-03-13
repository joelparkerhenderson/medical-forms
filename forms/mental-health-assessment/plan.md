# Plan: Mental Health Assessment

## Current status

Implemented. Patient form, clinician dashboard, and Rust backend all created.

## Scoring engine

The Mental Health Assessment uses two validated instruments: the PHQ-9 for depression screening (scoring 0-27 across nine items) and the GAD-7 for anxiety screening (scoring 0-21 across seven items). Each instrument categorises severity from minimal to severe, enabling clinicians to track symptom changes over time. The combined assessment includes risk evaluation, substance use screening, and functional impact analysis to support comprehensive treatment planning.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
