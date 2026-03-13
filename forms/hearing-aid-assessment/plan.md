# Plan: Hearing Aid Assessment

## Current status

Implemented. Patient form, clinician dashboard, and Rust backend all created.

## Scoring engine

The HHIE-S (Hearing Handicap Inventory for the Elderly - Screening) is a validated 10-item questionnaire that measures the emotional and social impact of hearing loss in older adults. Each item is scored 0 (no), 2 (sometimes), or 4 (yes), yielding a total score from 0 to 40. Scores of 0-8 indicate no handicap, 10-24 indicate mild-to-moderate handicap, and 26-40 indicate significant handicap warranting hearing aid candidacy.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
