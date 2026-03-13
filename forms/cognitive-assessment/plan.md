# Plan: Cognitive Assessment

## Current status

Implemented. Patient form, clinician dashboard, and Rust backend all created.

## Scoring engine

The cognitive assessment uses the Mini-Mental State Examination (MMSE), a widely used 30-point questionnaire that measures cognitive function across multiple domains including orientation to time and place, registration, attention and calculation, recall, language, repetition, command following, and visuospatial ability. Scores of 24-30 indicate normal cognition, 18-23 indicate mild cognitive impairment, and 0-17 indicate severe cognitive impairment. The MMSE is commonly used for initial screening and longitudinal monitoring of cognitive decline in conditions such as dementia and delirium.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
