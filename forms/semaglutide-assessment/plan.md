# Plan: Semaglutide Assessment

## Current status

Implemented. Patient form, clinician dashboard, and Rust backend all created.

## Scoring engine

The eligibility grader evaluates patients for semaglutide (GLP-1 receptor agonist) therapy by screening absolute and relative contraindications, assessing metabolic profile including BMI and glycaemic markers, and reviewing cardiovascular risk factors. The engine produces a categorical outcome of Eligible, Conditional, or Ineligible based on the collected clinical data. Flagged issues are raised for identified contraindications, significant GI history, mental health concerns, or drug interactions with current medications.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
