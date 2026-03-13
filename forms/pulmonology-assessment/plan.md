# Plan: Pulmonology Assessment

## Current status

Implemented. Patient form, clinician dashboard, and Rust backend all created.

## Scoring engine

The GOLD (Global Initiative for Chronic Obstructive Lung Disease) staging engine classifies patients into stages I through IV based primarily on post-bronchodilator FEV1 percentage predicted from spirometry results. It incorporates exacerbation frequency, symptom burden scores, and functional status to provide a comprehensive COPD severity assessment. Smoking history and occupational exposures are documented as contributing risk factors alongside comorbidity evaluation.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
