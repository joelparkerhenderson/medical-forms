# Plan: Diabetes Assessment

## Current status

Implemented. Patient form (HTML and SvelteKit), clinician dashboard (HTML and SvelteKit), Rust backend, SQL migrations, XML representations, and FHIR R5 resources all created.

## Scoring engine

The NICE Diabetes Review scoring engine evaluates glycaemic control, complications risk, and self-management aligned with NICE NG28 (type 2) / NG17 (type 1) and the Diabetes UK 15 Healthcare Essentials. Patients are categorised as Controlled, Suboptimal, or Poorly Controlled based on HbA1c targets, complication screening results, cardiovascular risk, and self-care engagement.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Clinical safety case documentation
- User acceptance testing with clinical staff
- GDPR data processing impact assessment
