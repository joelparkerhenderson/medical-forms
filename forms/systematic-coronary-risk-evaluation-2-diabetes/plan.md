# Plan: Systematic Coronary Risk Evaluation 2 Diabetes

## Current status

Implemented. Patient form (HTML and SvelteKit), clinician dashboard (HTML and SvelteKit), Rust backend, SQL migrations, XML representations, and FHIR R5 resources all created.

## Scoring engine

The SCORE2-Diabetes (ESC 2023) calculator estimates 10-year cardiovascular risk as a percentage for people with type 2 diabetes. Risk thresholds are age-modified: Low/moderate (< 5%), High (5 – < 10% for under 50, or < 7.5% for 50+), Very high (≥ 10% for under 50, or ≥ 7.5% for 50+).

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Clinical safety case documentation
- User acceptance testing with clinical staff
- GDPR data processing impact assessment
