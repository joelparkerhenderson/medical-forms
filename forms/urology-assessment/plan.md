# Plan: Urology Assessment

## Current status

Implemented. Patient form, clinician dashboard, and Rust backend all created.

## Scoring engine

The IPSS scoring engine calculates the International Prostate Symptom Score by summing patient responses across seven urinary symptom questions, each scored 0-5, producing a total score from 0 to 35. The calculateIPSS function categorises results as mild (0-7), moderate (8-19), or severe (20-35) symptoms, alongside a separate quality of life assessment. Flagged issues are raised for severe symptom scores, significant renal function abnormalities, or concerning sexual health findings.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
