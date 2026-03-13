# Plan: Gerontology Assessment

## Current status

Implemented. Patient form, clinician dashboard, and Rust backend all created.

## Scoring engine

The Clinical Frailty Scale (CFS) is a validated instrument for assessing frailty in elderly patients, scoring from 1 (very fit) to 9 (terminally ill). It integrates functional capacity, cognitive status, mobility, nutritional state, and polypharmacy burden to determine an overall frailty level. Key thresholds include 4 (vulnerable), 7 (severely frail), and 9 (terminally ill), guiding care planning and treatment intensity decisions.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
