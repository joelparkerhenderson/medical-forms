# Plan: Respirology Assessment

## Current status

Implemented. Patient form, clinician dashboard, and Rust backend all created.

## Scoring engine

The MRC Dyspnoea Scale grades breathlessness severity on a 1 to 5 scale, from breathless only with strenuous exercise (grade 1) to too breathless to leave the house (grade 5). The scoring engine evaluates the patient's self-reported dyspnoea level alongside cough assessment, pulmonary function data, and exposure history to generate a comprehensive respiratory profile. Flagged issues are raised for high MRC grades, significant exposure history, or abnormal pulmonary function results.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
