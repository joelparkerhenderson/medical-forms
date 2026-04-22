# Plan: Predicting Risk of Cardiovascular Disease Events

## Current status

Implemented. Patient form (HTML and SvelteKit), clinician dashboard (HTML and SvelteKit), Rust backend, SQL migrations, XML representations, and FHIR R5 resources all created.

## Scoring engine

The AHA PREVENT equations (2023) calculate 10-year and 30-year cardiovascular risk as percentages (0.0–100.0%) for total CVD, atherosclerotic CVD (ASCVD), and heart failure (HF). The 10-year total CVD risk is categorised as Low (< 5%), Borderline (5 – < 7.5%), Intermediate (7.5 – < 20%), or High (≥ 20%).

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Clinical safety case documentation
- User acceptance testing with clinical staff
- GDPR data processing impact assessment
