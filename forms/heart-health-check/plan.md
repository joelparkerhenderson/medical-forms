# Plan: Heart Health Check

## Current status

Implemented. Patient form (HTML and SvelteKit), clinician dashboard (HTML and SvelteKit), Rust backend, and SQL migrations all created.

## Scoring engine

The risk grader evaluates cardiovascular risk using a simplified QRISK3-based point scoring system. Multiple clinical and lifestyle factors (age, sex, smoking, blood pressure, cholesterol ratio, diabetes, atrial fibrillation, CKD, family history, BMI, deprivation, medications) contribute points, which are mapped to a 10-year CVD risk percentage via an exponential function. The result is categorised as Low (<10%), Moderate (10–19.9%), or High (>=20%). Heart age is calculated by finding the age at which an average person (non-smoker, normal BP, optimal cholesterol) would have the same risk.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Clinical safety case documentation
- User acceptance testing with clinical staff
- GDPR data processing impact assessment
