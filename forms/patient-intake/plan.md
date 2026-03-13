# Plan: Patient Intake

## Current status

Implemented. Patient form, clinician dashboard, and Rust backend all created.

## Scoring engine

The Risk Level scoring engine stratifies patients into Low, Medium, or High risk categories based on their intake information. It evaluates medical history complexity, current medication count, allergy severity, family history of significant conditions, and social risk factors. The stratification helps clinical staff prioritise patients who may need immediate attention or additional screening.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
