# Plan: Medical Error Report

## Current status

Implemented. Patient form, clinician dashboard, and SQL migrations all created.

## Scoring engine

The medical error report uses two complementary classification systems. The WHO Severity Scale grades incident severity from Near Miss (error occurred but did not reach the patient) through Critical (death or life-threatening event). The NCC MERP (National Coordinating Council for Medication Error Reporting and Prevention) Harm Categories provide a more granular classification from Category A (circumstances with capacity to cause error) through Category I (error contributed to patient death). Together these provide a comprehensive picture of incident severity and patient impact, informing root cause analysis, corrective action planning, and regulatory reporting requirements.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
